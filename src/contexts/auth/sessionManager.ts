
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export class SessionManager {
  private static MAX_RETRIES = 3;
  private static RETRY_DELAY = 1000; // 1 second

  static async refreshSession(currentSession: Session, retryCount: number): Promise<Session | null> {
    if (retryCount >= this.MAX_RETRIES) {
      console.log('Max retries reached for session refresh');
      return null;
    }

    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        if (error.message?.includes('refresh_token_not_found')) {
          await this.handleSignOut();
          return null;
        }
        throw error;
      }

      if (!session) {
        console.error('No session returned after refresh');
        await this.handleSignOut();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Session refresh failed:', error);
      await this.handleSignOut();
      return null;
    }
  }

  static async handleSignOut() {
    try {
      await supabase.auth.signOut();
      toast.error('Your session has expired. Please sign in again.');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('An error occurred while signing out. Please refresh the page.');
    }
  }

  static scheduleNextRefresh(session: Session, callback: () => void): NodeJS.Timeout {
    const expiresIn = session.expires_in || 3600;
    const refreshTime = Math.max(0, (expiresIn - 300) * 1000); // 5 minutes before expiry
    return setTimeout(callback, refreshTime);
  }
}
