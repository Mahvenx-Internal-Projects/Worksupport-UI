import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import AppLayout from './components/layout/AppLayout';
import { ENV } from './config/env';

// Public pages
import HomePage from './pages/public/HomePage';
import { TermsPage, PrivacyPage } from './pages/public/LegalPages';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRequests from './pages/admin/AdminRequests';
import { AdminMeetings, AdminProjects, AdminTimesheets, AdminInvoices, AdminPayments, AdminFreelancers, AdminLeaderboard, AdminClients, AdminReports } from './pages/admin/AdminPages';

// Freelancer pages
import AdminSupport from './pages/admin/AdminSupport';
import AgentPortal from './pages/agent/AgentPortal';
import { FreelancerDashboard, FreelancerProfile, FreelancerTimesheets, FreelancerEarnings, FreelancerStandups, FreelancerMeetings, FreelancerAssignments } from './pages/freelancer/FreelancerPages';
import CompleteProfilePage from './pages/freelancer/CompleteProfilePage';

// Client pages
import { ClientDashboard, ClientBrowse, ClientProjects, ClientInvoices, ClientFeedback, ClientTimesheets } from './pages/client/ClientPages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

const Protected: React.FC<{ children: React.ReactNode; role?: string }> = ({ children, role }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace/>;
  if (role && user?.role !== role) return <Navigate to="/login" replace/>;
  return <AppLayout>{children}</AppLayout>;
};

const AppInner: React.FC = () => {
  const { isAuthenticated, user, hydrate } = useAuthStore();

  // Restore auth on app load
  useEffect(() => { hydrate(); }, [hydrate]);

  const redirect = user?.role === 'admin' ? '/admin' : user?.role === 'freelancer' ? '/freelancer' : '/client';

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage/>}/>
        <Route path="/login" element={isAuthenticated ? <Navigate to={redirect} replace/> : <LoginPage/>}/>
        <Route path="/register" element={<RegisterPage/>}/>

        {/* Admin */}
        <Route path="/admin" element={<Protected role="admin"><AdminDashboard/></Protected>}/>
        <Route path="/admin/support" element={<Protected role="admin"><AdminSupport/></Protected>}/>
        <Route path="/agent" element={<Protected role="agent"><AgentPortal/></Protected>}/>
        <Route path="/admin/requests" element={<Protected role="admin"><AdminRequests/></Protected>}/>
        <Route path="/admin/meetings" element={<Protected role="admin"><AdminMeetings/></Protected>}/>
        <Route path="/admin/projects" element={<Protected role="admin"><AdminProjects/></Protected>}/>
        <Route path="/admin/timesheets" element={<Protected role="admin"><AdminTimesheets/></Protected>}/>
        <Route path="/admin/invoices" element={<Protected role="admin"><AdminInvoices/></Protected>}/>
        <Route path="/admin/payments" element={<Protected role="admin"><AdminPayments/></Protected>}/>
        <Route path="/admin/freelancers" element={<Protected role="admin"><AdminFreelancers/></Protected>}/>
        <Route path="/admin/clients" element={<Protected role="admin"><AdminClients/></Protected>}/>
        <Route path="/admin/leaderboard" element={<Protected role="admin"><AdminLeaderboard/></Protected>}/>
        <Route path="/admin/reports" element={<Protected role="admin"><AdminReports/></Protected>}/>

        {/* Freelancer */}
        <Route path="/freelancer/complete-profile" element={<Protected role="freelancer"><CompleteProfilePage/></Protected>}/>
        <Route path="/freelancer" element={<Protected role="freelancer"><FreelancerDashboard/></Protected>}/>
        <Route path="/freelancer/profile" element={<Protected role="freelancer"><FreelancerProfile/></Protected>}/>
        <Route path="/freelancer/assignments" element={<Protected role="freelancer"><FreelancerAssignments/></Protected>}/>
        <Route path="/freelancer/timesheets" element={<Protected role="freelancer"><FreelancerTimesheets/></Protected>}/>
        <Route path="/freelancer/standups" element={<Protected role="freelancer"><FreelancerStandups/></Protected>}/>
        <Route path="/freelancer/earnings" element={<Protected role="freelancer"><FreelancerEarnings/></Protected>}/>
        <Route path="/freelancer/meetings" element={<Protected role="freelancer"><FreelancerMeetings/></Protected>}/>
        <Route path="/freelancer/certifications" element={<Protected role="freelancer"><FreelancerProfile/></Protected>}/>

        {/* Client */}
        <Route path="/client" element={<Protected role="client"><ClientDashboard/></Protected>}/>
        <Route path="/client/browse" element={<Protected role="client"><ClientBrowse/></Protected>}/>
        <Route path="/client/projects" element={<Protected role="client"><ClientProjects/></Protected>}/>
        <Route path="/client/requests" element={<Protected role="client"><ClientBrowse/></Protected>}/>
        <Route path="/client/meetings" element={<Protected role="client"><ClientDashboard/></Protected>}/>
        <Route path="/client/timesheets" element={<Protected role="client"><ClientTimesheets/></Protected>}/>
        <Route path="/client/invoices" element={<Protected role="client"><ClientInvoices/></Protected>}/>
        <Route path="/client/payments" element={<Protected role="client"><ClientInvoices/></Protected>}/>
        <Route path="/client/feedback" element={<Protected role="client"><ClientFeedback/></Protected>}/>

        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </BrowserRouter>
  );
};

const App: React.FC = () => (
  <GoogleOAuthProvider clientId={ENV.GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <AppInner/>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { borderRadius: '12px', fontSize: '14px' } }}/>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;
