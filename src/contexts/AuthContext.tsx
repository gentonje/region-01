
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType, AuthState } from "./auth/types";
import { SessionManager } from "./auth/sessionManager";
import { AuthErrorHandler } from "./auth/errorHandler";
import { toast } from "sonner";
import { AuthError, AuthChangeEvent } from "@supabase/supabase-js";

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
    console.log('Session refresh failed:', error);
    
    // Only sign out if it's a refresh token error
    if (error?.message?.includes('refresh_token_not_found')) {
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
    }
  }, []);

  const initSession = useCallback(async () => {
    try {
      console.log('Initializing session...');
      setState(prev => ({ ...prev, loading: true }));

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session initialization error:', error);
        await handleSessionRefreshError(error);
        return;
      }

      if (session) {
        console.log('Found existing session');
        setState(prev => ({
          ...prev,
          session,
          user: session.user,
          retryCount: 0,
          loading: false,
        }));
      } else {
        console.log('No valid session found');
        setState(prev => ({
          ...prev,
          session: null,
          user: null,
          retryCount: 0,
          loading: false,
        }));
      }
    } catch (error) {
      console.error('Session initialization error:', error);
      await AuthErrorHandler.handleError(
        error as AuthError,
        initSession,
        state.retryCount
      );
    }
  }, [handleSessionRefreshError, state.retryCount]);

  useEffect(() => {
    let mounted = true;
    let refreshTimeout: NodeJS.Timeout | null = null;

    // Initialize the session
    initSession();

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      console.log('Auth state changed:', event);
      
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        console.log('User signed out or deleted');
        setState(prev => ({
          ...prev,
          session: null,
          user: null,
          loading: false,
        }));
        
        if (refreshTimeout) {
          clearTimeout(refreshTimeout);
        }
        return;
      }

      if (session) {
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
        }

        // Schedule next refresh
        const expiresIn = session.expires_in || 3600;
        const refreshTime = Math.max(0, (expiresIn - 60) * 1000); // Refresh 1 minute before expiry
        refreshTimeout = setTimeout(async () => {
          try {
            const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
            if (error) throw error;
            if (!newSession) throw new Error('No session returned after refresh');
          } catch (error) {
            console.error('Session refresh failed:', error);
            await handleSessionRefreshError(error as AuthError);
          }
        }, refreshTime);
      }
    });

    // Cleanup function
    return () => {
      mounted = false;
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      subscription.unsubscribe();
    };
  }, [initSession, handleSessionRefreshError]);

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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
