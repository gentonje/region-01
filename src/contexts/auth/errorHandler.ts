import { toast } from "sonner";
import { AuthError } from "./types";
import { SessionManager } from "./sessionManager";

export class AuthErrorHandler {
  static async handleError(error: AuthError, retryCallback: () => Promise<void>, retryCount: number) {
    const errorMessage = error.message || "Authentication error occurred";
    console.error('Auth error:', error);
    
    if (this.isSessionError(error)) {
      await SessionManager.handleSignOut();
      return;
    }

    if (retryCount < SessionManager["MAX_RETRIES"]) {
      toast.error(`${errorMessage} - Retrying... (${retryCount + 1}/${SessionManager["MAX_RETRIES"]})`);
      setTimeout(retryCallback, SessionManager["RETRY_DELAY"] * (retryCount + 1));
    } else {
      toast.error(errorMessage);
    }
  }

  private static isSessionError(error: AuthError): boolean {
    return !!(
      error.message?.includes('session_not_found') ||
      error.message?.includes('refresh_token_not_found') ||
      error.message?.includes('Failed to fetch')
    );
  }
}