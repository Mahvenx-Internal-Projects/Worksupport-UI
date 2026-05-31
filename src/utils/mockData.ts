import { Freelancer, Client, DemoRequest, Project, Timesheet, Invoice, Payment, Meeting, Notification, Stats, LeaderboardEntry } from '../types';

export const mockFreelancers: Freelancer[] = [
  {
    id: 'fl1', userId: 'u1', aliasName: 'Rahul S.', realName: 'Rahul Sharma',
    currentCompany: 'Infosys', currentRole: 'Senior Software Engineer',
    totalExp: 8, freelanceExp: 3, skills: ['React', 'Node.js', 'AWS', 'TypeScript', 'PostgreSQL', 'Docker'],
    hourlyRate: 35, currency: 'USD', country: 'India', timezone: 'IST (UTC+5:30)',
    bio: 'Full stack specialist with 8 years building fintech and e-commerce platforms. React + Node.js expert.',
    rating: 4.9, reviewCount: 47, trustScore: 94, tier: 2, isAvailable: true,
    availability: {
      monday: { available: true, startTime: '18:00', endTime: '22:00' },
      tuesday: { available: true, startTime: '18:00', endTime: '22:00' },
      wednesday: { available: false, startTime: '', endTime: '' },
      thursday: { available: true, startTime: '18:00', endTime: '22:00' },
      friday: { available: true, startTime: '18:00', endTime: '22:00' },
      saturday: { available: true, startTime: '10:00', endTime: '18:00' },
      sunday: { available: false, startTime: '', endTime: '' },
    },
    totalEarned: 42000, pendingAmount: 1260, completedProjects: 24,
    isVerified: true, badges: ['ID Verified', 'Skill Tested', 'Top Performer'], profileViews: 1240, responseTime: 45,
  },
  {
    id: 'fl2', userId: 'u2', aliasName: 'Priya K.', realName: 'Priya Kumar',
    currentCompany: 'TCS', currentRole: 'Data Scientist',
    totalExp: 6, freelanceExp: 2, skills: ['Python', 'ML', 'SQL', 'Pandas', 'TensorFlow', 'Power BI'],
    hourlyRate: 2500, currency: 'INR', country: 'India', timezone: 'IST (UTC+5:30)',
    bio: 'Data scientist specializing in ML pipelines, predictive modeling, and business intelligence dashboards.',
    rating: 4.8, reviewCount: 31, trustScore: 88, tier: 2, isAvailable: true,
    availability: {
      monday: { available: true, startTime: '19:00', endTime: '22:00' },
      tuesday: { available: true, startTime: '19:00', endTime: '22:00' },
      wednesday: { available: true, startTime: '19:00', endTime: '22:00' },
      thursday: { available: true, startTime: '19:00', endTime: '22:00' },
      friday: { available: true, startTime: '19:00', endTime: '22:00' },
      saturday: { available: false, startTime: '', endTime: '' },
      sunday: { available: false, startTime: '', endTime: '' },
    },
    totalEarned: 28000, pendingAmount: 5000, completedProjects: 18,
    isVerified: true, badges: ['ID Verified', 'Skill Tested'], profileViews: 890, responseTime: 30,
  },
  {
    id: 'fl3', userId: 'u3', aliasName: 'Arjun M.', realName: 'Arjun Mehta',
    currentCompany: 'Wipro', currentRole: 'DevOps Lead',
    totalExp: 5, freelanceExp: 2, skills: ['Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'AWS', 'Jenkins'],
    hourlyRate: 28, currency: 'USD', country: 'India', timezone: 'IST (UTC+5:30)',
    bio: 'DevOps engineer building scalable infrastructure on AWS and Azure. Kubernetes certified.',
    rating: 4.9, reviewCount: 22, trustScore: 97, tier: 2, isAvailable: true,
    availability: {
      monday: { available: true, startTime: '20:00', endTime: '23:00' },
      tuesday: { available: false, startTime: '', endTime: '' },
      wednesday: { available: true, startTime: '20:00', endTime: '23:00' },
      thursday: { available: false, startTime: '', endTime: '' },
      friday: { available: true, startTime: '20:00', endTime: '23:00' },
      saturday: { available: true, startTime: '09:00', endTime: '17:00' },
      sunday: { available: true, startTime: '09:00', endTime: '13:00' },
    },
    totalEarned: 19000, pendingAmount: 840, completedProjects: 14,
    isVerified: true, badges: ['ID Verified', 'Skill Tested', 'BG Checked', 'Expert of Month'], profileViews: 720, responseTime: 20,
  },
  {
    id: 'fl4', userId: 'u4', aliasName: 'Sneha T.', realName: 'Sneha Trivedi',
    currentCompany: 'HCL', currentRole: 'QA Lead',
    totalExp: 7, freelanceExp: 1, skills: ['Selenium', 'Cypress', 'Jest', 'Postman', 'JIRA', 'Manual Testing'],
    hourlyRate: 22, currency: 'USD', country: 'India', timezone: 'IST (UTC+5:30)',
    bio: 'QA specialist with expertise in automation testing frameworks and CI/CD integration.',
    rating: 4.7, reviewCount: 15, trustScore: 82, tier: 1, isAvailable: false,
    availability: {
      monday: { available: false, startTime: '', endTime: '' },
      tuesday: { available: true, startTime: '18:00', endTime: '21:00' },
      wednesday: { available: true, startTime: '18:00', endTime: '21:00' },
      thursday: { available: false, startTime: '', endTime: '' },
      friday: { available: true, startTime: '18:00', endTime: '21:00' },
      saturday: { available: true, startTime: '10:00', endTime: '16:00' },
      sunday: { available: false, startTime: '', endTime: '' },
    },
    totalEarned: 8500, pendingAmount: 660, completedProjects: 9,
    isVerified: true, badges: ['ID Verified'], profileViews: 340, responseTime: 120,
  },
];

export const mockClients: Client[] = [
  { id: 'cl1', userId: 'uc1', companyName: 'ABC Corp', contactName: 'John Smith', industry: 'Fintech', country: 'USA', plan: 'starter', hoursUsed: 8, hoursIncluded: 10, totalSpent: 4992, activeProjects: 2 },
  { id: 'cl2', userId: 'uc2', companyName: 'XYZ Ltd', contactName: 'Sarah Chen', industry: 'E-commerce', country: 'Singapore', plan: 'growth', hoursUsed: 18, hoursIncluded: 25, totalSpent: 12800, activeProjects: 1 },
  { id: 'cl3', userId: 'uc3', companyName: 'TechSol', contactName: 'Raj Patel', industry: 'SaaS', country: 'UK', plan: 'payg', hoursUsed: 0, hoursIncluded: 0, totalSpent: 2100, activeProjects: 1 },
];

export const mockRequests: DemoRequest[] = [
  { id: 'req1', clientId: 'cl1', clientName: 'ABC Corp', freelancerId: 'fl1', freelancerName: 'Rahul S.', sessionType: 'demo', preferredDate: '2025-06-15', preferredTime: '19:00', budgetMin: 30, budgetMax: 40, currency: 'USD', description: 'Need React + AWS expertise for fintech dashboard. 3-month project ~20 hrs/week.', duration: 45, status: 'pending', createdAt: '2025-06-10T14:30:00Z' },
  { id: 'req2', clientId: 'cl2', clientName: 'XYZ Ltd', freelancerId: 'fl2', freelancerName: 'Priya K.', sessionType: 'interview', preferredDate: '2025-06-16', preferredTime: '20:00', budgetMin: 2000, budgetMax: 3000, currency: 'INR', description: 'ML pipeline for recommendation engine. Python expertise needed.', duration: 60, status: 'scheduled', createdAt: '2025-06-09T10:00:00Z' },
  { id: 'req3', clientId: 'cl3', clientName: 'TechSol', freelancerId: 'fl3', freelancerName: 'Arjun M.', sessionType: 'quick_support', preferredDate: '2025-06-10', preferredTime: '21:00', budgetMin: 25, budgetMax: 30, currency: 'USD', description: 'Kubernetes cluster setup urgent issue in production.', duration: 60, status: 'completed', createdAt: '2025-06-08T18:00:00Z' },
];

export const mockProjects: Project[] = [
  {
    id: 'proj1', name: 'Fintech Dashboard — Phase 1', clientId: 'cl1', clientName: 'ABC Corp',
    freelancerId: 'fl1', freelancerName: 'Rahul S.', description: 'Full-stack dashboard for transaction analytics',
    skills: ['React', 'Node.js', 'AWS'], hourlyRate: 32, currency: 'USD', estimatedHours: 200,
    loggedHours: 84, startDate: '2025-06-01', endDate: '2025-08-31', status: 'active', progress: 42,
    totalBudget: 6400, totalPaid: 2688, escrowBalance: 3712,
    milestones: [
      { id: 'm1', projectId: 'proj1', title: 'Auth & user mgmt module', description: '', dueDate: '2025-06-20', amount: 1600, status: 'approved' },
      { id: 'm2', projectId: 'proj1', title: 'Dashboard UI components', description: '', dueDate: '2025-07-15', amount: 2400, status: 'in_progress' },
      { id: 'm3', projectId: 'proj1', title: 'API integration & testing', description: '', dueDate: '2025-08-31', amount: 2400, status: 'pending' },
    ],
    createdAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'proj2', name: 'ML Recommendation Engine', clientId: 'cl2', clientName: 'XYZ Ltd',
    freelancerId: 'fl2', freelancerName: 'Priya K.', description: 'Product recommendation ML pipeline',
    skills: ['Python', 'ML', 'SQL'], hourlyRate: 2500, currency: 'INR', estimatedHours: 80,
    loggedHours: 12, startDate: '2025-06-08', endDate: '2025-07-31', status: 'active', progress: 15,
    totalBudget: 200000, totalPaid: 30000, escrowBalance: 170000,
    milestones: [
      { id: 'm4', projectId: 'proj2', title: 'Data pipeline setup', description: '', dueDate: '2025-06-25', amount: 50000, status: 'in_progress' },
      { id: 'm5', projectId: 'proj2', title: 'Model training & evaluation', description: '', dueDate: '2025-07-15', amount: 75000, status: 'pending' },
      { id: 'm6', projectId: 'proj2', title: 'API deployment', description: '', dueDate: '2025-07-31', amount: 75000, status: 'pending' },
    ],
    createdAt: '2025-06-08T00:00:00Z',
  },
];

export const mockTimesheets: Timesheet[] = [
  {
    id: 'ts1', projectId: 'proj1', projectName: 'Fintech Dashboard — Phase 1',
    freelancerId: 'fl1', freelancerName: 'Rahul S.',
    weekStart: '2025-06-09', weekEnd: '2025-06-13', totalHours: 16, totalAmount: 512, status: 'submitted',
    submittedAt: '2025-06-14T09:00:00Z',
    entries: [
      { id: 'te1', projectId: 'proj1', freelancerId: 'fl1', date: '2025-06-09', hours: 4, description: 'Auth module — JWT implementation', status: 'submitted' },
      { id: 'te2', projectId: 'proj1', freelancerId: 'fl1', date: '2025-06-10', hours: 5, description: 'API integration — user endpoints', status: 'submitted' },
      { id: 'te3', projectId: 'proj1', freelancerId: 'fl1', date: '2025-06-11', hours: 3, description: 'Dashboard UI — header + sidebar', status: 'submitted' },
      { id: 'te4', projectId: 'proj1', freelancerId: 'fl1', date: '2025-06-13', hours: 4, description: 'Bug fixes & code review', status: 'submitted' },
    ],
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv1', invoiceNumber: 'INV-2025-0047', projectId: 'proj1', clientId: 'cl1', clientName: 'ABC Corp',
    freelancerId: 'fl1', freelancerName: 'Rahul S.', timesheetIds: ['ts1'],
    lineItems: [
      { description: 'Rahul S. — Auth & API development (Mon–Tue)', hours: 9, rate: 32, amount: 288 },
      { description: 'Rahul S. — UI components + bug fixes (Wed–Fri)', hours: 7, rate: 32, amount: 224 },
    ],
    subtotal: 512, commission: 76.8, commissionRate: 15, total: 512, freelancerAmount: 435.2,
    currency: 'USD', status: 'pending', issuedAt: '2025-06-14T00:00:00Z', dueAt: '2025-06-21T00:00:00Z',
  },
];

export const mockPayments: Payment[] = [
  { id: 'pay1', invoiceId: 'inv-prev1', clientId: 'cl1', freelancerId: 'fl1', amount: 1024, commission: 153.6, freelancerAmount: 870.4, currency: 'USD', status: 'paid', method: 'Bank Transfer', transactionId: 'TXN-8823', createdAt: '2025-05-15T00:00:00Z', paidAt: '2025-05-16T00:00:00Z' },
  { id: 'pay2', invoiceId: 'inv1', clientId: 'cl1', freelancerId: 'fl1', amount: 512, commission: 76.8, freelancerAmount: 435.2, currency: 'USD', status: 'pending', method: 'Bank Transfer', createdAt: '2025-06-14T00:00:00Z' },
  { id: 'pay3', invoiceId: 'inv-cl3', clientId: 'cl3', freelancerId: 'fl3', amount: 1400, commission: 210, freelancerAmount: 1190, currency: 'USD', status: 'overdue', method: 'Wire', createdAt: '2025-05-28T00:00:00Z' },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', userId: 'admin', type: 'request', title: 'New demo request', message: 'ABC Corp requested a demo with Rahul S. for June 15, 7 PM.', isRead: false, actionUrl: '/admin/requests/req1', createdAt: '2025-06-10T14:30:00Z' },
  { id: 'n2', userId: 'admin', type: 'payment', title: 'Payment overdue', message: 'TechSol invoice INV-2025-0039 is 7 days overdue. Amount: $1,400.', isRead: false, actionUrl: '/admin/payments', createdAt: '2025-06-09T00:00:00Z' },
  { id: 'n3', userId: 'admin', type: 'timesheet', title: 'Timesheet submitted', message: 'Rahul S. submitted timesheet for week of June 9. 16 hours logged.', isRead: true, actionUrl: '/admin/timesheets', createdAt: '2025-06-14T09:00:00Z' },
  { id: 'n4', userId: 'fl1', type: 'payment', title: 'Payment received', message: 'You received $870.40 for the week of June 1.', isRead: false, createdAt: '2025-05-16T10:00:00Z' },
  { id: 'n5', userId: 'fl1', type: 'approval', title: 'Timesheet approved', message: 'Your timesheet for week of June 9 has been approved by ABC Corp.', isRead: false, createdAt: '2025-06-14T16:00:00Z' },
];

export const mockStats: Stats = {
  totalRevenue: 18400, activeProjects: 24, pendingRequests: 8,
  platformCommission: 2760, totalFreelancers: 142, totalClients: 89,
  avgRating: 4.85, revenueGrowth: 12,
};

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, freelancerId: 'fl1', freelancerName: 'Rahul S.', earnings: 4200, rating: 4.9, completedProjects: 8, badge: 'Top Earner' },
  { rank: 2, freelancerId: 'fl-v', freelancerName: 'Vikram R.', earnings: 3800, rating: 4.8, completedProjects: 6, badge: 'Rising Star' },
  { rank: 3, freelancerId: 'fl2', freelancerName: 'Priya K.', earnings: 3200, rating: 4.8, completedProjects: 5, badge: '5-Star Streak' },
  { rank: 4, freelancerId: 'fl3', freelancerName: 'Arjun M.', earnings: 2940, rating: 4.9, completedProjects: 4 },
  { rank: 5, freelancerId: 'fl4', freelancerName: 'Sneha T.', earnings: 2100, rating: 4.7, completedProjects: 3 },
];
