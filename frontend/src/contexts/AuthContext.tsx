import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { User } from '../types/domain';

// Tipos para o contexto de autenticação
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Criação do contexto
export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Provider do contexto de autenticação
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verifica se há token ao iniciar
  useEffect(() => {
    checkAuth();
  }, []);

  // Verifica autenticação inicial
  const checkAuth = async () => {
    try {
      const hasToken = await authService.hasToken();
      
      if (hasToken) {
        // Busca dados do usuário
        const userData = await authService.getMe();
        setUser(userData);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      // Se falhar, limpa o token
      await authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  // Realiza login
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });
      setUser(response.user);
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Realiza logout
  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualiza dados do usuário
  const refreshUser = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o contexto de autenticação
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}
