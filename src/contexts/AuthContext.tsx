import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType, AuthState } from "./auth/types";
import { SessionManager } from "./auth/sessionManager";
import { AuthErrorHandler } from "./auth/errorHandler";
import { toast } from "sonner";
import { AuthError } from "@supabase/supabase-js";

// Create a context for authentication
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
    retryCount: 0,
  });

  const handleSessionRefreshError = useCallback(async (error?: AuthError) => {
    console.log('Session refresh failed, signing out...', error);
    try {
      await supabase.auth.signOut();
      setState(prev => ({
        ...prev,
        session: null,
        user: null,
        loading: false,
        retryCount: 0,
      }));
      toast.error('Your session has expired. Please sign in again.');
    } catch (signOutError) {
      console.error('Error during sign out:', signOutError);
      toast.error('An error occurred. Please refresh the page.');
    }
  }, []);

  const initSession = useCallback(async () => {
    try {
      console.log('Initializing session...');
      setState(prev => ({ ...prev, loading: true }));

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session initialization error:', error);
        toast.error('Failed to initialize session. Please try again.');
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      if (!session) {
        console.warn('No session found during initialization.');
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      setState(prev => ({
        ...prev,
        session,
        user: session.user,
        loading: false,
      }));
    } catch (error) {
      console.error('Session initialization error:', error);
      await AuthErrorHandler.handleError(
        error as AuthError,
        initSession,
        state.retryCount
      );
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.retryCount, handleSessionRefreshError]);

  useEffect(() => {
    console.log('Setting up auth state change listener');
    let mounted = true;
    let refreshTimeout: NodeJS.Timeout | null = null;

    // Initialize the session
    initSession();

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      
      if (!mounted) return;

      const signOutEvents = ['SIGNED_OUT', 'USER_DELETED'];
      const sessionEvents = [
        'SIGNED_IN',
        'TOKEN_REFRESHED',
        'USER_UPDATED',
        'PASSWORD_RECOVERY',
        'MFA_CHALLENGE_VERIFIED',
        'INITIAL_SESSION'
      ];

      if (signOutEvents.includes(event)) {
        console.log('User signed out or deleted');
        setState(prev => ({
          ...prev,
          session: null,
          user: null,
          loading: false,
        }));
        
        if (refreshTimeout) {
          clearTimeout(refreshTimeout);
          refreshTimeout = null;
        }
      } else if (session && sessionEvents.includes(event)) {
        console.log('Session updated');
        setState(prev => ({
          ...prev,
          session,
          user: session.user,
          retryCount: 0,
          loading: false,
        }));

        if (refreshTimeout) {
          clearTimeout(refreshTimeout);
          refreshTimeout = null;
        }

        // Schedule next refresh
        const expiresIn = session.expires_in || 3600;
        const refreshTime = Math.max(0, (expiresIn - 300) * 1000); // 5 minutes before expiry
        refreshTimeout = setTimeout(() => {
          SessionManager.refreshSession(session, state.retryCount);
        }, refreshTime);
      }
    });

    // Cleanup function
    return () => {
      console.log('Cleaning up auth state change listener');
      mounted = false;
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
        refreshTimeout = null;
      }
      subscription.unsubscribe();
    };
  }, [initSession, state.retryCount]);

  const value = useMemo(() => ({
    session: state.session,
    user: state.user,
    loading: state.loading,
  }), [state.session, state.user, state.loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
