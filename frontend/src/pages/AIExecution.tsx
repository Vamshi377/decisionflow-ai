import React, { useState, useEffect, useRef } from 'react';
import { useNav } from '../context/NavContext';
import { apiService, type AgentExecutionTask } from '../services/api';
import ReactFlow, { Background, Handle, Position, type Node, type Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  BrainCircuit, 
  SearchCode, 
  Database, 
  BookOpen, 
  Sparkles, 
  ShieldAlert, 
  AlertCircle, 
  Terminal,
  Clock
} from 'lucide-react';

// Custom Agent Node Component for React Flow
const AgentNode = ({ data }: any) => {
  const { agent_name, status, progress, execution_time, output_summary } = data;
  
  let Icon = Cpu;
  let colorClass = 'neutral';
  if (agent_name === 'Planner') { Icon = BrainCircuit; colorClass = 'blue'; }
  else if (agent_name === 'Signal') { Icon = SearchCode; colorClass = 'cyan'; }
  else if (agent_name === 'Memory' || agent_name === 'Context') { Icon = Database; colorClass = 'purple'; }
  else if (agent_name === 'Knowledge') { Icon = BookOpen; colorClass = 'amber'; }
  else if (agent_name === 'Recommendation') { Icon = Sparkles; colorClass = 'emerald'; }
  else if (agent_name === 'Explainability') { Icon = ShieldAlert; colorClass = 'indigo'; }

  const colorPresets: Record<string, { border: string, bg: string, text: string, iconBg: string, iconText: string }> = {
    blue: {
      border: 'border-blue-200/80 dark:border-blue-800/80',
      bg: 'bg-blue-50/15 dark:bg-blue-950/10',
      text: 'text-blue-700 dark:text-blue-400',
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      iconText: 'text-blue-500'
    },
    cyan: {
      border: 'border-cyan-200/80 dark:border-cyan-800/80',
      bg: 'bg-cyan-50/15 dark:bg-cyan-950/10',
      text: 'text-cyan-700 dark:text-cyan-400',
      iconBg: 'bg-cyan-50 dark:bg-cyan-900/20',
      iconText: 'text-cyan-500'
    },
    purple: {
      border: 'border-purple-200/80 dark:border-purple-800/80',
      bg: 'bg-purple-50/15 dark:bg-purple-950/10',
      text: 'text-purple-700 dark:text-purple-400',
      iconBg: 'bg-purple-50 dark:bg-purple-900/20',
      iconText: 'text-purple-500'
    },
    amber: {
      border: 'border-amber-200/80 dark:border-amber-800/80',
      bg: 'bg-amber-50/15 dark:bg-amber-955/10',
      text: 'text-amber-700 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-955/20',
      iconText: 'text-amber-500'
    },
    emerald: {
      border: 'border-emerald-200/80 dark:border-emerald-800/80',
      bg: 'bg-emerald-50/15 dark:bg-emerald-950/10',
      text: 'text-emerald-700 dark:text-emerald-450',
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconText: 'text-emerald-500'
    },
    indigo: {
      border: 'border-indigo-200/80 dark:border-indigo-800/80',
      bg: 'bg-indigo-50/15 dark:bg-indigo-950/10',
      text: 'text-indigo-700 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-900/20',
      iconText: 'text-indigo-500'
    },
    neutral: {
      border: 'border-neutral-200 dark:border-neutral-800',
      bg: 'bg-white dark:bg-neutral-900',
      text: 'text-neutral-500 dark:text-neutral-450',
      iconBg: 'bg-neutral-50 dark:bg-neutral-950',
      iconText: 'text-neutral-400'
    }
  };

  const colors = colorPresets[colorClass];

  let stateStyle = 'opacity-40 border-dashed';
  if (status === 'completed') {
    stateStyle = 'opacity-100 border-solid shadow-xs';
  } else if (status === 'running') {
    stateStyle = 'opacity-100 border-solid ring-2 ring-primary/20 scale-[1.02] shadow-md shadow-primary/5';
  } else if (status === 'failed') {
    stateStyle = 'opacity-100 border-solid border-danger bg-danger/5 text-danger ring-2 ring-danger/25';
  } else if (status === 'queued') {
    stateStyle = 'opacity-30 border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/30';
  }

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0.8 }}
      animate={{ scale: status === 'running' ? 1.02 : 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`p-3 border rounded-xl flex items-center gap-3 w-[270px] bg-white dark:bg-neutral-900 ${colors.border} ${colors.bg} ${stateStyle} text-[11px] font-sans relative transition-all duration-300`}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#9CA3AF', width: 6, height: 6 }} />
      
      {/* Node Icon with pulsing ring if running */}
      <div className="relative flex-shrink-0">
        {status === 'running' && (
          <span className="absolute -inset-1 rounded-lg bg-primary/25 animate-ping" />
        )}
        <div className={`p-2 rounded-lg ${colors.iconBg} border border-neutral-200/40 dark:border-neutral-800/40 flex items-center justify-center relative z-10`}>
          <Icon className={`w-4 h-4 ${colors.iconText} ${status === 'running' ? 'animate-pulse' : ''}`} />
        </div>
      </div>
      
      {/* Node Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="font-bold text-neutral-905 dark:text-white truncate">
            {agent_name} Agent
          </span>
          <span className={`text-[8px] font-extrabold uppercase tracking-wider ${
            status === 'completed' ? 'text-emerald-500' : status === 'running' ? 'text-primary' : 'text-neutral-450'
          }`}>
            {status === 'queued' ? 'Waiting' : status}
          </span>
        </div>
        
        {status === 'running' && (
          <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1 mt-1.5 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${progress}%` }} />
          </div>
        )}
        
        {output_summary ? (
          <p className="text-[9px] text-neutral-450 dark:text-neutral-500 truncate mt-1 font-semibold leading-none">
            {output_summary}
          </p>
        ) : (
          <p className="text-[9px] text-neutral-400 dark:text-neutral-600 truncate mt-1 italic font-semibold leading-none">
            {status === 'queued' ? 'Pending queue dispatch...' : status === 'running' ? 'Executing node logic...' : 'Complete.'}
          </p>
        )}
      </div>

      {/* Latency / Execution Time */}
      {status === 'completed' && (
        <span className="text-[9px] font-bold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded flex-shrink-0 flex items-center gap-0.5">
          <Clock className="w-2.5 h-2.5" /> {execution_time}s
        </span>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: '#9CA3AF', width: 6, height: 6 }} />
    </motion.div>
  );
};

const nodeTypes = {
  agentNode: AgentNode
};

export const AIExecution: React.FC = () => {
  const { activeTaskId, navigate } = useNav();
  const [taskState, setTaskState] = useState<AgentExecutionTask | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // 1. Elapsed timer
  useEffect(() => {
    if (!activeTaskId || taskState?.status === 'completed' || taskState?.status === 'failed') return;
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTaskId, taskState?.status]);

  // 2. Poll Task status and compile dynamic console logs
  useEffect(() => {
    if (!activeTaskId) return;
    let active = true;
    const loggedAgents = new Set<string>();

    const poll = async () => {
      try {
        const task = await apiService.getTaskStatus(activeTaskId);
        if (!active) return;
        setTaskState(task);

        const newLogs = [...logs];
        if (newLogs.length === 0) {
          newLogs.push(`[${new Date().toLocaleTimeString()}] [SYSTEM] Compiling LangGraph StateGraph...`);
          newLogs.push(`[${new Date().toLocaleTimeString()}] [SYSTEM] Handshaking backend server...`);
          newLogs.push(`[${new Date().toLocaleTimeString()}] [SYSTEM] Initializing shared state channels...`);
        }

        task.agents.forEach((agent) => {
          if (agent.status === 'running' && !loggedAgents.has(`${agent.agent_name}_running`)) {
            newLogs.push(`[${new Date().toLocaleTimeString()}] [${agent.agent_name.toUpperCase()}] Agent triggered. Analyzing state parameters...`);
            loggedAgents.add(`${agent.agent_name}_running`);
          }
          if (agent.status === 'completed' && !loggedAgents.has(`${agent.agent_name}_completed`)) {
            newLogs.push(`[${new Date().toLocaleTimeString()}] [${agent.agent_name.toUpperCase()}] Execution complete in ${agent.execution_time}s.`);
            if (agent.output_summary) {
              newLogs.push(`  └─ Output: ${agent.output_summary.slice(0, 100)}...`);
            }
            loggedAgents.add(`${agent.agent_name}_completed`);
          }
        });

        if (task.status === 'completed' && !loggedAgents.has('system_completed')) {
          newLogs.push(`[${new Date().toLocaleTimeString()}] [SYSTEM] LangGraph execution successful. Synthesis complete.`);
          loggedAgents.add('system_completed');
          setLogs(newLogs);
          
          const customerDetail = await apiService.getCustomer(task.customer_id);
          const sortedRecs = customerDetail.recommendations.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          if (sortedRecs.length > 0) {
            setTimeout(() => {
              navigate('recommendations', task.customer_id);
            }, 1500);
          }
        } else if (task.status === 'failed') {
          newLogs.push(`[${new Date().toLocaleTimeString()}] [SYSTEM] CRITICAL ERROR: Agent chain aborted.`);
          setLogs(newLogs);
          setError("Orchestrator pipeline failed.");
        } else {
          setLogs(newLogs);
          setTimeout(poll, 1200);
        }
      } catch (err: any) {
        if (!active) return;
        setError(err.message || "Connection check failed.");
      }
    };

    poll();
    return () => {
      active = false;
    };
  }, [activeTaskId]);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Construct React Flow Nodes and Edges dynamically
  const flowNodes: Node[] = (taskState?.agents || []).map((agent, index) => {
    return {
      id: agent.agent_name,
      type: 'agentNode',
      position: { x: 50, y: index * 90 },
      draggable: false,
      data: {
        agent_name: agent.agent_name,
        status: agent.status,
        progress: agent.progress,
        execution_time: agent.execution_time,
        output_summary: agent.output_summary,
      }
    };
  });

  const flowEdges: Edge[] = [];
  const agents = taskState?.agents || [];
  for (let i = 0; i < agents.length - 1; i++) {
    const source = agents[i];
    const target = agents[i + 1];
    
    let strokeColor = '#E5E7EB';
    if (source.status === 'completed') {
      strokeColor = '#10B981';
    } else if (source.status === 'running') {
      strokeColor = '#3B82F6';
    }

    flowEdges.push({
      id: `e-${source.agent_name}-${target.agent_name}`,
      source: source.agent_name,
      target: target.agent_name,
      animated: source.status === 'completed' || source.status === 'running',
      style: {
        stroke: strokeColor,
        strokeWidth: 2,
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Agentic Graph Cockpit
          </h1>
          <p className="text-xs text-neutral-455 dark:text-neutral-500 mt-0.5">
            Interactive visualizer showing dynamic node execution traces.
          </p>
        </div>
        
        {activeTaskId && (
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3.5 py-1.5 rounded-lg shadow-xs">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>Time Elapsed: {elapsedTime}s</span>
          </div>
        )}
      </div>

      {activeTaskId ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left/Center Pane: Workflow Graph using React Flow */}
          <div className="lg:col-span-2 p-6 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-neutral-950 dark:text-white uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-850 pb-2">
              LangGraph StateGraph Nodes (React Flow)
            </h3>
            
            {error && (
              <div className="flex items-center gap-2 p-3 text-xs font-semibold text-danger bg-danger/10 border border-danger/20 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* React Flow Container */}
            <div className="h-[580px] w-full border border-neutral-105 dark:border-neutral-850 rounded-xl overflow-hidden bg-neutral-50/50 dark:bg-neutral-950/20 relative">
              <ReactFlow
                nodes={flowNodes}
                edges={flowEdges}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                nodesConnectable={false}
                nodesDraggable={false}
                zoomOnScroll={false}
                zoomOnPinch={false}
                panOnDrag={false}
              >
                <Background color="#ccc" gap={16} size={1} />
              </ReactFlow>
            </div>

          </div>

          {/* Right Pane: Monospaced logs panel */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 border border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-neutral-200 rounded-xl shadow-md font-mono text-xs flex flex-col h-[650px] border border-neutral-200/50 dark:border-neutral-800/50"
          >
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-800 text-neutral-400 mb-4 flex-shrink-0">
              <Terminal className="w-4 h-4" />
              <span className="font-bold tracking-tight text-[11px] uppercase">Telemetry Execution console</span>
            </div>

            {/* Scrollable console lines */}
            <div className="flex-1 overflow-y-auto space-y-2 select-text pr-2 leading-relaxed text-[11px]">
              <AnimatePresence initial={false}>
                {logs.map((log, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${
                      log.includes('[SYSTEM]') 
                        ? 'text-neutral-450 font-bold' 
                        : log.includes('complete') || log.includes('successful')
                          ? 'text-emerald-450 font-bold' 
                          : log.includes('aborted')
                            ? 'text-danger font-semibold'
                            : 'text-neutral-205 font-medium'
                    }`}
                  >
                    {log}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={consoleEndRef} />
            </div>
          </motion.div>

        </div>
      ) : (
        <div className="max-w-md mx-auto text-center p-8 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-xs space-y-4">
          <div className="p-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded-xl inline-block">
            <Cpu className="w-8 h-8" />
          </div>
          <h2 className="text-base font-bold text-neutral-905 dark:text-white">No active agent runs</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Please select a customer from the workspace and click "Run Decision Agents" or upload an artifact to trigger agentic synthesis execution.
          </p>
          <button 
            onClick={() => navigate('customers')}
            className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark cursor-pointer"
          >
            Select Customer Account
          </button>
        </div>
      )}
    </div>
  );
};

export default AIExecution;
