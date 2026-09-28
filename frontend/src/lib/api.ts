import { BarangayTenant, YouthProfile } from '../types';
import { NAGA_BARANGAYS } from '../data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

  async uploadDocument(payload: {
    title: string;
    document_type: string;
    file_url: string;
    status?: string;
  }): Promise<{ success: boolean; data?: any; message?: string; error?: any }> {
    return await this.request('/documents', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async approveDocument(id: string): Promise<{ success: boolean; data?: any; message?: string }> {
    return await this.request(`/documents/${id}/approve`, {
      method: 'PUT',
    });
  }

  // --- BUDGET & EXPENSES ---
  async getBudgets(tenantId?: string): Promise<any[]> {
    const url = tenantId ? `/budget?tenant_id=${tenantId}` : '/budget';
    const res = await this.request<any>(url, { method: 'GET' });
    if (res.success && res.data) {
      if (Array.isArray(res.data)) return res.data;
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

  // --- FEEDBACK ---
  async getFeedback(tenantId?: string): Promise<any[]> {
    const url = tenantId ? `/feedback?tenant_id=${tenantId}` : '/feedback';
    const res = await this.request<any[]>(url, { method: 'GET' });
    return res.success && res.data ? res.data : [];
  }

  async submitFeedback(data: any): Promise<{ success: boolean; data?: any; message?: string }> {
    return await this.request('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
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

  async getYouthProfiles(tenantId?: string): Promise<YouthProfile[]> {
    const url = tenantId ? `/users/youth-profiles?tenant_id=${tenantId}` : '/users/youth-profiles';
    const res = await this.request<YouthProfile[]>(url, { method: 'GET' });
    return res.success && res.data ? res.data : [];
  }
}

export const kabisigApi = new KabisigApiClient();
export default kabisigApi;
