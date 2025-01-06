import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType, AuthState } from "./auth/types";
import { SessionManager } from "./auth/sessionManager";
import { AuthErrorHandler } from "./auth/errorHandler";

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
    retryCount: 0,
  });

  const initSession = useCallback(async () => {
    try {
      console.log('Initializing session...');
      setState(prev => ({ ...prev, loading: true }));

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session initialization error:', error);
        await AuthErrorHandler.handleError(
          error,
          initSession,
          state.retryCount
        );
        return;
      }

      if (session) {
        console.log('Found existing session, refreshing...');
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
        error as any,
        initSession,
        state.retryCount
      );
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.retryCount]);

  useEffect(() => {
    let mounted = true;
    let refreshTimeout: NodeJS.Timeout | null = null;

    // Initialize the session
    initSession();

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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
      } else if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
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

        refreshTimeout = SessionManager.scheduleNextRefresh(session, () => {
          SessionManager.refreshSession(session, state.retryCount);
        });
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