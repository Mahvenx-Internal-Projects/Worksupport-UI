import { api } from './api';
import { ENV } from '../config/env';
import axios from 'axios';

const pub = axios.create({ baseURL: `${ENV.API_URL}/api` });

export const authApi = {
  login:       (email: string, password: string) => api.post('/auth/login', { email, password }),
  googleSignIn:(idToken: string)                 => api.post('/auth/google', { idToken }),
  register:    (data: any)                       => api.post('/auth/register', data),
  refresh:     (refreshToken: string)            => api.post('/auth/refresh', { refreshToken }),
  logout:      (refreshToken: string)            => api.post('/auth/logout', { refreshToken }),
  me:          ()                                => api.get('/auth/me'),
  completeProfile: (data: any)                   => api.post('/auth/complete-profile', data),
};

export const publicApi = {
  getStats:               ()           => pub.get('/public/stats'),
  getFeaturedFreelancers: (p?: any)    => pub.get('/public/featured-freelancers', { params: p }),
  getFaqs:                (cat?: string) => pub.get('/public/faqs', { params: cat ? { category: cat } : undefined }),
  markFaqHelpful:         (id: string) => pub.post(`/public/faqs/${id}/helpful`),
  getPlans:               ()           => pub.get('/public/plans'),
  getSettings:            ()           => pub.get('/public/settings'),
  contact:                (d: any)     => pub.post('/public/contact', d),
};

export const freelancerApi = {
  search:          (p?: any)    => api.get('/freelancers', { params: p }),
  getById:         (id: string) => api.get(`/freelancers/${id}`),
  getMe:           ()           => api.get('/freelancers/me'),
  getMyStats:      ()           => api.get('/freelancers/me/stats'),
  updateMe:        (d: any)     => api.put('/freelancers/me', d),
  setAvailability: (v: boolean) => api.patch('/freelancers/me/availability', v),
};

export const quickSupportApi = {
  getAvailable: (skill?: string) => pub.get('/public/quick-support/available', { params: skill ? { skill } : undefined }),
  book:         (d: any)         => api.post('/public/quick-support/book', d),
};

export const subscriptionApi = {
  getMine:   ()     => api.get('/subscriptions/mine'),
  subscribe: (d: any) => api.post('/subscriptions', d),
  cancel:    ()     => api.delete('/subscriptions/mine'),
};

export const requestsApi = {
  getAll:       (status?: string) => api.get('/requests', { params: status ? { status } : undefined }),
  getById:      (id: string)      => api.get(`/requests/${id}`),
  create:       (d: any)          => api.post('/requests', d),
  updateStatus: (id: string, d: any) => api.patch(`/requests/${id}/status`, d),
};

export const meetingsApi = {
  getAll:     ()                   => api.get('/meetings'),
  schedule:   (d: any)             => api.post('/meetings', d),
  setOutcome: (id: string, d: any) => api.patch(`/meetings/${id}/outcome`, d),
  cancel:     (id: string)         => api.patch(`/meetings/${id}/cancel`),
  confirm:    (id: string, d: any) => api.patch(`/meetings/${id}/confirm`, d),
};

export const projectsApi = {
  getAll:          (status?: string) => api.get('/projects', { params: status ? { status } : undefined }),
  getById:         (id: string)      => api.get(`/projects/${id}`),
  create:          (d: any)          => api.post('/projects', d),
  update:          (id: string, d: any) => api.patch(`/projects/${id}`, d),
  updateMilestone: (pid: string, mid: string, status: string) =>
    api.patch(`/projects/${pid}/milestones/${mid}`, JSON.stringify(status), { headers: { 'Content-Type': 'application/json' } }),
};

export const timesheetsApi = {
  getAll:   (p?: any)  => api.get('/timesheets', { params: p }),
  submit:   (d: any)   => api.post('/timesheets', d),
  approve:  (id: string, d: any) => api.patch(`/timesheets/${id}/approve`, d),
};

export const invoicesApi = {
  getAll:                  (status?: string) => api.get('/invoices', { params: status ? { status } : undefined }),
  getById:                 (id: string)      => api.get(`/invoices/${id}`),
  sendPaymentInstructions: (id: string)      => api.post(`/invoices/${id}/send-payment-instructions`),
  markPaid:                (id: string, d: any) => api.patch(`/invoices/${id}/mark-paid`, d),
  sendReminder:            (id: string)      => api.post(`/invoices/${id}/send-reminder`),
  markOverdue:             ()                => api.post('/invoices/mark-overdue'),
};

export const paymentsApi = {
  getAll:       ()                   => api.get('/payments'),
  recordPayout: (id: string, d: any) => api.post(`/payments/${id}/record-payout`, d),
};

export const notificationsApi = {
  getAll:      ()           => api.get('/notifications'),
  getCount:    ()           => api.get('/notifications/count'),
  markRead:    (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: ()           => api.post('/notifications/mark-all-read'),
  delete:      (id: string) => api.delete(`/notifications/${id}`),
};

export const standupsApi = {
  getByProject: (pid: string) => api.get(`/standups/project/${pid}`),
  submit:       (d: any)      => api.post('/standups', d),
};

export const reviewsApi = {
  submit: (d: any) => api.post('/reviews', d),
};

export const adminApi = {
  getStats:       ()     => api.get('/admin/stats'),
  getLeaderboard: ()     => api.get('/admin/leaderboard'),
  getRevenue:     ()     => api.get('/admin/reports/revenue'),
  getBreakdown:   ()     => api.get('/admin/revenue/breakdown'),
  getAttendance:  (p?: any) => api.get('/admin/attendance', { params: p }),
  getPendingPayouts: ()  => api.get('/admin/pending-payouts'),
  setRole:        (uid: string, role: string) =>
    api.patch(`/admin/users/${uid}/role`, JSON.stringify(role), { headers: { 'Content-Type': 'application/json' } }),
  verifyFreelancer: (id: string, v: boolean) =>
    api.patch(`/admin/freelancers/${id}/verify`, v),
};

export const supportApi = {
  getTickets:  ()                   => api.get('/support/tickets'),
  create:      (d: any)             => api.post('/support/tickets', d),
  getMessages: (id: string)         => api.get(`/support/tickets/${id}/messages`),
  sendMessage: (id: string, msg: string) =>
    api.post(`/support/tickets/${id}/messages`, JSON.stringify(msg), { headers: { 'Content-Type': 'application/json' } }),
};

export const requirementsApi = {
  getPublic:   (p?: any)    => pub.get('/requirements/public', { params: p }),
  getAll:      (p?: any)    => api.get('/requirements', { params: p }),
  getMine:     ()             => api.get('/requirements/mine'),
  create:      (d: any)     => api.post('/requirements', d),
  apply:       (id: string|number, d: any) => api.post(`/requirements/${id}/apply`, d),
  getMyApps:   ()           => api.get('/requirements/my-applications'),
  update:      (id: string|number, d: any) => api.patch(`/requirements/${id}`, d),
  remove:      (id: string|number) => api.delete(`/requirements/${id}`),
  allocate:    (id: string|number, freelancerId: number) => api.patch(`/requirements/${id}/allocate`, { freelancerId }),
};