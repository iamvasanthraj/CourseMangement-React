import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navigation from './components/layout/Navigation'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import Dashboard from './components/dashboard/shared/Dashboard' // Fixed: Only one Dashboard import
import MyEnrollments from './components/dashboard/student/MyEnrollments' // Add this import
import MyCourses from './components/dashboard/instructor/MyCourses';
import TestPage from './components/test/TestPage'
import TestResults from './components/test/TestResults'
import ErrorBoundary from './components/shared/ErrorBoundary'
import './App.css'

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

const PublicRoute = ({ children }) => {
  const { user } = useAuth()
  return !user ? children : <Navigate to="/dashboard" />
}

const NotFound = () => {
  const { user } = useAuth()
  return <Navigate to={user ? "/dashboard" : "/login"} replace />
}

const AppLayout = () => {
  const location = useLocation()
  const { user } = useAuth()
  
  const hideNavigation = ['/login', '/signup'].includes(location.pathname)
  
  return (
    <div className={`app-container ${hideNavigation ? 'auth-layout' : 'dashboard-layout'}`}>
      {!hideNavigation && user && <Navigation />}
      
      <main className={`main-content ${hideNavigation ? 'full-screen' : 'with-sidebar'}`}>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

            {/* Student Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/my-enrollments" element={<ProtectedRoute><MyEnrollments /></ProtectedRoute>} /> {/* Add this route */}
            
            {/* Test Routes */}
            <Route path="/test" element={<ProtectedRoute><TestPage /></ProtectedRoute>} />
            <Route path="/test-results" element={<ProtectedRoute><TestResults /></ProtectedRoute>} />
            
            {/* Instructor Route (if needed) */}
            <Route path="/enrollments" element={<ProtectedRoute><div>Instructor Courses Page</div></ProtectedRoute>} />
            <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
            
            {/* Catch-all Route */} 
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