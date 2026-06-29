import time
import logging
from typing import Dict, Any, List

logger = logging.getLogger("agents.execution_logger")

class ExecutionLogger:
    """
    Traces agent execution logs, latencies, and output details
    for pipeline telemetry and audit logs.
    """
    def __init__(self):
        self.traces: List[Dict[str, Any]] = []

    def start_trace(self, agent_name: str) -> float:
        logger.info("Agent node '%s' started execution.", agent_name)
        return time.time()

    def end_trace(self, agent_name: str, start_time: float, status: str = "completed", details: str = "") -> Dict[str, Any]:
        latency = time.time() - start_time
        trace = {
            "agent_name": agent_name,
            "status": status,
            "latency_seconds": round(latency, 3),
            "timestamp": time.time(),
            "summary": details
        }
        self.traces.append(trace)
        logger.info("Agent node '%s' completed in %.3fs. Status: %s", agent_name, latency, status)
        return trace

    def get_trace_log(self) -> List[Dict[str, Any]]:
        return self.traces

    def clear(self):
        self.traces.clear()
