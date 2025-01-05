import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Auth, AuthChangeEvent, Session } from "@supabase/auth-ui-react";
import { Logo } from "@/components/navigation/Logo";
import { toast } from "sonner";
import { ThemeSupa } from "@supabase/auth-ui-shared";

const Login = () => {
  const [authView, setAuthView] = useState<'sign_in' | 'sign_up'>('sign_in');
  const navigate = useNavigate();
  const { session } = useAuth();

  const handleAuthChange = (event: AuthChangeEvent, session: Session | null) => {
    if (event === 'SIGNED_IN' && session) {
      toast.success('Successfully signed in!');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="flex justify-center">
          <Logo />
        </div>
        
        <div className="bg-card rounded-lg shadow-lg p-6 space-y-6">
          <Auth
            supabaseClient={supabase}
            view={authView}
            appearance={{ theme: ThemeSupa }}
            providers={['google']}
            onAuthStateChange={handleAuthChange}
            redirectTo={window.location.origin}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
