import React, { useEffect, useState } from 'react';
import { useNav } from '../context/NavContext';
import { apiService, type Customer } from '../services/api';
import { Search, Filter, ArrowUpDown, ChevronRight, RefreshCw, AlertCircle, UserPlus } from 'lucide-react';
import { CreateCustomerDialog } from '../components/ui/CreateCustomerDialog';

export const Customers: React.FC = () => {
  const { navigate } = useNav();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'health_score' | 'renewal_date'>('health_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await apiService.getCustomers();
      setCustomers(list);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch customer list from DB.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSort = (field: 'name' | 'health_score' | 'renewal_date') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder(field === 'health_score' ? 'asc' : 'desc'); // default asc for health (lowest first)
    }
  };

  // Filter & Search Logic
  const filteredCustomers = customers
    .filter(c => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.company_name.toLowerCase().includes(search.toLowerCase());
      const matchRisk = riskFilter === 'all' || c.risk_level === riskFilter;
      return matchSearch && matchRisk;
    })
    .sort((a, b) => {
      let multiplier = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name) * multiplier;
      }
      if (sortBy === 'health_score') {
        return (a.health_score - b.health_score) * multiplier;
      }
      if (sortBy === 'renewal_date') {
        return (new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime()) * multiplier;
      }
      return 0;
    });

  const getAvatarBadge = (name: string) => {
    const initials = name.slice(0, 2).toUpperCase();
    const colors = [
      'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200/30 dark:border-blue-800/30',
      'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200/30 dark:border-emerald-800/30',
      'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-200/30 dark:border-indigo-800/30',
      'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200/30 dark:border-purple-800/30',
      'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400 border-cyan-200/30 dark:border-cyan-800/30',
      'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200/30 dark:border-rose-800/30',
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    const colorStyle = colors[sum % colors.length];
    return { initials, colorStyle };
  };

  return (
    <div className="space-y-6">
      {/* Header telemetry */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Client Accounts Portfolio
          </h1>
          <p className="text-xs text-neutral-450 dark:text-neutral-500 mt-0.5">
            Database of accounts and health score tracking filters.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-all duration-150 cursor-pointer shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" /> Register Client
          </button>
          <button 
            onClick={fetchCustomers}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-350 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-all duration-150 cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload List
          </button>
        </div>
      </div>

      {/* Search & Filters Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-xs">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-450 dark:text-neutral-500" />
          <input
            type="text"
            placeholder="Search account name or company name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-neutral-50/50 dark:bg-neutral-950/40 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/45 focus:border-primary transition-all duration-150 font-medium"
          />
        </div>

        {/* Risk Filter Select */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-neutral-450" />
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-neutral-50/50 dark:bg-neutral-950/40 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/45 focus:border-primary font-semibold cursor-pointer"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk Only</option>
            <option value="medium">Medium Risk Only</option>
            <option value="high">High Risk Only</option>
          </select>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-danger-light/20 border border-danger/30 text-danger-dark dark:text-danger-light">
          <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
          <p className="text-xs font-semibold leading-tight">{error}</p>
        </div>
      )}

      {/* Main Table Card */}
      <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs text-neutral-450">Fetching customer accounts...</span>
          </div>
        ) : filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">
                  <th className="p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors" onClick={() => handleSort('name')}>
                    <span className="flex items-center gap-1.5">Client & Company <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors" onClick={() => handleSort('health_score')}>
                    <span className="flex items-center gap-1.5">Health Score <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="p-4">Risk Level</th>
                  <th className="p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors" onClick={() => handleSort('renewal_date')}>
                    <span className="flex items-center gap-1.5">Renewal Date <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                {filteredCustomers.map((c) => (
                  <tr 
                    key={c.id} 
                    className="hover:bg-neutral-50/40 dark:hover:bg-neutral-950/20 transition-colors duration-150 cursor-pointer"
                    onClick={() => navigate('workspace', c.id)}
                  >
                    {/* Name column */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const { initials, colorStyle } = getAvatarBadge(c.company_name || c.name);
                          return (
                            <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs border ${colorStyle}`}>
                              {initials}
                            </div>
                          );
                        })()}
                        <div>
                          <p className="text-xs font-bold text-neutral-950 dark:text-white leading-none">
                            {c.name}
                          </p>
                          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1.5 font-semibold">
                            {c.company_name} • {c.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Health score visual progress bar */}
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5 w-32">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-neutral-450 dark:text-neutral-500">HEALTH INDEX</span>
                          <span className={c.health_score < 50 ? 'text-danger font-bold' : c.health_score < 75 ? 'text-warning font-bold' : 'text-success font-bold'}>
                            {c.health_score}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              c.health_score < 50 
                                ? 'bg-danger' 
                                : c.health_score < 75 
                                  ? 'bg-warning' 
                                  : 'bg-success'
                            }`}
                            style={{ width: `${c.health_score}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Risk Level */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                        c.risk_level === 'high' 
                          ? 'bg-danger/10 text-danger-dark dark:text-danger-light border-danger/25' 
                          : c.risk_level === 'medium'
                            ? 'bg-warning/10 text-warning-dark dark:text-warning-light border-warning/25'
                            : 'bg-success/10 text-success-dark dark:text-success-light border-success/25'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${
                          c.risk_level === 'high' 
                            ? 'bg-danger' 
                            : c.risk_level === 'medium'
                              ? 'bg-warning'
                              : 'bg-success'
                        }`} />
                        {c.risk_level}
                      </span>
                    </td>

                    {/* Renewal Date */}
                    <td className="p-4">
                      <span className="text-xs text-neutral-600 dark:text-neutral-350 font-semibold">
                        {new Date(c.renewal_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>

                    {/* Details Action button */}
                    <td className="p-4 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate('workspace', c.id); }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 border border-neutral-200 dark:border-neutral-800 rounded-lg text-[10px] font-bold text-neutral-500 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-colors duration-150 cursor-pointer"
                      >
                        Workspace <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <p className="text-xs text-neutral-400 dark:text-neutral-500 font-semibold">
              No customer records match your filter query.
            </p>
          </div>
        )}
      </div>

      <CreateCustomerDialog 
        isOpen={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)} 
        onSuccess={fetchCustomers} 
      />
    </div>
  );
};
