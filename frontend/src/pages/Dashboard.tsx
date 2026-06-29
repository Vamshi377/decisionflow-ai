import React, { useEffect, useState } from 'react';
import { useNav } from '../context/NavContext';
import { apiService, type Customer, type AnalyticsSummary } from '../services/api';
import { 
  Users, 
  CheckSquare, 
  TrendingUp, 
  AlertCircle, 
  ShieldAlert, 
  ChevronRight, 
  Upload, 
  Activity,
  RefreshCw,
  Sparkles,
  Calendar,
  Cpu
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { navigate } = useNav();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dynamic recommendations and activity feed logs
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // ROI / Churn Calculator state
  const [atRiskValue, setAtRiskValue] = useState(250000);
  const [mitigationRate, setMitigationRate] = useState(45);
  const savedValue = Math.round(atRiskValue * (mitigationRate / 100));

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [customerList, summary, logs, recs] = await Promise.all([
        apiService.getCustomers(),
        apiService.getAnalytics(),
        apiService.getAuditLogs(),
        apiService.getRecommendations()
      ]);
      setCustomers(customerList);
      setAnalytics(summary);
      setAuditLogs(logs || []);
      setRecommendations(recs || []);
      setLoading(false);
    } catch (err) {
      setError("Failed to sync dashboard telemetry with database.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter for Priority Queue: Health Score < 70
  const priorityQueue = customers
    .filter(c => c.health_score < 70)
    .sort((a, b) => a.health_score - b.health_score);

  // Filter for Upcoming Renewals & Top Risks
  const upcomingRenewals = [...customers]
    .sort((a, b) => new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime());

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm text-neutral-455 dark:text-neutral-500">Syncing dashboard telemetry...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <div className="p-3 bg-danger/10 text-danger rounded-xl inline-block">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-base font-bold text-neutral-900 dark:text-white">Telemetry Sync Failed</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Decision Intel Cockpit
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
            Overview of client lifecycle risk matrices and agentic decisions.
          </p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-950 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-150 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Immediate Platform Objective Announcement Card */}
      <div className="relative overflow-hidden p-5 border border-primary/10 dark:border-primary/20 bg-linear-to-r from-primary/5 to-transparent dark:from-primary/10 dark:to-transparent rounded-xl shadow-xs flex items-center gap-4">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="p-2.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light rounded-xl flex-shrink-0 border border-primary/20">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div className="space-y-1 z-10">
          <h2 className="text-xs font-bold text-primary dark:text-primary-light uppercase tracking-wider leading-none">DecisionFlow Agentic Platform</h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed max-w-4xl">
            This platform analyzes customer interactions using multiple AI agents <span className="text-neutral-900 dark:text-white font-semibold">(Planner, Signal, Memory, Knowledge, Recommendation, Explainability)</span> and recommends the Next Best Action.
          </p>
        </div>
      </div>

      {/* 4 Analytics cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average Health Score Card */}
        <div className="p-5 border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-xs space-y-3 hover:-translate-y-1 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 group">
          <div className="flex items-center justify-between text-neutral-450 dark:text-neutral-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Average Health</span>
            <div className="p-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-850 rounded-lg text-neutral-400 group-hover:text-primary transition-colors">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-neutral-955 dark:text-white tracking-tight">
                {analytics?.average_health_score}%
              </span>
              <span className="text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded-md border border-success/10">
                Stable
              </span>
            </div>
            {/* Sparkline SVG */}
            <div className="h-6 w-16 opacity-75 group-hover:opacity-100 transition-opacity">
              <svg className="w-full h-full text-success" viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0,25 L15,22 L30,24 L45,18 L60,20 L75,15 L90,12 L100,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M0,25 L15,22 L30,24 L45,18 L60,20 L75,15 L90,12 L100,10 L100,30 L0,30 Z" fill="url(#health-grad)" opacity="0.08" />
                <defs>
                  <linearGradient id="health-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* High Risk Customers Count Card */}
        <div className="p-5 border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-xs space-y-3 hover:-translate-y-1 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">High Risk Accounts</span>
            <div className="p-1.5 bg-red-50/50 dark:bg-red-950/20 border border-red-100/50 dark:border-red-900/30 rounded-lg text-danger group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-neutral-955 dark:text-white tracking-tight">
                {analytics?.risk_distribution.high || 0}
              </span>
              <span className="text-[10px] font-bold text-danger bg-danger/10 px-1.5 py-0.5 rounded-md border border-danger/10">
                Needs Attention
              </span>
            </div>
            {/* Sparkline SVG */}
            <div className="h-6 w-16 opacity-75 group-hover:opacity-100 transition-opacity">
              <svg className="w-full h-full text-danger" viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0,10 L15,12 L30,8 L45,15 L60,18 L75,22 L90,25 L100,28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M0,10 L15,12 L30,8 L45,15 L60,18 L75,22 L90,25 L100,28 L100,30 L0,30 Z" fill="url(#risk-grad)" opacity="0.08" />
                <defs>
                  <linearGradient id="risk-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Pending Approvals Count Card */}
        <div className="p-5 border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-xs space-y-3 hover:-translate-y-1 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Pending Decisions</span>
            <div className="p-1.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 rounded-lg text-primary group-hover:scale-105 transition-transform">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-neutral-955 dark:text-white tracking-tight">
                {analytics?.decisions_breakdown.pending || 0}
              </span>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/10">
                Queue Backlog
              </span>
            </div>
            {/* Sparkline SVG */}
            <div className="h-6 w-16 opacity-75 group-hover:opacity-100 transition-opacity">
              <svg className="w-full h-full text-primary" viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0,28 L15,20 L30,22 L45,15 L60,12 L75,18 L90,10 L100,5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M0,28 L15,20 L30,22 L45,15 L60,12 L75,18 L90,10 L100,5 L100,30 L0,30 Z" fill="url(#dec-grad)" opacity="0.08" />
                <defs>
                  <linearGradient id="dec-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Decision Acceptance Rate Card */}
        <div className="p-5 border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-xs space-y-3 hover:-translate-y-1 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-450">NBA Acceptance Rate</span>
            <div className="p-1.5 bg-green-50/50 dark:bg-emerald-950/20 border border-green-100/50 dark:border-emerald-900/30 rounded-lg text-success group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-neutral-955 dark:text-white tracking-tight">
                {analytics?.acceptance_rate}%
              </span>
              <span className="text-[10px] font-semibold text-success flex items-center gap-0.5 mt-0.5">
                +2.4% vs last week
              </span>
            </div>
            {/* Sparkline SVG */}
            <div className="h-6 w-16 opacity-75 group-hover:opacity-100 transition-opacity">
              <svg className="w-full h-full text-success" viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0,28 L15,26 L30,24 L45,20 L60,15 L75,10 L90,5 L100,2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M0,28 L15,26 L30,24 L45,20 L60,15 L75,10 L90,5 L100,2 L100,30 L0,30 Z" fill="url(#acc-grad)" opacity="0.08" />
                <defs>
                  <linearGradient id="acc-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Priority queue on left, Audits and Quick actions on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Today's Priority Queue & Recent Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customers Requiring Immediate Attention */}
          <div className="p-6 border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-xs space-y-4">
            <div>
              <h2 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Customers Requiring Immediate Attention
              </h2>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
                Clients showing critical renewal risk and low license utilization. Review action proposed.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-neutral-100 dark:border-neutral-800/80 text-neutral-450 dark:text-neutral-500 font-bold uppercase text-[9px] tracking-wider">
                    <th className="py-2.5 px-2">Account Name</th>
                    <th className="py-2.5 px-2">Company</th>
                    <th className="py-2.5 px-2 text-center">Health Index</th>
                    <th className="py-2.5 px-2 text-center">Risk Profile</th>
                    <th className="py-2.5 px-2">Key Issue Flagged</th>
                    <th className="py-2.5 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100/50 dark:divide-neutral-800/40 text-neutral-600 dark:text-neutral-350">
                  {priorityQueue.map((c) => (
                    <tr 
                      key={c.id} 
                      className="hover:bg-neutral-50/50 dark:hover:bg-neutral-950/20 transition-all cursor-pointer group"
                      onClick={() => navigate('workspace', c.id)}
                    >
                      <td className="py-3 px-2 font-bold text-neutral-900 dark:text-white group-hover:text-primary transition-colors">{c.name}</td>
                      <td className="py-3 px-2 font-medium">{c.company_name}</td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex items-center justify-center gap-1.5 font-bold">
                          <span className={`w-1.5 h-1.5 rounded-full ${c.health_score < 40 ? 'bg-danger animate-pulse' : 'bg-warning'}`} />
                          <span className={c.health_score < 40 ? 'text-danger' : 'text-warning'}>
                            {c.health_score}/100
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                          c.risk_level === 'high' 
                            ? 'bg-red-50/80 text-danger border-red-200/60 dark:bg-red-950/30 dark:text-red-450 dark:border-red-900/50' 
                            : 'bg-amber-50/80 text-warning border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-450 dark:border-amber-900/50'
                        }`}>
                          {c.risk_level}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-medium text-neutral-500 dark:text-neutral-400 truncate max-w-[140px]">
                        {c.id === 1 ? "Salesforce review, 30% usage drop" : c.id === 4 ? "SLA breach, SSO login errors" : "Licensing utilization gap"}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all inline" />
                      </td>
                    </tr>
                  ))}
                  {priorityQueue.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-neutral-400 font-bold">
                        All client accounts are stable and healthy.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Recommendations & AI Decisions */}
          <div className="p-6 border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-xs space-y-4">
            <div>
              <h2 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Recent AI Recommendations & Decisions
              </h2>
              <p className="text-[10px] text-neutral-500 mt-1 font-medium">
                Audited action logs compiled by recommendation agents.
              </p>
            </div>

             <div className="space-y-3">
              {recommendations.slice(0, 5).map((item, idx) => {
                const c = customers.find(x => x.id === item.customer_id);
                const cName = c ? c.company_name : `Client #${item.customer_id}`;
                return (
                  <div key={idx} className="p-3.5 border border-neutral-100/60 dark:border-neutral-800/60 bg-neutral-50/10 dark:bg-neutral-950/10 rounded-xl hover:bg-neutral-50/40 dark:hover:bg-neutral-950/30 transition-all duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white">{cName}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold border uppercase tracking-wider ${
                          item.status === 'approved' 
                            ? 'bg-green-50/80 text-success border-green-200/60 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50' 
                            : 'bg-amber-50/80 text-warning border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-455 dark:border-amber-900/50'
                        }`}>{item.status}</span>
                      </div>
                      <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-bold">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-250 mt-1.5 leading-snug">{item.action}</h4>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-405 mt-1 font-medium">{item.justification}</p>
                  </div>
                );
              })}
              {recommendations.length === 0 && (
                <p className="text-xs text-neutral-400 text-center py-6">No recent recommendations compiled yet. Select a client to run agents.</p>
              )}
            </div>
          </div>

          {/* Agent Activity Feed (Telemetry logger) */}
          <div className="p-6 border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <Cpu className="w-3.5 h-3.5 text-primary animate-pulse" />
              <h2 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Agent Activity Feed</h2>
            </div>

            <div className="space-y-4 mt-2">
              {auditLogs.slice(0, 6).map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  {/* Left Column: Bullet & Timeline Line */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-primary bg-white dark:bg-neutral-900 z-10" />
                    {idx < Math.min(5, auditLogs.length - 1) && (
                      <div className="w-[1.5px] grow bg-neutral-100 dark:bg-neutral-800 mt-1" />
                    )}
                  </div>
                  {/* Right Column: Text Content */}
                  <div className="flex-grow pb-3 last:pb-0">
                    <span className="font-bold text-neutral-900 dark:text-white block text-xs leading-none">{item.agent_name}</span>
                    <p className="text-neutral-500 dark:text-neutral-455 font-medium mt-1.5 leading-snug text-[10px]">{item.summary}</p>
                    <span className="text-[8px] text-neutral-400 font-bold block mt-1">{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <p className="text-xs text-neutral-450 text-center py-4">No recent agent activity logs. Initializing pipeline...</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Upcoming Renewals, Activity Telemetry & Tasks */}
        <div className="space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="p-6 border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Quick Actions</h2>
            
            <div className="grid grid-cols-1 gap-2.5">
              <button 
                onClick={() => navigate('upload')}
                className="flex items-center gap-3.5 p-3.5 text-left rounded-xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/20 dark:bg-neutral-950/20 hover:border-primary/20 hover:bg-primary/5 dark:hover:bg-primary/5 transition-all duration-150 group"
              >
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-primary transition-colors">Upload Playbooks</h4>
                  <p className="text-[9px] text-neutral-450 dark:text-neutral-500 mt-0.5 font-medium">Ingest transcripts and emails</p>
                </div>
              </button>

              <button 
                onClick={() => navigate('customers')}
                className="flex items-center gap-3.5 p-3.5 text-left rounded-xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/20 dark:bg-neutral-950/20 hover:border-indigo-500/20 hover:bg-indigo-500/5 dark:hover:bg-indigo-500/5 transition-all duration-150 group"
              >
                <div className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-405 group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-indigo-500 transition-colors">Client Portfolio</h4>
                  <p className="text-[9px] text-neutral-450 dark:text-neutral-500 mt-0.5 font-medium">Search client accounts list</p>
                </div>
              </button>
            </div>
          </div>

          {/* AI Risk Impact Calculator */}
          <div className="p-6 border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <h2 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">AI Impact Calculator</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-[10px] text-neutral-500 dark:text-neutral-450 leading-relaxed font-medium">
                Simulate potential contract recovery by applying next-best action playbooks.
              </p>

              {/* Slider 1: At-Risk Value */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-600 dark:text-neutral-350">
                  <span>AT-RISK CONTRACT ACV</span>
                  <span className="font-bold text-neutral-900 dark:text-white">${atRiskValue.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="50000" 
                  max="1000000" 
                  step="10000"
                  value={atRiskValue}
                  onChange={(e) => setAtRiskValue(Number(e.target.value))}
                  className="w-full accent-primary h-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Slider 2: Mitigation Rate */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-600 dark:text-neutral-350">
                  <span>TARGET MITIGATION RATE</span>
                  <span className="font-bold text-neutral-900 dark:text-white">{mitigationRate}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  step="5"
                  value={mitigationRate}
                  onChange={(e) => setMitigationRate(Number(e.target.value))}
                  className="w-full accent-primary h-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Dynamic Saved Revenue block */}
              <div className="p-3.5 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-primary uppercase tracking-wider block">Estimated Recovery</span>
                  <span className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5 block">${savedValue.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Risk Reduction</span>
                  <span className="text-xs font-bold text-success mt-0.5 block">-{mitigationRate}% Churn</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Upcoming Renewals & Risks */}
          <div className="p-6 border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <h2 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Upcoming Renewals</h2>
            </div>

            <div className="space-y-2">
              {upcomingRenewals.map((c) => (
                <div 
                  key={c.id} 
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-950 cursor-pointer transition-all duration-150 group"
                  onClick={() => navigate('workspace', c.id)}
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-primary transition-colors">{c.name}</p>
                    <span className="text-[9px] text-neutral-450 dark:text-neutral-500 font-bold">
                      Renewal: {new Date(c.renewal_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                    c.risk_level === 'high' 
                      ? 'bg-red-50/80 text-danger border-red-200/60 dark:bg-red-950/30 dark:text-red-450 dark:border-red-900/50' 
                      : c.risk_level === 'medium'
                        ? 'bg-amber-50/80 text-warning border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-450 dark:border-amber-900/50'
                        : 'bg-green-50/80 text-success border-green-200/60 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50'
                  }`}>
                    {c.risk_level}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
