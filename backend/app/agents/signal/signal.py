import logging
import time
from backend.app.agents.state import AgentState

logger = logging.getLogger("agents.signal")

class SignalAgent:
    """
    Signal Agent parses transcripts, emails, or CSV lines to extract
    sentiment markers, alert triggers, and behavior patterns.
    """
    def __init__(self, model_client=None):
        self.model_client = model_client

    def execute(self, state: AgentState) -> AgentState:
        logger.info("Executing Signal Agent for Customer: %s", state["customer_name"])
        start_time = time.time()
        
        # Simulate signal extraction
        signals = [
            {"type": "sentiment", "value": "negative", "description": "Client expressed frustration with product load speed."},
            {"type": "activity", "value": "declined", "description": "API usage dropped by 34% month-over-month."},
            {"type": "billing", "value": "delayed", "description": "Invoice for premium support is overdue."}
        ]
        
        state["signals_extracted"] = signals
        state["current_agent"] = "Knowledge"
        state["execution_log"].append("Signal Agent: Extracted usage drop and billing friction metrics.")
        
        latency = time.time() - start_time
        state["agent_latencies"]["Signal"] = round(latency, 3)
        return state
