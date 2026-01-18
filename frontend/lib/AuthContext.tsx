'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import { API_ENDPOINTS } from './api-config';
import { isProfileComplete } from './utils/profile-complete';

const TOKEN_KEY = 'auth_token';

interface User {
  id: string;
  email: string;
  full_name: string;
  company: string;
  role: string;
  linkedin: string;
  phone_number: string | null;
  is_admin: boolean;
  phone_is_primary?: boolean;
}

interface SessionWithToken {
  token?: string;
  [key: string]: unknown;
}

function hasToken(session: unknown): session is SessionWithToken {
  return typeof session === 'object' && session !== null && 'token' in session;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  isAdmin: boolean;
  user: User | null;
  login: (token: string) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Initialize auth state - check NextAuth session first, then localStorage
  useEffect(() => {
    const initAuth = async () => {
      // Prevent multiple initializations - only run once
      if (authInitialized) {
        return;
      }

      // Wait for NextAuth session to finish loading
      if (sessionStatus === 'loading') {
        return;
      }

      let token: string | null = null;

      // Priority 1: Check NextAuth session for token
      if (sessionStatus === 'authenticated' && session) {
        if (hasToken(session) && session.token) {
          token = session.token;
          // Sync to localStorage
          localStorage.setItem(TOKEN_KEY, session.token);
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Found token in NextAuth session, syncing to localStorage');
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ NextAuth session exists but no token found. Session:', session);
            console.warn('Session keys:', Object.keys(session || {}));
            console.warn('Full session object:', JSON.stringify(session, null, 2));
          }
        }
      } else if (process.env.NODE_ENV === 'development') {
        console.log('NextAuth session status:', sessionStatus, 'Session:', session);
      }

      // Priority 2: Fall back to localStorage if no NextAuth token
      if (!token) {
        token = localStorage.getItem(TOKEN_KEY);
      }

      // If we have a token, verify it and fetch user data
      if (token) {
        setIsLoggedIn(true);
        try {
          const response = await fetch(API_ENDPOINTS.me, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setIsAdmin(userData.is_admin || false);
          } else if (response.status === 401) {
            // Token invalid or expired, clear it and session
            localStorage.removeItem(TOKEN_KEY);
            setIsLoggedIn(false);
            setIsAdmin(false);
            setUser(null);
            // If it's a NextAuth token issue, sign out from NextAuth too
            if (session && hasToken(session) && session.token === token) {
              nextAuthSignOut({ redirect: false });
            }
          } else {
            // Other errors (network, 500, etc.) - don't clear token
            if (process.env.NODE_ENV === 'development') {
              console.error('Failed to fetch user (non-401 error):', response.status);
            }
          }
        } catch (error) {
          // Silently handle auth errors in production
          if (process.env.NODE_ENV === 'development') {
            console.error('Failed to fetch user:', error);
          }
        }
      }

      setIsLoading(false);
      setAuthInitialized(true);
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus]); // Only depend on sessionStatus, not session object itself

  const login = useCallback((token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    setIsLoggedIn(true);
    // Fetch user data after login
    fetch(API_ENDPOINTS.me, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch user: ${res.status}`);
        }
        return res.json();
      })
      .then((userData) => {
        setUser(userData);
        setIsAdmin(userData.is_admin || false);
        
        const profileComplete = isProfileComplete(userData);
        const currentPath = window.location.pathname;
        
        if (!profileComplete) {
          if (currentPath !== '/account') {
            router.push('/account');
          }
        } else {
          if (currentPath === '/login' || currentPath === '/signup' || currentPath === '/account') {
            router.push('/candidates');
          }
        }
      })
      .catch((error) => {
        // Log auth errors for debugging
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch user after login:', error);
          // Log token for debugging (first 20 chars only)
          if (token) {
            console.error('Token used (first 20 chars):', token.substring(0, 20) + '...');
          }
        }
        // Only clear token if it's an auth error (401), not network errors
        // The error message will indicate the status code
        const isAuthError = error.message?.includes('401') || error.message?.includes('Unauthorized');
        if (isAuthError) {
        localStorage.removeItem(TOKEN_KEY);
        setIsLoggedIn(false);
        setUser(null);
        setIsAdmin(false);
        }
      });
  }, [router]);

  const logout = useCallback(async () => {
    // First, sign out from NextAuth (await to ensure session is cleared)
    await nextAuthSignOut({ redirect: false });
    
    // Then clear local state and storage
    localStorage.removeItem(TOKEN_KEY);
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUser(null);
    
    // Finally, navigate to login
    router.push('/login');
  }, [router]);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    try {
      const response = await fetch(API_ENDPOINTS.me, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAdmin(userData.is_admin || false);
      }
    } catch (error) {
      // Silently handle refresh errors in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to refresh user:', error);
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        isLoggingOut,
        isAdmin,
        user,
        login,
        logout,
        refreshUser,
      }}
    >
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

// Helper to get token for API calls (doesn't require context)
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

