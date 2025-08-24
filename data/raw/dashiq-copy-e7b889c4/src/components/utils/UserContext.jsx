import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User } from '@/api/entities';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const userFetchedRef = useRef(false);
  const userCacheRef = useRef(null);

  // Fetch user only once when the provider mounts
  useEffect(() => {
    const fetchUser = async () => {
      // Prevent multiple fetches
      if (userFetchedRef.current) {
        return;
      }
      
      userFetchedRef.current = true;
      
      try {
        // Use cached data immediately if available
        if (userCacheRef.current) {
          setUser(userCacheRef.current);
          setIsLoading(false);
        }

        const currentUser = await User.me();
        
        // Only update if data actually changed
        const hasChanged = !userCacheRef.current || 
          JSON.stringify(currentUser) !== JSON.stringify(userCacheRef.current);
        
        if (hasChanged) {
          userCacheRef.current = currentUser;
          setUser(currentUser);
        }
        
        setIsLoading(false);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setError(err);
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []); // Empty dependency array - only runs once

  // Provide a stable user object that doesn't change on re-renders
  const contextValue = {
    user,
    isLoading,
    error,
    refreshUser: async () => {
      try {
        const currentUser = await User.me();
        userCacheRef.current = currentUser;
        setUser(currentUser);
        setError(null);
      } catch (err) {
        console.error('Failed to refresh user:', err);
        setError(err);
      }
    }
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};