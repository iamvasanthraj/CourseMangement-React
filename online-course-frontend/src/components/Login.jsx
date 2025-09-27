import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { useNavigate, Link } from 'react-router-dom'

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authAPI.login(formData)
      login(response.data, rememberMe)
      navigate('/dashboard')
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = (role) => {
    const demoAccounts = {
      student: { username: 'Student', password: 'demo123456789' },
      instructor: { username: 'Instructor', password: 'demo123456789' }
    }
    
    setFormData(demoAccounts[role])
  }

  return (
    <div className="auth-container">
      <div className="auth-glass auth-floating">
        <div className="auth-header">
          <div className="auth-icon">🎓</div>
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your account to continue learning</p>
        </div>

        {error && (
          <div className="auth-message error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <span className="auth-input-icon">👤</span>
            <input
              type="text"
              name="username"
              className="auth-input"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="auth-form-group">
            <span className="auth-input-icon">🔒</span>
            <input
              type="password"
              name="password"
              className="auth-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="auth-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <button 
            type="submit" 
            className={`auth-btn ${loading ? 'auth-btn-loading' : ''}`}
            disabled={loading}
          >
            {loading ? '' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider">
          <span>Or try demo</span>
        </div>

        <div className="social-auth">
          <button 
            type="button"
            className="social-btn"
            onClick={() => handleDemoLogin('student')}
            disabled={loading}
          >
            👨‍🎓 Student Demo
          </button>
          <button 
            type="button"
            className="social-btn"
            onClick={() => handleDemoLogin('instructor')}
            disabled={loading}
          >
            👨‍🏫 Instructor Demo
          </button>
        </div>

        <div className="auth-footer">
          Don't have an account? 
          <Link to="/signup" className="auth-link">
            Create account
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login