import { createContext, useState, useContext } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(localStorage.getItem('token') || null)

 const login = (responseData) => {
  console.log('🔑 AuthContext login called with:', responseData);
  
  // Create user object from API response
  const userData = {
    userId: responseData.userId,
    username: responseData.username,
    email: responseData.email,
    role: responseData.role
  };
  
  console.log('✅ Setting user data:', userData);
  
  setUser(userData);
  setToken(null); // No token since you removed JWT
  
  localStorage.setItem('user', JSON.stringify(userData));
  localStorage.removeItem('token'); // Clean up any old tokens
}
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const value = {
    user,
    token,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}