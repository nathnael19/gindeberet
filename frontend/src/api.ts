const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const ADMIN_CACHE_PREFIX = 'admin';

// Token management
const getToken = () => localStorage.getItem('token');
const setToken = (token: string) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
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
};

// Public API (no authentication required)
export const publicApi = {
  getProjects: async () => {
    return publicApiCall<{ success: boolean; data: any[] }>('/projects');
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
      throw new Error(data.message || 'Upload failed');
    }

    return data as { success: boolean; data: Array<{ url: string; filename: string; originalName: string; size: number }> };
  },

  deleteImage: async (filename: string) => {
    return apiCall<{ success: boolean }>(`/upload/image/${filename}`, {
      method: 'DELETE',
    });
  },
};

// Landing Page dynamic sections API
export const landingApi = {
  getSection: async (section: string) => {
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