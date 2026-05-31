export type UserRole = 'admin' | 'freelancer' | 'client';
export type Currency = 'USD' | 'INR' | 'EUR' | 'GBP';
export type ProjectStatus = 'active' | 'completed' | 'paused' | 'cancelled';
export type RequestStatus = 'pending' | 'scheduled' | 'approved' | 'rejected' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'processing';
export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected';
export type MeetingPlatform = 'zoom' | 'meet' | 'teams';
export type SessionType = 'demo' | 'interview' | 'quick_support' | 'daily_standup';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface Freelancer {
  id: string;
  userId: string;
  aliasName: string;
  realName: string;
  currentCompany: string; // private
  currentRole: string;
  totalExp: number;
  freelanceExp: number;
  skills: string[];
  hourlyRate: number;
  currency: Currency;
  country: string;
  timezone: string;
  bio: string;
  rating: number;
  reviewCount: number;
  trustScore: number;
  tier: 1 | 2 | 3 | 4;
  isAvailable: boolean;
  availability: WeeklyAvailability;
  totalEarned: number;
  pendingAmount: number;
  completedProjects: number;
  isVerified: boolean;
  badges: string[];
  profileViews: number;
  responseTime: number; // minutes
}

export interface WeeklyAvailability {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  available: boolean;
  startTime: string;
  endTime: string;
}

export interface Client {
  id: string;
  userId: string;
  companyName: string;
  contactName: string;
  industry: string;
  country: string;
  plan: 'payg' | 'starter' | 'growth' | 'enterprise';
  hoursUsed: number;
  hoursIncluded: number;
  totalSpent: number;
  activeProjects: number;
}

export interface DemoRequest {
  id: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName: string;
  sessionType: SessionType;
  preferredDate: string;
  preferredTime: string;
  budgetMin: number;
  budgetMax: number;
  currency: Currency;
  description: string;
  duration: number; // minutes
  status: RequestStatus;
  adminNotes?: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  requestId: string;
  clientId: string;
  freelancerId: string;
  scheduledAt: string;
  duration: number;
  platform: MeetingPlatform;
  meetingLink: string;
  agreedRate: number;
  currency: Currency;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  outcome?: 'approved' | 'rejected' | 'pending_decision';
  feedbackFromClient?: string;
  feedbackFromFreelancer?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName: string;
  description: string;
  skills: string[];
  hourlyRate: number;
  currency: Currency;
  estimatedHours: number;
  loggedHours: number;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  progress: number; // 0-100
  totalBudget: number;
  totalPaid: number;
  escrowBalance: number;
  milestones: Milestone[];
  createdAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'paid';
}

export interface TimesheetEntry {
  id: string;
  projectId: string;
  freelancerId: string;
  date: string;
  hours: number;
  description: string;
  status: TimesheetStatus;
}

export interface Timesheet {
  id: string;
  projectId: string;
  projectName: string;
  freelancerId: string;
  freelancerName: string;
  weekStart: string;
  weekEnd: string;
  entries: TimesheetEntry[];
  totalHours: number;
  totalAmount: number;
  status: TimesheetStatus;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  projectId: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName: string;
  timesheetIds: string[];
  lineItems: InvoiceLineItem[];
  subtotal: number;
  commission: number;
  commissionRate: number;
  total: number;
  freelancerAmount: number;
  currency: Currency;
  status: PaymentStatus;
  issuedAt: string;
  dueAt: string;
  paidAt?: string;
}

export interface InvoiceLineItem {
  description: string;
  hours: number;
  rate: number;
  amount: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  clientId: string;
  freelancerId: string;
  amount: number;
  commission: number;
  freelancerAmount: number;
  currency: Currency;
  status: PaymentStatus;
  method: string;
  transactionId?: string;
  createdAt: string;
  paidAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'request' | 'meeting' | 'payment' | 'approval' | 'timesheet' | 'message' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface Stats {
  totalRevenue: number;
  activeProjects: number;
  pendingRequests: number;
  platformCommission: number;
  totalFreelancers: number;
  totalClients: number;
  avgRating: number;
  revenueGrowth: number;
}

export interface DailyStandup {
  id: string;
  projectId: string;
  freelancerId: string;
  date: string;
  yesterdayWork: string;
  todayPlan: string;
  blockers: string;
  hoursWorked: number;
}

export interface LeaderboardEntry {
  rank: number;
  freelancerId: string;
  freelancerName: string;
  earnings: number;
  rating: number;
  completedProjects: number;
  badge?: string;
}
