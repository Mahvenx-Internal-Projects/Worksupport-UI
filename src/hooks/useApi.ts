import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  publicApi, freelancerApi, quickSupportApi, subscriptionApi,
  requestsApi, meetingsApi, projectsApi, timesheetsApi,
  invoicesApi, paymentsApi, notificationsApi, standupsApi,
  reviewsApi, adminApi, supportApi,
} from '../services/endpoints';

// ─── Public ───────────────────────────────────────────────────
export const usePublicStats = () =>
  useQuery({ queryKey: ['public-stats'], queryFn: () => publicApi.getStats().then(r => r.data), staleTime: 60_000 });

export const useFeaturedFreelancers = (p?: any) =>
  useQuery({ queryKey: ['featured', p], queryFn: () => publicApi.getFeaturedFreelancers(p).then(r => r.data), staleTime: 30_000 });

export const useFaqs = (cat?: string) =>
  useQuery({ queryKey: ['faqs', cat], queryFn: () => publicApi.getFaqs(cat).then(r => r.data) });

export const usePlans = () =>
  useQuery({ queryKey: ['plans'], queryFn: () => publicApi.getPlans().then(r => r.data) });

export const usePublicSettings = () =>
  useQuery({ queryKey: ['pub-settings'], queryFn: () => publicApi.getSettings().then(r => r.data) });

// ─── Quick Support ────────────────────────────────────────────
export const useAvailableQuickSupport = (skill?: string) =>
  useQuery({ queryKey: ['qs-available', skill], queryFn: () => quickSupportApi.getAvailable(skill).then(r => r.data), refetchInterval: 30_000 });

export const useBookQuickSupport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: any) => quickSupportApi.book(d),
    onSuccess: () => { toast.success('Quick support booked! Expert connects in ~30 min.'); qc.invalidateQueries({ queryKey: ['qs-available'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Booking failed'),
  });
};

// ─── Freelancers ──────────────────────────────────────────────
export const useFreelancers = (p?: any) =>
  useQuery({ queryKey: ['freelancers', p], queryFn: () => freelancerApi.search(p).then(r => r.data) });

export const useFreelancer = (id?: string) =>
  useQuery({ queryKey: ['freelancer', id], queryFn: () => freelancerApi.getById(id!).then(r => r.data), enabled: !!id });

export const useMyFreelancerProfile = () =>
  useQuery({ queryKey: ['my-fl-profile'], queryFn: () => freelancerApi.getMe().then(r => r.data), retry: false });

export const useMyFreelancerStats = () =>
  useQuery({ queryKey: ['my-fl-stats'], queryFn: () => freelancerApi.getMyStats().then(r => r.data), retry: false });

export const useUpdateFreelancerProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: any) => freelancerApi.updateMe(d),
    onSuccess: () => { toast.success('Profile updated!'); qc.invalidateQueries({ queryKey: ['my-fl-profile'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Update failed'),
  });
};

// ─── Subscriptions ────────────────────────────────────────────
export const useMySubscription = () =>
  useQuery({ queryKey: ['my-sub'], queryFn: () => subscriptionApi.getMine().then(r => r.data), retry: false });

export const useSubscribe = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: any) => subscriptionApi.subscribe(d),
    onSuccess: () => { toast.success('Subscription activated!'); qc.invalidateQueries({ queryKey: ['my-sub'] }); },
  });
};

// ─── Requests ─────────────────────────────────────────────────
export const useRequests = (status?: string) =>
  useQuery({ queryKey: ['requests', status], queryFn: () => requestsApi.getAll(status).then(r => r.data) });

export const useCreateRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: any) => requestsApi.create(d),
    onSuccess: () => { toast.success('Request submitted! Admin will confirm within 4 hours.'); qc.invalidateQueries({ queryKey: ['requests'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to submit request'),
  });
};

export const useUpdateRequestStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => requestsApi.updateStatus(id, data),
    onSuccess: () => { toast.success('Request updated'); qc.invalidateQueries({ queryKey: ['requests'] }); },
  });
};

// ─── Meetings ─────────────────────────────────────────────────
export const useMeetings = () =>
  useQuery({ queryKey: ['meetings'], queryFn: () => meetingsApi.getAll().then(r => r.data) });

export const useScheduleMeeting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: any) => meetingsApi.schedule(d),
    onSuccess: () => { toast.success('Meeting scheduled — invites sent to both parties!'); qc.invalidateQueries({ queryKey: ['meetings', 'requests'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Scheduling failed'),
  });
};

export const useSetMeetingOutcome = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => meetingsApi.setOutcome(id, data),
    onSuccess: () => { toast.success('Outcome saved'); qc.invalidateQueries({ queryKey: ['meetings'] }); },
  });
};

export const useConfirmMeeting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => meetingsApi.confirm(id, data),
    onSuccess: (_, v: any) => {
      toast.success(v.data.confirmed ? 'Meeting confirmed! Admin notified.' : 'Meeting declined. Admin will find alternative.');
      qc.invalidateQueries({ queryKey: ['meetings'] });
    },
  });
};

// ─── Projects ─────────────────────────────────────────────────
export const useProjects = (status?: string) =>
  useQuery({ queryKey: ['projects', status], queryFn: () => projectsApi.getAll(status).then(r => r.data) });

export const useProject = (id?: string) =>
  useQuery({ queryKey: ['project', id], queryFn: () => projectsApi.getById(id!).then(r => r.data), enabled: !!id });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: any) => projectsApi.create(d),
    onSuccess: () => { toast.success('Project created! Both parties notified.'); qc.invalidateQueries({ queryKey: ['projects'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create project'),
  });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => projectsApi.update(id, data),
    onSuccess: () => { toast.success('Project updated!'); qc.invalidateQueries({ queryKey: ['projects'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Update failed'),
  });
};

// ─── Timesheets ───────────────────────────────────────────────
export const useTimesheets = (p?: any) =>
  useQuery({ queryKey: ['timesheets', p], queryFn: () => timesheetsApi.getAll(p).then(r => r.data) });

export const useSubmitTimesheet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: any) => timesheetsApi.submit(d),
    onSuccess: () => { toast.success('Timesheet submitted for approval!'); qc.invalidateQueries({ queryKey: ['timesheets'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Submission failed'),
  });
};

export const useApproveTimesheet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => timesheetsApi.approve(id, data),
    onSuccess: (_, v: any) => { toast.success(v.data.approve ? 'Approved — invoice generated!' : 'Timesheet rejected'); qc.invalidateQueries({ queryKey: ['timesheets', 'invoices'] }); },
  });
};

// ─── Invoices ─────────────────────────────────────────────────
export const useInvoices = (status?: string) =>
  useQuery({ queryKey: ['invoices', status], queryFn: () => invoicesApi.getAll(status).then(r => r.data) });

export const useMarkInvoicePaid = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => invoicesApi.markPaid(id, data),
    onSuccess: () => { toast.success('Invoice paid — commission recorded!'); qc.invalidateQueries({ queryKey: ['invoices', 'payments', 'projects'] }); },
  });
};

export const useSendPaymentInstructions = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invoicesApi.sendPaymentInstructions(id),
    onSuccess: () => { toast.success('Payment instructions sent to client via email!'); qc.invalidateQueries({ queryKey: ['invoices'] }); },
    onError: () => toast.error('Failed to send instructions'),
  });
};

export const useSendInvoiceReminder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invoicesApi.sendReminder(id),
    onSuccess: () => { toast.success('Payment reminder sent!'); qc.invalidateQueries({ queryKey: ['invoices'] }); },
  });
};

// ─── Payments ─────────────────────────────────────────────────
export const usePayments = () =>
  useQuery({ queryKey: ['payments'], queryFn: () => paymentsApi.getAll().then(r => r.data) });

export const useRecordPayout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => paymentsApi.recordPayout(id, data),
    onSuccess: () => { toast.success('Payout recorded — freelancer notified!'); qc.invalidateQueries({ queryKey: ['payments'] }); },
  });
};

// ─── Notifications ────────────────────────────────────────────
export const useNotifications = () =>
  useQuery({ queryKey: ['notifs'], queryFn: () => notificationsApi.getAll().then(r => r.data), refetchInterval: 60_000 });

export const useNotifCount = () =>
  useQuery({ queryKey: ['notif-count'], queryFn: () => notificationsApi.getCount().then(r => r.data.count), refetchInterval: 30_000 });

// ─── Standups ─────────────────────────────────────────────────
export const useStandups = (projectId?: string) =>
  useQuery({ queryKey: ['standups', projectId], queryFn: () => standupsApi.getByProject(projectId!).then(r => r.data), enabled: !!projectId });

export const useSubmitStandup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: any) => standupsApi.submit(d),
    onSuccess: () => { toast.success('Standup submitted!'); qc.invalidateQueries({ queryKey: ['standups'] }); },
  });
};

// ─── Reviews ──────────────────────────────────────────────────
export const useSubmitReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: any) => reviewsApi.submit(d),
    onSuccess: () => { toast.success('Review submitted — thank you!'); qc.invalidateQueries({ queryKey: ['projects'] }); },
  });
};

// ─── Admin ────────────────────────────────────────────────────
export const useAdminStats = () =>
  useQuery({ queryKey: ['admin-stats'], queryFn: () => adminApi.getStats().then(r => r.data), refetchInterval: 60_000 });

export const useLeaderboard = () =>
  useQuery({ queryKey: ['leaderboard'], queryFn: () => adminApi.getLeaderboard().then(r => r.data) });

export const useRevenueReport = () =>
  useQuery({ queryKey: ['revenue-report'], queryFn: () => adminApi.getRevenue().then(r => r.data) });

export const useRevenueBreakdown = () =>
  useQuery({ queryKey: ['revenue-breakdown'], queryFn: () => adminApi.getBreakdown().then(r => r.data) });

export const useAttendanceLogs = (p?: any) =>
  useQuery({ queryKey: ['attendance', p], queryFn: () => adminApi.getAttendance(p).then(r => r.data) });

export const usePendingPayouts = () =>
  useQuery({ queryKey: ['pending-payouts'], queryFn: () => adminApi.getPendingPayouts().then(r => r.data) });

export const useVerifyFreelancer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, verified }: { id: string; verified: boolean }) => adminApi.verifyFreelancer(id, verified),
    onSuccess: () => { toast.success('Freelancer status updated'); qc.invalidateQueries({ queryKey: ['freelancers'] }); },
  });
};

// aliases for compatibility
export const useUpdateProgress = useUpdateProject;
export const useFreelancerStats = useMyFreelancerStats;
export const useRevenuBreakdown = useRevenueBreakdown;
