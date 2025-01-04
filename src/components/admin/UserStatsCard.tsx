import { Card } from "@/components/ui/card";
import { Users, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserStatsCardProps {
  id: string;
  username: string | null;
  product_count: string;
  is_active: boolean;
}

export const UserStatsCard = ({ id, username, product_count, is_active }: UserStatsCardProps) => {
  const { toast } = useToast();

  const handleRemoveUser = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "User removed",
        description: `${username || 'User'} has been successfully removed.`,
      });
    } catch (error) {
      console.error('Error removing user:', error);
      toast({
        title: "Error",
        description: "Failed to remove user. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-muted-foreground" />
          <div>
            <h3 className="font-medium">{username || "Anonymous User"}</h3>
            <p className="text-sm text-muted-foreground">
              {product_count} products listed
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleRemoveUser}
          className="ml-4"
        >
          <UserX className="h-4 w-4" />
          <span className="sr-only">Remove user</span>
        </Button>
      </div>
    </Card>
  );
};