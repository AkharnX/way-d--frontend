import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import SecurityProvider from './components/SecurityProvider';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EmailVerification from './pages/EmailVerification';
import Dashboard from './pages/Dashboard';
import Discovery from './pages/Discovery';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import CreateProfile from './pages/CreateProfile';
import EditProfile from './pages/EditProfile';
import Settings from './pages/Settings';

function App() {
  return (
    <ErrorBoundary>
      <SecurityProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<EmailVerification />} />
                
                {/* Profile management routes */}
                <Route path="/create-profile" element={
                  <ProtectedRoute>
                    <CreateProfile />
                  </ProtectedRoute>
                } />
                <Route path="/edit-profile" element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              } />
              
              {/* Protected routes with layout */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="discovery" element={<Discovery />} />
                <Route path="messages" element={<Messages />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Direct access routes (also protected) */}
              <Route path="/discovery" element={
                <ProtectedRoute>
                  <Discovery />
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              {/* Redirect old dashboard route */}
              <Route path="/dashboard" element={<Navigate to="/app" replace />} />
              
              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </SecurityProvider>
    </ErrorBoundary>
  );
}

export default App;