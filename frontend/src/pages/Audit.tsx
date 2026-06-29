import React, { useEffect, useState } from 'react';
import { apiService, type AuditLog } from '../services/api';
import { ShieldAlert, Search, Calendar, User, Info, RefreshCw, AlertCircle } from 'lucide-react';

export const Audit: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const allLogs = await apiService.getAuditLogs();
      setLogs(allLogs);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch system audit logs.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => 
    l.user_action.toLowerCase().includes(search.toLowerCase()) ||
    l.user_name.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Security & Compliance Audit Logs
          </h1>
          <p className="text-xs text-neutral-450 dark:text-neutral-500 mt-0.5">
            Cryptographic ledger tracking AI model triggers and user override actions.
          </p>
        </div>
        <button 
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-350 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-all duration-150"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Sync Logs
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="relative p-4 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-sm">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
        <input
          type="text"
          placeholder="Filter audit logs by action, username, or details keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-950 text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        />
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-danger-light/20 border border-danger/30 text-danger-dark dark:text-danger-light">
          <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
          <p className="text-xs font-semibold leading-tight">{error}</p>
        </div>
      )}

      {/* Table grid */}
      <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs text-neutral-400">Loading audit ledger...</span>
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">
                  <th className="p-4"><span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Timestamp</span></th>
                  <th className="p-4"><span className="flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> Action Event</span></th>
                  <th className="p-4"><span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> User Entity</span></th>
                  <th className="p-4"><span className="flex items-center gap-1"><Info className="w-3.5 h-3.5" /> Event Logs</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/40 dark:hover:bg-neutral-950/10 transition-colors duration-150">
                    <td className="p-4 text-neutral-500 dark:text-neutral-400 font-medium whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="p-4 font-bold text-neutral-900 dark:text-white whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${
                        log.user_action.toLowerCase().includes('approve') 
                          ? 'bg-success/5 border-success/20 text-success' 
                          : log.user_action.toLowerCase().includes('reject')
                            ? 'bg-danger/5 border-danger/20 text-danger'
                            : log.user_action.toLowerCase().includes('modify') || log.user_action.toLowerCase().includes('overr')
                              ? 'bg-warning/5 border-warning/20 text-warning'
                              : 'bg-neutral-50 dark:bg-neutral-950 border-neutral-100 dark:border-neutral-850 text-neutral-500'
                      }`}>
                        {log.user_action}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-700 dark:text-neutral-355 font-semibold whitespace-nowrap">
                      {log.user_name}
                    </td>
                    <td className="p-4 text-neutral-600 dark:text-neutral-300 leading-relaxed min-w-[20rem]">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <p className="text-xs text-neutral-450 dark:text-neutral-500">
              No audit logs match your query description filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
