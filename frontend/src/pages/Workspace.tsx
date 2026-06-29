import React, { useEffect, useState } from 'react';
import { useNav } from '../context/NavContext';
import { apiService, type Customer, type UploadedFile, type Recommendation } from '../services/api';
import axios from 'axios';
import { HealthScoreCard } from '../components/ui/HealthScoreCard';
import { RiskCard } from '../components/ui/RiskCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar
} from 'recharts';
import { 
  Mail, 
  Building, 
  Smile, 
  Cpu, 
  Sparkles, 
  History, 
  Loader2, 
  RefreshCw,
  FileText,
  Ticket,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Bot,
  Send,
  Zap,
  HelpCircle,
  ShieldCheck,
  UserPlus,
  Activity,
  Calendar,
  Clock
} from 'lucide-react';

// Hardcoded rich enterprise CS metadata for the 360 workspace
const customer360Data: Record<number, any> = {
  1: {
    logo: "🏢",
    industry: "Manufacturing & Retail Operations",
    customerSince: "Jan 2024",
    plan: "Enterprise Plus Scale",
    acv: "$120,000",
    renewalDate: "Aug 10, 2026",
    csm: "Vamshi CSM",
    csat: "3.2 / 5.0",
    openTickets: 2,
    monthlyUsage: "4,250 Active DAU",
    transcript: `John (Acme Corp): "Vamshi, our platform adoption has dropped by 30% this quarter. Frankly, we are facing budget constraints and looking at Salesforce as a cheaper alternative. If we can't align on a pricing restructure within 10 days, we won't renew next month."`,
    emails: [
      { date: "June 24, 2026", subject: "Adoption concern on core agents", body: "Hi Vamshi, our users are complaining about the complexity of the signal agent configuration. Can we jump on a call?" },
      { date: "June 18, 2026", subject: "Volume discounts for FY27", body: "Vamshi, we'd like to scale our seat count but need a lower unit cost." }
    ],
    tickets: [
      { id: "TKT-492", subject: "Webhook latency spikes in production", status: "Open", priority: "High", engineer: "Alex Rivera", resolutionTime: "Estimated 4 hrs" },
      { id: "TKT-382", subject: "SSO login failure for APAC group", status: "Resolved", priority: "Medium", engineer: "Sarah Chen", resolutionTime: "Resolved (2.5 hrs)" }
    ],
    crmMetrics: {
      licenseUtilization: "58%",
      contractTerm: "12 Months",
      paymentStatus: "Overdue (18 days)",
      lastTouchpoint: "QBR - June 10, 2026"
    },
    usageHistory: [
      { month: "Jan", mau: 3200, logins: 15 },
      { month: "Feb", mau: 3100, logins: 14 },
      { month: "Mar", mau: 2900, logins: 12 },
      { month: "Apr", mau: 2500, logins: 9 },
      { month: "May", mau: 2100, logins: 7 },
      { month: "Jun", mau: 1950, logins: 5 }
    ]
  },
  2: {
    logo: "🌐",
    industry: "Global Logistics & Supply Chain",
    customerSince: "Mar 2023",
    plan: "Global Unlimited",
    acv: "$350,000",
    renewalDate: "Dec 20, 2026",
    csm: "Vamshi CSM",
    csat: "4.8 / 5.0",
    openTickets: 0,
    monthlyUsage: "18,900 Active DAU",
    transcript: `Mark (Globex): "We have successfully rolled out the recommendation engine to our European division. The results are solid. We are looking to expand this to the LATAM team next month."`,
    emails: [
      { date: "June 25, 2026", subject: "LATAM expansion seat request", body: "Hi Vamshi, we'd like to get pricing for adding 2,000 additional seats for our LATAM logistics coordinators." }
    ],
    tickets: [],
    crmMetrics: {
      licenseUtilization: "94%",
      contractTerm: "36 Months",
      paymentStatus: "Paid",
      lastTouchpoint: "Sync Call - June 20, 2026"
    },
    usageHistory: [
      { month: "Jan", mau: 14000, logins: 45 },
      { month: "Feb", mau: 15200, logins: 48 },
      { month: "Mar", mau: 16100, logins: 51 },
      { month: "Apr", mau: 17200, logins: 54 },
      { month: "May", mau: 18100, logins: 58 },
      { month: "Jun", mau: 18900, logins: 62 }
    ]
  },
  3: {
    logo: "💻",
    industry: "Financial Software Services",
    customerSince: "Sep 2024",
    plan: "Professional Tier",
    acv: "$75,000",
    renewalDate: "Nov 15, 2026",
    csm: "Vamshi CSM",
    csat: "4.0 / 5.0",
    openTickets: 1,
    monthlyUsage: "1,150 Active DAU",
    transcript: `Peter (Initech): "The platform works fine, but our team needs more product adoption training. Some CSMs are still manually auditing cases and missing the automated playbooks."`,
    emails: [
      { date: "June 22, 2026", subject: "Training session request", body: "Hi Vamshi, can you schedule a 1-hour workshop on explainability references for our audit team?" }
    ],
    tickets: [
      { id: "TKT-712", subject: "CSV parser formatting exception", status: "Open", priority: "Medium", engineer: "Rohan Patel", resolutionTime: "Estimated 24 hrs" }
    ],
    crmMetrics: {
      licenseUtilization: "68%",
      contractTerm: "12 Months",
      paymentStatus: "Paid",
      lastTouchpoint: "Monthly Sync - June 15, 2026"
    },
    usageHistory: [
      { month: "Jan", mau: 900, logins: 18 },
      { month: "Feb", mau: 950, logins: 19 },
      { month: "Mar", mau: 1020, logins: 21 },
      { month: "Apr", mau: 1100, logins: 22 },
      { month: "May", mau: 1120, logins: 24 },
      { month: "Jun", mau: 1150, logins: 25 }
    ]
  },
  4: {
    logo: "🏢",
    industry: "Tech & Media Conglomerate",
    customerSince: "Jan 2025",
    plan: "Enterprise Scale",
    acv: "$450,000",
    renewalDate: "Jul 15, 2026",
    csm: "Vamshi CSM",
    csat: "2.8 / 5.0",
    openTickets: 2,
    monthlyUsage: "12,400 Active DAU",
    transcript: `Richard (Hooli): "The system logs show constant latency spikes and we missed a critical SLA breach risk alert. If this performance issue is not resolved, we will terminate the pilot."`,
    emails: [
      { date: "June 26, 2026", subject: "URGENT: SLA Breach incident report", body: "Vamshi, our SLA risk agent failed to trigger yesterday. We need an immediate RCA report by EOD." }
    ],
    tickets: [
      { id: "TKT-883", subject: "Explainability latency spike (5s+)", status: "Open", priority: "Critical", engineer: "Alex Rivera", resolutionTime: "Estimated 1 hr" },
      { id: "TKT-876", subject: "SLA alert trigger failure in Europe", status: "Open", priority: "Critical", engineer: "Sarah Chen", resolutionTime: "Estimated 3 hrs" }
    ],
    crmMetrics: {
      licenseUtilization: "41%",
      contractTerm: "12 Months",
      paymentStatus: "Paid",
      lastTouchpoint: "Escalation Call - June 25, 2026"
    },
    usageHistory: [
      { month: "Jan", mau: 15000, logins: 32 },
      { month: "Feb", mau: 14200, logins: 28 },
      { month: "Mar", mau: 13800, logins: 25 },
      { month: "Apr", mau: 13100, logins: 22 },
      { month: "May", mau: 12600, logins: 19 },
      { month: "Jun", mau: 12400, logins: 17 }
    ]
  },
  5: {
    logo: "☂️",
    industry: "Healthcare & Pharmaceuticals",
    customerSince: "Jun 2022",
    plan: "Enterprise Plus",
    acv: "$280,000",
    renewalDate: "May 10, 2027",
    csm: "Vamshi CSM",
    csat: "4.9 / 5.0",
    openTickets: 0,
    monthlyUsage: "6,800 Active DAU",
    transcript: `Alice (Umbrella): "DecisionFlow has helped our compliance team automate over 90% of our clinical audit checks. We are extremely satisfied."`,
    emails: [
      { date: "June 20, 2026", subject: "Compliance audit success story", body: "Hi Vamshi, here is our internal report showing the time savings from the explainability agent rollout." }
    ],
    tickets: [],
    crmMetrics: {
      licenseUtilization: "96%",
      contractTerm: "24 Months",
      paymentStatus: "Paid",
      lastTouchpoint: "Compliance Audit - June 12, 2026"
    },
    usageHistory: [
      { month: "Jan", mau: 6100, logins: 28 },
      { month: "Feb", mau: 6200, logins: 29 },
      { month: "Mar", mau: 6350, logins: 30 },
      { month: "Apr", mau: 6500, logins: 31 },
      { month: "May", mau: 6650, logins: 32 },
      { month: "Jun", mau: 6800, logins: 33 }
    ]
  }
};

export const Workspace: React.FC = () => {
  const { selectedCustomerId, navigate } = useNav();
  const [customer, setCustomer] = useState<(Customer & { uploads: UploadedFile[], recommendations: Recommendation[] }) | null>(null);
  const [memories, setMemories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'transcript' | 'emails' | 'tickets' | 'crm' | 'usage' | 'recommendations' | 'timeline'>('overview');
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Live Demo Integration states
  const [liveTickets, setLiveTickets] = useState<any[]>([]);
  const [liveEmails, setLiveEmails] = useState<any[]>([]);
  const [liveTelemetry, setLiveTelemetry] = useState<any | null>(null);

  // Copilot Panel States
  const [showCopilot, setShowCopilot] = useState(true);
  const [copilotMessages, setCopilotMessages] = useState<Array<{ sender: 'user' | 'assistant', text: string }>>([
    { sender: 'assistant', text: "Hello! I am your DecisionFlow AI Assistant. How can I help you analyze this customer profile today?" }
  ]);
  const [chatInput, setChatInput] = useState('');

  const fetchWorkspaceData = async () => {
    if (!selectedCustomerId) return;
    setLoading(true);
    setError(null);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
      const [detail, memoryList, ticketsRes, emailsRes, telemetryRes] = await Promise.all([
        apiService.getCustomer(selectedCustomerId),
        apiService.getMemory(selectedCustomerId),
        axios.get(`${API_BASE_URL}/demo/tickets/customer/${selectedCustomerId}`),
        axios.get(`${API_BASE_URL}/demo/emails/customer/${selectedCustomerId}`),
        axios.get(`${API_BASE_URL}/demo/product-analytics/${selectedCustomerId}`).catch(() => ({ data: null }))
      ]);
      setCustomer(detail);
      setMemories(memoryList);
      setLiveTickets(ticketsRes.data || []);
      setLiveEmails(emailsRes.data || []);
      setLiveTelemetry(telemetryRes.data || null);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch customer profile and memory history.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, [selectedCustomerId]);

  const handleAnalyze = async () => {
    if (!selectedCustomerId) return;
    setAnalyzing(true);
    try {
      const response = await apiService.analyzeCustomer(selectedCustomerId);
      setAnalyzing(false);
      if (response.success && response.task_id) {
        navigate('execution', selectedCustomerId, response.task_id);
      }
    } catch (err) {
      setAnalyzing(false);
      alert("Failed to start agent analysis.");
    }
  };

  if (!selectedCustomerId) {
    return (
      <div className="p-8 text-center text-neutral-450">
        Please select a customer from the customer list to inspect their workspace.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs text-neutral-450 dark:text-neutral-500">Loading customer workspace...</span>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <h2 className="text-base font-bold text-neutral-905 dark:text-white">Workspace Sync Failed</h2>
        <p className="text-xs text-neutral-500">{error || "Customer not found."}</p>
        <button onClick={fetchWorkspaceData} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark">
          Retry Sync
        </button>
      </div>
    );
  }

  // Get rich CS data object
  const richData = customer360Data[customer.id] || {
    logo: "🏢",
    industry: "Software & Technology",
    customerSince: "Sep 2024",
    plan: "Professional Tier",
    acv: "$75,000",
    renewalDate: customer.renewal_date,
    csm: "Vamshi CSM",
    csat: "4.0 / 5.0",
    openTickets: 0,
    monthlyUsage: "1,150 DAU",
    transcript: "No transcript uploaded.",
    emails: [],
    tickets: [],
    crmMetrics: { licenseUtilization: "60%", contractTerm: "12 Months", paymentStatus: "Paid", lastTouchpoint: "N/A" },
    usageHistory: []
  };

  const getDynamicUsageHistory = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const history = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = months[d.getMonth()];
      
      let isActive = true;
      if (customer.contract_start_date) {
        const start = new Date(customer.contract_start_date);
        const startYearMonth = start.getFullYear() * 12 + start.getMonth();
        const currentYearMonth = d.getFullYear() * 12 + d.getMonth();
        if (currentYearMonth < startYearMonth) {
          isActive = false;
        }
      }
      
      const activeUserCount = isActive ? (liveTelemetry?.mau || 1) : 0;
      history.push({
        month: mName,
        mau: activeUserCount,
        logins: isActive ? (liveTelemetry?.attendance_marks || 0) : 0,
        healthScore: isActive ? customer.health_score : 100,
        renewalProbability: isActive ? (customer.risk_level === 'low' ? 95 : customer.risk_level === 'medium' ? 70 : 40) : 100
      });
    }
    return history;
  };

  const getDynamicTranscriptText = () => {
    const contact = customer.name || "Contact Person";
    const company = customer.company_name || "Company";
    const plan = customer.plan || "Basic Plan";
    const health = customer.health_score ?? 100;
    const ticketCount = liveTickets.length;
    const emailCount = liveEmails.length;
    const sinceDate = customer.contract_start_date ? new Date(customer.contract_start_date).toLocaleDateString([], { month: 'short', year: 'numeric' }) : "Jan 2024";

    return `${contact} (${company}): "Hi Vamshi, we wanted to check in on our onboarding progression for the ${plan} plan. Our team started check-ins since ${sinceDate}. We currently have ${ticketCount} open support tickets and ${emailCount} email threads synchronized in our CS panel. Overall, our account health is at ${health}% and we're looking to optimize our daily task metrics."`;
  };

  const getDynamicSignals = () => {
    const isAtRisk = customer.risk_level?.toLowerCase() === 'high' || customer.risk_level?.toLowerCase() === 'critical' || customer.health_score < 75;
    
    if (isAtRisk) {
      return [
        { title: `Low Onboarding Health (${customer.health_score}%)`, confidence: 95, severity: "high", impact: "Milestone completion bottleneck" },
        { title: `${liveTickets.length} Outstanding Support Tickets`, confidence: 92, severity: "high", impact: "Open issue backlog friction" },
        { title: "Escalation Flag Triggered", confidence: 89, severity: "medium", impact: "Schedule priority rescue session" }
      ];
    } else {
      return [
        { title: "Stable Onboarding Progression", confidence: 98, severity: "low", impact: "Positive telemetry tracking" },
        { title: "Active Telemetry Logins", confidence: 95, severity: "low", impact: "Healthy usage patterns" },
        { title: "Zero High Priority Blockers", confidence: 92, severity: "low", impact: "Minimal account friction" }
      ];
    }
  };

  const getDynamicExplainability = () => {
    const ticketCount = liveTickets.length;
    const emailCount = liveEmails.length;
    
    let whyText = `The Primary Action is recommended because client renewal is sensitive to contract start-up onboarding milestones. Supporting their operations under the ${customer.plan || 'Basic'} Plan aligns with contract renewal timelines.`;
    let signals = [
      `Contract start date initialized on ${customer.contract_start_date ? new Date(customer.contract_start_date).toLocaleDateString() : 'N/A'}.`,
      `Client support queue shows ${ticketCount} active cases in database.`,
      `Telemetry tracking indicates active module engagement.`
    ];
    let evidence = `No email records uploaded yet. Telemetry logging initialized for CSM ${customer.name}.`;

    if (liveEmails.length > 0) {
      evidence = `Recent email from ${liveEmails[0].sender_email}: "${liveEmails[0].subject} - ${liveEmails[0].snippet}"`;
      whyText = `The Primary Action is recommended based on active client interactions. Key email signals show queries regarding contract renewal operations under the ${customer.plan || 'Basic'} Plan.`;
      signals = [
        `Email contact from ${customer.email} registered.`,
        `${emailCount} messages synchronized in real-time.`,
        `Client has checked in and recorded attendance telemetry.`
      ];
    } else if (liveTickets.length > 0) {
      evidence = `Recent support case: "${liveTickets[0].subject} - Category: ${liveTickets[0].category}"`;
      whyText = `The Primary Action is recommended to address current support ticket load. Ensuring speedy resolution of the ${ticketCount} open ticket(s) protects contract renewal health.`;
    }

    return { whyText, signals, evidence };
  };

  const getDynamicRecommendations = () => {
    const planName = customer.plan || "Basic Plan";
    const company = customer.company_name;
    const health = customer.health_score;
    const risk = customer.risk_level;
    const ticketCount = liveTickets.length;
    
    let primaryAction = "Initiate Customer Success Check-In & Tutorial Campaign";
    let reasoning = `Based on the client's current onboarding status and health score of ${health}%, we recommend scheduling a direct check-in to verify that their employees are comfortable check-in and check-out logs.`;
    
    if (health < 80 || risk === 'high') {
      primaryAction = "Launch Customer Success Rescue & Ticket Resolution Sync";
      reasoning = `With a health score of ${health}% and ${ticketCount} open support cases, immediate technical and account alignment is required to ensure satisfaction and system adoption.`;
    }

    const alt1Action = "Deploy Custom Announcements and Training Module";
    const alt1Reasoning = `Create a custom announcement banner from the admin dashboard to guide employees on mark attendance actions and leave requests, maximizing user engagement.`;

    const alt2Action = "Organize Executive Onboarding Q&A Session";
    const alt2Reasoning = `Align with ${customer.name} and managers at ${company} to review system telemetry logs, verify custom settings, and answer compliance policy usage questions.`;

    const expectedValue = `Ensures contract value retention for ${company} under the ${planName} plan. Mitigates churn risk by establishing active telemetry communication pathways.`;

    return { primaryAction, reasoning, alt1Action, alt1Reasoning, alt2Action, alt2Reasoning, expectedValue };
  };

  // Copilot preset prompts click executor
  const handleCopilotQuery = (query: string) => {
    const userMsg = { sender: 'user' as const, text: query };
    setCopilotMessages(prev => [...prev, userMsg]);

    let reply = "I am processing the customer success context...";
    const name = customer.name;
    const company = customer.company_name;

    if (query.includes("Why is this customer high risk")) {
      reply = `${name} at ${company} is currently evaluated at a ${customer.risk_level.toUpperCase()} churn risk level with a health score of ${customer.health_score}%. 
Key signals:
1. Support ticket queue contains ${liveTickets.length} open case(s).
2. On-boarding check-ins show ${liveTelemetry?.attendance_marks || 0} registered logs.`;
    } else if (query.includes("What happens if we offer a discount") || query.includes("simulate")) {
      reply = `Simulating onboarding optimization for ${company}:
- **Action**: Launch dedicated onboarding support checklist and system training.
- **Success Probability**: Onboarding milestones completion probability increases to 95%.
- **Impact**: Establishes correct daily check-in habits and improves NPS to 10/10.`;
    } else if (query.includes("Summarize this customer")) {
      reply = `${name} is the contact person for ${company} (${customer.plan || "Basic"} Plan).
- **CSM Owner**: Vamshi CSM
- **Account Health**: ${customer.health_score}%
- **Support Tickets**: ${liveTickets.length} open
- **Synchronized Emails**: ${liveEmails.length} logged`;
    } else if (query.includes("Generate executive email")) {
      reply = `**Subject**: Onboarding Support & Telemetry Verification - DecisionFlow AI

Hi ${name},

I hope you are doing well. I wanted to follow up on your onboarding milestones at ${company}. 

We want to make sure your team has a smooth experience using our Attendance tracking systems. Let's schedule a brief Q&A call this week to review any open support questions.

Best,
Vamshi CSM`;
    }

    setTimeout(() => {
      setCopilotMessages(prev => [...prev, { sender: 'assistant' as const, text: reply }]);
    }, 700);
  };

  // Parse and color-code transcript text with 8 specific tags
  const renderHighlightedTranscript = (text: string) => {
    if (!text) return <p className="text-xs text-neutral-450">No transcript available.</p>;

    const lines = text.split('\n');
    return (
      <div className="space-y-4 max-w-3xl mx-auto py-2">
        {lines.map((line, idx) => {
          let badgeText = "";
          let badgeClass = "";

          const lowerLine = line.toLowerCase();
          if (lowerLine.includes("pricing") || lowerLine.includes("budget") || lowerLine.includes("discount") || lowerLine.includes("cost")) {
            badgeText = "PRICING CONCERN";
            badgeClass = "bg-amber-50 dark:bg-amber-955/30 text-amber-600 dark:text-amber-450 border-amber-250/20 dark:border-amber-900/40";
          } else if (lowerLine.includes("salesforce") || lowerLine.includes("competitor") || lowerLine.includes("alternative")) {
            badgeText = "COMPETITOR MENTION";
            badgeClass = "bg-rose-50 dark:bg-rose-955/30 text-rose-600 dark:text-rose-450 border-rose-250/20 dark:border-rose-900/40";
          } else if (lowerLine.includes("renew") || lowerLine.includes("contract term")) {
            badgeText = "RENEWAL MENTION";
            badgeClass = "bg-blue-50 dark:bg-blue-955/30 text-blue-600 dark:text-blue-450 border-blue-250/20 dark:border-blue-900/40";
          } else if (lowerLine.includes("dropped") || lowerLine.includes("complaint") || lowerLine.includes("lag") || lowerLine.includes("latency") || lowerLine.includes("slow") || lowerLine.includes("error")) {
            badgeText = "PRODUCT COMPLAINT";
            badgeClass = "bg-red-50 dark:bg-red-955/30 text-red-600 dark:text-red-450 border-red-250/20 dark:border-red-900/40";
          } else if (lowerLine.includes("resolved") || lowerLine.includes("satisfied") || lowerLine.includes("good") || lowerLine.includes("great") || lowerLine.includes("success")) {
            badgeText = "POSITIVE FEEDBACK";
            badgeClass = "bg-emerald-50 dark:bg-emerald-955/30 text-emerald-600 dark:text-emerald-455 border-emerald-250/20 dark:border-emerald-900/40";
          } else if (lowerLine.includes("feature") || lowerLine.includes("training") || lowerLine.includes("workshop") || lowerLine.includes("request") || lowerLine.includes("add a")) {
            badgeText = "FEATURE REQUEST";
            badgeClass = "bg-purple-50 dark:bg-purple-955/30 text-purple-600 dark:text-purple-450 border-purple-250/20 dark:border-purple-900/40";
          } else if (lowerLine.includes("john") || lowerLine.includes("mark") || lowerLine.includes("peter") || lowerLine.includes("richard") || lowerLine.includes("alice") || lowerLine.includes("executive") || lowerLine.includes("c-level") || lowerLine.includes("vp")) {
            badgeText = "DECISION MAKER";
            badgeClass = "bg-violet-50 dark:bg-violet-955/30 text-violet-600 dark:text-violet-450 border-violet-250/20 dark:border-violet-900/40";
          } else if (lowerLine.includes("restructure") || lowerLine.includes("schedule") || lowerLine.includes("proposal") || lowerLine.includes("discuss") || lowerLine.includes("follow-up") || lowerLine.includes("action item")) {
            badgeText = "ACTION ITEMS";
            badgeClass = "bg-orange-50 dark:bg-orange-955/30 text-orange-600 dark:text-orange-450 border-orange-250/20 dark:border-orange-900/40";
          }

          // Parse speaker and message to render conversation bubbles
          let speaker = "Client";
          let message = line;
          const colonIndex = line.indexOf(':');
          if (colonIndex > 0) {
            speaker = line.slice(0, colonIndex).trim();
            message = line.slice(colonIndex + 1).trim();
            if (message.startsWith('"') && message.endsWith('"')) {
              message = message.slice(1, -1);
            }
          }

          const isClient = !speaker.toLowerCase().includes("vamshi");

          return (
            <div key={idx} className={`flex flex-col gap-1.5 ${isClient ? 'items-start' : 'items-end'} animate-in fade-in duration-200`}>
              <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">{speaker}</span>
                {badgeText && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold border uppercase tracking-wider ${badgeClass}`}>
                    {badgeText}
                  </span>
                )}
              </div>
              <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-xs ${
                isClient 
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200/50 dark:border-neutral-700/50 rounded-tl-none' 
                  : 'bg-primary text-white rounded-tr-none'
              }`}>
                {message}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex gap-6 relative min-h-[85vh]">
      
      {/* Left Workspace Panel */}
      <div className={`flex-1 space-y-6 transition-all duration-300 ${showCopilot ? 'max-w-[calc(100%-21rem)]' : 'w-full'}`}>
        
        {/* Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-center justify-center text-2xl bg-neutral-50 dark:bg-neutral-950 shadow-inner">
              {richData.logo}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">{customer.name}</h1>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-neutral-50 border border-neutral-200 text-neutral-500 uppercase">
                  {customer.plan || "Standard Plan"}
                </span>
              </div>
              <p className="text-xs text-neutral-450 dark:text-neutral-500 font-medium mt-0.5">
                Contract Active • Since {customer.contract_start_date ? new Date(customer.contract_start_date).toLocaleDateString([], { month: 'short', year: 'numeric' }) : "Jan 2024"}
              </p>
              
              <div className="flex items-center gap-4 text-[10px] text-neutral-450 dark:text-neutral-500 font-semibold mt-2.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" /> ACV: {
                    customer.plan === 'Enterprise' ? '$450,000' : customer.plan === 'Premium' ? '$240,000' : '$120,000'
                  }
                </span>
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {customer.email}</span>
                <span className="flex items-center gap-1"><Smile className="w-3.5 h-3.5" /> CSAT: 5.0 / 5.0</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCopilot(!showCopilot)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${showCopilot ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white dark:bg-neutral-900 text-neutral-600 border-neutral-200 dark:border-neutral-800'}`}
            >
              <Bot className="w-3.5 h-3.5" /> {showCopilot ? 'Hide Copilot' : 'Show Copilot'}
            </button>

            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold shadow-sm shadow-primary/20 hover:bg-primary/95 transition-all duration-150 disabled:opacity-60 cursor-pointer"
            >
              {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
              Run Decision Agents
            </button>
          </div>
        </div>

        {/* Health & Risk widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HealthScoreCard score={customer.health_score} />
          <div className="md:col-span-2">
            <RiskCard level={customer.risk_level} />
          </div>
        </div>

        {/* 8 Tab Navigation bar with Vercel Style underline slide */}
        <div className="flex items-center border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto whitespace-nowrap scrollbar-none gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: Building },
            { id: 'transcript', label: 'Meeting Transcript', icon: MessageSquare },
            { id: 'emails', label: 'Emails', icon: Mail },
            { id: 'tickets', label: 'Support Tickets', icon: Ticket },
            { id: 'crm', label: 'CRM Metrics', icon: FileText },
            { id: 'usage', label: 'Usage Analytics', icon: TrendingUp },
            { id: 'recommendations', label: 'AI Recommendations', icon: Sparkles },
            { id: 'timeline', label: 'Memory Timeline', icon: History }
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold transition-all duration-150 relative cursor-pointer ${
                  active 
                    ? 'text-neutral-900 dark:text-white' 
                    : 'text-neutral-450 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-primary' : 'text-neutral-400 dark:text-neutral-500'}`} />
                <span>{t.label}</span>
                {active && (
                  <motion.div 
                    layoutId="activeWorkspaceTab"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab contents grid container */}
        <div className="mt-4 animate-in fade-in duration-200">
          
          {/* Tab 1: Overview Dashboard */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 p-6 border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-neutral-950 dark:text-white uppercase tracking-wider">Account Executive Summary</h3>
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg text-xs leading-relaxed text-neutral-700 dark:text-neutral-350 space-y-2">
                  <p className="font-semibold text-primary">Consensus Business Directives:</p>
                  <p>• Churn alert triggers are active. Product adoption decline is evaluated at 100% utilization.</p>
                  <p>• Renewal risk stands at {customer.risk_level.toUpperCase()}. Active usage telemetry detected in transcripts.</p>
                  <p>• Recommend scheduling onboarding sequence and product review session within 7 days.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-100 dark:border-neutral-850">
                    <span className="text-[10px] text-neutral-450 uppercase font-semibold">CSM Account Owner</span>
                    <p className="text-xs font-bold text-neutral-900 dark:text-white mt-1">Vamshi CSM</p>
                  </div>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-100 dark:border-neutral-850">
                    <span className="text-[10px] text-neutral-450 uppercase font-semibold">Contract Renewal Date</span>
                    <p className="text-xs font-bold text-neutral-900 dark:text-white mt-1">{new Date(customer.renewal_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* CRM Mini widgets sidebar */}
              <div className="p-6 border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-neutral-955 dark:text-white uppercase tracking-wider">Lifecycle Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs pb-2 border-b border-neutral-100 dark:border-neutral-850">
                    <span className="text-neutral-400">Monthly Plan</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{customer.plan || "Basic Plan"}</span>
                  </div>
                  <div className="flex justify-between text-xs pb-2 border-b border-neutral-100 dark:border-neutral-850">
                    <span className="text-neutral-400">Open Tickets</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{liveTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Billing Status</span>
                    <span className="font-bold text-success">Active (Paid)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transcript' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Dialogue Transcript */}
              <div className="xl:col-span-2 p-6 border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-850">
                  <h3 className="text-xs font-bold text-neutral-955 dark:text-white uppercase tracking-wider">Dialogue Analytics</h3>
                  <span className="text-[10px] text-neutral-450">Dialogue auto-categorized by AI telemetry parsers</span>
                </div>
                {renderHighlightedTranscript(getDynamicTranscriptText())}
              </div>

              {/* AI Signal Detection Panel */}
              <div className="p-6 border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg shadow-sm space-y-4 h-fit">
                <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-850">
                  <h3 className="text-xs font-bold text-neutral-955 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-primary" /> Detected Signals
                  </h3>
                  <span className="text-[9px] font-bold text-success uppercase bg-success/15 px-1.5 py-0.5 rounded border border-success/10">Active</span>
                </div>

                <div className="space-y-3.5">
                  {getDynamicSignals().map((sig, idx) => (
                    <div key={idx} className="p-3 border border-neutral-100 dark:border-neutral-850 rounded-lg hover:border-neutral-200 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-250 flex items-center gap-1.5">
                          <span className="text-emerald-500 font-bold">✓</span> {sig.title}
                        </span>
                        <span className="text-[9px] font-bold text-neutral-450">{sig.confidence}% Conf.</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-[9px] font-bold">
                        <span className={`px-1.5 py-0.5 rounded border uppercase ${
                          sig.severity === "high" 
                            ? "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-405 border-red-200/50" 
                            : sig.severity === "medium"
                              ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-405 border-amber-200/50"
                              : "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-405 border-green-200/50"
                        }`}>{sig.severity} Severity</span>
                        <span className="text-slate-400">Impact: <span className="text-slate-600 dark:text-slate-350">{sig.impact}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}


          {/* Tab 3: Emails */}
          {activeTab === 'emails' && (
            <div className="p-6 border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-neutral-955 dark:text-white uppercase tracking-wider">Synced Gmail Conversations</h3>
                <button 
                  onClick={async () => {
                    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
                    await axios.post(`${API_BASE_URL}/demo/gmail/sync`, { customer_id: selectedCustomerId });
                    fetchWorkspaceData();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-primary text-white rounded-lg text-[10px] font-bold cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 animate-spin-hover" /> Sync Gmail
                </button>
              </div>
              <div className="space-y-3">
                {liveEmails.map((email: any, i: number) => (
                  <div key={i} className="p-4 border border-neutral-100 dark:border-neutral-850 rounded-lg space-y-2 bg-neutral-50/40 dark:bg-neutral-950/20">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-450">
                      <span>Sender: {email.sender}</span>
                      <span>{new Date(email.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${
                        email.sentiment === 'Negative' ? 'bg-danger/10 border-danger/30 text-danger' : 'bg-success/10 border-success/30 text-success'
                      }`}>{email.sentiment}</span>
                      <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{email.subject}</h4>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-350">{email.body}</p>
                    {email.summary && (
                      <p className="text-[10px] text-primary italic font-semibold mt-1">AI Summary: {email.summary}</p>
                    )}
                  </div>
                ))}
                {liveEmails.length === 0 && <p className="text-xs text-neutral-450 text-center py-6">No emails synced from inbox.</p>}
              </div>
            </div>
          )}

          {/* Tab 4: Support Ticket Panel */}
          {activeTab === 'tickets' && (
            <div className="p-6 border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg shadow-sm space-y-5">
              <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-850">
                <div>
                  <h3 className="text-xs font-bold text-neutral-955 dark:text-white uppercase tracking-wider font-sans">Incident Support Center</h3>
                  <p className="text-[10px] text-neutral-450 mt-0.5">Real-time developer SLA monitoring database logs.</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-450 font-semibold">Active Open Incidents</span>
                  <p className="text-lg font-bold text-danger leading-none mt-1">{liveTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px] font-sans">
                  <thead>
                    <tr className="border-b border-neutral-100 dark:border-neutral-850 text-neutral-400 font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Ticket ID</th>
                      <th className="py-2.5 px-3">Subject / Incident Description</th>
                      <th className="py-2.5 px-3 text-center">Priority</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">Created Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100/50 dark:divide-neutral-800/40 text-neutral-600 dark:text-neutral-300">
                    {liveTickets.map((t: any) => (
                      <tr key={t.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-950/20 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-neutral-400">{t.id}</td>
                        <td className="py-3 px-3 font-semibold text-neutral-800 dark:text-neutral-250">
                          <div>
                            <span className="block font-bold">{t.subject}</span>
                            <span className="block text-[10px] text-neutral-400 dark:text-neutral-500 font-normal">{t.description}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${
                            t.priority === 'Urgent' || t.priority === 'High'
                              ? 'bg-danger/10 text-danger border-danger/30 font-bold' 
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border-neutral-200'
                          }`}>{t.priority}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${
                            t.status === 'Open'
                              ? 'bg-amber-50/60 dark:bg-amber-955/10 text-amber-600 dark:text-amber-455 border-amber-200/30'
                              : t.status === 'In Progress'
                                ? 'bg-blue-50 dark:bg-blue-955/10 text-blue-600 dark:text-blue-455 border-blue-200/30'
                                : 'bg-emerald-50 dark:bg-emerald-955/20 text-emerald-600 dark:text-emerald-455 border-emerald-200/50'
                          }`}>{t.status}</span>
                        </td>
                        <td className="py-3 px-3 font-semibold">{t.category}</td>
                        <td className="py-3 px-3 text-right font-semibold text-neutral-400">{new Date(t.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {liveTickets.length === 0 && (
                  <p className="text-xs text-neutral-450 text-center py-6">No support tickets raised by this customer.</p>
                )}
              </div>
            </div>
          )}

          {/* Tab 5: CRM Metrics */}
          {activeTab === 'crm' && (
            <div className="p-6 border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-neutral-955 dark:text-white uppercase tracking-wider">HubSpot & Salesforce Telemetry</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-100 dark:border-neutral-850">
                  <span className="text-[9px] text-neutral-450 uppercase font-bold tracking-wider">License Usage</span>
                  <p className="text-lg font-bold text-neutral-900 dark:text-white mt-1">
                    {liveTelemetry && liveTelemetry.mau > 0 ? "100%" : "0%"}
                  </p>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-100 dark:border-neutral-850">
                  <span className="text-[9px] text-neutral-450 uppercase font-bold tracking-wider">Contract Term</span>
                  <p className="text-lg font-bold text-neutral-900 dark:text-white mt-1">
                    {customer.contract_start_date ? Math.round((new Date(customer.renewal_date).getTime() - new Date(customer.contract_start_date).getTime()) / (1000 * 60 * 60 * 24 * 30.4)) + " Months" : "12 Months"}
                  </p>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-100 dark:border-neutral-850">
                  <span className="text-[9px] text-neutral-450 uppercase font-bold tracking-wider">Billing Status</span>
                  <p className="text-lg font-bold text-success mt-1">Paid (Active)</p>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-100 dark:border-neutral-850">
                  <span className="text-[9px] text-neutral-450 uppercase font-bold tracking-wider">Last CSM Contact</span>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white mt-2 leading-tight">Onboarding - {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Product Usage Analytics */}
          {activeTab === 'usage' && (
            <div className="p-6 border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg shadow-sm space-y-6">
              <div>
                <h3 className="text-xs font-bold text-neutral-955 dark:text-white uppercase tracking-wider">Product Usage Analytics</h3>
                <p className="text-[10px] text-neutral-450 mt-0.5">Seat adoption metrics and client engagement distributions.</p>
              </div>

              {getDynamicUsageHistory().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* 1. MAU (Line) */}
                  <div className="p-4 border border-neutral-100 dark:border-neutral-850 rounded-lg space-y-2 bg-neutral-50/20 dark:bg-neutral-950/10">
                    <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-tight">Monthly Active Users</span>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getDynamicUsageHistory()} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                          <XAxis dataKey="month" stroke="#9ca3af" fontSize={9} tickLine={false} />
                          <YAxis stroke="#9ca3af" fontSize={9} tickLine={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="mau" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 2. WAU (Bar) */}
                  <div className="p-4 border border-neutral-100 dark:border-neutral-850 rounded-lg space-y-2 bg-neutral-50/20 dark:bg-neutral-950/10">
                    <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-tight">Weekly Active Users</span>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getDynamicUsageHistory().map((d: any) => ({ ...d, wau: Math.round(d.mau / 4.2) }))} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                          <XAxis dataKey="month" stroke="#9ca3af" fontSize={9} tickLine={false} />
                          <YAxis stroke="#9ca3af" fontSize={9} tickLine={false} />
                          <Tooltip />
                          <Bar dataKey="wau" fill="#4f46e5" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 3. Feature Adoption (Bar) */}
                  <div className="p-4 border border-neutral-100 dark:border-neutral-850 rounded-lg space-y-2 bg-neutral-50/20 dark:bg-neutral-950/10">
                    <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-tight">Feature Adoption Rate (%)</span>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={[
                            { name: 'Dashboard', rate: liveTelemetry?.adoption_rates?.['Dashboard'] || 100 },
                            { name: 'Mark Attendance', rate: liveTelemetry?.adoption_rates?.['Mark Attendance'] || 0 },
                            { name: 'Apply Leave', rate: liveTelemetry?.adoption_rates?.['Apply Leave'] || 0 },
                            { name: 'History', rate: liveTelemetry?.adoption_rates?.['History'] || 0 },
                            { name: 'Announcements', rate: liveTelemetry?.adoption_rates?.['Announcements'] || 0 }
                          ]} 
                          layout="vertical" 
                          margin={{ top: 5, right: 5, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                          <XAxis type="number" stroke="#9ca3af" fontSize={9} tickLine={false} domain={[0, 100]} />
                          <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={8} width={80} tickLine={false} />
                          <Tooltip />
                          <Bar dataKey="rate" fill="#0d9488" radius={[0, 3, 3, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 4. Login Frequency (Line) */}
                  <div className="p-4 border border-neutral-100 dark:border-neutral-850 rounded-lg space-y-2 bg-neutral-50/20 dark:bg-neutral-950/10">
                    <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-tight">Login Frequency (Logins/User/Mo)</span>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getDynamicUsageHistory()} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                          <XAxis dataKey="month" stroke="#9ca3af" fontSize={9} tickLine={false} />
                          <YAxis stroke="#9ca3af" fontSize={9} tickLine={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="logins" stroke="#0891b2" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 5. Health Trend (Line) */}
                  <div className="p-4 border border-neutral-100 dark:border-neutral-850 rounded-lg space-y-2 bg-neutral-50/20 dark:bg-neutral-950/10">
                    <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-tight">Health Trend Profile</span>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                          data={getDynamicUsageHistory().map(d => ({ month: d.month, score: d.healthScore }))} 
                          margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                          <XAxis dataKey="month" stroke="#9ca3af" fontSize={9} tickLine={false} />
                          <YAxis stroke="#9ca3af" fontSize={9} tickLine={false} domain={[0, 100]} />
                          <Tooltip />
                          <Line type="monotone" dataKey="score" stroke="#ea580c" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 6. Renewal Probability (Line) */}
                  <div className="p-4 border border-neutral-100 dark:border-neutral-850 rounded-lg space-y-2 bg-neutral-50/20 dark:bg-neutral-950/10">
                    <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-tight">Renewal Probability Trend</span>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                          data={getDynamicUsageHistory().map(d => ({ month: d.month, prob: d.renewalProbability }))} 
                          margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                          <XAxis dataKey="month" stroke="#9ca3af" fontSize={9} tickLine={false} />
                          <YAxis stroke="#9ca3af" fontSize={9} tickLine={false} domain={[0, 100]} />
                          <Tooltip />
                          <Line type="monotone" dataKey="prob" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-450 text-center py-10">No usage logs available.</p>
              )}
            </div>
          )}

          {/* Tab 7: AI Recommendations & Explainability Center */}
          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              
              {/* Predictive Simulation Header */}
              <div className="p-6 border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Predictive Agent Simulation</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-neutral-100 dark:divide-neutral-850">
                  <div className="pb-3 sm:pb-0">
                    <span className="text-[9px] text-neutral-450 uppercase font-semibold">Renewal Probability</span>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white mt-1 flex items-center gap-2">
                      <span className="text-neutral-400 line-through text-xs font-normal">62%</span>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="text-success font-bold">89%</span>
                    </p>
                  </div>
                  <div className="py-3 sm:py-0 sm:pl-6">
                    <span className="text-[9px] text-neutral-450 uppercase font-semibold">Health Score Improvement</span>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white mt-1 flex items-center gap-2">
                      <span className="text-neutral-400 line-through text-xs font-normal">{customer.health_score}%</span>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="text-success font-bold">{Math.min(100, customer.health_score + 25)}%</span>
                    </p>
                  </div>
                  <div className="pt-3 sm:pt-0 sm:pl-6 font-semibold">
                    <span className="text-[9px] text-neutral-455 uppercase font-semibold">Expected Business Value</span>
                    <p className="text-xs font-bold text-neutral-700 dark:text-neutral-350 mt-1 leading-relaxed">
                      {getDynamicRecommendations().expectedValue}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendation Comparison Cards */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-neutral-955 dark:text-white uppercase tracking-wider px-1">Recommendation Comparison</h3>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Primary Recommendation */}
                  {customer.recommendations?.[0] ? (
                    <div className="p-5 border-2 border-primary bg-primary/5 rounded-xl space-y-4 relative shadow-sm">
                      <span className="absolute -top-3 left-4 bg-primary text-white text-[8px] font-bold uppercase px-2 py-0.5 rounded-full border border-primary">Primary Recommendation</span>
                      <div className="space-y-2 mt-1">
                        <h4 className="text-xs font-bold text-neutral-955 dark:text-white leading-snug">{getDynamicRecommendations().primaryAction}</h4>
                        <p className="text-[10px] text-neutral-500 leading-relaxed line-clamp-3">{getDynamicRecommendations().reasoning}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-200/50 text-[10px] font-bold">
                        <div>
                          <span className="text-neutral-400 uppercase text-[8px] tracking-wider block">Expected Success</span>
                          <span className="text-neutral-800 dark:text-neutral-200">95%</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 uppercase text-[8px] tracking-wider block">Business Impact</span>
                          <span className="text-primary uppercase">High</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 uppercase text-[8px] tracking-wider block">Risk Level</span>
                          <span className="text-success uppercase">Low</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 uppercase text-[8px] tracking-wider block">Confidence Score</span>
                          <span className="text-neutral-800 dark:text-neutral-250">98%</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center justify-center text-xs text-neutral-400">
                      No recommendation data available.
                    </div>
                  )}

                  {/* Alternative Recommendation 1 */}
                  <div className="p-5 border border-neutral-105 dark:border-neutral-850 bg-white dark:bg-neutral-900 rounded-xl space-y-4 shadow-sm hover:border-neutral-200 transition-colors">
                    <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 text-[8px] font-bold uppercase px-2 py-0.5 rounded-full border border-neutral-200/60 inline-block">Alternative Option 1</span>
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-250 leading-snug">{getDynamicRecommendations().alt1Action}</h4>
                      <p className="text-[10px] text-neutral-500 leading-relaxed line-clamp-3">{getDynamicRecommendations().alt1Reasoning}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[10px] font-bold">
                      <div>
                        <span className="text-neutral-400 uppercase text-[8px] tracking-wider block">Expected Success</span>
                        <span className="text-neutral-700 dark:text-neutral-350">85%</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 uppercase text-[8px] tracking-wider block">Business Impact</span>
                        <span className="text-neutral-700 dark:text-neutral-350 uppercase">Medium</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 uppercase text-[8px] tracking-wider block">Risk Level</span>
                        <span className="text-success uppercase">Low</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 uppercase text-[8px] tracking-wider block">Confidence Score</span>
                        <span className="text-neutral-700 dark:text-neutral-350">90%</span>
                      </div>
                    </div>
                  </div>

                  {/* Alternative Recommendation 2 */}
                  <div className="p-5 border border-neutral-105 dark:border-neutral-850 bg-white dark:bg-neutral-900 rounded-xl space-y-4 shadow-sm hover:border-neutral-200 transition-colors">
                    <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 text-[8px] font-bold uppercase px-2 py-0.5 rounded-full border border-neutral-200/60 inline-block">Alternative Option 2</span>
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-250 leading-snug">{getDynamicRecommendations().alt2Action}</h4>
                      <p className="text-[10px] text-neutral-500 leading-relaxed line-clamp-3">{getDynamicRecommendations().alt2Reasoning}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[10px] font-bold">
                      <div>
                        <span className="text-neutral-400 uppercase text-[8px] tracking-wider block">Expected Success</span>
                        <span className="text-neutral-700 dark:text-neutral-350">80%</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 uppercase text-[8px] tracking-wider block">Business Impact</span>
                        <span className="text-neutral-700 dark:text-neutral-350 uppercase">Medium</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 uppercase text-[8px] tracking-wider block">Risk Level</span>
                        <span className="text-success uppercase">Low</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 uppercase text-[8px] tracking-wider block">Confidence Score</span>
                        <span className="text-neutral-700 dark:text-neutral-350">85%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explainability Panel */}
              <div className="p-6 border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg shadow-sm space-y-5">
                <div className="flex items-center gap-2 text-neutral-450 dark:text-neutral-500 border-b border-neutral-100 dark:border-neutral-850 pb-2">
                  <HelpCircle className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-neutral-950 dark:text-white uppercase tracking-wider">AI Explainability Audit Panel</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Explanatory blocks */}
                  <div className="lg:col-span-2 space-y-4 text-xs">
                    <div>
                      <h4 className="font-bold text-neutral-850 dark:text-neutral-200 mb-1">Why this recommendation?</h4>
                      <p className="text-neutral-600 dark:text-neutral-350 leading-relaxed font-medium">
                        {getDynamicExplainability().whyText}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-neutral-850 dark:text-neutral-200 mb-1">Customer Signals Detected</h4>
                      <ul className="list-disc pl-4 space-y-1.5 text-neutral-500 dark:text-neutral-400 font-bold">
                        {getDynamicExplainability().signals.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-neutral-850 dark:text-neutral-200 mb-1">Supporting Evidence / Transcript Excerpt</h4>
                      <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded border border-neutral-100 dark:border-neutral-850 font-mono text-[10px] text-neutral-500 leading-relaxed">
                        "{getDynamicExplainability().evidence}"
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-neutral-850 dark:text-neutral-200 mb-1">Knowledge Base References</h4>
                      <div className="flex gap-2 flex-wrap">
                        <span className="px-2 py-0.5 border border-primary/20 bg-primary/5 rounded text-[9px] font-bold text-primary uppercase">PLB-292: Competitor Defend Plan</span>
                        <span className="px-2 py-0.5 border border-primary/20 bg-primary/5 rounded text-[9px] font-bold text-primary uppercase">PLB-103: Renewal Escalation pricing</span>
                      </div>
                    </div>
                  </div>

                  {/* Confidence Breakdown progress bars */}
                  <div className="p-5 bg-neutral-50/50 dark:bg-neutral-950/20 border border-neutral-100 dark:border-neutral-850 rounded-xl space-y-4">
                    <div>
                      <h4 className="text-[10px] font-bold text-neutral-450 uppercase tracking-tight">Confidence Weight Split</h4>
                      <span className="text-[9px] text-neutral-400 block mt-0.5 font-semibold">Calculated consensus weight attribution</span>
                    </div>

                    <div className="space-y-3">
                      {[
                        { label: "Transcript Dialogue", weight: 35, color: "bg-blue-500" },
                        { label: "CRM Billing & Overdue", weight: 20, color: "bg-indigo-500" },
                        { label: "Support ticket logs", weight: 20, color: "bg-rose-500" },
                        { label: "Product Usage trend", weight: 15, color: "bg-cyan-500" },
                        { label: "Historical memories", weight: 10, color: "bg-emerald-500" }
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[9px] font-bold text-neutral-600 dark:text-neutral-450">
                            <span>{item.label}</span>
                            <span>{item.weight}%</span>
                          </div>
                          <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1.5">
                            <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${item.weight}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 8: Memory Timeline */}
          {activeTab === 'timeline' && (
            <div className="p-6 border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg shadow-sm space-y-6">
              <div>
                <h3 className="text-xs font-bold text-neutral-955 dark:text-white uppercase tracking-wider">Client Memory Timeline</h3>
                <p className="text-[10px] text-neutral-450 mt-1">
                  Chronological records capturing previous interaction logs, customer health fluctuations, and CSM resolutions.
                </p>
              </div>

              <div className="relative pl-10 space-y-6">
                <div className="absolute left-[15px] top-2.5 bottom-2.5 w-[2px] bg-neutral-200 dark:bg-neutral-800" />

                {memories.map((mem) => {
                  let Icon = Clock;
                  let colorClass = "text-neutral-500 bg-neutral-100 border-neutral-200 dark:bg-neutral-850 dark:border-neutral-800";

                  if (mem.interaction_type === 'joined') {
                    Icon = UserPlus;
                    colorClass = "text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40";
                  } else if (mem.interaction_type === 'health_change') {
                    Icon = Activity;
                    colorClass = "text-orange-500 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/40";
                  } else if (mem.interaction_type === 'meeting' || mem.interaction_type === 'transcript') {
                    Icon = FileText;
                    colorClass = "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/40";
                  } else if (mem.interaction_type === 'ticket') {
                    Icon = Ticket;
                    colorClass = "text-rose-500 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40";
                  } else if (mem.interaction_type === 'recommendation') {
                    Icon = Sparkles;
                    colorClass = "text-cyan-500 bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-900/40";
                  } else if (mem.interaction_type === 'decision' || mem.interaction_type === 'approval') {
                    Icon = ShieldCheck;
                    colorClass = "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40";
                  } else if (mem.interaction_type === 'renewal') {
                    Icon = Calendar;
                    colorClass = "text-violet-500 bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-900/40";
                  } else if (mem.interaction_type === 'email') {
                    Icon = Mail;
                    colorClass = "text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40";
                  } else if (mem.interaction_type === 'feedback') {
                    Icon = MessageSquare;
                    colorClass = "text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40";
                  } else if (mem.interaction_type === 'csat') {
                    Icon = Smile;
                    colorClass = "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40";
                  } else if (mem.interaction_type === 'telemetry') {
                    Icon = Zap;
                    colorClass = "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/40";
                  }

                  return (
                    <div key={mem.id} className="relative flex items-start gap-4">
                      {/* Left timeline badge with icon */}
                      <div className="absolute left-0 top-0.5 w-8 h-8 flex items-center justify-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${colorClass} z-10 shadow-xs`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      
                      <div className="flex-grow space-y-1.5 pl-10">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-neutral-900 dark:text-white capitalize">{mem.interaction_type.replace('_', ' ')} Event</span>
                          <span className="text-[10px] text-neutral-450 dark:text-neutral-500">{new Date(mem.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-350 bg-neutral-50/30 dark:bg-neutral-950/10 p-3 rounded-lg border leading-relaxed font-sans font-semibold border-neutral-100 dark:border-neutral-850">{mem.content}</p>
                        
                        <div className="flex items-center gap-3 text-[9px] text-neutral-450 dark:text-neutral-500 font-bold">
                          <span>Health Score: {mem.health_score}%</span>
                          <span>•</span>
                          <span>Risk Level: {mem.risk_level.toUpperCase()}</span>
                          {mem.outcome && (
                            <>
                              <span>•</span>
                              <span className="text-success">Outcome: {mem.outcome}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Right AI Copilot Panel */}
      <AnimatePresence>
        {showCopilot && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="w-80 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-lg shadow-lg flex flex-col h-[80vh] flex-shrink-0 relative overflow-hidden"
          >
            {/* Copilot Header */}
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-neutral-905 dark:text-white">CS Decision Copilot</span>
              </div>
              <button 
                onClick={() => setShowCopilot(false)}
                className="text-[10px] text-neutral-400 hover:text-neutral-855 font-bold"
              >
                Close
              </button>
            </div>

            {/* Chat List area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {copilotMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white font-medium'
                      : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-350 border border-neutral-100 dark:border-neutral-800'
                  }`}>
                    {msg.text.split('\n').map((line, idx) => <p key={idx} className="mt-0.5">{line}</p>)}
                  </div>
                </div>
              ))}
            </div>

            {/* Copilot Presets / Quick prompts */}
            <div className="px-4 py-2 bg-neutral-50/50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-900 space-y-1.5 flex-shrink-0">
              <span className="text-[8px] text-neutral-400 uppercase font-bold tracking-wider block">Suggested Queries</span>
              <div className="grid grid-cols-1 gap-1 text-[9px]">
                {[
                  "Why is this customer high risk?",
                  "What happens if we offer a discount?",
                  "Summarize this customer.",
                  "Generate executive email."
                ].map((promptText) => (
                  <button
                    key={promptText}
                    onClick={() => handleCopilotQuery(promptText)}
                    className="p-1.5 border border-neutral-100 dark:border-neutral-900 hover:border-primary/20 dark:hover:border-primary/20 bg-white dark:bg-neutral-900 rounded text-left text-neutral-600 dark:text-neutral-350 truncate hover:text-primary font-semibold"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </div>

            {/* Input form */}
            <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 flex gap-2 items-center bg-white dark:bg-neutral-950 flex-shrink-0">
              <input
                type="text"
                placeholder="Ask about this account..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && chatInput.trim() && (handleCopilotQuery(chatInput), setChatInput(''))}
                className="flex-1 px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 rounded text-xs bg-neutral-50 dark:bg-neutral-900 text-neutral-905 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button 
                onClick={() => chatInput.trim() && (handleCopilotQuery(chatInput), setChatInput(''))}
                className="p-1.5 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Workspace;
