import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '@/services/auth';
import { User, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const authData = await authService.getStoredAuthData();
      if (authData) {
        setUser(authData.user);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const authResponse = await authService.signInWithEmailPassword(email, password);
      await authService.storeAuthData(authResponse);
      
      const userData: User = {
        localId: authResponse.localId,
        email: authResponse.email,
        displayName: authResponse.displayName,
        emailVerified: authResponse.emailVerified || false,
      };
      
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const authResponse = await authService.signUpWithEmailPassword(email, password);
      await authService.storeAuthData(authResponse);
      
      const userData: User = {
        localId: authResponse.localId,
        email: authResponse.email,
        displayName: authResponse.displayName,
        emailVerified: authResponse.emailVerified || false,
      };
      
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.clearAuthData();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const loginWithGoogle = async () => {
    // This would be implemented with Google Sign-In SDK
    // For now, we'll throw an error to indicate it's not implemented
    throw new Error('Google Sign-In not implemented yet. Please use email/password.');
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    loginWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}