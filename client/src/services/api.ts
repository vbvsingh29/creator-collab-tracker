import { Collab, Brand, StatsSummary, User } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

// Retrieve auth token from localStorage
export function getAuthToken(): string | null {
  return localStorage.getItem('collabflow_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('collabflow_token', token);
  } else {
    localStorage.removeItem('collabflow_token');
  }
}

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Auth API Calls
export async function apiLogin(email: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to log in');
  return data;
}

export async function apiRegister(userData: {
  name: string;
  email: string;
  password: string;
  handle: string;
  platform: string;
}): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create account');
  return data;
}

export async function apiGetMe(): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch current user profile');
  return data.user;
}


export async function apiForgotPassword(email: string): Promise<{ success: boolean; message: string; preview_code?: string; preview_mode?: boolean }> {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to request password reset');
  return data;
}

export async function apiVerifyResetCode(email: string, code: string): Promise<{ success: boolean; valid: boolean }> {
  const res = await fetch(`${API_BASE}/auth/verify-reset-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Invalid reset code');
  return data;
}

export async function apiResetPassword(email: string, code: string, newPassword: string): Promise<{ success: boolean; token: string; user: User; message: string }> {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reset password');
  return data;
}

export async function apiGetDemoCreators(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/auth/demo-creators`);
  const data = await res.json();
  if (!res.ok) throw new Error('Failed to load demo creators');
  return data.data;
}

// Collabs API Calls
export async function fetchCollabs(filters: Record<string, string> = {}): Promise<Collab[]> {
  const query = new URLSearchParams(filters).toString();
  const res = await fetch(`${API_BASE}/collabs?${query}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch collaborations');
  const json = await res.json();
  return json.data;
}

export async function fetchCollabById(id: string): Promise<Collab> {
  const res = await fetch(`${API_BASE}/collabs/${id}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch collaboration');
  const json = await res.json();
  return json.data;
}

export async function createCollab(data: Partial<Collab>): Promise<Collab> {
  const res = await fetch(`${API_BASE}/collabs`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create collaboration');
  const json = await res.json();
  return json.data;
}

export async function updateCollab(id: string, data: Partial<Collab>): Promise<Collab> {
  const res = await fetch(`${API_BASE}/collabs/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update collaboration');
  const json = await res.json();
  return json.data;
}

export async function updateCollabStage(id: string, stage: string): Promise<Collab> {
  const res = await fetch(`${API_BASE}/collabs/${id}/stage`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ stage }),
  });
  if (!res.ok) throw new Error('Failed to update collaboration stage');
  const json = await res.json();
  return json.data;
}

export async function updateCollabPayment(
  id: string,
  paymentData: {
    payment_status: string;
    amount_paid?: number;
    payment_received_date?: string;
    invoice_number?: string;
  }
): Promise<Collab> {
  const res = await fetch(`${API_BASE}/collabs/${id}/payment`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(paymentData),
  });
  if (!res.ok) throw new Error('Failed to update payment status');
  const json = await res.json();
  return json.data;
}

export async function updateCollabLivePost(
  id: string,
  liveData: { live_post_url: string; actual_posted_date?: string }
): Promise<Collab> {
  const res = await fetch(`${API_BASE}/collabs/${id}/live`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(liveData),
  });
  if (!res.ok) throw new Error('Failed to mark post live');
  const json = await res.json();
  return json.data;
}

export async function previewMediaUrl(url: string): Promise<any> {
  const res = await fetch(`${API_BASE}/collabs/preview-url`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to preview media link');
  }
  const json = await res.json();
  return json.data;
}

export async function syncCollabMetrics(id: string): Promise<Collab> {
  const res = await fetch(`${API_BASE}/collabs/${id}/sync-metrics`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to sync metrics');
  }
  const json = await res.json();
  return json.data;
}

export async function deleteCollab(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/collabs/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete collaboration');
}

export async function fetchIntegrationsStatus(): Promise<any> {
  const res = await fetch(`${API_BASE}/integrations/status`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch integrations status');
  const json = await res.json();
  return json.integrations;
}

export async function fetchBrands(): Promise<Brand[]> {
  const res = await fetch(`${API_BASE}/brands`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch brands');
  const json = await res.json();
  return json.data;
}

export async function fetchStats(): Promise<StatsSummary> {
  const res = await fetch(`${API_BASE}/stats`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch statistics');
  const json = await res.json();
  return json.data;
}
