import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import AppLayout from './components/layout/AppLayout';
import { useAuthStore } from './store/authStore';
import { ENV } from './config/env';

// Pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import { TermsPage, PrivacyPage } from './pages/public/LegalPages';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRequirements from './pages/admin/AdminRequirements';
import AdminSupport from './pages/admin/AdminSupport';
import AdminRequests from './pages/admin/AdminRequests';
import AdminMeetings from './pages/admin/AdminMeetings';
import { AdminProjects, AdminTimesheets, AdminInvoices, AdminPayments, AdminFreelancers, AdminClients, AdminLeaderboard, AdminReports, AdminAttendance } from './pages/admin/AdminPages';
import AgentPortal from './pages/agent/AgentPortal';
import ExpertPage from './pages/public/ExpertPage';
import { FreelancerDashboard, FreelancerAssignments, FreelancerTimesheets, FreelancerMeetings, FreelancerEarnings, FreelancerProfile, FreelancerStandups, FreelancerApplications } from './pages/freelancer/FreelancerPages';
import CompleteProfilePage from './pages/freelancer/CompleteProfilePage';
import PostRequirementPage from './pages/public/PostRequirementPage';
import { ClientDashboard, ClientRequirements, ClientBrowse, ClientProjects, ClientTimesheets, ClientInvoices, ClientFeedback } from './pages/client/ClientPages';

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30000 } } });

// ── Protected route — NO AppLayout for agent role ─────────────
const Protected: React.FC<{ children: React.ReactNode; role?: string }> = ({ children, role }) => {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace/>;
  if (role && user?.role !== role) {
    // Allow admin to access agent routes
    if (!(role === 'agent' && (user?.role as string) === 'admin')) {
      return <Navigate to="/" replace/>;
    }
  }
  // Agent and admin accessing /agent get NO AppLayout — standalone portal
  if ((user?.role as string) === 'agent') return <>{children}</>;
  return <AppLayout>{children}</AppLayout>;
};

// ── Auto-redirect after login ──────────────────────────────────
const AutoRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const path = user.role === 'admin' ? '/admin'
      : (user.role as string) === 'agent' ? '/agent'
      : user.role === 'freelancer' ? '/freelancer'
      : '/client';
    navigate(path, { replace: true });
  }, [isAuthenticated, user, navigate]);
  return null;
};

function App() {
  const { hydrate } = useAuthStore();
  useEffect(() => { hydrate(); }, []);

  return (
    <QueryClientProvider client={qc}>
      <GoogleOAuthProvider clientId={ENV.GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }}/>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/post-requirement" element={<PostRequirementPage/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
            <Route path="/terms" element={<TermsPage/>}/>
            <Route path="/privacy" element={<PrivacyPage/>}/>

            {/* Expert full page — public */}
            <Route path="/expert/:id" element={<ExpertPage/>}/>

            {/* Agent — standalone, NO sidebar */}
            <Route path="/agent" element={<Protected role="agent"><AgentPortal/></Protected>}/>

            {/* Admin */}
            <Route path="/admin" element={<Protected role="admin"><AdminDashboard/></Protected>}/>
            <Route path="/admin/support" element={<Protected role="admin"><AdminSupport/></Protected>}/>
            <Route path="/admin/requests" element={<Protected role="admin"><AdminRequests/></Protected>}/>
            <Route path="/admin/requirements" element={<Protected role="admin"><AdminRequirements/></Protected>}/>
            <Route path="/admin/meetings" element={<Protected role="admin"><AdminMeetings/></Protected>}/>
            <Route path="/admin/projects" element={<Protected role="admin"><AdminProjects/></Protected>}/>
            <Route path="/admin/timesheets" element={<Protected role="admin"><AdminTimesheets/></Protected>}/>
            <Route path="/admin/invoices" element={<Protected role="admin"><AdminInvoices/></Protected>}/>
            <Route path="/admin/payments" element={<Protected role="admin"><AdminPayments/></Protected>}/>
            <Route path="/admin/freelancers" element={<Protected role="admin"><AdminFreelancers/></Protected>}/>
            <Route path="/admin/clients" element={<Protected role="admin"><AdminClients/></Protected>}/>
            <Route path="/admin/leaderboard" element={<Protected role="admin"><AdminLeaderboard/></Protected>}/>
            <Route path="/admin/reports" element={<Protected role="admin"><AdminReports/></Protected>}/>
            <Route path="/admin/attendance" element={<Protected role="admin"><AdminAttendance/></Protected>}/>

            {/* Freelancer */}
            <Route path="/freelancer" element={<Protected role="freelancer"><FreelancerDashboard/></Protected>}/>
            <Route path="/freelancer/assignments" element={<Protected role="freelancer"><FreelancerAssignments/></Protected>}/>
            <Route path="/freelancer/timesheets" element={<Protected role="freelancer"><FreelancerTimesheets/></Protected>}/>
            <Route path="/freelancer/meetings" element={<Protected role="freelancer"><FreelancerMeetings/></Protected>}/>
            <Route path="/freelancer/earnings" element={<Protected role="freelancer"><FreelancerEarnings/></Protected>}/>
            <Route path="/freelancer/profile" element={<Protected role="freelancer"><FreelancerProfile/></Protected>}/>
            <Route path="/freelancer/standups" element={<Protected role="freelancer"><FreelancerStandups/></Protected>}/>
            <Route path="/freelancer/applications" element={<Protected role="freelancer"><FreelancerApplications/></Protected>}/>
            <Route path="/freelancer/complete-profile" element={<Protected role="freelancer"><CompleteProfilePage/></Protected>}/>

            {/* Client */}
            <Route path="/client" element={<Protected role="client"><ClientDashboard/></Protected>}/>
            <Route path="/client/requirements" element={<Protected role="client"><ClientRequirements/></Protected>}/>
            <Route path="/client/browse" element={<Protected role="client"><ClientBrowse/></Protected>}/>
            <Route path="/client/projects" element={<Protected role="client"><ClientProjects/></Protected>}/>
            <Route path="/client/timesheets" element={<Protected role="client"><ClientTimesheets/></Protected>}/>
            <Route path="/client/invoices" element={<Protected role="client"><ClientInvoices/></Protected>}/>
            <Route path="/client/feedback" element={<Protected role="client"><ClientFeedback/></Protected>}/>

            <Route path="*" element={<Navigate to="/" replace/>}/>
          </Routes>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
