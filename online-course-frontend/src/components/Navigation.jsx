import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Navigation = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login') // Redirect after logout
  }

  return (
    <nav style={{
      background: 'rgba(255, 255, 255, 0.95)',
      padding: '1rem 2rem',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <h1 style={{ 
        color: '#3a0ca3', 
        margin: 0,
        fontSize: '1.5rem',
        fontWeight: '700'
      }}>
        🎓 CourseMaster
      </h1>
      
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ 
            color: '#4361ee',
            fontWeight: '600'
          }}>
            Welcome, {user.username} ({user.role})
          </span>
          <button 
            onClick={handleLogout}
            style={{
              background: 'linear-gradient(135deg, #f72585, #b5179e)',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}

export default Navigation