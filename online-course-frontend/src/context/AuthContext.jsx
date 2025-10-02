import { createContext, useState, useContext } from 'react'
import { usersAPI } from '../services/api'

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
      const savedUser = JSON.parse(localStorage.getItem('user')) || null
      console.log('🔍 Loaded user from localStorage:', savedUser)
      return savedUser
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(localStorage.getItem('token') || null)

  const login = (responseData) => {
    console.log('🔑 AuthContext login called with:', responseData);
    
    // Create user object from API response - handle both field naming conventions
    const userData = {
      id: responseData.id || responseData.userId, // Support both 'id' and 'userId'
      userId: responseData.id || responseData.userId, // Keep both for compatibility
      username: responseData.username || responseData.name, // Support both 'username' and 'name'
      name: responseData.name || responseData.username,
      email: responseData.email,
      role: responseData.role,
      avatar: responseData.avatarIndex !== undefined ? responseData.avatarIndex : (responseData.avatar || 0), // Support avatarIndex from backend
      createdAt: responseData.createdAt
    };
    
    console.log('✅ Setting user data:', userData);
    
    setUser(userData);
    setToken(null);
    
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.removeItem('token');
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  // ✅ UPDATED: Fixed updateProfile function
  const updateProfile = async (profileData) => {
    try {
      console.log('📝 Updating profile with:', profileData);
      
      if (!user?.id && !user?.userId) {
        throw new Error('User not authenticated');
      }

      const userId = user.id || user.userId;
      
      // Call your backend API to update the profile
      const response = await usersAPI.update(userId, profileData);
      
      console.log('🔍 Backend update response:', response);
      
      // Check if we got a valid user object back from backend
      if (response && response.id) {
        // Update local user state - map backend fields to frontend
        const updatedUser = {
          ...user,
          id: response.id,
          userId: response.id,
          username: response.name, // Backend uses 'name', frontend uses 'username'
          name: response.name,
          email: response.email,
          avatar: response.avatarIndex !== undefined ? response.avatarIndex : user.avatar,
          role: response.role,
          createdAt: response.createdAt
        };
        
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        console.log('✅ Profile updated successfully');
        return { 
          success: true, 
          message: 'Profile updated successfully',
          user: updatedUser 
        };
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      throw error;
    }
  }

  // ✅ UPDATED: Fixed changePassword function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      console.log('🔐 Changing password...');
      
      if (!user?.id && !user?.userId) {
        throw new Error('User not authenticated');
      }

      const userId = user.id || user.userId;
      
      // Call your backend API to change password
      const response = await usersAPI.changePassword(userId, {
        currentPassword,
        newPassword
      });
      
      console.log('🔍 Password change response:', response);
      
      // Backend returns { "message": "...", "success": true/false }
      if (response && response.success) {
        console.log('✅ Password changed successfully');
        return response;
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('❌ Error changing password:', error);
      throw error;
    }
  }

  // ✅ ADD: Update avatar function
  const updateAvatar = async (avatarIndex) => {
    try {
      console.log('🖼️ Updating avatar to:', avatarIndex);
      
      if (!user?.id && !user?.userId) {
        throw new Error('User not authenticated');
      }

      const userId = user.id || user.userId;
      
      // Call your backend API to update avatar
      const response = await usersAPI.updateAvatar(userId, avatarIndex);
      
      console.log('🔍 Avatar update response:', response);
      
      if (response && response.id) {
        // Update local user state
        const updatedUser = {
          ...user,
          avatar: response.avatarIndex !== undefined ? response.avatarIndex : avatarIndex
        };
        
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        console.log('✅ Avatar updated successfully');
        return { 
          success: true, 
          message: 'Avatar updated successfully',
          user: updatedUser 
        };
      } else {
        throw new Error('Failed to update avatar on server');
      }
    } catch (error) {
      console.error('❌ Error updating avatar:', error);
      throw error;
    }
  }

  const value = {
    user,
    token,
    login,
    logout,
    updateProfile,
    changePassword,
    updateAvatar // ✅ ADD: Export the new function
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}