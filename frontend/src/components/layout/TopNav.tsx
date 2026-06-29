import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNav } from '../../context/NavContext';
import { apiService, type AuditLog } from '../../services/api';
import { 
  Sun, 
  Moon, 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  Sparkles,
  Workflow
} from 'lucide-react';

export const TopNav: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { logout, navigate } = useNav();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [alerts, setAlerts] = useState<AuditLog[]>([]);

  // Fetch recent audit logs for notification list
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const logs = await apiService.getAuditLogs();
        // Take top 4 most recent
        setAlerts(logs.slice(0, 4));
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };
    fetchAlerts();
    
    // Poll for updates every 15 seconds
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 right-0 z-10 flex items-center justify-between w-[calc(100%-16rem)] h-16 px-8 border-b border-neutral-200/80 dark:border-neutral-800 bg-white/86 dark:bg-neutral-950/86 backdrop-blur-xl transition-all duration-200 shadow-sm shadow-slate-200/40 dark:shadow-black/20">
      {/* Search Input Bar with Command Palette Trigger Mockup */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-450 dark:text-neutral-500" />
        <input 
          type="text" 
          placeholder="Search accounts, recommendations, audit logs..."
          className="w-full pl-10 pr-16 py-2 border border-neutral-200/80 dark:border-neutral-800 rounded-lg text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-150 font-medium shadow-xs"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 border border-neutral-200/60 dark:border-neutral-800/85 rounded bg-white dark:bg-neutral-900 text-[9px] font-bold text-neutral-400 dark:text-neutral-500 shadow-xs pointer-events-none select-none tracking-wide">
          <span>Ctrl</span><span>K</span>
        </div>
      </div>

      {/* Quick Action Controls */}
      <div className="flex items-center gap-4">
        {/* AI Agent Status Indicator Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-250/20 dark:border-emerald-800/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>6 AI Agents Active</span>
          <span className="w-1 h-1 rounded-full bg-emerald-200 dark:bg-emerald-800" />
          <span className="text-[9px] text-neutral-450 dark:text-neutral-500 font-bold uppercase tracking-wider">Sync Live</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-neutral-450 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-850 transition-colors duration-150"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Notifications Center Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className={`relative p-2 rounded-lg text-neutral-450 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-850 transition-colors duration-150 ${showNotifications ? 'bg-neutral-100 dark:bg-neutral-850 text-neutral-900 dark:text-white' : ''}`}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {alerts.length > 0 && (
              <span className="absolute top-1 right-1 flex w-2 h-2 rounded-full bg-danger" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-80 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg shadow-neutral-100/50 dark:shadow-black/60 overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800/80 animate-in fade-in slide-in-from-top-2 duration-150 z-30">
              <div className="flex items-center justify-between px-4 py-3 bg-neutral-50/50 dark:bg-neutral-950/40">
                <span className="text-xs font-bold text-neutral-900 dark:text-white">Recent System Updates</span>
                <span className="text-[10px] text-primary font-bold hover:text-primary/80 transition-colors cursor-pointer" onClick={() => navigate('audit')}>View all</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/80">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <div key={alert.id} className="p-3.5 hover:bg-neutral-50/80 dark:hover:bg-neutral-950/40 transition-colors duration-150 cursor-pointer" onClick={() => { setShowNotifications(false); navigate('audit'); }}>
                      <p className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                        {alert.user_action.includes("Decision") || alert.user_action.includes("Recommendation") ? (
                          <Sparkles className="w-3.5 h-3.5 text-accent" />
                        ) : (
                          <Workflow className="w-3.5 h-3.5 text-primary" />
                        )}
                        {alert.user_action}
                      </p>
                      <p className="text-[11px] text-neutral-550 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                        {alert.details}
                      </p>
                      <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-bold block mt-1.5 uppercase tracking-wider">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">No active alerts</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Action Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-150"
            title="Profile Options"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Profile Menu Dropdown Panel */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2.5 w-48 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg shadow-neutral-100/50 dark:shadow-black/60 overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800/80 animate-in fade-in slide-in-from-top-2 duration-150 z-30">
              <div className="px-4 py-3 bg-neutral-50/50 dark:bg-neutral-950/40">
                <p className="text-xs font-bold text-neutral-900 dark:text-white">Vamshi CSM</p>
                <p className="text-[10px] text-neutral-450 dark:text-neutral-500 font-semibold mt-0.5">Enterprise Segment</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setShowProfileMenu(false); navigate('settings'); }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-xs font-semibold text-neutral-550 dark:text-neutral-450 hover:bg-neutral-50/80 dark:hover:bg-neutral-950/40 hover:text-neutral-900 dark:hover:text-white transition-colors duration-150"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Account Settings
                </button>
                <button
                  onClick={() => { setShowProfileMenu(false); logout(); }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-xs font-semibold text-danger hover:bg-neutral-50/85 dark:hover:bg-neutral-950/45 transition-colors duration-150"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
