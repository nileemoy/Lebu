import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  AuthContextType
} from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing user session on mount
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        // Simulate checking for a stored user session
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        setError('Failed to restore your session. Please sign in again.');
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, []);

  const signIn = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This would be replaced with an actual API call
      // Simulating a successful sign-in
      const user: User = { id: 'user123', email, name: 'Test User', plan: 'free' };
      
      // Store user data in localStorage for session persistence
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return user;
    } catch (error) {
      console.error('Sign in failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed. Please check your credentials and try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This would be replaced with an actual API call
      // Simulating a successful sign-up
      const user: User = { id: 'user123', email, name, plan: 'free' };
      
      // Store user data in localStorage for session persistence
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return user;
    } catch (error) {
      console.error('Sign up failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed. Please try again later.';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = (): void => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
