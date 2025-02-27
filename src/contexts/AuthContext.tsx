
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
    console.error('Session refresh failed:', error);
    
    // Only sign out if it's a refresh token error
    if (error?.message?.includes('refresh_token_not_found') || 
        error?.code === 'refresh_token_not_found') {
      try {
        console.log('Signing out due to invalid refresh token');
        await supabase.auth.signOut({ scope: 'local' });
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

      if (event === 'SIGNED_OUT') {
        console.log('User signed out');
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
        return;
      }

      if (session) {
        console.log('Session updated with expires_in:', session.expires_in);
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

        // Schedule next refresh only if session has an expiry
        if (session.expires_at) {
          const expiresAt = new Date(session.expires_at * 1000);
          const now = new Date();
          const timeUntilExpiry = expiresAt.getTime() - now.getTime() - (60 * 1000); // 1 minute before expiry
          
          console.log(`Session expires at: ${expiresAt.toISOString()}, refresh scheduled in: ${timeUntilExpiry / 1000} seconds`);
          
          if (timeUntilExpiry > 0) {
            refreshTimeout = setTimeout(async () => {
              console.log('Attempting to refresh session...');
              try {
                const { data, error } = await supabase.auth.refreshSession();
                if (error) {
                  console.error('Failed to refresh session:', error);
                  throw error;
                }
                
                if (!data.session) {
                  console.error('No session returned after refresh');
                  throw new Error('No session returned after refresh');
                }
                
                console.log('Session refreshed successfully');
              } catch (error) {
                console.error('Session refresh error:', error);
                await handleSessionRefreshError(error as AuthError);
              }
            }, timeUntilExpiry);
          } else {
            console.warn('Session already expired or about to expire, initiating refresh immediately');
            // Session already expired or about to expire, try to refresh immediately
            supabase.auth.refreshSession().catch(error => {
              console.error('Immediate session refresh failed:', error);
              handleSessionRefreshError(error as AuthError);
            });
          }
        } else {
          console.log('Session has no expiry information');
        }
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
