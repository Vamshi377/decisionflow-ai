from typing import TypedDict, List, Dict, Any, Optional

class AgentState(TypedDict):
    """
    LangGraph State Channel containing inputs, outputs, history logs, 
    dynamic agent routing lists, and execution tracing indicators.
    """
    customer_id: int
    customer_name: str
    task_id: Optional[str]
    uploaded_file_id: Optional[int]
    uploaded_file_content: Optional[str]
    
    # Dynamic Agent Orchestration Paths
    planned_agents: List[str]      # e.g., ["Signal", "Memory", "Knowledge", "Recommendation", "Explainability"]
    completed_agents: List[str]    # Chronological executed list
    current_agent: str
    
    # State Outputs compiled between nodes
    planner_directives: Optional[str]
    signals_extracted: Optional[List[Dict[str, Any]]]
    customer_memory_context: Optional[str]
    playbooks_matched: Optional[List[Dict[str, Any]]]
    primary_recommendation: Optional[str]
    confidence_score: Optional[float]
    business_impact: Optional[str]  # High, Medium, Low, Critical
    reasoning: Optional[str]
    evidence: Optional[str]
    alternatives: Optional[List[Dict[str, Any]]]
    
    # Execution telemetry and errors
    execution_log: List[str]
    agent_latencies: Dict[str, float]
    execution_trace: List[Dict[str, Any]]  # telemetry sent to frontend
    error: Optional[str]
