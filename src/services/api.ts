import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import { ENV } from '../config/env';

// ─────────────────────────────────────────────────────────────
// Axios instance — baseURL from env, single config point
// ─────────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: `${ENV.API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  // Accept self-signed certs in dev (localhost)
  httpsAgent: ENV.IS_DEV ? undefined : undefined,
});

// ─────────────────────────────────────────────────────────────
// Request interceptor — attach JWT from localStorage
// ─────────────────────────────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─────────────────────────────────────────────────────────────
// Response interceptor — auto-refresh token on 401
// ─────────────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void }> = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not a retry, try refreshing
    if (error.response?.status === 401 && !original._retry) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // No refresh token — force logout
        clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers!.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${ENV.API_URL}/api/auth/refresh`, {
          refreshToken,
        });
        storeAuth(data);
        processQueue(null, data.accessToken);
        original.headers!.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Show user-friendly error messages
    const msg = (error.response?.data as any)?.message;
    if (error.response?.status === 403) {
      toast.error('You don\'t have permission to do that.');
    } else if (error.response?.status === 409) {
      toast.error(msg || 'A conflict occurred.');
    } else if (error.response?.status && error.response.status >= 500) {
      toast.error('Server error — please try again.');
    }

    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────
// Token storage helpers
// ─────────────────────────────────────────────────────────────
export const storeAuth = (data: {
  accessToken: string; refreshToken: string; role: string;
  name: string; userId: string; picture?: string;
}) => {
  localStorage.setItem('accessToken',  data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('userRole',     data.role);
  localStorage.setItem('userName',     data.name);
  localStorage.setItem('userId',       data.userId);
  localStorage.setItem('userPicture',  data.picture || '');
};

export const clearAuth = () => {
  ['accessToken','refreshToken','userRole','userName','userId','userPicture'].forEach(k =>
    localStorage.removeItem(k)
  );
};

export const getStoredAuth = () => ({
  accessToken:  localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  role:         localStorage.getItem('userRole') as 'admin'|'freelancer'|'client'|null,
  name:         localStorage.getItem('userName'),
  userId:       localStorage.getItem('userId'),
  picture:      localStorage.getItem('userPicture'),
});
