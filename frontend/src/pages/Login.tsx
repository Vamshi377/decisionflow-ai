import React, { useState } from 'react';
import { useNav } from '../context/NavContext';
import { Workflow, Mail, Lock, Check, Loader2, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, navigate } = useNav();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all email and password fields.");
      return;
    }

    setLoading(true);
    // Simulate enterprise auth request delay
    setTimeout(() => {
      setLoading(false);
      login();
    }, 1200);
  };

  return (
    <div className="flex min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#f1f5f9_100%)] items-center justify-center font-sans p-4 relative overflow-hidden">
      {/* Decorative ambient spots */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-8 space-y-6 flex flex-col relative z-10">
        {/* Logo Branding */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white shadow-md shadow-primary/30">
            <Workflow className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold text-slate-800 tracking-tight">
            DecisionFlow AI
          </span>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Sign in to DecisionFlow
          </h2>
          <p className="text-xs text-slate-500">
            Access your Customer Success Decision cockpit.
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg animate-bounce">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Password
              </label>
              <a href="#forgot" className="text-[10px] font-bold text-primary hover:underline">
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold"
                required
              />
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className={`flex items-center justify-center w-4.5 h-4.5 rounded border transition-colors duration-150 cursor-pointer ${
                rememberMe 
                  ? 'bg-primary border-primary text-white' 
                  : 'border-slate-200 hover:border-slate-400 bg-slate-50'
              }`}
            >
              {rememberMe && <Check className="w-3.5 h-3.5" />}
            </button>
            <span className="text-xs text-slate-500 select-none font-semibold">
              Remember me on this workstation
            </span>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary/95 active:scale-[0.98] transition-all duration-150 shadow-sm shadow-primary/20 disabled:opacity-70 mt-2 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>Sign In <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <div className="flex items-center justify-center border-t border-slate-100 pt-4">
          <button 
            type="button"
            onClick={() => navigate('customer_portal')}
            className="text-[10px] text-primary hover:underline font-bold tracking-tight uppercase cursor-pointer"
          >
            Switch to B2B Customer Portal →
          </button>
        </div>

        {/* Bottom copyright */}
        <p className="text-[10px] text-slate-400 text-center font-medium pt-2">
          © 2026 DecisionFlow AI, Inc. Enterprise Grade Decision Intelligence.
        </p>
      </div>
    </div>
  );
};
