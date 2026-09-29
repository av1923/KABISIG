import { BarangayTenant, ResolutionRecord, SystemAuditLog, YouthProfile } from '../types';
import { NAGA_BARANGAYS } from '../data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function toResolutionRecord(poll: any): ResolutionRecord {
  const numberLine = String(poll.description || '').split('\n').find(line => line.startsWith('Resolution Number: '));
  const votes = poll.vote_counts || {};
  return {
    id: poll.id,
    resolutionNumber: numberLine?.replace('Resolution Number: ', '') || `POLL-${String(poll.id).slice(0, 8)}`,
    title: poll.question,
    content: poll.description || '',
    status: poll.is_active ? 'Voting Open' : 'Archived',
    validityPeriod: `${String(poll.start_date).slice(0, 10)} - ${String(poll.end_date).slice(0, 10)}`,
    votesSupport: Number(votes.support) || 0,
    votesOppose: Number(votes.oppose) || 0,
    votesAbstain: 0,
    votedUsers: Array.isArray(poll.voted_users) ? poll.voted_users : [],
    dateCreated: poll.created_at || poll.start_date,
  };
}

class KabisigApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('kabisig_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('kabisig_token', token);
      } else {
        localStorage.removeItem('kabisig_token');
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('kabisig_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; message?: string; error?: any }> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const json = await response.json();
      if (!response.ok) {
        return {
          success: false,
          message: json.message || `Request failed with status ${response.status}`,
          error: json.error || json.details || null,
        };
      }

      return {
        success: true,
        data: json.data as T,
        message: json.message,
      };
    } catch (err: any) {
      console.warn(`API call failed for ${endpoint}:`, err.message);
      const isConnectionFailed = err?.name === 'TypeError' || err?.message === 'Failed to fetch';
      return {
        success: false,
        message: isConnectionFailed
          ? 'Backend server is unreachable (Failed to fetch). Please ensure the backend server is running on http://localhost:5000.'
          : (err.message || 'Network connection failed'),
        error: err,
      };
    }
  }

  // --- BARANGAY REGISTRY (27 Naga City Barangays) ---
  async getBarangays(): Promise<BarangayTenant[]> {
    const res = await this.request<BarangayTenant[]>('/barangays', { method: 'GET' });
    if (res.success && res.data && res.data.length > 0) {
      return res.data;
    }
    return [...NAGA_BARANGAYS];
  }

  async getBarangay(id: string): Promise<BarangayTenant | null> {
    const res = await this.request<BarangayTenant>(`/barangays/${id}`, { method: 'GET' });
    if (res.success && res.data) {
      return res.data;
    }
    return NAGA_BARANGAYS.find(b => b.id === id) || null;
  }

  async updateBarangaySettings(id: string, settings: Partial<BarangayTenant>): Promise<{ success: boolean; message?: string; error?: any }> {
    const res = await this.request(`/barangays/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
    return { success: res.success, message: res.message, error: res.error };
  }

  async assignChairperson(id: string, data: { full_name: string; email: string; phone?: string }): Promise<{ success: boolean; message?: string; error?: any }> {
    const res = await this.request(`/barangays/${id}/assign-chairperson`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { success: res.success, message: res.message, error: res.error };
  }

  async assignChairpersonByEmail(barangayId: string, email: string): Promise<{ success: boolean; data?: any; message?: string; error?: any }> {
    return await this.request('/admin/assign-chairperson', {
      method: 'POST',
      body: JSON.stringify({ barangay_id: barangayId, email }),
    });
  }

  async completeProfile(data: {
    full_name: string;
    phone?: string;
    birthdate: string;
    sex: string;
    address: string;
    password?: string;
    confirmPassword?: string;
  }): Promise<{ success: boolean; data?: any; message?: string; error?: any }> {
    return await this.request('/users/complete-profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async saveBarangayConfiguration(id: string, data: {
    chairperson?: string;
    chairpersonEmail?: string;
    contact?: string;
    youthPopulation?: number;
    allocatedBudget?: number;
    totalBudget?: number;
    status?: 'Active' | 'Inactive';
    logo?: string;
  }): Promise<{ success: boolean; data?: any; message?: string; error?: any }> {
    return await this.request(`/barangays/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // --- AUTHENTICATION & MULTI-TENANCY ---
  async login(email: string, password: string): Promise<{ success: boolean; token?: string; user?: any; message?: string }> {
    const res = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data?.token) {
      this.setToken(res.data.token);
      return { success: true, token: res.data.token, user: res.data.user, message: res.message };
    }
    return { success: false, message: res.message };
  }

  async checkChairpersonInvite(email: string): Promise<{ success: boolean; data?: any; message?: string }> {
    return await this.request(`/auth/check-chairperson-invite?email=${encodeURIComponent(email)}`, {
      method: 'GET',
    });
  }

  async setupChairpersonPassword(data: {
    email: string;
    password: string;
    confirmPassword: string;
    full_name?: string;
  }): Promise<{ success: boolean; token?: string; user?: any; message?: string }> {
    const res = await this.request<{ token: string; user: any }>('/auth/setup-chairperson-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.success && res.data?.token) {
      this.setToken(res.data.token);
      return { success: true, token: res.data.token, user: res.data.user, message: res.message };
    }
    return { success: false, message: res.message || 'Password setup failed' };
  }

  async registerYouth(payload: {
    email: string;
    password?: string;
    full_name: string;
    barangay_id: string;
    phone?: string;
    birthdate: string;
    sex: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
    address: string;
    educational_status?: string;
    employment_status?: string;
    is_registered_voter?: boolean;
  }): Promise<{ success: boolean; data?: any; message?: string; error?: any }> {
    const body = {
      password: payload.password || 'KabisigYouth2026!',
      ...payload,
    };
    return await this.request('/auth/register-youth', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async registerOfficial(payload: {
    email: string;
    password?: string;
    full_name: string;
    barangay_id: string;
    role: string;
    phone?: string;
  }): Promise<{ success: boolean; data?: any; message?: string; error?: any }> {
    const body = {
      password: payload.password || 'KabisigOfficial2026!',
      ...payload,
    };
    return await this.request('/auth/register-official', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async approveUser(userId: string): Promise<{ success: boolean; data?: any; message?: string }> {
    return await this.request('/auth/approve-user', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async rejectUser(userId: string, reason: string): Promise<{ success: boolean; data?: any; message?: string }> {
    return await this.request('/auth/reject-user', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, reason }),
    });
  }

  async getCurrentUser(): Promise<any> {
    const res = await this.request('/auth/me', { method: 'GET' });
    return res.success ? res.data : null;
  }

  logout() {
    this.request('/auth/logout', { method: 'POST' }).catch(() => {});
    this.setToken(null);
  }

  // --- PROGRAMS ---
  async getPrograms(tenantId?: string): Promise<any[]> {
    const url = tenantId ? `/programs?tenant_id=${tenantId}` : '/programs';
    const res = await this.request<any[]>(url, { method: 'GET' });
    return res.success && res.data ? res.data : [];
  }

  async createProgram(programData: any): Promise<{ success: boolean; data?: any; message?: string }> {
    return await this.request('/programs', {
      method: 'POST',
      body: JSON.stringify(programData),
    });
  }

  async registerForProgram(programId: string): Promise<{ success: boolean; data?: any; message?: string }> {
    return await this.request(`/programs/${encodeURIComponent(programId)}/register`, {
      method: 'POST',
    });
  }

  async getMyProgramRegistrations(): Promise<any[] | null> {
    const res = await this.request<any[]>('/programs/registrations/mine', { method: 'GET' });
    return res.success && Array.isArray(res.data) ? res.data : null;
  }

  async getPolls(): Promise<ResolutionRecord[] | null> {
    const res = await this.request<any[]>('/polls', { method: 'GET' });
    return res.success && Array.isArray(res.data) ? res.data.map(toResolutionRecord) : null;
  }

  async createPoll(payload: {
    question: string;
    description: string;
    options: string[];
    start_date: string;
    end_date: string;
  }): Promise<{ success: boolean; data?: ResolutionRecord; message?: string }> {
    const res = await this.request<any>('/polls', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      success: res.success,
      data: res.success && res.data ? toResolutionRecord(res.data) : undefined,
      message: res.message,
    };
  }

  async voteOnPoll(pollId: string, voteChoice: 'Support' | 'Oppose'): Promise<{ success: boolean; data?: ResolutionRecord; message?: string }> {
    const res = await this.request<any>(`/polls/${encodeURIComponent(pollId)}/vote`, {
      method: 'POST',
      body: JSON.stringify({ vote_choice: voteChoice }),
    });
    return {
      success: res.success,
      data: res.success && res.data ? toResolutionRecord(res.data) : undefined,
      message: res.message,
    };
  }

  async recordProgramAttendance(programId: string, qrPayload: string): Promise<{ success: boolean; data?: any; message?: string }> {
    return await this.request(`/programs/${encodeURIComponent(programId)}/attendance`, {
      method: 'POST',
      body: JSON.stringify({ qr_payload: qrPayload }),
    });
  }

  async getProgramAttendance(programId: string): Promise<any[] | null> {
    const res = await this.request<any[]>(`/programs/${encodeURIComponent(programId)}/attendance`, { method: 'GET' });
    return res.success && Array.isArray(res.data) ? res.data : null;
  }

  async updateProgram(id: string, programData: any): Promise<{ success: boolean; data?: any; message?: string }> {
    return await this.request(`/programs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(programData),
    });
  }

  // --- DOCUMENTS ---
  async getDocuments(tenantId?: string): Promise<any[]> {
    const url = tenantId ? `/documents?tenant_id=${tenantId}` : '/documents';
    const res = await this.request<any[]>(url, { method: 'GET' });
    return res.success && res.data ? res.data : [];
  }

  async persistComplianceIssue(payload: {
    report_type: string;
    fiscal_year: number;
    status?: 'pending' | 'submitted' | 'approved' | 'rejected' | 'overdue';
    notes?: string;
  }): Promise<{ success: boolean; data?: any; message?: string }> {
    return await this.request('/analytics/compliance', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async persistBudgetAlert(payload: {
    alert_code: string;
    level: 'Critical' | 'Warning' | 'Info';
    message: string;
    link?: string;
  }): Promise<{ success: boolean; data?: any; message?: string }> {
    return await this.request('/analytics/budget-alerts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getDocumentDownloadUrl(id: string): Promise<{ success: boolean; data?: { url: string; expires_in: number }; message?: string }> {
    return await this.request(`/documents/${encodeURIComponent(id)}/download`, { method: 'GET' });
  }

  async uploadDocument(payload: {
    title: string;
    document_type: string;
    file: File;
  }): Promise<{ success: boolean; data?: any; message?: string; error?: any }> {
    const bytes = new Uint8Array(await payload.file.arrayBuffer());
    let binary = '';
    const chunkSize = 0x8000;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
    }

    return await this.request('/documents/upload', {
      method: 'POST',
      body: JSON.stringify({
        title: payload.title,
        document_type: payload.document_type,
        file_name: payload.file.name,
        content_type: payload.file.type || 'application/octet-stream',
        file_base64: btoa(binary),
      }),
    });
  }

  async approveDocument(id: string, feedback?: string): Promise<{ success: boolean; data?: any; message?: string }> {
    return await this.request(`/documents/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ feedback }),
    });
  }

  async rejectDocument(id: string, feedback: string): Promise<{ success: boolean; data?: any; message?: string }> {
    return await this.request(`/documents/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ feedback }),
    });
  }

  // --- BUDGET & EXPENSES ---
  async getBudgets(tenantId?: string, fiscalYear = new Date().getFullYear()): Promise<any[]> {
    const params = new URLSearchParams({ fiscal_year: String(fiscalYear) });
    if (tenantId) params.set('tenant_id', tenantId);
    const url = `/budget?${params.toString()}`;
    const res = await this.request<any>(url, { method: 'GET' });
    if (res.success && res.data) {
      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.data.budgets)) return res.data.budgets;
      if (res.data.allocations && Array.isArray(res.data.allocations)) return res.data.allocations;
      return [res.data];
    }
    return [];
  }

  async getExpenses(tenantId?: string): Promise<any[]> {
    const url = tenantId ? `/budget/expenses?tenant_id=${tenantId}` : '/budget/expenses';
    const res = await this.request<any[]>(url, { method: 'GET' });
    return res.success && res.data ? res.data : [];
  }

  async recordExpense(payload: {
    budget_id: string;
    program_id?: string;
    title: string;
    description?: string;
    gross_amount: number;
    tax_type: 'VAT' | 'NON_VAT' | 'EXEMPT';
    tax_rate?: number;
    receipt_url?: string;
    expense_date?: string;
  }): Promise<{ success: boolean; data?: any; message?: string; error?: any }> {
    return await this.request('/budget/expense', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- ANALYTICS ---
  async getBarangayAnalytics(tenantId?: string): Promise<any | null> {
    const url = tenantId ? `/analytics/barangay?tenant_id=${tenantId}` : '/analytics/barangay';
    const res = await this.request<any>(url, { method: 'GET' });
    return res.success && res.data ? res.data : null;
  }

  async getFederationAnalytics(): Promise<any | null> {
    const res = await this.request<any>('/analytics/federation', { method: 'GET' });
    return res.success && res.data ? res.data : null;
  }

  async getAuditLogs(limit = 200): Promise<SystemAuditLog[] | null> {
    const res = await this.request<SystemAuditLog[]>(`/admin/audit-logs?limit=${limit}`, { method: 'GET' });
    return res.success && Array.isArray(res.data) ? res.data : null;
  }

  // --- FEEDBACK ---
  async getFeedback(tenantId?: string): Promise<any[]> {
    const url = tenantId ? `/feedback?tenant_id=${tenantId}` : '/feedback';
    const res = await this.request<any>(url, { method: 'GET' });
    if (!res.success || !res.data) return [];
    if (Array.isArray(res.data)) return res.data;
    return Array.isArray(res.data.feedbacks) ? res.data.feedbacks : [];
  }

  async submitFeedback(data: any): Promise<{ success: boolean; data?: any; message?: string }> {
    return await this.request('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async respondToFeedback(
    id: string,
    response: string,
    status: 'under_review' | 'resolved' | 'dismissed' = 'resolved'
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    return await this.request(`/feedback/${encodeURIComponent(id)}/respond`, {
      method: 'PATCH',
      body: JSON.stringify({ response, status }),
    });
  }

  // --- USER & RESIDENT PROFILES (DATABASE PERSISTENCE) ---
  async updateProfile(profile: Partial<YouthProfile>): Promise<{ success: boolean; data?: any; message?: string; error?: any }> {
    return await this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  async getProfile(): Promise<{ success: boolean; data?: YouthProfile; message?: string }> {
    return await this.request<YouthProfile>('/users/profile', { method: 'GET' });
  }

  async getYouthProfiles(tenantId?: string, includeOfficials = false): Promise<YouthProfile[]> {
    const params = new URLSearchParams();
    if (tenantId) params.set('tenant_id', tenantId);
    if (includeOfficials) params.set('include_officials', 'true');
    const query = params.toString();
    const url = query ? `/users/youth-profiles?${query}` : '/users/youth-profiles';
    const res = await this.request<YouthProfile[]>(url, { method: 'GET' });
    return res.success && res.data ? res.data : [];
  }
}

export const kabisigApi = new KabisigApiClient();
export default kabisigApi;
