import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Customer {
  id: number;
  name: string;
  company_name: string;
  email: string;
  health_score: number;
  risk_level: 'low' | 'medium' | 'high';
  renewal_date: string;
  nps: number;
  domain: string;
  contract_start_date?: string;
  industry?: string;
  plan?: string;
  created_at: string;
}

export interface UploadedFile {
  id: number;
  customer_id: number;
  filename: string;
  file_type: 'transcript' | 'email' | 'csv';
  file_size: number;
  status: string;
  uploaded_at: string;
}

export interface Recommendation {
  id: number;
  customer_id: number;
  primary_action: string;
  confidence_score: number;
  business_impact: 'High' | 'Medium' | 'Low';
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  reasoning: string;
  evidence: string;
  alternative_actions?: {
    items?: Array<{
      action: string;
      confidence_score: number;
      business_impact: 'High' | 'Medium' | 'Low';
      reasoning: string;
    }>;
  };
  agent_run_id?: number;
  created_at: string;
}

export interface AgentStatus {
  agent_name: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  execution_time: number;
  output_summary?: string;
}

export interface AgentExecutionTask {
  task_id: string;
  customer_id: number;
  status: 'running' | 'completed' | 'failed';
  current_agent: string;
  agents: AgentStatus[];
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_action: string;
  user_name: string;
  details: string;
  timestamp: string;
}

export interface AnalyticsSummary {
  acceptance_rate: number;
  total_recommendations: number;
  decisions_breakdown: {
    approved: number;
    rejected: number;
    modified: number;
    pending: number;
  };
  average_health_score: number;
  risk_distribution: {
    high: number;
    medium: number;
    low: number;
  };
  weekly_activity: Array<{
    day: string;
    generated: number;
    accepted: number;
  }>;
}

export const apiService = {
  // Health
  getHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    const response = await apiClient.get('/customers');
    return response.data;
  },

  getCustomer: async (id: number): Promise<Customer & { uploads: UploadedFile[], recommendations: Recommendation[], agent_runs: any[] }> => {
    const response = await apiClient.get(`/customer/${id}`);
    return response.data;
  },

  createCustomer: async (customerData: {
    name: string;
    company_name: string;
    email: string;
    health_score: number;
    risk_level: string;
    renewal_date: string;
    nps: number;
    domain: string;
    contract_start_date?: string;
    industry?: string;
    plan?: string;
  }): Promise<Customer> => {
    const response = await apiClient.post('/customer', customerData);
    return response.data;
  },

  // Uploads
  uploadFile: async (customerId: number, file: File): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append('customer_id', customerId.toString());
    formData.append('file', file);
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Agent execution triggering
  analyzeCustomer: async (customerId: number): Promise<{ success: boolean; task_id: string; status: string }> => {
    const response = await apiClient.post('/analyze', { customer_id: customerId });
    return response.data;
  },

  getTaskStatus: async (taskId: string): Promise<AgentExecutionTask> => {
    const response = await apiClient.get(`/task/${taskId}`);
    return response.data;
  },

  // Recommendations
  getRecommendation: async (id: number): Promise<Recommendation> => {
    const response = await apiClient.get(`/recommendation/${id}`);
    return response.data;
  },

  getRecommendations: async (): Promise<Recommendation[]> => {
    const response = await apiClient.get('/recommendations');
    return response.data;
  },

  submitDecision: async (
    id: number,
    status: 'approved' | 'rejected' | 'modified',
    userName: string = 'Customer Success Manager',
    reason?: string,
    modifiedAction?: string,
    modifiedPriority?: string,
    modifiedFollowUp?: string
  ) => {
    const response = await apiClient.post(`/recommendation/${id}/action`, {
      status,
      user_name: userName,
      reason,
      modified_action: modifiedAction,
      modified_priority: modifiedPriority,
      modified_follow_up: modifiedFollowUp,
    });
    return response.data;
  },

  // Analytics & Audits
  getAnalytics: async (): Promise<AnalyticsSummary> => {
    const response = await apiClient.get('/analytics');
    return response.data;
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
    const response = await apiClient.get('/audit-logs');
    return response.data;
  },

  getMemory: async (customerId: number): Promise<any[]> => {
    const response = await apiClient.get(`/memory/${customerId}`);
    return response.data;
  },
};
