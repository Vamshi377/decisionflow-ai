import React, { useEffect, useState } from 'react';
import { apiService, type AnalyticsSummary } from '../services/api';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  Cpu, 
  Loader2, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await apiService.getAnalytics();
      setData(summary);
      setLoading(false);
    } catch (err) {
      setError("Failed to sync analytics report metrics.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs text-neutral-450">Syncing analytics database...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <AlertCircle className="w-8 h-8 text-danger mx-auto" />
        <h2 className="text-base font-bold text-neutral-905 dark:text-white font-sans">Analytics Sync Failed</h2>
        <p className="text-xs text-neutral-500 leading-relaxed">{error}</p>
        <button onClick={fetchAnalytics} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark">
          Retry Connection
        </button>
      </div>
    );
  }

  // Parse Pie data
  const pieData = [
    { name: 'Approved', value: data.decisions_breakdown.approved, color: '#10B981' },
    { name: 'Modified', value: data.decisions_breakdown.modified, color: '#F59E0B' },
    { name: 'Rejected', value: data.decisions_breakdown.rejected, color: '#EF4444' },
    { name: 'Pending', value: data.decisions_breakdown.pending, color: '#cbd5e1' },
  ].filter(d => d.value > 0);

  // Parse Bar data
  const riskBarData = [
    { name: 'Low Risk', count: data.risk_distribution.low || 0, fill: '#10B981' },
    { name: 'Medium Risk', count: data.risk_distribution.medium || 0, fill: '#F59E0B' },
    { name: 'High Risk', count: data.risk_distribution.high || 0, fill: '#EF4444' },
  ];

  // Agent execution latencies (mock performance data matching typical backend runtimes)
  const agentPerformanceData = [
    { name: 'Planner', time: 1.2 },
    { name: 'Signal', time: 0.8 },
    { name: 'Memory', time: 0.3 },
    { name: 'Knowledge', time: 1.2 },
    { name: 'Recommendation', time: 1.1 },
    { name: 'Explainability', time: 0.9 },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
            System Intelligence Analytics
          </h1>
          <p className="text-xs text-neutral-450 dark:text-neutral-500 mt-0.5">
            Operational dashboard analyzing next-best-action acceptance rates and latencies.
          </p>
        </div>
        <button 
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-350 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-all duration-150"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reload Graphs
        </button>
      </div>

      {/* Grid of charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Acceptance Rate (Pie Chart) */}
        <div className="p-6 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-neutral-450 dark:text-neutral-500 border-b border-neutral-100 dark:border-neutral-850 pb-2">
            <PieIcon className="w-4 h-4 text-neutral-450" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Recommendation Acceptance Rate</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-1/2 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} decisions`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full sm:w-1/2 space-y-2">
              <div className="text-center sm:text-left pb-2">
                <span className="text-2xl font-bold text-neutral-955 dark:text-white">{data.acceptance_rate}%</span>
                <span className="text-[10px] text-neutral-450 block font-semibold uppercase">Total Acceptance Index</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-neutral-600 dark:text-neutral-400">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Customer Risk Distribution (Bar Chart) */}
        <div className="p-6 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-neutral-450 dark:text-neutral-500 border-b border-neutral-100 dark:border-neutral-850 pb-2">
            <BarChart3 className="w-4 h-4 text-neutral-450" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Account Churn Risk Profile</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskBarData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" stroke="#a3a3a3" fontSize={10} tickLine={false} />
                <YAxis stroke="#a3a3a3" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'transparent' }} formatter={(value) => [`${value} customers`, 'Volume']} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {riskBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Weekly Activity Trends (Line Chart) */}
        <div className="p-6 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-neutral-450 dark:text-neutral-500 border-b border-neutral-100 dark:border-neutral-850 pb-2">
            <TrendingUp className="w-4 h-4 text-neutral-450" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Weekly Activity Flow</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.weekly_activity} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="day" stroke="#a3a3a3" fontSize={10} tickLine={false} />
                <YAxis stroke="#a3a3a3" fontSize={10} tickLine={false} />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="generated" stroke="#2563EB" strokeWidth={2} name="NBA Generated" activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="accepted" stroke="#10B981" strokeWidth={2} name="NBA Accepted" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Agent Latencies Performance (Horizontal Bar Chart) */}
        <div className="p-6 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-neutral-450 dark:text-neutral-500 border-b border-neutral-100 dark:border-neutral-850 pb-2">
            <Cpu className="w-4 h-4 text-neutral-450" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Agent Node Latency Performance</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={agentPerformanceData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f5" />
                <XAxis type="number" stroke="#a3a3a3" fontSize={10} tickLine={false} label={{ value: 'Seconds', position: 'insideBottom', offset: -5, fontSize: '9px' }} />
                <YAxis type="category" dataKey="name" stroke="#a3a3a3" fontSize={10} tickLine={false} />
                <Tooltip formatter={(value) => [`${value}s`, 'Runtime']} />
                <Bar dataKey="time" fill="#06B6D4" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
