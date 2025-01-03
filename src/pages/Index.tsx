import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Navigation, BottomNavigation } from "@/components/Navigation";

const Index = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      
      // Try to get user's name from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      setUserName(profile?.full_name || user.email || "");
    };

    getUser();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 pt-20">
        <div className="flex items-center justify-center min-h-[60vh]">
          <h1 className="text-4xl font-bold text-center">
            Welcome, {userName}!
          </h1>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Index;