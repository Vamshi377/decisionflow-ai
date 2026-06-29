import React, { useEffect, useState } from 'react';
import { apiService, type Customer } from '../services/api';
import { ApprovalHistoryCard } from '../components/ui/ApprovalHistoryCard';
import { 
  MessageSquare, 
  Sparkles, 
  RefreshCw,
  AlertCircle,
  Activity,
  ShieldCheck,
  UserPlus,
  Calendar,
  Clock,
  Ticket
} from 'lucide-react';

export const Memory: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [memories, setMemories] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const list = await apiService.getCustomers();
        setCustomers(list);
        if (list.length > 0) {
          setSelectedCustomerId(list[0].id);
        }
        setLoadingCustomers(false);
      } catch (err) {
        setError("Failed to fetch customer select configurations.");
        setLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, []);

  const fetchTimeline = async (id: number) => {
    setLoadingTimeline(true);
    try {
      const list = await apiService.getMemory(id);
      setMemories(list);
      setLoadingTimeline(false);
    } catch (err) {
      console.error("Failed to load customer memories", err);
      setLoadingTimeline(false);
    }
  };

  useEffect(() => {
    if (selectedCustomerId) {
      fetchTimeline(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'joined': return UserPlus;
      case 'health_change': return Activity;
      case 'meeting': return MessageSquare;
      case 'ticket': return Ticket;
      case 'recommendation': return Sparkles;
      case 'decision':
      case 'approval':
        return ShieldCheck;
      case 'renewal': return Calendar;
      default: return Clock;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'joined':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40';
      case 'health_change':
        return 'text-orange-500 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/40';
      case 'meeting':
        return 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/40';
      case 'ticket':
        return 'text-rose-500 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40';
      case 'recommendation':
        return 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-900/40';
      case 'decision':
      case 'approval':
        return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40';
      case 'renewal':
        return 'text-violet-500 bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-900/40';
      default:
        return 'text-neutral-500 bg-neutral-100 border-neutral-200 dark:bg-neutral-850 dark:border-neutral-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
          Client Interaction Memory
        </h1>
        <p className="text-xs text-neutral-450 dark:text-neutral-500 mt-0.5 font-medium">
          Access historical playbooks, meeting notes, and approval histories.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-danger-light/20 border border-danger/30 text-danger-dark dark:text-danger-light">
          <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
          <p className="text-xs font-semibold leading-tight">{error}</p>
        </div>
      )}

      {/* Main Grid: Customer Memory timeline on left, Global decision history on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Customer history timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-sm space-y-6">
            
            {/* Customer selector header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-850">
              <div>
                <h2 className="text-sm font-bold text-neutral-950 dark:text-white">Account Memory Logs</h2>
                <p className="text-[10px] text-neutral-450 dark:text-neutral-500 mt-0.5 font-medium">Select client to inspect historical decision sequences.</p>
              </div>
              
              {!loadingCustomers && (
                <select
                  value={selectedCustomerId || ''}
                  onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                  className="sm:w-56 p-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-955 text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Timeline */}
            {loadingTimeline ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                <span className="text-xs text-neutral-405">Loading timeline database...</span>
              </div>
            ) : memories.length > 0 ? (
              <div className="relative pl-10 space-y-6">
                {/* Connection thread */}
                <div className="absolute left-[15px] top-2.5 bottom-2.5 w-[2px] bg-neutral-200 dark:bg-neutral-800" />
 
                {memories.map((mem) => {
                  const Icon = getIcon(mem.interaction_type);
                  const colorClass = getBadgeColor(mem.interaction_type);
                  return (
                    <div key={mem.id} className="relative flex items-start gap-4">
                      {/* Left timeline badge with icon */}
                      <div className="absolute left-0 top-0.5 w-8 h-8 flex items-center justify-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${colorClass} z-10 shadow-xs`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                      </div>
 
                      <div className="flex-grow space-y-1.5 pl-10">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-neutral-900 dark:text-white capitalize">
                            {mem.interaction_type.replace('_', ' ')} Event
                          </span>
                          <span className="text-[10px] text-neutral-450 dark:text-neutral-500 font-bold">
                            {new Date(mem.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>
 
                        <p className="text-xs text-neutral-600 dark:text-neutral-350 bg-neutral-50/30 dark:bg-neutral-955/10 p-3 rounded-lg border border-neutral-100 dark:border-neutral-850 leading-relaxed font-sans font-semibold">
                          {mem.content}
                        </p>
 
                        <div className="flex items-center gap-3 text-[9px] text-neutral-450 dark:text-neutral-500 font-bold flex-wrap">
                          <span>Health Score: {mem.health_score}%</span>
                          <span>•</span>
                          <span>Risk Level: {mem.risk_level.toUpperCase()}</span>
                          {mem.outcome && (
                            <>
                              <span>•</span>
                              <span className="text-success">Outcome Status: {mem.outcome}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center py-12">
                No previous memory interactions recorded. Upload transcripts to initiate model timeline logs.
              </p>
            )}

          </div>
        </div>

        {/* Right Col: Global overrides audit timeline */}
        <div className="lg:col-span-1">
          <ApprovalHistoryCard />
        </div>

      </div>
    </div>
  );
};
