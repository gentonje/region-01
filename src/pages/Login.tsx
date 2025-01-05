import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { Logo } from "@/components/navigation/Logo";
import { toast } from "sonner";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [authView, setAuthView] = useState<'sign_in' | 'sign_up'>('sign_in');
  const navigate = useNavigate();
  const { session } = useAuth();

  if (session) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4 mt-10">
        <div className="flex justify-center mt-10">
          <Logo />
        </div>
        
        <div className="bg-card rounded-lg shadow-lg p-6 space-y-6">
          <Auth
            supabaseClient={supabase}
            view={authView}
            appearance={{ theme: ThemeSupa }}
            providers={['google']}
            redirectTo={window.location.origin}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;