const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const ADMIN_CACHE_PREFIX = 'admin';

// Token management
const getToken = () => localStorage.getItem('token');
const setToken = (token: string) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

function redirectToLoginIfUnauthorized(status: number) {
  if (status !== 401) return;
  removeToken();
  const returnPath = `${window.location.pathname}${window.location.search}`;
  const params = new URLSearchParams();
  params.set('session', 'expired');
  if (returnPath && returnPath !== '/admin') {
    params.set('return', returnPath);
  }
  window.location.href = `/admin?${params.toString()}`;
}

import {
  createCacheKey,
  invalidateCache,
  invalidateCachePrefix,
  loadFromCacheWithBackgroundRefresh,
  writeCache,
} from './cache';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(
      response.ok
        ? 'Server returned invalid JSON'
        : `API error ${response.status}: server did not return JSON`
    );
  }

  if (!response.ok) {
    redirectToLoginIfUnauthorized(response.status);
    throw new Error(data?.message || 'API request failed');
  }

  return data as T;
}

// Public API calls (no authentication required)
async function publicApiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data as T;
}

const buildAdminCacheKey = (scope: string, params?: Record<string, unknown>) =>
  createCacheKey(`${ADMIN_CACHE_PREFIX}:${scope}`, params);

const invalidateAdminData = () => {
  invalidateCachePrefix(`${ADMIN_CACHE_PREFIX}:projects`);
  invalidateCachePrefix(`${ADMIN_CACHE_PREFIX}:dashboard`);
  invalidateCachePrefix(`${ADMIN_CACHE_PREFIX}:activity`);
  invalidateCachePrefix(`${ADMIN_CACHE_PREFIX}:settings`);
  invalidateCachePrefix(`${ADMIN_CACHE_PREFIX}:user`);
};

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const data = await apiCall<{ success: boolean; data: { token: string; user: any } }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    if (data.success && data.data.token) {
      setToken(data.data.token);
    }
    return data;
  },

  forgotPassword: async (email: string) => {
    return apiCall<{ success: boolean; message?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    return apiCall<{ success: boolean; message?: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    });
  },

  getMe: async () => {
    return apiCall<{ success: boolean; data: any }>('/auth/me');
  },

  getMeCached: async (onUpdate?: (value: { success: boolean; data: any }) => void) => {
    return loadFromCacheWithBackgroundRefresh({
      key: buildAdminCacheKey('user:me'),
      fetcher: () => authApi.getMe(),
      onUpdate,
    });
  },

  updateMe: async (payload: { firstName?: string; lastName?: string; email?: string; currentPassword?: string; newPassword?: string; role?: string }) => {
    const response = await apiCall<{ success: boolean; data: any; message?: string }>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    if (response.success && response.data) {
      writeCache(buildAdminCacheKey('user:me'), { success: true, data: response.data });
    }

    invalidateCache(buildAdminCacheKey('settings:profile'));

    return response;
  },

  logout: () => {
    removeToken();
    // Clear any sensitive data from session storage
    sessionStorage.clear();
    invalidateAdminData();
    // Replace history to prevent back button from returning to protected pages
    window.history.replaceState(null, '', '/');
  },
};

// Projects API
export const projectsApi = {
  getAll: async (params?: { status?: string; category?: string; search?: string }) => {
    // Filter out undefined values before building query string
    const filteredParams = Object.fromEntries(
      Object.entries(params || {}).filter(([_, value]) => value !== undefined && value !== null && value !== '')
    );
    const queryString = new URLSearchParams(filteredParams).toString();
    const endpoint = queryString ? `/projects?${queryString}` : '/projects';
    return apiCall<{ success: boolean; data: any[] }>(endpoint);
  },

  getAllCached: async (
    params?: { status?: string; category?: string; search?: string },
    onUpdate?: (value: { success: boolean; data: any[] }) => void
  ) => {
    const cacheKey = buildAdminCacheKey('projects:list', params);
    return loadFromCacheWithBackgroundRefresh({
      key: cacheKey,
      fetcher: () => projectsApi.getAll(params),
      onUpdate,
    });
  },

  getById: async (id: string) => {
    return apiCall<{ success: boolean; data: any }>(`/projects/${id}`);
  },

  create: async (projectData: any) => {
    const response = await apiCall<{ success: boolean; data: any }>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });

    if (response.success) {
      invalidateAdminData();
    }

    return response;
  },

  update: async (id: string, projectData: any) => {
    const response = await apiCall<{ success: boolean }>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });

    if (response.success) {
      invalidateAdminData();
    }

    return response;
  },

  delete: async (id: string) => {
    const response = await apiCall<{ success: boolean }>(`/projects/${id}`, {
      method: 'DELETE',
    });

    if (response.success) {
      invalidateAdminData();
    }

    return response;
  },

  getStats: async () => {
    return apiCall<{ success: boolean; data: any }>('/projects/stats');
  },

  getStatsCached: async (onUpdate?: (value: { success: boolean; data: any }) => void) => {
    return loadFromCacheWithBackgroundRefresh({
      key: buildAdminCacheKey('projects:stats'),
      fetcher: () => projectsApi.getStats(),
      onUpdate,
    });
  },

  /** Upsert all 35 company sheet projects (GB001–GB035) and publish. */
  syncSheet: async () => {
    const token = getToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 120000);

    try {
      const response = await fetch(`${API_BASE_URL}/projects/sync-sheet`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
        signal: controller.signal,
      });
      const text = await response.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        throw new Error(
          response.ok
            ? 'Server returned invalid JSON'
            : `API error ${response.status}: server did not return JSON. Restart the Node app and try again.`
        );
      }
      if (!response.ok) {
        throw new Error(data?.message || `Sync failed (HTTP ${response.status})`);
      }
      if (data?.success) {
        invalidateAdminData();
      }
      return data as {
        success: boolean;
        message?: string;
        data: {
          created: number;
          updated: number;
          total: number;
          published: number;
          sheetCount?: number;
          errors?: string[];
        };
      };
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        throw new Error('Import timed out. Restart the Node app, then try again.');
      }
      if (String(err?.message || '').toLowerCase().includes('failed to fetch')) {
        throw new Error(
          'Cannot reach API (Failed to fetch). Usually Imunify360 bot-protection on api.gindeberetconstruction.com — ask host to whitelist that subdomain / disable JS challenge for the API, then Restart Node and retry.'
        );
      }
      throw err;
    } finally {
      window.clearTimeout(timer);
    }
  },
};

// Activity API
export const activityApi = {
  getRecent: async (limit = 10) => {
    return apiCall<{ success: boolean; data: any[] }>(`/activity?limit=${limit}`);
  },

  getRecentCached: async (limit = 10, onUpdate?: (value: { success: boolean; data: any[] }) => void) => {
    return loadFromCacheWithBackgroundRefresh({
      key: buildAdminCacheKey('activity:recent', { limit }),
      fetcher: () => activityApi.getRecent(limit),
      onUpdate,
    });
  },
};

// Dashboard API
export const dashboardApi = {
  getRevenue: async () => {
    return apiCall<{ success: boolean; data: any[] }>('/dashboard/revenue');
  },

  getRevenueCached: async (onUpdate?: (value: { success: boolean; data: any[] }) => void) => {
    return loadFromCacheWithBackgroundRefresh({
      key: buildAdminCacheKey('dashboard:revenue'),
      fetcher: () => dashboardApi.getRevenue(),
      onUpdate,
    });
  },

  getKPI: async () => {
    return apiCall<{ success: boolean; data: any }>('/dashboard/kpi');
  },

  getKPICached: async (onUpdate?: (value: { success: boolean; data: any }) => void) => {
    return loadFromCacheWithBackgroundRefresh({
      key: buildAdminCacheKey('dashboard:kpi'),
      fetcher: () => dashboardApi.getKPI(),
      onUpdate,
    });
  },

  getAnalytics: async () => {
    return apiCall<{ success: boolean; data: any }>('/dashboard/analytics');
  },

  getAnalyticsCached: async (onUpdate?: (value: { success: boolean; data: any }) => void) => {
    return loadFromCacheWithBackgroundRefresh({
      key: buildAdminCacheKey('dashboard:analytics'),
      fetcher: () => dashboardApi.getAnalytics(),
      onUpdate,
    });
  },
};

// Public API (no authentication required)
export const publicApi = {
  getProjects: async () => {
    return publicApiCall<{ success: boolean; data: any[] }>('/projects');
  },

  getSummary: async () => {
    return publicApiCall<{
      success: boolean;
      data: { completedProjects: number; totalProjects: number; awards: number };
    }>('/projects/summary');
  },
};

export const contactApi = {
  send: async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    projectType?: string;
    message: string;
  }) => {
    return publicApiCall<{ success: boolean; message?: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// Site settings API (public contact info shown on the landing page)
export const settingsApi = {
  getSite: async () => {
    return publicApiCall<{ success: boolean; data: any }>('/settings');
  },

  getSiteCached: async (onUpdate?: (value: { success: boolean; data: any }) => void) => {
    return loadFromCacheWithBackgroundRefresh({
      key: buildAdminCacheKey('settings:site'),
      fetcher: () => settingsApi.getSite(),
      onUpdate,
    });
  },

  updateSite: async (payload: { officeLocation?: string; phone?: string; workingHours?: string; email?: string; mapUrl?: string }) => {
    const response = await apiCall<{ success: boolean; data: any; message?: string }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    if (response.success) {
      invalidateCache(buildAdminCacheKey('settings:site'));
      invalidateAdminData();
    }

    return response;
  },
};

// Upload API
export const uploadApi = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      redirectToLoginIfUnauthorized(response.status);
      throw new Error(data.message || 'Upload failed');
    }

    return data as { success: boolean; data: { url: string; filename: string; originalName: string; size: number } };
  },

  uploadImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/upload/images`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      redirectToLoginIfUnauthorized(response.status);
      throw new Error(data.message || 'Upload failed');
    }

    return data as { success: boolean; data: Array<{ url: string; filename: string; originalName: string; size: number }> };
  },

  deleteImage: async (filename: string) => {
    return apiCall<{ success: boolean }>(`/upload/image/${filename}`, {
      method: 'DELETE',
    });
  },

  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('document', file);

    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/upload/document`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      redirectToLoginIfUnauthorized(response.status);
      throw new Error(data.message || 'Document upload failed');
    }

    return data as { success: boolean; data: { url: string; filename: string; originalName: string; size: number } };
  },
};

// Stamp & Sign API (admin)
function savePdfBytes(bytes: Uint8Array, downloadName: string) {
  const head =
    bytes.length >= 4
      ? String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3])
      : '';
  if (head !== '%PDF') {
    throw new Error('Downloaded file is not a valid PDF. Please try again.');
  }
  // Copy into a plain ArrayBuffer so BlobPart typing is happy under TS 5.x DOM libs
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const blob = new Blob([copy], { type: 'application/pdf' });
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = downloadName.replace(/[^\w.\-]+/g, '_') || 'stamped.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Keep URL alive briefly so the browser can start the download
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
}

function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export const stampApi = {
  apply: async (payload: {
    document: File;
    stamp?: File;
    signature?: File;
    pages: string;
    signaturePages: string;
    position: string;
    signaturePosition: string;
    opacity: number;
    rotation: number;
    size: number;
    signatureSize: number;
  }) => {
    const formData = new FormData();
    formData.append('document', payload.document);
    if (payload.stamp) formData.append('stamp', payload.stamp);
    if (payload.signature) formData.append('signature', payload.signature);
    formData.append('pages', payload.pages);
    formData.append('signaturePages', payload.signaturePages);
    formData.append('position', payload.position);
    formData.append('signaturePosition', payload.signaturePosition);
    formData.append('opacity', String(payload.opacity));
    formData.append('rotation', String(payload.rotation));
    formData.append('size', String(payload.size));
    formData.append('signatureSize', String(payload.signatureSize));

    const token = getToken();
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/stamp/apply`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Stamp failed');
    return data as {
      success: boolean;
      data: {
        id: number;
        url: string;
        filename: string;
        downloadName: string;
        originalName: string;
        size?: number;
        pdfBase64?: string | null;
      };
    };
  },

  /** Save stamped PDF from inline base64 (preferred) or authenticated download. */
  saveResult: async (data: {
    id: number;
    downloadName?: string;
    pdfBase64?: string | null;
    url?: string;
  }) => {
    const name = (data.downloadName || 'stamped.pdf').replace(/[^\w.\-]+/g, '_');
    if (data.pdfBase64) {
      savePdfBytes(base64ToUint8Array(data.pdfBase64), name);
      return;
    }

    const token = getToken();
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/stamp/download/${data.id}`, { headers });
    if (!response.ok) {
      let message = 'Download failed';
      try {
        const err = await response.json();
        message = err.message || message;
      } catch {
        /* ignore */
      }
      throw new Error(message);
    }
    const buf = new Uint8Array(await response.arrayBuffer());
    savePdfBytes(buf, name);
  },

  /** Authenticated download of a stamped PDF (forces attachment). */
  download: async (id: number | string, downloadName?: string) => {
    await stampApi.saveResult({ id: Number(id), downloadName, pdfBase64: null });
  },

  getSignatures: async () => apiCall<{ success: boolean; data: any[] }>('/stamp/signatures'),

  saveSignature: async (file: File, name?: string) => {
    const formData = new FormData();
    formData.append('signature', file);
    if (name) formData.append('name', name);
    const token = getToken();
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/stamp/signatures`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Save signature failed');
    return data;
  },

  deleteSignature: async (id: number | string) =>
    apiCall<{ success: boolean }>(`/stamp/signatures/${id}`, { method: 'DELETE' }),
};

// Careers / vacancies API
export const careersApi = {
  getOpenVacancies: async () => {
    return publicApiCall<{ success: boolean; data: any[] }>('/careers/vacancies');
  },

  apply: async (
    vacancyId: number | string,
    payload: {
      fullName: string;
      email: string;
      phone?: string;
      coverLetter?: string;
      cvUrl: string;
      otherDocsUrl?: string;
    }
  ) => {
    return publicApiCall<{ success: boolean; message?: string; data: { id: number } }>(
      `/careers/vacancies/${vacancyId}/apply`,
      { method: 'POST', body: JSON.stringify(payload) }
    );
  },

  adminListVacancies: async () => {
    return apiCall<{ success: boolean; data: any[] }>('/careers/admin/vacancies');
  },

  adminCreateVacancy: async (payload: Record<string, unknown>) => {
    return apiCall<{ success: boolean; data: any }>('/careers/admin/vacancies', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  adminUpdateVacancy: async (id: number | string, payload: Record<string, unknown>) => {
    return apiCall<{ success: boolean; data: any }>(`/careers/admin/vacancies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  adminDeleteVacancy: async (id: number | string) => {
    return apiCall<{ success: boolean; message: string }>(`/careers/admin/vacancies/${id}`, {
      method: 'DELETE',
    });
  },

  adminListApplications: async (params?: { vacancyId?: number | string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.vacancyId) query.set('vacancyId', String(params.vacancyId));
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return apiCall<{ success: boolean; data: any[] }>(
      `/careers/admin/applications${qs ? `?${qs}` : ''}`
    );
  },

  adminUpdateApplication: async (
    id: number | string,
    payload: { status?: string; adminNotes?: string }
  ) => {
    return apiCall<{ success: boolean; data: any }>(`/careers/admin/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /** Open CV / other docs as blob (auth + correct Content-Type for PDF). */
  openApplicationFile: async (id: number | string, which: 'cv' | 'other' = 'cv') => {
    const token = getToken();
    const response = await fetch(
      `${API_BASE_URL}/careers/admin/applications/${id}/file/${which}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    if (!response.ok) {
      let message = `Could not open file (${response.status})`;
      try {
        const data = await response.json();
        if (data?.message) message = data.message;
      } catch {
        /* ignore */
      }
      throw new Error(message);
    }
    const blob = await response.blob();
    const type = response.headers.get('Content-Type') || blob.type || 'application/octet-stream';
    const typed = blob.type ? blob : new Blob([blob], { type });
    const objectUrl = URL.createObjectURL(typed);
    const win = window.open(objectUrl, '_blank', 'noopener,noreferrer');
    if (!win) {
      const a = document.createElement('a');
      a.href = objectUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = which === 'cv' ? 'cv' : 'document';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    return true;
  },
};

export const companyProfileApi = {
  getPublic: async () => {
    return publicApiCall<{
      success: boolean;
      data: {
        company: string;
        title: string;
        generatedAt: string;
        summary: any;
        yearMatrix: any;
        rows: any[];
        sharePath: string;
      };
    }>('/company-profile/public');
  },

  getAdmin: async () => {
    return apiCall<{
      success: boolean;
      data: {
        company: string;
        title: string;
        generatedAt: string;
        summary: any;
        yearMatrix: any;
        rows: any[];
        sharePath: string;
        note?: string;
      };
    }>('/company-profile/admin');
  },

  downloadPublicPdf: async () => {
    const data = await publicApiCall<{
      success: boolean;
      data: { filename: string; pdfBase64: string; count: number };
    }>('/company-profile/public/pdf?format=json');
    if (!data.data?.pdfBase64) throw new Error('PDF not returned');
    savePdfBytes(base64ToUint8Array(data.data.pdfBase64), data.data.filename || 'company-profile.pdf');
  },

  downloadAdminPdf: async (scope: 'all' | 'public' = 'all') => {
    const qs = new URLSearchParams({ format: 'json' });
    if (scope === 'public') qs.set('scope', 'public');
    const data = await apiCall<{
      success: boolean;
      data: { filename: string; pdfBase64: string; count: number };
    }>(`/company-profile/admin/pdf?${qs.toString()}`);
    if (!data.data?.pdfBase64) throw new Error('PDF not returned');
    savePdfBytes(base64ToUint8Array(data.data.pdfBase64), data.data.filename || 'company-profile.pdf');
  },
};

// Landing Page dynamic sections API
export const landingApi = {
  getSection: async (section: string) => {
    // Prefer authenticated call in admin so empty/errors are clearer; fall back to public.
    const token = getToken();
    if (token) {
      return apiCall<{ success: boolean; data: any[] }>(`/landing/${section}`);
    }
    return publicApiCall<{ success: boolean; data: any[] }>(`/landing/${section}`);
  },
  
  createItem: async (section: string, data: any) => {
    return apiCall<{ success: boolean; data: any }>(`/landing/${section}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateItem: async (section: string, id: string | number, data: any) => {
    return apiCall<{ success: boolean; data: any }>(`/landing/${section}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteItem: async (section: string, id: string | number) => {
    return apiCall<{ success: boolean; message: string }>(`/landing/${section}/${id}`, {
      method: 'DELETE',
    });
  }
};

export { getToken, setToken, removeToken };