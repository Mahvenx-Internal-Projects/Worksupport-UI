import { api } from './api';
import { ENV } from '../config/env';
import axios from 'axios';

// Public (no auth) API calls use axios directly to avoid auth interceptor issues
const pub = axios.create({ baseURL: `${ENV.API_URL}/api` });

// ─── Auth ─────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  googleSignIn: (idToken: string) => api.post('/auth/google', { idToken }),
  register: (data: any) => api.post('/auth/register', data),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  logoutAll: () => api.post('/auth/logout-all'),
  me: () => api.get('/auth/me'),
};

// ─── Public ───────────────────────────────────────────────────
export const publicApi = {
  getStats: () => pub.get('/public/stats'),
  getFeaturedFreelancers: (params?: { page?: number; pageSize?: number; skill?: string }) =>
    pub.get('/public/featured-freelancers', { params }),
  getFaqs: (category?: string) => pub.get('/public/faqs', { params: category ? { category } : undefined }),
  markFaqHelpful: (id: string) => pub.post(`/public/faqs/${id}/helpful`),
  getPlans: () => pub.get('/public/plans'),
  getSettings: () => pub.get('/public/settings'),
  contact: (data: { name: string; email: string; reason: string; message: string }) =>
    pub.post('/public/contact', data),
  getRecentRequirements: (count = 6) =>
    pub.get('/public/recent-requirements', { params: { count } }),
};

// ─── Freelancers ──────────────────────────────────────────────
export const freelancerApi = {
  search: (params?: any) => api.get('/freelancers', { params }),
  getById: (id: string) => api.get(`/freelancers/${id}`),
  getMe: () => api.get('/freelancers/me'),
  getMyStats: () => api.get('/freelancers/me/stats'),
  updateMe: (data: any) => api.put('/freelancers/me', data),
  setAvailability: (isAvailable: boolean) => api.patch('/freelancers/me/availability', isAvailable),
};

// ─── Quick Support ────────────────────────────────────────────
export const quickSupportApi = {
  getAvailable: (skill?: string) => pub.get('/quick-support/available', { params: skill ? { skill } : undefined }),
  book: (data: any) => api.post('/quick-support/book', data),
};

// ─── Support ──────────────────────────────────────────────────
export const supportApi = {
  getTickets: () => api.get('/support/tickets'),
  createTicket: (data: any) => api.post('/support/tickets', data),
  getMessages: (id: string) => api.get(`/support/tickets/${id}/messages`),
  sendMessage: (id: string, content: string) => api.post(`/support/tickets/${id}/messages`, JSON.stringify(content), { headers: { 'Content-Type': 'application/json' } }),
};

// ─── Subscriptions ────────────────────────────────────────────
export const subscriptionApi = {
  getMine: () => api.get('/subscriptions/mine'),
  subscribe: (data: { planKey: string; billingCycle: string; currency: string; paymentMethod?: string }) =>
    api.post('/subscriptions', data),
  cancel: () => api.delete('/subscriptions/mine'),
};

// ─── Requests ─────────────────────────────────────────────────
export const requestsApi = {
  getAll: (status?: string) => api.get('/requests', { params: status ? { status } : undefined }),
  getById: (id: string) => api.get(`/requests/${id}`),
  create: (data: any) => api.post('/requests', data),
  updateStatus: (id: string, status: string, adminNotes?: string) => api.patch(`/requests/${id}/status`, { status, adminNotes }),
};

// ─── Meetings ─────────────────────────────────────────────────
export const meetingsApi = {
  getAll: () => api.get('/meetings'),
  schedule: (data: any) => api.post('/meetings', data),
  setOutcome: (id: string, outcome: string, notes?: string) => api.patch(`/meetings/${id}/outcome`, { outcome, notes }),
  confirm: (id: string, data: any) => api.patch(`/meetings/${id}/confirm`, data),
  cancel: (id: string) => api.patch(`/meetings/${id}/cancel`),
};

// ─── Projects ─────────────────────────────────────────────────
export const projectsApi = {
  getAll: (status?: string) => api.get('/projects', { params: status ? { status } : undefined }),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  updateProgress: (id: string, progress: number, status?: string) => api.patch(`/projects/${id}/progress`, { progress, status }),
  updateMilestone: (projectId: string, milestoneId: string, status: string) => api.patch(`/projects/${projectId}/milestones/${milestoneId}`, { status }),
};

// ─── Timesheets ───────────────────────────────────────────────
export const timesheetsApi = {
  getAll: (status?: string) => api.get('/timesheets', { params: status ? { status } : undefined }),
  submit: (data: any) => api.post('/timesheets', data),
  approve: (id: string, approve: boolean, reason?: string) => api.patch(`/timesheets/${id}/approve`, { approve, reason }),
};

// ─── Invoices ─────────────────────────────────────────────────
export const invoicesApi = {
  getAll: (status?: string) => api.get('/invoices', { params: status ? { status } : undefined }),
  getById: (id: string) => api.get(`/invoices/${id}`),
  markPaid: (id: string, method: string, transactionId?: string) => api.patch(`/invoices/${id}/mark-paid`, { invoiceId: id, method, transactionId }),
  markOverdue: () => api.post('/invoices/mark-overdue'),
  sendPaymentInstructions: (id: string) => api.post(`/invoices/${id}/payment-instructions`),
  sendReminder: (id: string) => api.post(`/invoices/${id}/reminder`),
};

// ─── Payments ─────────────────────────────────────────────────
export const paymentsApi = {
  getAll: () => api.get('/payments'),
  recordPayout: (id: string, data: any) => api.post(`/payments/${id}/payout`, data),
};

// ─── Notifications ────────────────────────────────────────────
export const notificationsApi = {
  getAll: (unreadOnly?: boolean) => api.get('/notifications', { params: unreadOnly ? { unreadOnly: true } : undefined }),
  getCount: () => api.get('/notifications/count'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/mark-all-read'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

// ─── Standups ─────────────────────────────────────────────────
export const standupsApi = {
  getByProject: (projectId: string) => api.get(`/standups/project/${projectId}`),
  submit: (data: any) => api.post('/standups', data),
};

// ─── Reviews ──────────────────────────────────────────────────
export const reviewsApi = { submit: (data: any) => api.post('/reviews', data) };

// ─── Admin ────────────────────────────────────────────────────
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getLeaderboard: () => api.get('/admin/leaderboard'),
  getRevenueReport: () => api.get('/admin/reports/revenue'),
  getRevenueBreakdown: () => api.get('/admin/revenue/breakdown'),
  getRevenue: () => api.get('/admin/reports/revenue'),
  getBreakdown: () => api.get('/admin/revenue/breakdown'),
  getAttendance: (params?: any) => api.get('/admin/attendance', { params }),
  getPendingPayouts: () => api.get('/admin/payouts/pending'),
  verifyFreelancer: (userId: string, verified: boolean) => api.patch(`/admin/freelancers/${userId}/verify`, { verified }),
  setUserRole: (userId: string, role: string) => api.patch(`/admin/users/${userId}/role`, JSON.stringify(role), { headers: { 'Content-Type': 'application/json' } }),
};
