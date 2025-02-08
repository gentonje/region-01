import { createContext, useContext, useEffect, useState, useCallback } from "react";
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
        if (error.message?.includes('refresh_token_not_found') || error.message?.includes('Failed to fetch')) {
          await handleSessionRefreshError(error);
          return;
        }
        await AuthErrorHandler.handleError(
          error,
          initSession,
          state.retryCount
        );
        return;
      }

      if (session) {
        console.log('Found existing session, refreshing...');
        try {
          const refreshedSession = await SessionManager.refreshSession(
            session,
            state.retryCount
          );
          
          if (refreshedSession) {
            setState(prev => ({
              ...prev,
              session: refreshedSession,
              user: refreshedSession.user,
              retryCount: 0,
            }));
          } else {
            await handleSessionRefreshError();
          }
        } catch (refreshError) {
          console.error('Session refresh error:', refreshError);
          await handleSessionRefreshError(refreshError as AuthError);
        }
      } else {
        console.log('No valid session found');
        setState(prev => ({
          ...prev,
          session: null,
          user: null,
          retryCount: 0,
        }));
      }
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
    let mounted = true;
    let refreshTimeout: NodeJS.Timeout | null = null;

    // Initialize the session
    initSession();

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
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
      mounted = false;
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      subscription.unsubscribe();
    };
  }, [initSession]);

  return (
    <AuthContext.Provider value={{
      session: state.session,
      user: state.user,
      loading: state.loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};