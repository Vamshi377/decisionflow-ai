import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Settings as SettingsIcon, 
  User, 
  Workflow, 
  Sliders, 
  Check, 
  Sun, 
  Moon,
  Mail,
  Briefcase
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  // Tab control
  const [activeTab, setActiveTab] = useState<'profile' | 'domain' | 'preferences'>('profile');
  const [showToast, setShowToast] = useState(false);

  // Profile state
  const [name, setName] = useState('Vamshi CSM');
  const [email, setEmail] = useState('csm@decisionflow.ai');
  const [role, setRole] = useState('Senior Enterprise CSM');
  
  // AI Pref state
  const [weights, setWeights] = useState({
    planner: 80,
    signal: 90,
    knowledge: 75,
    recommendation: 95
  });

  // Domain Config state
  const [selectedDomain, setSelectedDomain] = useState('customer_success');

  const domains = [
    { 
      id: 'customer_success', 
      label: 'Customer Success', 
      desc: 'Track accounts churn risk level, and suggest Next Best Actions.', 
      agents: ['Planner', 'Signal', 'Knowledge', 'Recommendation']
    },
    { 
      id: 'hr', 
      label: 'HR & Employee Retention', 
      desc: 'Analyze exit interviews and reviews to flag flight risk signals.', 
      agents: ['Planner', 'Sentiment', 'RetentionRisk', 'RecAction']
    },
    { 
      id: 'sales', 
      label: 'Sales Deal Intelligence', 
      desc: 'Scan email threads and call playbooks to recommend deal closing actions.', 
      agents: ['Planner', 'BuyingSignal', 'DealRisk', 'NextBestAction']
    },
    { 
      id: 'it_support', 
      label: 'IT Support & SLAs', 
      desc: 'Process tickets to isolate system log errors and calculate breach alerts.', 
      agents: ['Planner', 'SymptomAnalyzer', 'SLA_Risk', 'ResolutionAgent']
    }
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
          Platform Configuration Settings
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Tune the agent weights, active domain templates, and account profiles.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Navigator links */}
        <div className="p-4 border border-neutral-200/60 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 rounded-xl shadow-xs space-y-1 h-fit">
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 mb-2">
            <SettingsIcon className="w-3.5 h-3.5" /> Navigation Config
          </div>
          
          <button 
            type="button" 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 text-xs font-semibold rounded-lg text-left transition-all ${
              activeTab === 'profile'
                ? 'text-primary dark:text-primary-light bg-primary/10'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-950'
            }`}
          >
            <User className="w-3.5 h-3.5" /> User Profile & Theme
          </button>
          
          <button 
            type="button" 
            onClick={() => setActiveTab('domain')}
            className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 text-xs font-semibold rounded-lg text-left transition-all ${
              activeTab === 'domain'
                ? 'text-primary dark:text-primary-light bg-primary/10'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-950'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" /> Domain Profile
          </button>
          
          <button 
            type="button" 
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 text-xs font-semibold rounded-lg text-left transition-all ${
              activeTab === 'preferences'
                ? 'text-primary dark:text-primary-light bg-primary/10'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-950'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> AI Preferences
          </button>
        </div>

        {/* Right Col: Forms stack */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Section 1: User Profile & Appearance */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* User Info Form */}
              <div className="p-6 border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-neutral-955 dark:text-white uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-855 pb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> User Profile Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-450 uppercase block mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-neutral-450 uppercase block mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-955 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-neutral-450 uppercase block mb-1">CSM Role</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                      <input 
                        type="text" 
                        value={role} 
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-955 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Theme Settings */}
              <div className="p-6 border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-neutral-955 dark:text-white uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-850 pb-2 flex items-center gap-2">
                  {theme === 'light' ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-primary" />} Appearance & Theme
                </h3>

                <div className="flex gap-3 bg-neutral-100/50 dark:bg-neutral-950/60 p-1.5 rounded-xl border border-neutral-200/50 dark:border-neutral-800/80">
                  <button
                    type="button"
                    onClick={() => { if (theme === 'dark') toggleTheme(); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-150 ${
                      theme === 'light'
                        ? 'bg-white dark:bg-neutral-900 text-primary shadow-xs border border-neutral-200 dark:border-neutral-800'
                        : 'text-neutral-450 hover:text-neutral-200'
                    }`}
                  >
                    <Sun className="w-4 h-4" /> Light Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => { if (theme === 'light') toggleTheme(); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-150 ${
                      theme === 'dark'
                        ? 'bg-neutral-900 dark:bg-neutral-855 text-primary shadow-xs border border-neutral-800 dark:border-neutral-700'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
                    }`}
                  >
                    <Moon className="w-4 h-4" /> Dark Mode
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Domain Configuration */}
          {activeTab === 'domain' && (
            <div className="p-6 border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-xs space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <h3 className="text-xs font-bold text-neutral-955 dark:text-white uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-850 pb-2 flex items-center gap-2">
                <Workflow className="w-4 h-4 text-primary" /> Active Platform Domain Profile
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {domains.map((dom) => (
                  <div
                    key={dom.id}
                    onClick={() => setSelectedDomain(dom.id)}
                    className={`relative p-4 border rounded-xl cursor-pointer text-left transition-all duration-200 ${
                      selectedDomain === dom.id
                        ? 'border-primary bg-primary/5 shadow-xs'
                        : 'border-neutral-100 dark:border-neutral-800/85 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-955/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">{dom.label}</span>
                      {selectedDomain === dom.id && (
                        <span className="p-0.5 rounded-full bg-primary text-white shadow-xs animate-in zoom-in duration-200">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed font-medium">
                      {dom.desc}
                    </p>
                    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                      <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Agents:</span>
                      {dom.agents.map(ag => (
                        <span key={ag} className="text-[9px] bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-350 px-2.5 py-0.5 rounded-full font-bold border border-neutral-200/50 dark:border-neutral-700/50">
                          {ag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: AI Preferences */}
          {activeTab === 'preferences' && (
            <div className="p-6 border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-xs space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <h3 className="text-xs font-bold text-neutral-955 dark:text-white uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-850 pb-2 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" /> AI Decision Consensus Weights
              </h3>

              <div className="space-y-5">
                {Object.keys(weights).map((key) => {
                  const val = weights[key as keyof typeof weights];
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-neutral-700 dark:text-neutral-300 capitalize">{key} Consensus weight</span>
                        <span className="font-bold text-primary dark:text-primary-light bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{val}%</span>
                      </div>
                      <div className="relative pt-1">
                        <input 
                          type="range" 
                          min="10" 
                          max="100" 
                          value={val}
                          onChange={(e) => setWeights({
                            ...weights,
                            [key]: Number(e.target.value)
                          })}
                          className="w-full accent-primary h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer focus:outline-none"
                        />
                        {/* Fill track overlay */}
                        <div 
                          className="absolute top-[11px] left-0 h-1.5 bg-primary rounded-l-lg pointer-events-none" 
                          style={{ width: `${val}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary hover:bg-primary/95 active:scale-[0.98] text-white rounded-lg text-xs font-bold shadow-xs transition-all"
            >
              Save Configuration Settings
            </button>
          </div>

        </div>

      </form>

      {/* Floating Animated Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4.5 py-3 bg-neutral-900 text-white rounded-xl shadow-lg border border-neutral-800 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="p-1 rounded-full bg-success text-white">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-neutral-100">Settings saved successfully!</span>
        </div>
      )}
    </div>
  );
};

export default Settings;
