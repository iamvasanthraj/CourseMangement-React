import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { 
  Login, 
  Signup, 
  Dashboard, 
  Navigation, 
  ErrorBoundary, 
  TestPage
  // Removed EnrollmentsPage from this import
} from './components'
// Import EnrollmentsPage directly
import EnrollmentsPage from './components/dashboard/EnrollmentsPage'
import './styles/variables.css';
import './App.css';
import './styles/auth.css';
import './styles/dashboard.css';
import './styles/components.css';
import './styles/modal.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { user } = useAuth()
  return !user ? children : <Navigate to="/dashboard" />
}

// 404 Component
const NotFound = () => {
  const { user } = useAuth()
  return (
    <div className="page-not-found">
      <h2>404 - Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <Navigate to={user ? "/dashboard" : "/login"} replace />
    </div>
  )
}

// Layout component that conditionally shows navigation
const AppLayout = () => {
  const location = useLocation()
  const { user } = useAuth()
  
  // Don't show navigation on login and signup pages only
  // Dashboard now handles its own navigation internally
  const hideNavigation = ['/login', '/signup'].includes(location.pathname)
  
  return (
    <div id="quantum-dashboard" className={`app-container ${hideNavigation ? 'auth-layout' : 'dashboard-layout'}`}>
      {!hideNavigation && user && (
        <aside className="sidebar">
          <Navigation />
        </aside>
      )}
      
      <main className={`main-content ${hideNavigation ? 'full-screen' : 'with-sidebar'}`}>
        <ErrorBoundary>
          <Routes>
            {/* Default route */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            {/* Public routes - no navigation */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            
            <Route path="/signup" element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } />

            {/* Protected routes - Dashboard handles its own layout */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/test" element={
              <ProtectedRoute>
                <TestPage />
              </ProtectedRoute>
            } />

            {/* ✅ Added Enrollments Page Route */}
            <Route path="/enrollments" element={
              <ProtectedRoute>
                <EnrollmentsPage />
              </ProtectedRoute>
            } />
  
            {/* 404 fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  )
}

export default App