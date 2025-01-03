import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface UserStatsCardProps {
  id: string;
  username: string | null;
  product_count: string;
  is_active: boolean;
}

export const UserStatsCard = ({ id, username, product_count, is_active }: UserStatsCardProps) => {
  const queryClient = useQueryClient();

  const handleActivationToggle = async (checked: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: checked })
        .eq('id', id);

      if (error) throw error;

      toast.success(`User ${checked ? 'activated' : 'deactivated'} successfully`);
      queryClient.invalidateQueries({ queryKey: ["users-stats"] });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
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
        <Switch
          checked={is_active}
          onCheckedChange={handleActivationToggle}
          aria-label="Toggle user activation"
        />
      </div>
    </Card>
  );
};