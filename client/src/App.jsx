import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Layout from './components/Layout';

import FounderDashboard from './pages/founder/FounderDashboard';
import SubmitStartup from './pages/founder/SubmitStartup';
import StartupDetail from './pages/founder/StartupDetail';
import BrowseMentors from './pages/founder/BrowseMentors';
import FounderMessages from './pages/founder/FounderMessages';
import FounderMeetings from './pages/founder/FounderMeetings';

import MentorDashboard from './pages/mentor/MentorDashboard';
import MentorStartups from './pages/mentor/MentorStartups';
import MentorRequests from './pages/mentor/MentorRequests';
import MentorStartupDetail from './pages/mentor/MentorStartupDetail';

import InvestorDashboard from './pages/investor/InvestorDashboard';
import BrowseStartups from './pages/investor/BrowseStartups';
import InvestorStartupDetail from './pages/investor/InvestorStartupDetail';
import InvestorMeetings from './pages/investor/InvestorMeetings';
import InvestorMessages from './pages/investor/InvestorMessages';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStartups from './pages/admin/AdminStartups';
import AdminAuditLog from './pages/admin/AdminAuditLog';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-canvas">
      <span className="spinner w-7 h-7" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function DashboardRedirect() {
  const { user } = useAuth();
  const routes = { FOUNDER: '/founder', MENTOR: '/mentor', INVESTOR: '/investor', ADMIN: '/admin' };
  return <Navigate to={routes[user?.role] || '/login'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NotificationProvider>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

            <Route path="/founder" element={<ProtectedRoute roles={['FOUNDER']}><Layout /></ProtectedRoute>}>
              <Route index element={<FounderDashboard />} />
              <Route path="submit" element={<SubmitStartup />} />
              <Route path="startup/:id" element={<StartupDetail />} />
              <Route path="mentors" element={<BrowseMentors />} />
              <Route path="messages" element={<FounderMessages />} />
              <Route path="messages/:userId" element={<FounderMessages />} />
              <Route path="meetings" element={<FounderMeetings />} />
            </Route>

            <Route path="/mentor" element={<ProtectedRoute roles={['MENTOR']}><Layout /></ProtectedRoute>}>
              <Route index element={<MentorDashboard />} />
              <Route path="startups" element={<MentorStartups />} />
              <Route path="startups/:id" element={<MentorStartupDetail />} />
              <Route path="requests" element={<MentorRequests />} />
            </Route>

            <Route path="/investor" element={<ProtectedRoute roles={['INVESTOR']}><Layout /></ProtectedRoute>}>
              <Route index element={<InvestorDashboard />} />
              <Route path="startups" element={<BrowseStartups />} />
              <Route path="startups/:id" element={<InvestorStartupDetail />} />
              <Route path="meetings" element={<InvestorMeetings />} />
              <Route path="messages" element={<InvestorMessages />} />
              <Route path="messages/:userId" element={<InvestorMessages />} />
            </Route>

            <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><Layout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="startups" element={<AdminStartups />} />
              <Route path="audit" element={<AdminAuditLog />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </NotificationProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
