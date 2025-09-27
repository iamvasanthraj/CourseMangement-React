import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import Login from './components/Login'
import Signup from './components/Signup'
import Dashboard from './components/Dashboard'
import Navigation from './components/Navigation'
import CourseCard from './components/CourseCard'
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App