
import { Session, User } from "@supabase/supabase-js";

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  retryCount: number;
}

export interface AuthError {
  message: string;
  status?: number;
  code?: string;
}
