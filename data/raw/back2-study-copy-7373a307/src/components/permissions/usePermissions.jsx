import { useState, useEffect } from 'react';
import { User } from '@/api/entities';

export function usePermissions() {
  const [permissions, setPermissions] = useState({});
  const [pendingPrompt, setPendingPrompt] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      // Load user's permission preferences
      if (userData.permissions) {
        setPermissions(userData.permissions);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const requestPermission = async (permissionType, options = {}) => {
    // Check if already granted
    if (permissions[permissionType] === 'granted') {
      return Promise.resolve('granted');
    }

    // Check if user previously denied and shouldn't be prompted again
    if (permissions[permissionType] === 'denied' && !options.forcePrompt) {
      return Promise.resolve('denied');
    }

    return new Promise((resolve) => {
      setPendingPrompt({
        type: permissionType,
        resolve,
        ...options
      });
    });
  };

  const handlePermissionResponse = async (response) => {
    if (!pendingPrompt) return;

    const { type, resolve } = pendingPrompt;
    
    // Update local state
    setPermissions(prev => ({ ...prev, [type]: response }));
    
    // Save to user preferences
    if (user) {
      try {
        const updatedPermissions = { ...user.permissions || {}, [type]: response };
        await User.updateMyUserData({ permissions: updatedPermissions });
      } catch (error) {
        console.error('Error saving permission preference:', error);
      }
    }

    // Clear prompt and resolve
    setPendingPrompt(null);
    resolve(response);
  };

  const checkPermission = (permissionType) => {
    return permissions[permissionType] || 'notRequested';
  };

  const hasPermission = (permissionType) => {
    return permissions[permissionType] === 'granted';
  };

  return {
    permissions,
    pendingPrompt,
    requestPermission,
    handlePermissionResponse,
    checkPermission,
    hasPermission,
    clearPrompt: () => setPendingPrompt(null)
  };
}