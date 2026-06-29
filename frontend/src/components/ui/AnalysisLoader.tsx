import React, { useState, useEffect } from 'react';
import { apiService, type AgentExecutionTask, type AgentStatus } from '../../services/api';
import { 
  Cpu, 
  BrainCircuit, 
  SearchCode, 
  ShieldAlert, 
  BookOpen, 
  Sparkles, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AnalysisLoaderProps {
  taskId: string;
  onAnalysisComplete: (recommendationId: number) => void;
  onAnalysisError?: (error: string) => void;
}

export const AnalysisLoader: React.FC<AnalysisLoaderProps> = ({
  taskId,
  onAnalysisComplete,
  onAnalysisError
}) => {
  const [taskState, setTaskState] = useState<AgentExecutionTask | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Timer to track elapsed seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll Task Status
  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const task = await apiService.getTaskStatus(taskId);
        if (!active) return;
        setTaskState(task);

        if (task.status === 'completed') {
          // Find generated recommendation for this customer
          const customerDetail = await apiService.getCustomer(task.customer_id);
          const sortedRecs = customerDetail.recommendations.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          if (sortedRecs.length > 0) {
            setTimeout(() => {
              onAnalysisComplete(sortedRecs[0].id);
            }, 1000);
          } else {
            setError("Analysis completed but no recommendation was found.");
            if (onAnalysisError) onAnalysisError("No recommendation found.");
          }
        } else if (task.status === 'failed') {
          setError("Agent pipeline execution failed.");
          if (onAnalysisError) onAnalysisError("Pipeline execution failed.");
        } else {
          // Poll again in 1.5 seconds
          setTimeout(poll, 1500);
        }
      } catch (err: any) {
        if (!active) return;
        setError(err.message || "Failed to check analysis status.");
        if (onAnalysisError) onAnalysisError(err.message || "Poll failed");
      }
    };

    poll();
    return () => {
      active = false;
    };
  }, [taskId]);

  const getAgentIcon = (name: string) => {
    switch (name) {
      case 'Planner': return BrainCircuit;
      case 'Signal': return SearchCode;
      case 'Context': return Cpu;
      case 'Risk': return ShieldAlert;
      case 'Knowledge': return BookOpen;
      case 'Recommendation': return Sparkles;
      default: return Cpu;
    }
  };

  const getStatusColor = (status: AgentStatus['status']) => {
    switch (status) {
      case 'completed': return 'bg-success/15 border-success/30 text-success dark:text-success-light';
      case 'running': return 'bg-primary/10 border-primary/30 text-primary dark:text-primary-light animate-pulse-flow';
      case 'failed': return 'bg-danger/15 border-danger/30 text-danger dark:text-danger-light';
      default: return 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-glass dark:shadow-glass-dark">
      {/* Header telemetry */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
            Agentic intelligence synthesis
          </h2>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold uppercase tracking-wider">
            Task ID: {taskId.slice(0, 8)}... • Elapsed Time: {elapsedTime}s
          </p>
        </div>
        <div className="flex items-center gap-2">
          {taskState?.status === 'running' ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/35 text-[10px] font-bold text-primary dark:text-primary-light uppercase tracking-wider">
              <Loader2 className="w-3 h-3 animate-spin" /> Processing
            </span>
          ) : taskState?.status === 'completed' ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/35 text-[10px] font-bold text-success dark:text-success-light uppercase tracking-wider">
              <CheckCircle2 className="w-3 h-3" /> Completed
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              {taskState?.status || 'Initiating'}
            </span>
          )}
        </div>
      </div>

      {/* Error alert banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-danger-light/20 border border-danger/30 text-danger-dark dark:text-danger-light">
          <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
          <p className="text-xs font-semibold">{error}</p>
        </div>
      )}

      {/* Agents Nodes Stack */}
      <div className="relative pl-8 space-y-4">
        {/* Connection timeline line */}
        <div className="absolute left-3.5 top-2 bottom-6 w-[2px] bg-neutral-200 dark:bg-neutral-800" />

        {taskState?.agents.map((agent) => {
          const Icon = getAgentIcon(agent.agent_name);
          const statusClass = getStatusColor(agent.status);
          return (
            <div key={agent.agent_name} className="relative flex items-start gap-4">
              {/* Agent Node Icon Ring */}
              <div className={`absolute -left-8 flex items-center justify-center w-7 h-7 rounded-full border transition-all duration-300 ${statusClass}`}>
                {agent.status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : agent.status === 'running' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Agent Log Card */}
              <div className={`flex-1 p-3.5 border rounded-xl transition-all duration-300 ${
                agent.status === 'running' 
                  ? 'border-primary bg-primary/5 shadow-sm' 
                  : agent.status === 'completed' 
                    ? 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/20 dark:bg-neutral-900/10 opacity-90' 
                    : 'border-neutral-100 dark:border-neutral-800/40 bg-neutral-50/10 dark:bg-neutral-900/5 opacity-50'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-950 dark:text-white">
                    {agent.agent_name} Agent
                  </span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
                    {agent.status === 'completed' && agent.execution_time > 0 
                      ? `${agent.execution_time}s` 
                      : agent.status === 'running' 
                        ? 'Active' 
                        : 'Queued'}
                  </span>
                </div>
                {agent.status === 'running' && (
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-primary" /> Analyzing logs and constructing matrices...
                  </p>
                )}
                {agent.output_summary && (
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-300 mt-1 bg-white/70 dark:bg-neutral-950/40 p-2 rounded-lg border border-neutral-100 dark:border-neutral-900 font-mono text-[10px] leading-relaxed">
                    {agent.output_summary}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
