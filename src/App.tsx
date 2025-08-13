import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import SecurityProvider from './components/SecurityProvider';
import ProtectedRoute from './components/ProtectedRoute';
import ProfileRequiredRoute from './components/ProfileRequiredRoute';
import AppLayout from './components/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';
import ServiceStatus from './components/ServiceStatus';

// Analytics wrapper component
import AnalyticsWrapper from './components/AnalyticsWrapper';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import EmailVerification from './pages/EmailVerification';
import Dashboard from './pages/Dashboard';
import ModernDiscovery from './pages/ModernDiscovery';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import CreateProfile from './pages/CreateProfile';
import EditProfile from './pages/EditProfile';
import Events from './pages/Events';
import AdminDashboard from './pages/AdminDashboard';
import PostLoginRedirect from './components/PostLoginRedirect';
import Settings from './pages/Settings';
import ProfileFeaturesDemo from './pages/ProfileFeaturesDemo';
import TokenDiagnostic from './components/TokenDiagnostic';
import RequestLogsViewer from './components/RequestLogsViewer';

function App() {
  return (
    <ErrorBoundary>
      <SecurityProvider>
        <AuthProvider>
          <Router>
            <AnalyticsWrapper>
              <div className="App">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/verify-email" element={<EmailVerification />} />
                  <Route path="/post-login-redirect" element={
                    <ProtectedRoute>
                      <PostLoginRedirect />
                    </ProtectedRoute>
                  } />
                  
                  {/* Profile management routes - Special case for create-profile (no navigation needed) */}
                  <Route path="/create-profile" element={
                    <ProtectedRoute>
                      <CreateProfile />
                    </ProtectedRoute>
                  } />
                  
                  {/* Protected routes with layout - REQUIRE COMPLETE PROFILE */}
                  <Route path="/app" element={
                    <ProtectedRoute>
                      <ProfileRequiredRoute>
                        <AppLayout />
                      </ProfileRequiredRoute>
                    </ProtectedRoute>
                  }>
                    <Route index element={<Dashboard />} />
                    <Route path="discovery" element={<ModernDiscovery />} />
                    <Route path="events" element={<Events />} />
                    <Route path="messages" element={<Messages />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="edit-profile" element={<EditProfile />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="profile-features-demo" element={<ProfileFeaturesDemo />} />
                  </Route>

                  {/* Legacy route redirects to maintain compatibility */}
                  <Route path="/discovery" element={<Navigate to="/app/discovery" replace />} />
                  <Route path="/discovery-old" element={<Navigate to="/app/discovery" replace />} />
                  <Route path="/events" element={<Navigate to="/app/events" replace />} />
                  <Route path="/messages" element={<Navigate to="/app/messages" replace />} />
                  <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
                  <Route path="/edit-profile" element={<Navigate to="/app/edit-profile" replace />} />
                  <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
                  
                  {/* Redirect old dashboard route */}
                  <Route path="/dashboard" element={<Navigate to="/app" replace />} />
                  
                  {/* Admin routes */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  
                  {/* Debug routes */}
                  <Route path="/token-diagnostic" element={<TokenDiagnostic />} />
                  <Route path="/request-logs" element={<RequestLogsViewer />} />
                  
                  {/* Catch all - redirect to home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                
                {/* Service Status Indicator */}
                <ServiceStatus />
              </div>
            </AnalyticsWrapper>
          </Router>
        </AuthProvider>
      </SecurityProvider>
    </ErrorBoundary>
  );
}

export default App;