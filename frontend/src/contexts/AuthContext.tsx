import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types/domain';

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Mock user data (CLIENT logged in)
const mockUser: User = {
  id: 'client-001',
  name: 'João Silva',
  email: 'joao.silva@email.com',
  passwordHash: '', // Never expose in real app
  role: 'CLIENT',
  phone: '(11) 98765-4321',
  active: true,
  createdAt: new Date('2025-01-15').toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockToken = 'mock-jwt-token-client-001';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Start with user already logged in for MVP
  const [user, setUser] = useState<User | null>(mockUser);
  const [token, setToken] = useState<string | null>(mockToken);

  const login = async (email: string, password: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock login - always succeeds for now
    setUser(mockUser);
    setToken(mockToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
