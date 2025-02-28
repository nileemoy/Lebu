import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check for existing user session on mount
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        // Check if user data exists in localStorage
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        
        if (storedUser) {
          const userData = JSON.parse(storedUser) as User;
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to restore your session';
        setError(errorMessage);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, []);

  /**
   * Sign in user
   */
  const signIn = useCallback(async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This would be replaced with an actual API call
      // Simulating a successful sign-in
      const user: User = { id: 'user123', email, name: 'Test User', plan: 'free' };
      
      // Store user data in localStorage for session persistence
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      
      return user;
    } catch (err) {
      console.error('Sign in failed:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Sign in failed. Please check your credentials and try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sign up user
   */
  const signUp = useCallback(async (email: string, password: string, name: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This would be replaced with an actual API call
      // Simulating a successful sign-up
      const user: User = { id: 'user123', email, name, plan: 'free' };
      
      // Store user data in localStorage for session persistence
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      
      return user;
    } catch (err) {
      console.error('Sign up failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed. Please try again later.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sign out user
   */
  const signOut = useCallback(() => {
    // Clear user data from localStorage
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
  };
};
