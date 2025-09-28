import { useState } from 'react'
import { authAPI } from '../../services/api'
import { useNavigate, Link } from 'react-router-dom'

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    role: 'STUDENT'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, text: '' })
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    if (name === 'password') {
      checkPasswordStrength(value)
    }
    
    if (error) setError('')
  }

  const checkPasswordStrength = (password) => {
    let strength = 0
    let text = ''

    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1

    if (strength === 0) text = ''
    else if (strength === 1) text = 'Weak'
    else if (strength <= 3) text = 'Medium'
    else text = 'Strong'

    setPasswordStrength({ strength, text })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (passwordStrength.strength < 2) {
      setError('Please choose a stronger password')
      setLoading(false)
      return
    }

    try {
      await authAPI.signup(formData)
      navigate('/login?message=signup_success')
    } catch (error) {
      setError(error.response?.data?.error || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-glass auth-floating">
        <div className="auth-header">
          <div className="auth-icon">🚀</div>
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join thousands of learners worldwide</p>
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
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="auth-form-group">
            <span className="auth-input-icon">📧</span>
            <input
              type="email"
              name="email"
              className="auth-input"
              placeholder="Enter your email"
              value={formData.email}
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
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className={`strength-fill ${passwordStrength.text.toLowerCase()}`}
                    style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                  ></div>
                </div>
                <div className="strength-text">
                  Password strength: {passwordStrength.text}
                </div>
              </div>
            )}
          </div>

          <div className="role-selection">
            <div className="role-option">
              <input
                type="radio"
                name="role"
                value="STUDENT"
                id="role-student"
                checked={formData.role === 'STUDENT'}
                onChange={handleChange}
                disabled={loading}
              />
              <label htmlFor="role-student" className="role-label">
                <span className="role-icon">👨‍🎓</span>
                <span className="role-name">Student</span>
                <span className="role-description">Learn and grow</span>
              </label>
            </div>

            <div className="role-option">
              <input
                type="radio"
                name="role"
                value="INSTRUCTOR"
                id="role-instructor"
                checked={formData.role === 'INSTRUCTOR'}
                onChange={handleChange}
                disabled={loading}
              />
              <label htmlFor="role-instructor" className="role-label">
                <span className="role-icon">👨‍🏫</span>
                <span className="role-name">Instructor</span>
                <span className="role-description">Teach and inspire</span>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className={`auth-btn ${loading ? 'auth-btn-loading' : ''}`}
            disabled={loading}
          >
            {loading ? '' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? 
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Signup