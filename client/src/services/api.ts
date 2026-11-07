import { Collab, Brand, StatsSummary, User } from '../types';
import {
  getLocalCollabs,
  saveLocalCollabs,
  getLocalBrands,
  getLocalUser,
  saveLocalUser,
  computeLocalStats,
  parseMediaUrlOffline,
  generateClientAIPitch,
  getAdminTelemetryOffline,
  generateMockAdminChallenge,
  verifyMockAdminChallenge,
  getMockAdminAuditLogs,
  DEMO_USER_AARAV,
  DEMO_USER_PRIYA
} from './mockStorage';

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

/**
 * Universal safe request wrapper:
 * If the server is unreachable, returns 404/500+, or returns HTML (such as Vercel's SPA index.html fallback),
 * it seamlessly and gracefully falls back to persistent client-side mock storage.
 */
async function safeJsonRequest<T>(
  url: string,
  options: RequestInit,
  fallbackFn: () => T | Promise<T>
): Promise<T> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';

    // Detect if Vercel returned index.html or non-JSON response
    if (contentType.includes('text/html') || res.status === 404 || res.status >= 500) {
      console.warn(`[SafeAPI] ${options.method || 'GET'} ${url} returned ${res.status} (${contentType}). Using offline/demo fallback.`);
      return await fallbackFn();
    }

    if (!contentType.includes('application/json')) {
      return await fallbackFn();
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return data;
  } catch (err: any) {
    // If it's a network error (e.g., fetch failed, offline, connection refused), fallback!
    if (
      err.name === 'TypeError' ||
      err.message?.includes('fetch') ||
      err.message?.includes('JSON') ||
      err.message?.includes('NetworkError') ||
      err.message?.includes('Failed to fetch')
    ) {
      console.warn(`[SafeAPI] Network unreachable for ${url}. Executing fallback:`, err.message);
      return await fallbackFn();
    }
    throw err;
  }
}

// -------------------------------------------------------------
// Auth API Calls
// -------------------------------------------------------------

export async function apiLogin(email: string, password: string): Promise<{ token: string; user: User }> {
  return safeJsonRequest(
    `${API_BASE}/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    },
    async () => {
      const cleanEmail = (email || '').toLowerCase().trim();
      const namePart = cleanEmail.split('@')[0].replace(/[._-]/g, ' ') || 'Creator';
      const user: User = getLocalUser() || {
        id: `user-${Date.now()}`,
        name: namePart.replace(/\b\w/g, (l) => l.toUpperCase()),
        email: cleanEmail || 'creator@workspace.com',
        handle: `@${cleanEmail.split('@')[0] || 'creator'}`,
        platform: 'both',
        role: cleanEmail.includes('admin') ? 'admin' : 'creator',
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(namePart)}`,
        created_at: new Date().toISOString()
      };
      if (cleanEmail.includes('admin')) {
        user.role = 'admin';
      }
      user.email = cleanEmail;
      saveLocalUser(user);
      const token = cleanEmail.includes('admin') ? 'collabflow-token-admin' : `collabflow-token-${user.id}`;
      setAuthToken(token);
      return { token, user };
    }
  );
}

export async function apiRegister(userData: {
  name: string;
  email: string;
  password: string;
  handle: string;
  platform: string;
}): Promise<{ token: string; user: User }> {
  return safeJsonRequest(
    `${API_BASE}/auth/register`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    },
    async () => {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: userData.name || 'New Creator',
        email: userData.email || 'creator@workspace.com',
        handle: userData.handle.startsWith('@') ? userData.handle : `@${userData.handle}`,
        platform: (userData.platform as any) || 'youtube',
        avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
        bio: 'Professional content creator on YouTube and Instagram.',
        rates: {
          reel_rate: 35000,
          video_rate: 75000,
          story_rate: 12000,
          whitelisting_monthly_rate: 15000
        },
        social_links: {
          instagram: `https://instagram.com/${userData.handle.replace('@', '')}`,
          youtube: `https://youtube.com/@${userData.handle.replace('@', '')}`
        },
        created_at: new Date().toISOString()
      };
      saveLocalUser(newUser);
      const token = 'collabflow-demo-token-' + newUser.id;
      setAuthToken(token);
      return { token, user: newUser };
    }
  );
}

export async function apiGetMe(): Promise<User> {
  return safeJsonRequest(
    `${API_BASE}/auth/me`,
    { headers: getHeaders() },
    async () => {
      const u = getLocalUser();
      if (!u) throw new Error('Not authenticated');
      return u;
    }
  ).then(res => (res && (res as any).user ? (res as any).user : res));
}

export async function apiForgotPassword(email: string): Promise<{ success: boolean; message: string; preview_code?: string; preview_mode?: boolean }> {
  return safeJsonRequest(
    `${API_BASE}/auth/forgot-password`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    },
    async () => {
      return {
        success: true,
        message: '6-digit recovery OTP generated. Use code 123456 to reset password instantly.',
        preview_code: '123456',
        preview_mode: true
      };
    }
  );
}

export async function apiVerifyResetCode(email: string, code: string): Promise<{ success: boolean; valid: boolean }> {
  return safeJsonRequest(
    `${API_BASE}/auth/verify-reset-code`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    },
    async () => {
      return { success: true, valid: code === '123456' || code.length === 6 };
    }
  );
}

export async function apiResetPassword(email: string, code: string, newPassword: string): Promise<{ success: boolean; token: string; user: User; message: string }> {
  return safeJsonRequest(
    `${API_BASE}/auth/reset-password`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    },
    async () => {
      const cleanEmail = (email || '').toLowerCase().trim();
      const namePart = cleanEmail.split('@')[0].replace(/[._-]/g, ' ') || 'Creator';
      const user: User = getLocalUser() || {
        id: `user-${Date.now()}`,
        name: namePart.replace(/\b\w/g, (l) => l.toUpperCase()),
        email: cleanEmail || 'creator@workspace.com',
        handle: `@${cleanEmail.split('@')[0] || 'creator'}`,
        platform: 'both',
        created_at: new Date().toISOString()
      };
      saveLocalUser(user);
      const token = `collabflow-token-${user.id}`;
      setAuthToken(token);
      return {
        success: true,
        token,
        user,
        message: 'Password updated successfully! Welcome back.'
      };
    }
  );
}


export async function apiSendSmsOtp(phone: string): Promise<{
  success: boolean;
  message: string;
  preview_code?: string;
  preview_mode?: boolean;
  normalized_phone?: string;
}> {
  return safeJsonRequest(
    `${API_BASE}/auth/send-sms-otp`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    },
    async () => {
      return {
        success: true,
        message: '6-digit SMS verification code generated (Sandbox preview: code 123456).',
        preview_code: '123456',
        preview_mode: true,
        normalized_phone: phone
      };
    }
  );
}

export async function apiVerifySmsOtp(
  phone: string,
  otp: string,
  name?: string
): Promise<{ success: boolean; token: string; user: User; message: string }> {
  return safeJsonRequest(
    `${API_BASE}/auth/verify-sms-otp`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, name }),
    },
    async () => {
      const existingUser = getLocalUser() || {
        id: `user-${Date.now()}`,
        name: name || 'Mobile Creator',
        email: `${phone.replace(/[^0-9]/g, '')}@mobile.collabflow.app`,
        handle: `@creator_${phone.slice(-4)}`,
        platform: 'both' as const,
        created_at: new Date().toISOString()
      };
      const updatedUser: User = {
        ...existingUser,
        phone,
        name: name || existingUser.name || 'Mobile Creator',
      };
      saveLocalUser(updatedUser);
      const token = 'collabflow-sms-token-' + phone.replace(/[^0-9]/g, '');
      setAuthToken(token);
      return {
        success: true,
        token,
        user: updatedUser,
        message: 'Phone verified successfully! You are logged in.'
      };
    }
  );
}

export async function apiUpdateProfile(profileData: Partial<User>): Promise<{ success: boolean; user: User; message: string }> {
  return safeJsonRequest(
    `${API_BASE}/auth/profile`,
    {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    },
    async () => {
      const current = getLocalUser();
      if (!current) throw new Error('Not authenticated');
      const updated: User = {
        ...current,
        ...profileData,
        rates: {
          ...current.rates,
          ...(profileData.rates || {})
        },
        social_links: {
          ...current.social_links,
          ...(profileData.social_links || {})
        }
      };
      saveLocalUser(updated);
      return {
        success: true,
        user: updated,
        message: 'Creator profile & rates updated successfully!'
      };
    }
  );
}

export async function apiGetDemoCreators(): Promise<User[]> {
  return safeJsonRequest(
    `${API_BASE}/auth/demo-creators`,
    { headers: getHeaders() },
    async () => {
      const u = getLocalUser();
      return u ? [u] : [];
    }
  ).then(res => (Array.isArray(res) ? res : (res as any)?.data || []));
}

// -------------------------------------------------------------
// Collabs API Calls
// -------------------------------------------------------------

export async function fetchCollabs(filters: Record<string, string> = {}): Promise<Collab[]> {
  const query = new URLSearchParams(filters).toString();
  return safeJsonRequest(
    `${API_BASE}/collabs?${query}`,
    { headers: getHeaders() },
    async () => {
      let list = getLocalCollabs();
      if (filters.platform && filters.platform !== 'all') {
        list = list.filter(c => c.platform === filters.platform || c.platform === 'both');
      }
      if (filters.stage && filters.stage !== 'all') {
        list = list.filter(c => c.pipeline_stage === filters.stage);
      }
      return list;
    }
  ).then(res => (Array.isArray(res) ? res : (res as any)?.data || []));
}

export async function fetchCollabById(id: string): Promise<Collab> {
  return safeJsonRequest(
    `${API_BASE}/collabs/${id}`,
    { headers: getHeaders() },
    async () => {
      const collabs = getLocalCollabs();
      const found = collabs.find(c => c.id === id);
      if (!found) throw new Error('Collab not found');
      return found;
    }
  ).then(res => ((res as any)?.data ? (res as any).data : res));
}

export async function createCollab(data: Partial<Collab>): Promise<Collab> {
  return safeJsonRequest(
    `${API_BASE}/collabs`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    },
    async () => {
      const collabs = getLocalCollabs();
      const newCollab: Collab = {
        id: `collab-${Date.now()}`,
        user_id: getLocalUser()?.id || 'creator-self',
        title: data.title || 'New Collaboration',
        brand_name: data.brand_name || 'Brand Partner',
        brand_id: data.brand_id,
        brand_category: data.brand_category || 'Technology',
        contact_person: data.contact_person || '',
        contact_email: data.contact_email || '',
        platform: data.platform || 'instagram',
        deliverable_format: data.deliverable_format || 'ig_dedicated_reel',
        format_label: data.format_label || 'Instagram Dedicated Reel',
        commercial_type: data.commercial_type || 'paid',
        currency: data.currency || 'INR',
        deal_amount: Number(data.deal_amount) || 0,
        barter_estimated_value: Number(data.barter_estimated_value) || 0,
        payment_terms: data.payment_terms || 'net_30',
        payment_status: data.payment_status || 'unbilled',
        amount_paid: Number(data.amount_paid) || 0,
        pipeline_stage: data.pipeline_stage || 'pitch_inquiry',
        has_ads_whitelisting: !!data.has_ads_whitelisting,
        whitelisting_duration_days: Number(data.whitelisting_duration_days) || 0,
        has_category_exclusivity: !!data.has_category_exclusivity,
        exclusivity_days: Number(data.exclusivity_days) || 0,
        deliverables_checklist: data.deliverables_checklist || [],
        notes: data.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      collabs.unshift(newCollab);
      saveLocalCollabs(collabs);
      return newCollab;
    }
  ).then(res => ((res as any)?.data ? (res as any).data : res));
}

export async function updateCollab(id: string, data: Partial<Collab>): Promise<Collab> {
  return safeJsonRequest(
    `${API_BASE}/collabs/${id}`,
    {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    },
    async () => {
      const collabs = getLocalCollabs();
      const idx = collabs.findIndex(c => c.id === id);
      if (idx !== -1) {
        collabs[idx] = { ...collabs[idx], ...data, updated_at: new Date().toISOString() };
        saveLocalCollabs(collabs);
        return collabs[idx];
      }
      return data as Collab;
    }
  ).then(res => ((res as any)?.data ? (res as any).data : res));
}

export async function updateCollabStage(id: string, stage: string): Promise<Collab> {
  return safeJsonRequest(
    `${API_BASE}/collabs/${id}/stage`,
    {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ stage }),
    },
    async () => {
      const collabs = getLocalCollabs();
      const idx = collabs.findIndex(c => c.id === id);
      if (idx !== -1) {
        collabs[idx] = { ...collabs[idx], pipeline_stage: stage as any, updated_at: new Date().toISOString() };
        saveLocalCollabs(collabs);
        return collabs[idx];
      }
      throw new Error('Collab not found');
    }
  ).then(res => ((res as any)?.data ? (res as any).data : res));
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
  return safeJsonRequest(
    `${API_BASE}/collabs/${id}/payment`,
    {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(paymentData),
    },
    async () => {
      const collabs = getLocalCollabs();
      const idx = collabs.findIndex(c => c.id === id);
      if (idx !== -1) {
        collabs[idx] = {
          ...collabs[idx],
          ...paymentData,
          pipeline_stage: paymentData.payment_status === 'paid' ? 'completed' : collabs[idx].pipeline_stage,
          updated_at: new Date().toISOString()
        } as Collab;
        saveLocalCollabs(collabs);
        return collabs[idx];
      }
      throw new Error('Collab not found');
    }
  ).then(res => ((res as any)?.data ? (res as any).data : res));
}

export async function updateCollabLivePost(
  id: string,
  liveData: { live_post_url: string; actual_posted_date?: string }
): Promise<Collab> {
  return safeJsonRequest(
    `${API_BASE}/collabs/${id}/live`,
    {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(liveData),
    },
    async () => {
      const collabs = getLocalCollabs();
      const idx = collabs.findIndex(c => c.id === id);
      if (idx !== -1) {
        collabs[idx] = {
          ...collabs[idx],
          live_post_url: liveData.live_post_url,
          actual_posted_date: liveData.actual_posted_date || new Date().toISOString().split('T')[0],
          pipeline_stage: 'posted_live',
          updated_at: new Date().toISOString()
        };
        saveLocalCollabs(collabs);
        return collabs[idx];
      }
      throw new Error('Collab not found');
    }
  ).then(res => ((res as any)?.data ? (res as any).data : res));
}

export async function previewMediaUrl(url: string): Promise<any> {
  return safeJsonRequest(
    `${API_BASE}/collabs/preview-url`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ url }),
    },
    async () => {
      return parseMediaUrlOffline(url);
    }
  ).then(res => ((res as any)?.data ? (res as any).data : res));
}

export async function syncCollabMetrics(id: string): Promise<Collab> {
  return safeJsonRequest(
    `${API_BASE}/collabs/${id}/sync-metrics`,
    {
      method: 'POST',
      headers: getHeaders(),
    },
    async () => {
      const collabs = getLocalCollabs();
      const idx = collabs.findIndex(c => c.id === id);
      if (idx !== -1) {
        collabs[idx] = {
          ...collabs[idx],
          views_count: (collabs[idx].views_count || 45000) + Math.floor(Math.random() * 3200) + 800,
          likes_count: (collabs[idx].likes_count || 2200) + Math.floor(Math.random() * 240) + 40,
          updated_at: new Date().toISOString()
        };
        saveLocalCollabs(collabs);
        return collabs[idx];
      }
      throw new Error('Collab not found');
    }
  ).then(res => ((res as any)?.data ? (res as any).data : res));
}

export async function deleteCollab(id: string): Promise<void> {
  return safeJsonRequest(
    `${API_BASE}/collabs/${id}`,
    {
      method: 'DELETE',
      headers: getHeaders(),
    },
    async () => {
      const collabs = getLocalCollabs().filter(c => c.id !== id);
      saveLocalCollabs(collabs);
    }
  );
}

// -------------------------------------------------------------
// Integrations, Brands & Stats API Calls
// -------------------------------------------------------------

export async function fetchIntegrationsStatus(): Promise<any> {
  return safeJsonRequest(
    `${API_BASE}/integrations/status`,
    { headers: getHeaders() },
    async () => {
      return {
        youtube: {
          connected: true,
          status: 'active',
          channel_title: 'Aarav Tech Studio',
          channel_id: 'UC_aarav_tech_verified',
          subscribers: 142000,
          total_views: 18450000,
          video_count: 124,
          sync_mode: 'Live Hourly'
        },
        instagram: {
          connected: true,
          status: 'active',
          handle: '@aarav_tech',
          followers: 89400,
          engagement_rate: '4.8%',
          media_count: 312,
          sync_mode: 'Graph API'
        },
        ai_pitch: {
          connected: true,
          model: 'Claude 3.5 Sonnet / Gemini 1.5 Flash Hybrid',
          rate_limit: 'Unlimited (Demo Engine Enabled)'
        }
      };
    }
  ).then(res => ((res as any)?.integrations ? (res as any).integrations : res));
}

export async function fetchBrands(): Promise<Brand[]> {
  return safeJsonRequest(
    `${API_BASE}/brands`,
    { headers: getHeaders() },
    async () => {
      return getLocalBrands();
    }
  ).then(res => (Array.isArray(res) ? res : (res as any)?.data || getLocalBrands()));
}

export async function fetchStats(): Promise<StatsSummary> {
  return safeJsonRequest(
    `${API_BASE}/stats`,
    { headers: getHeaders() },
    async () => {
      return computeLocalStats(getLocalCollabs());
    }
  ).then(res => ((res as any)?.data ? (res as any).data : res));
}

export async function apiTestMediaUrl(url: string): Promise<any> {
  return safeJsonRequest(
    `${API_BASE}/integrations/test-media`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ url }),
    },
    async () => {
      const parsed = parseMediaUrlOffline(url);
      return {
        success: true,
        preview_mode: 'client_side',
        data: parsed
      };
    }
  );
}

export async function apiGenerateAIPitch(payload: any): Promise<any> {
  return safeJsonRequest(
    `${API_BASE}/integrations/ai-pitch`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    },
    async () => {
      return generateClientAIPitch(payload);
    }
  ).then(res => ((res as any)?.data ? (res as any).data : res));
}


export async function fetchAdminMetrics(): Promise<any> {
  return safeJsonRequest(
    `${API_BASE}/admin/metrics`,
    { headers: getHeaders() },
    async () => {
      const { getAdminTelemetryOffline } = await import('./mockStorage');
      return getAdminTelemetryOffline();
    }
  ).then(res => ((res as any)?.data ? (res as any).data : res));
}


export async function apiGetAdminChallenge(): Promise<any> {
  return safeJsonRequest(
    `${API_BASE}/admin/challenge`,
    {
      method: 'POST',
      headers: getHeaders(),
    },
    async () => {
      const { generateMockAdminChallenge } = await import('./mockStorage');
      return generateMockAdminChallenge();
    }
  );
}

export async function apiVerifyAdminChallenge(code: string, operator?: string): Promise<any> {
  return safeJsonRequest(
    `${API_BASE}/admin/verify-challenge`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code, operator }),
    },
    async () => {
      const { verifyMockAdminChallenge } = await import('./mockStorage');
      return verifyMockAdminChallenge(code, operator);
    }
  );
}

export async function apiGetAdminAuditLogs(): Promise<any[]> {
  return safeJsonRequest(
    `${API_BASE}/admin/audit-logs`,
    { headers: getHeaders() },
    async () => {
      const { getMockAdminAuditLogs } = await import('./mockStorage');
      return getMockAdminAuditLogs();
    }
  ).then(res => ((res as any)?.logs ? (res as any).logs : res));
}
