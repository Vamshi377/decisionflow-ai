import logging
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.database_models import AgentRun
from backend.app.schemas.recommendation import (
    AgentExecutionResponse,
    AgentStatusSchema,
    AnalyzeRequest,
)
from backend.app.services.agent_service import AgentService

logger = logging.getLogger("api.agent_routes")
router = APIRouter(tags=["Agentic Workflow"])


@router.post("/analyze")
def analyze_customer(
    request: AnalyzeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Trigger background agentic reasoning pipeline."""
    try:
        task_id = AgentService.create_run(request.customer_id, db, background_tasks)
        return {
            "success": True,
            "message": "Analysis pipeline dispatched in background.",
            "task_id": task_id,
            "status": "running",
        }
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        logger.exception("Analyze routing error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Execution trigger failed",
        ) from exc


@router.get("/task/{task_id}", response_model=AgentExecutionResponse)
def get_task_status(task_id: str, db: Session = Depends(get_db)):
    """Poll agent execution state logs and times for the UI visualizer."""
    run = db.query(AgentRun).filter(AgentRun.task_id == task_id).first()
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent Run task {task_id} not found",
        )

    agent_names = ["Planner", "Signal", "Memory", "Knowledge", "Recommendation", "Explainability"]
    agents_status = []
    current_agent_idx = agent_names.index(run.current_agent) if run.current_agent in agent_names else -1
    if run.status == "completed":
        current_agent_idx = len(agent_names)

    latency_map = {
        "Planner": run.planner_time,
        "Signal": run.signal_time,
        "Memory": run.context_time,
        "Knowledge": run.knowledge_time,
        "Recommendation": run.recommendation_time,
        "Explainability": run.explainability_time,
    }
    output_map = {
        "Planner": run.planner_output,
        "Signal": run.signal_output,
        "Memory": run.context_output,
        "Knowledge": run.knowledge_output,
        "Recommendation": run.recommendation_output,
        "Explainability": run.explainability_output,
    }

    for idx, name in enumerate(agent_names):
        if idx < current_agent_idx:
            agent_status = "completed"
            progress = 100
        elif idx == current_agent_idx and run.status == "running":
            agent_status = "running"
            progress = 50
        elif run.status == "failed" and idx == current_agent_idx:
            agent_status = "failed"
            progress = 100
        else:
            agent_status = "queued"
            progress = 0

        agents_status.append(
            AgentStatusSchema(
                agent_name=name,
                status=agent_status,
                progress=progress,
                execution_time=latency_map.get(name, 0.0),
                output_summary=output_map.get(name),
            )
        )

    return AgentExecutionResponse(
        task_id=run.task_id,
        customer_id=run.customer_id,
        status=run.status,
        current_agent=run.current_agent,
        agents=agents_status,
        created_at=run.created_at,
    )
