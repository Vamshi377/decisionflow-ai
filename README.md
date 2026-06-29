# DecisionFlow AI

DecisionFlow AI is an agentic decision-intelligence platform for Customer Success teams. It ingests customer transcripts, emails, and CRM artifacts, extracts risk signals, retrieves matching playbooks, generates next-best-action recommendations, and keeps every human decision auditable.

The project is built as a full-stack hackathon MVP with a FastAPI backend, SQLite/PostgreSQL persistence, LangGraph-style multi-agent orchestration, and a React + TypeScript cockpit UI.

## Why It Matters

Customer Success teams usually discover churn risk late because signals are scattered across call notes, support tickets, emails, product usage, billing context, and renewal dates. DecisionFlow AI brings those signals into one workflow:

1. Ingest customer artifacts.
2. Run a planner-driven agent pipeline.
3. Extract business signals and customer memory.
4. Match enterprise playbooks.
5. Generate explainable next-best actions.
6. Let a CSM approve, reject, or modify the recommendation.
7. Store the final decision in an audit trail.

## Core Features

### 1. Decision Cockpit

The dashboard gives the CSM an executive overview of portfolio health:

- Average customer health score.
- High-risk account count.
- Pending decision queue.
- Recommendation acceptance rate.
- Immediate-attention customer table.
- Upcoming renewals.
- AI impact calculator for potential churn recovery.
- Agent activity feed for a live operating-room feel.

Frontend: `frontend/src/pages/Dashboard.tsx`  
Backend data: `GET /customers`, `GET /analytics`, `GET /audit-logs`

### 2. Client Portfolio

The customer list helps users filter, sort, and open customer workspaces:

- Search by customer name or company.
- Risk-level filtering.
- Sort by health score, renewal date, or name.
- One-click navigation into the 360-degree workspace.

Frontend: `frontend/src/pages/Customers.tsx`  
Backend data: `GET /customers`

### 3. Customer 360 Workspace

The workspace is the primary account command center:

- Customer metadata, ACV, plan, health, CSAT, renewal, and account owner.
- Transcript analysis with visual risk tags.
- Email, ticket, CRM, and product usage panels.
- Usage trend charts.
- Recommendation explainability panel.
- Customer memory timeline.
- Side-panel AI copilot for account questions.
- Direct trigger for the agent pipeline.

Frontend: `frontend/src/pages/Workspace.tsx`  
Backend data: `GET /customer/{id}`, `GET /memory/{customer_id}`, `POST /analyze`

### 4. Artifact Upload Center

Users can upload unstructured and structured customer artifacts:

- Supported formats: `.txt`, `.pdf`, `.docx`, `.csv`.
- Files are validated, written to disk, and recorded in the database.
- Uploads are tied to a customer.
- Upload events are written to audit logs.
- Users can immediately start analysis after upload.

Frontend: `frontend/src/pages/Upload.tsx`  
Backend: `backend/app/services/upload_service.py`  
API: `POST /upload`

### 5. Agent Execution Canvas

The execution screen visualizes the multi-agent reasoning flow:

- Planner Agent.
- Signal Agent.
- Memory Agent.
- Knowledge Agent.
- Recommendation Agent.
- Explainability Agent.

Each node exposes queued/running/completed/failed state, progress, latency, and output summary. The UI polls the backend task endpoint while the background pipeline runs.

Frontend: `frontend/src/pages/AIExecution.tsx`  
Backend: `backend/app/agents/workflow.py`, `backend/app/services/agent_service.py`  
API: `GET /task/{task_id}`

### 6. Signal Extraction

The Signal Agent reads uploaded or fallback transcript text and extracts customer-success indicators:

- Unhappy sentiment.
- Renewal risk.
- Product usage decline.
- Payment or billing friction.
- Neutral account health fallback.

Implementation: `backend/app/ai/services/signal_service.py`

### 7. Customer Memory

The Memory Agent loads historical context for an account:

- Previous meetings.
- Health-score changes.
- Tickets.
- Recommendations.
- CSM decisions.
- Renewal events.

This gives the recommendation engine continuity instead of treating every transcript as a standalone event.

Implementation: `backend/app/memory/*`  
API: `GET /memory/{customer_id}`, `POST /memory`, `PUT /memory/{id}`, `DELETE /memory/{id}`

### 8. Knowledge / Playbook Matching

The Knowledge Agent maps extracted signals to playbooks:

- Sponsor Risk Escalation Flow.
- Product Adoption Recovery.
- Grace-Period Payment Adjustments.
- Standard Renewal Sequence fallback.

The current MVP uses deterministic matching with a Qdrant-ready placeholder for vector search.

Implementation: `backend/app/ai/services/knowledge_service.py`, `backend/app/rag/qdrant_client.py`

### 9. Recommendation Engine

The Recommendation Agent generates the next best action using:

- Customer sentiment.
- Renewal risk.
- Product usage.
- Positive and negative signals.
- Competitor mentions.
- Customer memory.
- Matched playbooks.

It supports Gemini JSON output when configured and includes a robust heuristic fallback so the demo remains functional without an API key.

Implementation: `backend/app/ai/services/recommendation_engine.py`  
Output persisted in: `recommendations` table

### 10. Human Decision Workflow

CSMs can approve, reject, or modify recommendations:

- Approve an AI-generated action.
- Reject with reason.
- Modify action, priority, or follow-up.
- Persist final status.
- Write audit records for governance.

Frontend: `frontend/src/pages/Recommendations.tsx`  
Backend API: `POST /recommendation/{id}/action`

### 11. Audit Logs

DecisionFlow AI keeps traceability across:

- System initialization.
- Upload events.
- Agent analysis starts.
- Decision-engine completion.
- Human approval/rejection/modification.

Frontend: `frontend/src/pages/Audit.tsx`  
Backend model: `AuditLog`  
API: `GET /audit-logs`

### 12. Analytics

The analytics module summarizes decision performance:

- Acceptance rate.
- Total recommendations.
- Approved/rejected/modified/pending split.
- Average health score.
- Risk distribution.
- Weekly generated vs accepted activity.

Frontend: `frontend/src/pages/Analytics.tsx`  
API: `GET /analytics`

## Architecture

```text
React + TypeScript UI
        |
        | Axios API client
        v
FastAPI backend
        |
        | SQLAlchemy ORM
        v
SQLite fallback / PostgreSQL-ready database
        |
        v
Agentic workflow
Planner -> Signal -> Memory -> Knowledge -> Recommendation -> Explainability
        |
        v
Recommendation, audit log, task telemetry, and memory persistence
```

## Backend Structure

```text
backend/
  app/
    api/routes.py                  API routes
    agents/                        Agent registry, workflow, orchestration, execution logs
    ai/services/                   Signal, knowledge, recommendation, transcript services
    core/                          Config, logging, exception handling
    database/session.py            DB engine, fallback, seeding
    memory/                        Customer memory schema/service/repository/model
    models/database_models.py      SQLAlchemy models
    schemas/                       Pydantic request/response schemas
    services/                      Upload and agent orchestration services
  run.py                           Backend entrypoint
  requirements.txt                 Python dependencies
```

## Frontend Structure

```text
frontend/
  src/
    components/layout/             Sidebar and top navigation
    components/ui/                 Cards, dialogs, badges, loaders
    context/                       Navigation and theme state
    pages/                         Dashboard, workspace, upload, agents, recommendations, memory, analytics, audit
    services/api.ts                Axios API client and TypeScript API types
```

## Database Model

Main tables:

- `customers`: customer profile, health score, risk level, renewal date, NPS.
- `uploaded_files`: uploaded artifacts and processing status.
- `recommendations`: generated next-best-action records.
- `agent_runs`: task state, current agent, output summaries, latencies.
- `audit_logs`: governance and decision trail.
- `customer_memory`: historical customer events.

## API Reference

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | API welcome and platform status |
| `GET` | `/health` | API/database health check |
| `GET` | `/customers` | List all customers |
| `GET` | `/customer/{id}` | Customer 360 data |
| `POST` | `/upload` | Upload transcript/email/CRM artifact |
| `POST` | `/analyze` | Start background agent workflow |
| `GET` | `/task/{task_id}` | Poll agent workflow status |
| `GET` | `/recommendation/{id}` | Fetch one recommendation |
| `POST` | `/recommendation/{id}/action` | Approve/reject/modify recommendation |
| `GET` | `/audit-logs` | Fetch governance logs |
| `GET` | `/analytics` | Fetch KPI summary |
| `GET` | `/memory/{customer_id}` | Fetch customer memory |
| `POST` | `/memory` | Create memory record |
| `PUT` | `/memory/{id}` | Update memory record |
| `DELETE` | `/memory/{id}` | Delete memory record |

## Run Locally

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
python run.py
```

Backend runs on:

```text
http://localhost:8000
```

Swagger docs:

```text
http://localhost:8000/docs
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend usually runs on:

```text
http://localhost:5173
```

### 3. Login

The MVP login accepts any non-empty email and password and routes into the cockpit.

## Environment Notes

- `DATABASE_URL` can point to PostgreSQL.
- If PostgreSQL is unavailable, the backend falls back to `backend/decisionflow.db`.
- `GEMINI_API_KEY` is optional for the MVP because deterministic fallbacks keep the agent pipeline functional.
- CORS is configured for local Vite and common local frontend ports.

## Verification

Commands used during validation:

```bash
cd frontend
npm run build
```

```bash
cd backend
python - <<'PY'
import ast
from pathlib import Path
for path in Path("app").rglob("*.py"):
    ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
print("Python syntax OK")
PY
```

Direct API smoke coverage:

- `/`
- `/health`
- `/customers`
- `/analytics`
- `/audit-logs`

## Demo Script For Judges

1. Sign in and open the Decision Cockpit.
2. Show high-risk accounts and pending decisions.
3. Open Acme Corp or Hooli Corp in the Customer Workspace.
4. Show transcript risk tags, CRM details, usage trend, and memory timeline.
5. Upload a transcript or use the fallback transcript.
6. Run Decision Agents.
7. Open the Agent Canvas and show each agent progressing.
8. Review the generated recommendation.
9. Approve, reject, or modify it.
10. Open Audit Logs and Analytics to show governance and measurable impact.

## Hackathon Pitch

DecisionFlow AI is not just a dashboard. It is a reusable decision architecture:

- Planner-driven agent orchestration.
- Signal extraction from unstructured customer text.
- Historical memory for context continuity.
- Playbook retrieval for grounded recommendations.
- Human-in-the-loop approval.
- Audit logs for enterprise governance.
- Fallback logic so the product works even without external AI keys.

That combination makes the platform demoable, explainable, and extensible across Customer Success, Sales, HR, IT Support, Banking, Healthcare, and Procurement workflows.
