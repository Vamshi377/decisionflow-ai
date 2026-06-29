import React, { useState, useEffect } from 'react';
import { useNav } from '../context/NavContext';
import { apiService, type Customer } from '../services/api';
import axios from 'axios';
import { 
  Building2, 
  User, 
  Lock, 
  LayoutDashboard, 
  Clock, 
  CalendarDays, 
  History, 
  HelpCircle, 
  MessageSquare, 
  Megaphone, 
  LogOut, 
  UserCheck, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Send,
  Star
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const CustomerPortal: React.FC = () => {
  const { navigate } = useNav();
  
  // Auth State
  const [companies, setCompanies] = useState<Customer[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [isLogged, setIsLogged] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<{ id: number; company_name: string; name: string } | null>(null);
  const [currentEmp, setCurrentEmp] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Portal Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'leave' | 'history' | 'tickets' | 'feedback' | 'announcements'>('dashboard');

  // Attendance states
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [attendanceLogs, setAttendanceLogs] = useState<Array<{ date: string; time: string; action: string }>>([]);

  // Leave Form
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSuccess, setLeaveSuccess] = useState(false);

  // Tickets state
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketCategory, setTicketCategory] = useState('Bug');
  const [ticketPriority, setTicketPriority] = useState('Low');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // CSAT state
  const [activeCsatTicketId, setActiveCsatTicketId] = useState<number | null>(null);
  const [csatSupport, setCsatSupport] = useState(5);
  const [csatSpeed, setCsatSpeed] = useState(5);
  const [csatRecommend, setCsatRecommend] = useState(5);
  const [csatComments, setCsatComments] = useState('');
  const [csatSuccess, setCsatSuccess] = useState(false);

  // Feedback State
  const [fbRating, setFbRating] = useState(5);
  const [fbComments, setFbComments] = useState('');
  const [fbCategory, setFbCategory] = useState('General');
  const [fbSuggestions, setFbSuggestions] = useState('');
  const [fbSuccess, setFbSuccess] = useState(false);

  // Fetch registered customer list from DB to populate selector
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await apiService.getCustomers();
        setCompanies(res);
        if (res.length > 0 && !selectedCompanyId) {
          setSelectedCompanyId(res[0].id.toString());
        }
      } catch (err) {
        console.error("Failed to load companies list.", err);
      }
    };
    fetchCompanies();
  }, [isLogged]);

  // Send background telemetry logs
  const trackTelemetry = async (action: string, module: string, durationSec: number = 2) => {
    if (!currentCompany) return;
    try {
      await axios.post(`${API_BASE_URL}/demo/telemetry/event`, {
        customer_id: currentCompany.id,
        employee_id: currentEmp,
        action,
        module,
        duration: durationSec
      });
    } catch (err) {
      console.error("Telemetry failed: ", err);
    }
  };

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    trackTelemetry("VIEW_" + tab.toUpperCase(), "Navigation", 3);
  };

  const fetchTelemetryEvents = async (compId: number, empId: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/demo/telemetry/events/${compId}`);
      const empEvents = res.data.filter((e: any) => e.employee_id === empId);
      
      const logs = empEvents.map((e: any) => {
        const d = new Date(e.timestamp);
        return {
          id: e.id,
          date: d.toISOString().split('T')[0],
          time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: e.action === 'CHECK_OUT' ? 'Check-Out' : e.action === 'MARK_ATTENDANCE' ? 'Check-In' : e.action
        };
      });
      setAttendanceLogs(logs);

      // Determine today's shift status
      const today = new Date().toISOString().split('T')[0];
      const todayCheckIn = empEvents.find((e: any) => e.action === 'MARK_ATTENDANCE' && e.timestamp.startsWith(today));
      const todayCheckOut = empEvents.find((e: any) => e.action === 'CHECK_OUT' && e.timestamp.startsWith(today));
      setIsCheckedIn(!!todayCheckIn && !todayCheckOut);
    } catch (err) {
      console.error("Failed to load telemetry logs from database", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/demo/login`, {
        username: employeeId,
        password: password,
        company_id: parseInt(selectedCompanyId)
      });
      if (res.data.success) {
        setIsLogged(true);
        setCurrentCompany({
          id: res.data.company_id,
          company_name: res.data.company_name,
          name: res.data.client_name
        });
        setCurrentEmp(res.data.employee_id);
        fetchTickets(res.data.company_id);
        fetchTelemetryEvents(res.data.company_id, res.data.employee_id);
      }
    } catch (err: any) {
      setAuthError(err.response?.data?.detail || "Login authentication failed.");
    }
  };

  const handleLogout = async () => {
    await trackTelemetry("LOGOUT", "Authentication", 2);
    setIsLogged(false);
    setCurrentCompany(null);
    setCurrentEmp('');
    setEmployeeId('');
    setPassword('');
  };

  const fetchTickets = async (companyId: number) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/demo/tickets/customer/${companyId}`);
      setTickets(res.data);
    } catch (err) {
      console.error("Error loading tickets", err);
    }
  };

  const handleCheckIn = async () => {
    if (!currentCompany) return;
    const action = isCheckedIn ? 'CHECK_OUT' : 'MARK_ATTENDANCE';
    
    try {
      await axios.post(`${API_BASE_URL}/demo/telemetry/event`, {
        customer_id: currentCompany.id,
        employee_id: currentEmp,
        action,
        module: "Mark Attendance",
        duration: 5
      });
      fetchTelemetryEvents(currentCompany.id, currentEmp);
    } catch (err) {
      console.error("Check-in request failed", err);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCompany) return;
    
    try {
      await axios.post(`${API_BASE_URL}/demo/telemetry/event`, {
        customer_id: currentCompany.id,
        employee_id: currentEmp,
        action: "APPLY_LEAVE",
        module: "Apply Leave",
        duration: 10
      });
      setLeaveSuccess(true);
      fetchTelemetryEvents(currentCompany.id, currentEmp);
      setTimeout(() => {
        setLeaveSuccess(false);
        setLeaveStart('');
        setLeaveEnd('');
        setLeaveReason('');
        setActiveTab('dashboard');
      }, 2000);
    } catch (err) {
      console.error("Leave application request failed", err);
    }
  };

  const handleDownloadReport = () => {
    trackTelemetry("DOWNLOAD_REPORT", "History", 8);
    // Mimic CSV file download
    const link = document.createElement("a");
    link.href = "#";
    link.setAttribute("download", `attendance_report_${currentEmp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRaiseTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCompany) return;
    try {
      await axios.post(`${API_BASE_URL}/demo/tickets`, {
        customer_id: currentCompany.id,
        category: ticketCategory,
        priority: ticketPriority,
        subject: ticketSubject,
        description: ticketDescription
      });
      setTicketSuccess(true);
      trackTelemetry("RAISE_TICKET", "Support Tickets", 15);
      fetchTickets(currentCompany.id);
      setTimeout(() => {
        setTicketSuccess(false);
        setTicketSubject('');
        setTicketDescription('');
      }, 2000);
    } catch (err) {
      console.error("Failed to raise ticket", err);
    }
  };

  const handleResolveTicket = async (ticketId: number) => {
    try {
      await axios.put(`${API_BASE_URL}/demo/tickets/${ticketId}/status`, { status: "Resolved" });
      if (currentCompany) fetchTickets(currentCompany.id);
      trackTelemetry("RESOLVE_TICKET_DEMO", "Support Tickets", 4);
      setActiveCsatTicketId(ticketId);
      setCsatSuccess(false);
    } catch (err) {
      console.error("Resolve failed", err);
    }
  };

  const handleSendCSAT = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCompany || !activeCsatTicketId) return;
    try {
      await axios.post(`${API_BASE_URL}/demo/csat`, {
        customer_id: currentCompany.id,
        ticket_id: activeCsatTicketId,
        rate_support: csatSupport,
        rate_resolution_speed: csatSpeed,
        recommend: csatRecommend,
        comments: csatComments
      });
      setCsatSuccess(true);
      trackTelemetry("SUBMIT_CSAT", "CSAT Survey", 10);
      setTimeout(() => {
        setActiveCsatTicketId(null);
        setCsatComments('');
        setCsatSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("CSAT post failed", err);
    }
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCompany) return;
    try {
      await axios.post(`${API_BASE_URL}/demo/feedback`, {
        customer_id: currentCompany.id,
        rating: fbRating,
        comments: fbComments,
        category: fbCategory,
        suggestions: fbSuggestions
      });
      setFbSuccess(true);
      trackTelemetry("SUBMIT_FEEDBACK", "Feedback", 12);
      setTimeout(() => {
        setFbSuccess(false);
        setFbComments('');
        setFbSuggestions('');
        setFbRating(5);
      }, 2000);
    } catch (err) {
      console.error("Feedback submit failed", err);
    }
  };

  if (!isLogged || !currentCompany) {
    return (
      <div className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#f1f5f9_50%,#e2e8f0_100%)] text-slate-800 flex flex-col justify-center items-center p-4">
        {/* Decorative ambient spots */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-xl p-8 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl text-primary border border-primary/20 mb-1">
              <Building2 className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Employee Management Portal</h2>
            <p className="text-xs text-slate-500">
              Select your organization account and sign in to register check-ins.
            </p>
          </div>

          {authError && (
            <div className="flex items-center gap-2 p-3 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Company Selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Select Corporate Account
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold cursor-pointer"
              >
                {companies.length > 0 ? (
                  companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))
                ) : (
                  <option value="">No corporate accounts registered</option>
                )}
              </select>
            </div>

            {/* Employee ID */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Employee User ID
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="e.g. emp001"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Security Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-dark shadow-md shadow-primary/10 transition-all cursor-pointer active:scale-[0.99] mt-2"
            >
              Sign In
            </button>
          </form>

          {/* Quick back link */}
          <div className="text-center pt-2 border-t border-slate-100">
            <button
              onClick={() => navigate('dashboard')}
              className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
            >
              ← Back to Customer Success Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Header bar */}
      <header className="bg-white border-b border-slate-200 py-3.5 px-6 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
            <Building2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">{currentCompany.company_name}</h2>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Employee Workspace Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-900">{currentEmp}</p>
            <p className="text-[9px] text-slate-400 font-semibold">{currentCompany.name}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-primary border border-slate-200">
            {currentEmp.slice(-2).toUpperCase() || "EE"}
          </div>
        </div>
      </header>

      {/* Main container */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 p-6">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-60 flex flex-col gap-1 flex-shrink-0">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'attendance', label: 'Mark Attendance', icon: Clock },
            { id: 'leave', label: 'Apply Leave', icon: CalendarDays },
            { id: 'history', label: 'Attendance History', icon: History },
            { id: 'tickets', label: 'Support Tickets', icon: HelpCircle },
            { id: 'feedback', label: 'Submit Feedback', icon: MessageSquare },
            { id: 'announcements', label: 'Announcements', icon: Megaphone }
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id as any)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
                  active 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'
                }`}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-6 mt-6 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 w-full text-left cursor-pointer transition-all"
            >
              <LogOut className="w-4.5 h-4.5" />
              <span>Log Out</span>
            </button>
          </div>

          <div className="mt-auto pt-8">
            <button
              onClick={() => navigate('dashboard')}
              className="w-full py-2.5 border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 text-slate-500 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer text-center"
            >
              ← Back to CS Portal
            </button>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 bg-white border border-slate-200 shadow-sm rounded-xl p-6 min-h-[50vh]">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Quick Metrics Cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { 
                    label: "Attendance Marks", 
                    val: attendanceLogs.filter(l => l.action === 'Check-In').length, 
                    desc: "Total present days this period" 
                  },
                  { 
                    label: "Leaves Taken", 
                    val: `${attendanceLogs.filter(l => l.action === 'APPLY_LEAVE').length} Days`, 
                    desc: "Approved vacation requests" 
                  },
                  { 
                    label: "Compliance Rate", 
                    val: attendanceLogs.filter(l => l.action === 'Check-In').length > 0 ? "96.2%" : "100.0%", 
                    desc: "On-time logins percentage" 
                  }
                ].map((c, i) => (
                  <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">{c.label}</span>
                    <span className="text-lg font-bold text-slate-900 block">{c.val}</span>
                    <span className="text-[10px] text-slate-400 block">{c.desc}</span>
                  </div>
                ))}
              </div>

              {/* Announcements Dashboard preview */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Announcements</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-1 shadow-xs">
                    <span className="text-[8px] bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded font-bold uppercase">
                      {currentCompany.company_name} Admin
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">Upgrade completed on attendance tracking system</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">We successfully updated our telemetry engine to log checking metrics. Report speeds are now 2x faster.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="flex flex-col items-center justify-center text-center space-y-4 min-h-[40vh] py-6">
              <div className="p-4 bg-primary/10 rounded-full text-primary border border-primary/20">
                <UserCheck className="w-8 h-8 animate-bounce" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Daily Attendance Log</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                  Log your present shift coordinates instantly. System automatically updates CSM platform logs in the background.
                </p>
              </div>

              <button
                onClick={handleCheckIn}
                className={`px-6 py-3 rounded-xl font-bold text-xs cursor-pointer shadow-md transition-all active:scale-[0.98] ${
                  isCheckedIn 
                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-100' 
                    : 'bg-primary text-white hover:bg-primary-dark shadow-primary/10'
                }`}
              >
                {isCheckedIn ? "Mark Shift Check-Out" : "Mark Daily Check-In"}
              </button>
            </div>
          )}

          {activeTab === 'leave' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Apply for Leave</h3>
                <p className="text-xs text-slate-500 mt-1">Submit your leave request details to the HR system.</p>
              </div>

              {leaveSuccess && (
                <div className="flex items-center gap-2 p-3 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Leave request submitted successfully. Redirecting...</span>
                </div>
              )}

              <form onSubmit={handleApplyLeave} className="space-y-4 max-w-md">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Start Date</label>
                    <input
                      type="date"
                      value={leaveStart}
                      onChange={(e) => setLeaveStart(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-900 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">End Date</label>
                    <input
                      type="date"
                      value={leaveEnd}
                      onChange={(e) => setLeaveEnd(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-900 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block font-semibold">Reason for leave</label>
                  <textarea
                    placeholder="Enter justification..."
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-900 focus:outline-none"
                    rows={4}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2.5 bg-primary text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-primary-dark transition-all shadow-sm"
                >
                  Submit Application
                </button>
              </form>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Attendance Logs</h3>
                  <p className="text-xs text-slate-500 mt-1">Audit logs of checking records.</p>
                </div>
                <button
                  onClick={handleDownloadReport}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download Report
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3">Log Date</th>
                      <th className="p-3">Log Time</th>
                      <th className="p-3">Event Action</th>
                      <th className="p-3">Telemetry Code</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceLogs.map((log: any, index) => (
                      <tr key={index} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-700">{log.date}</td>
                        <td className="p-3 font-semibold text-slate-700">{log.time}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                            log.action.includes('In') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[9px] text-slate-400">TEL_OK_{log.id || (index + 101)}</td>
                      </tr>
                    ))}
                    {attendanceLogs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400">No shift check-ins recorded yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="space-y-6">
              
              {/* Raising a ticket */}
              <div className="p-5 border border-slate-200 rounded-xl space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Raise Support Ticket</h3>
                  <p className="text-xs text-slate-500 mt-1">Submit support issues. Tickets immediately appear on the CS Portal.</p>
                </div>

                {ticketSuccess && (
                  <div className="flex items-center gap-2 p-3 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Ticket created successfully! Refreshed queue.</span>
                  </div>
                )}

                <form onSubmit={handleRaiseTicket} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Category</label>
                      <select
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-900 focus:outline-none cursor-pointer"
                      >
                        <option value="Bug">Bug Report</option>
                        <option value="Feature">Feature Request</option>
                        <option value="Billing">Billing Issue</option>
                        <option value="Admin">Admin Request</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Priority</label>
                      <select
                        value={ticketPriority}
                        onChange={(e) => setTicketPriority(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-900 focus:outline-none cursor-pointer"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Subject</label>
                    <input
                      type="text"
                      placeholder="Summary of the issue..."
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-900 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Description Details</label>
                    <textarea
                      placeholder="Detailed description..."
                      value={ticketDescription}
                      onChange={(e) => setTicketDescription(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-900 focus:outline-none"
                      rows={4}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-dark transition-all cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Raise Support Ticket
                  </button>
                </form>
              </div>

              {/* Tickets Queue List */}
              <div className="p-5 border border-slate-200 rounded-xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-550">Active Ticket History</h3>
                <div className="space-y-3">
                  {tickets.map((t) => (
                    <div key={t.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                            t.priority === 'Urgent' 
                              ? 'bg-red-50 border-red-200 text-red-700' 
                              : t.priority === 'High'
                                ? 'bg-amber-50 border-amber-200 text-amber-700'
                                : 'bg-slate-100 border-slate-200 text-slate-500'
                          }`}>
                            {t.priority}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{t.category}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 mt-1.5">{t.subject}</h4>
                        <p className="text-[10px] text-slate-500 mt-1 font-semibold">{t.description}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider border ${
                          t.status === 'Open'
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : t.status === 'In Progress'
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}>
                          {t.status}
                        </span>
                        
                        {/* Demo Action: Mark Resolved (to test CSAT) */}
                        {t.status !== 'Resolved' && t.status !== 'Closed' && (
                          <button
                            onClick={() => handleResolveTicket(t.id)}
                            className="text-[9px] font-bold text-primary hover:underline cursor-pointer"
                          >
                            Mark Resolved (Test CSAT)
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {tickets.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-6">No support tickets submitted yet.</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">System Feedback</h3>
                <p className="text-xs text-slate-500 mt-1">Submit rating feedback. Automatically analyzed by Gemini in DecisionFlow AI.</p>
              </div>

              {fbSuccess && (
                <div className="flex items-center gap-2 p-3 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Feedback submitted successfully. Thank you!</span>
                </div>
              )}

              <form onSubmit={handleSendFeedback} className="space-y-4">
                {/* Star rating selector */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Rate overall system usage</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setFbRating(val)}
                        className="cursor-pointer"
                      >
                        <Star className={`w-5 h-5 ${
                          fbRating >= val ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Feedback Category</label>
                    <select
                      value={fbCategory}
                      onChange={(e) => setFbCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-900 focus:outline-none cursor-pointer"
                    >
                      <option value="General">General Review</option>
                      <option value="Performance">API Performance Speed</option>
                      <option value="UI">User Interface Layout</option>
                      <option value="Support">Support Desk responsiveness</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Comments</label>
                  <textarea
                    placeholder="Enter review comments..."
                    value={fbComments}
                    onChange={(e) => setFbComments(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-900 focus:outline-none"
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Improvement Suggestions</label>
                  <textarea
                    placeholder="Enter suggestions..."
                    value={fbSuggestions}
                    onChange={(e) => setFbSuggestions(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-900 focus:outline-none"
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-dark transition-all cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Feedback
                </button>
              </form>
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Company Announcements</h3>
                <p className="text-xs text-slate-500 mt-1">Global updates and notices published by admin desk.</p>
              </div>

              <div className="space-y-4">
                {[
                  { tag: `${currentCompany.company_name} HR`, title: "Upcoming vacation schedule audits", desc: "HR system requires all leave requests for July audits to be submitted by the end of this week.", time: "2 hours ago" },
                  { tag: "System Admin", title: "Server maintenance window completed", desc: "Our database servers were migrated successfully. Loading speed of next-best-action panels should now compile 3x faster.", time: "1 day ago" }
                ].map((item, index) => (
                  <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded font-bold uppercase">{item.tag}</span>
                      <span className="text-[9px] text-slate-400 font-semibold">{item.time}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CSAT Rating Overlay Modal */}
      {activeCsatTicketId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md border border-slate-250 bg-white rounded-2xl shadow-xl p-6 space-y-4 text-center text-slate-800 animate-in fade-in zoom-in duration-150">
            <div className="inline-flex items-center justify-center p-3 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl mb-1">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Support Ticket Resolved!</h3>
              <p className="text-xs text-slate-500 mt-1">Please take a second to rate your experience to help us improve.</p>
            </div>

            {csatSuccess && (
              <div className="p-3 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-250 rounded-lg">
                Thank you for your rating! Closing...
              </div>
            )}

            <form onSubmit={handleSendCSAT} className="space-y-4 text-left">
              {/* Rate Support */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Rate Support Representative (1-5)</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setCsatSupport(val)}
                      className="cursor-pointer"
                    >
                      <Star className={`w-4 h-4 ${
                        csatSupport >= val ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Rate Speed */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Rate Resolution Speed (1-5)</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setCsatSpeed(val)}
                      className="cursor-pointer"
                    >
                      <Star className={`w-4 h-4 ${
                        csatSpeed >= val ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Would Recommend */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Would recommend this product? (1-5)</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setCsatRecommend(val)}
                      className="cursor-pointer"
                    >
                      <Star className={`w-4 h-4 ${
                        csatRecommend >= val ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Comments</label>
                <textarea
                  placeholder="Tell us what we did well or what we can improve..."
                  value={csatComments}
                  onChange={(e) => setCsatComments(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-900 focus:outline-none"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveCsatTicketId(null)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                >
                  Send Survey
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default CustomerPortal;
