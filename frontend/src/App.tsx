import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, UserRole } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import CounselorDashboard from './pages/ConsoleDashboard';
import UserDashboard from './pages/UserDashboard';

function getDashboardPath(role: UserRole) {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'counselor':
      return '/counselor';
    case 'user':
    default:
      return '/dashboard';
  }
}

function RoleProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <>{children}</>;
}

// Landing Page (when not logged in)
function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold mb-4">MindfulSpace</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Your personal mental wellness companion
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/login" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
            Sign In
          </a>
          <a href="/signup" className="px-6 py-3 border border-input rounded-lg hover:bg-accent">
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}

// Main App Content
function AppContent() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={user ? getDashboardPath(user.role) : '/'} replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to={user ? getDashboardPath(user.role) : '/'} replace /> : <Signup />}
      />

      <Route
        path="/admin"
        element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/counselor"
        element={
          <RoleProtectedRoute allowedRoles={['counselor']}>
            <CounselorDashboard />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={['user']}>
            <UserDashboard />
          </RoleProtectedRoute>
        }
      />

      <Route path="/" element={isAuthenticated && user ? <Navigate to={getDashboardPath(user.role)} replace /> : <LandingPage />} />
      <Route path="*" element={<Navigate to={isAuthenticated && user ? getDashboardPath(user.role) : '/'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}