import React, { useEffect, useState } from 'react';
import { apiService, type AuditLog } from '../../services/api';
import { ApprovalStatusBadge } from './ApprovalStatusBadge';
import { History, UserCircle, Calendar, RefreshCw } from 'lucide-react';

export const ApprovalHistoryCard: React.FC = () => {
  const [decisions, setDecisions] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const logs = await apiService.getAuditLogs();
      // Filter for recommendation decisions (e.g. Approved, Rejected, Modified)
      const filtered = logs.filter(log => 
        log.user_action.toLowerCase().includes('approved') ||
        log.user_action.toLowerCase().includes('rejected') ||
        log.user_action.toLowerCase().includes('modified') ||
        log.user_action.toLowerCase().includes('override')
      );
      setDecisions(filtered);
      setLoading(false);
    } catch (err: any) {
      setError("Failed to load approval history logs.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getStatusFromAction = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('approved')) return 'approved';
    if (act.includes('rejected')) return 'rejected';
    if (act.includes('modified') || act.includes('override')) return 'modified';
    return 'pending';
  };

  return (
    <div className="p-6 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2 text-neutral-450 dark:text-neutral-500">
          <History className="w-4 h-4 text-neutral-450" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Human Approval History
          </span>
        </div>
        <button 
          onClick={fetchHistory}
          className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 dark:text-neutral-500 hover:text-neutral-950 dark:hover:text-white transition-colors duration-150"
          title="Refresh history logs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-2">
          <RefreshCw className="w-5 h-5 animate-spin text-neutral-400" />
          <span className="text-xs text-neutral-400">Loading history logs...</span>
        </div>
      ) : error ? (
        <p className="text-xs text-danger text-center py-6">{error}</p>
      ) : decisions.length > 0 ? (
        <div className="relative pl-6 space-y-5">
          {/* Vertical line connection */}
          <div className="absolute left-2.5 top-1 bottom-4 w-[1px] bg-neutral-100 dark:bg-neutral-800" />

          {decisions.map((dec) => {
            const status = getStatusFromAction(dec.user_action);
            return (
              <div key={dec.id} className="relative flex items-start gap-4">
                {/* Timeline node */}
                <div className={`absolute -left-6 w-2 h-2 rounded-full border-2 bg-white dark:bg-neutral-900 mt-2 ${
                  status === 'approved' 
                    ? 'border-success' 
                    : status === 'rejected' 
                      ? 'border-danger' 
                      : 'border-warning'
                }`} />

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-neutral-950 dark:text-white">
                      {dec.user_action}
                    </span>
                    <ApprovalStatusBadge status={status} />
                  </div>
                  
                  <p className="text-xs text-neutral-600 dark:text-neutral-350 leading-relaxed bg-neutral-50 dark:bg-neutral-950/40 p-2.5 rounded-lg border border-neutral-100/60 dark:border-neutral-800/40">
                    {dec.details}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold flex-wrap">
                    <span className="flex items-center gap-1">
                      <UserCircle className="w-3.5 h-3.5" /> {dec.user_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> 
                      {new Date(dec.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center py-6">
          No approval decisions recorded yet.
        </p>
      )}
    </div>
  );
};
