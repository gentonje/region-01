
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/navigation/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Github, Mail } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'sign_in' | 'sign_up'>('sign_in');
  const navigate = useNavigate();
  const { session } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  const handleSignInWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = mode === 'sign_in'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (error) {
        toast.error(error.message);
      } else if (mode === 'sign_up') {
        toast.success('Account created! Check your email for confirmation.');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to sign in with ${provider}`);
    }
  };

  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-white">
      <div className="w-full max-w-md space-y-6 p-4 pt-16">
        {/* Title Section */}
        <h1 className="text-4xl font-bold text-gray-900">
          {mode === 'sign_in' ? 'Sign in' : 'Sign up'}
        </h1>
        
        {/* OAuth Buttons */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full py-6 bg-[#f5f5f4] hover:bg-[#e7e5e4] border border-gray-200 flex items-center justify-center gap-2 font-medium text-base"
            onClick={() => handleOAuthSignIn('github')}
          >
            <Github className="w-5 h-5" />
            Sign in with GitHub
          </Button>
          
          <Button
            variant="outline"
            className="w-full py-6 bg-[#dbeafe] hover:bg-[#bfdbfe] border border-gray-200 text-gray-800 flex items-center justify-center gap-2 font-medium text-base"
            onClick={() => handleOAuthSignIn('google')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </Button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <Separator className="flex-grow" />
          <span className="mx-4 text-gray-500 text-sm py-2">OR</span>
          <Separator className="flex-grow" />
        </div>
        
        {/* Email/Password Form */}
        <form onSubmit={handleSignInWithEmail} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full py-5 px-3 bg-white border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                Password
              </label>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); toast.info("Password reset functionality will be added soon."); }} 
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full py-5 px-3 bg-white border border-gray-300 rounded-md"
            />
          </div>
          
          <Button
            type="submit"
            className="w-full py-6 bg-black hover:bg-gray-800 text-white font-medium text-base"
            disabled={loading}
          >
            {loading ? 'Processing...' : (mode === 'sign_in' ? 'Sign in' : 'Sign up')}
          </Button>
          
          <div className="text-center mt-4">
            <p className="text-gray-600">
              {mode === 'sign_in' ? "Don't have an account? " : "Already have an account? "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setMode(mode === 'sign_in' ? 'sign_up' : 'sign_in');
                }}
                className="text-gray-900 font-medium hover:underline"
              >
                {mode === 'sign_in' ? 'Sign Up' : 'Sign In'}
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
