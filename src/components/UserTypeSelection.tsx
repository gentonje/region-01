import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const UserTypeSelection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSelection = async (type: 'buyer' | 'seller') => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("No user found");
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ user_type: type })
        .eq('id', user.id);

      if (error) throw error;

      if (type === 'seller') {
        navigate('/onboarding');
      } else {
        navigate('/');
      }
      
      toast.success(`Successfully registered as a ${type}`);
    } catch (error) {
      console.error('Error setting user type:', error);
      toast.error('Failed to set user type');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center">How would you like to use our marketplace?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-32 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleSelection('buyer')}
              disabled={isLoading}
            >
              <ShoppingBag className="h-8 w-8" />
              <span>I want to buy products</span>
            </Button>
            <Button
              variant="outline"
              className="h-32 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleSelection('seller')}
              disabled={isLoading}
            >
              <Store className="h-8 w-8" />
              <span>I want to sell products</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};