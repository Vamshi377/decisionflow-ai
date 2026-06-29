import React from 'react';
import { useNav, type Page } from '../../context/NavContext';
import { 
  LayoutDashboard, 
  Users, 
  UploadCloud, 
  Cpu, 
  Sparkles, 
  History, 
  BarChart3, 
  ShieldAlert, 
  Settings, 
  LogOut,
  Workflow,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { currentPage, navigate, logout } = useNav();

  const sections = [
    {
      label: "Telemetry & Cockpit",
      items: [
        { id: 'dashboard' as Page, label: 'Decision Cockpit', icon: LayoutDashboard },
        { id: 'analytics' as Page, label: 'Analytics Insights', icon: BarChart3 },
        { id: 'audit' as Page, label: 'System Audit Logs', icon: ShieldAlert },
      ]
    },
    {
      label: "Client Intelligence",
      items: [
        { id: 'customers' as Page, label: 'Client Portfolio', icon: Users },
        { id: 'recommendations' as Page, label: 'Next Best Actions', icon: Sparkles },
        { id: 'memory' as Page, label: 'Memory Timeline', icon: History },
      ]
    },
    {
      label: "Agent Center & Setup",
      items: [
        { id: 'execution' as Page, label: 'Agent Canvas', icon: Cpu },
        { id: 'upload' as Page, label: 'Playbook Ingest', icon: UploadCloud },
        { id: 'settings' as Page, label: 'Platform Settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex flex-col w-64 border-r border-neutral-200/80 dark:border-neutral-800 bg-white/88 dark:bg-neutral-950/88 backdrop-blur-xl transition-all duration-200 shadow-xl shadow-slate-200/40 dark:shadow-black/30">
      {/* Branding Header */}
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-neutral-100 dark:border-neutral-850">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm">
          <Workflow className="w-3.5 h-3.5" />
        </div>
        <div>
          <h1 className="font-black text-neutral-950 dark:text-white tracking-tight leading-none text-sm">
            DecisionFlow AI
          </h1>
          <p className="text-[9px] font-bold text-primary uppercase tracking-wider mt-1">Agentic NBA Platform</p>
        </div>
      </div>

      {/* Workspace Selector Dropdown Mockup */}
      <div className="px-3.5 py-3 border-b border-neutral-100/80 dark:border-neutral-850">
        <div className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/60 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer group shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary font-bold text-[9px] border border-primary/20">
              DF
            </div>
            <div className="text-left min-w-0">
              <p className="text-[11px] font-bold text-neutral-900 dark:text-white truncate">Acme Enterprise Org</p>
              <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-bold block leading-none mt-0.5">Production Active</span>
            </div>
          </div>
          <ChevronRight className="w-3 h-3 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <span className="px-4 text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-1.5">
              {sec.label}
            </span>
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id || (item.id === 'customers' && currentPage === 'workspace');
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 relative ${
                    isActive 
                      ? 'bg-primary text-white dark:text-white font-bold shadow-sm shadow-primary/25' 
                      : 'text-neutral-550 dark:text-neutral-400 hover:bg-neutral-100/75 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-2.5 bottom-2.5 w-0.75 rounded-r bg-white/80 animate-in fade-in duration-200" />
                  )}
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-neutral-400 dark:text-neutral-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Profile */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2.5 px-2 py-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-100 dark:border-neutral-900/60">
          <div className="relative flex-shrink-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20">
              V
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-white dark:border-neutral-900" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-neutral-900 dark:text-white truncate">
              Vamshi CSM
            </p>
            <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-semibold truncate mt-0.5">
              Enterprise Success
            </p>
          </div>
          <button 
            onClick={logout}
            className="p-1 rounded-md text-neutral-450 dark:text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-danger dark:hover:text-danger-dark transition-colors duration-150"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
