
import { Card } from "@/components/ui/card";
import { Users, Star } from "lucide-react";

interface UserStatsCardProps {
  id: string;
  username: string | null;
  product_count: string;
  is_active: boolean;
  user_type?: string;
}

export const UserStatsCard = ({ id, username, product_count, is_active, user_type }: UserStatsCardProps) => {
  const isAdmin = user_type === 'admin' || user_type === 'super_admin';
  
  return (
    <Card className="p-1 overflow-hidden">
      <div className="flex items-center">
        <div className="flex items-center gap-1">
          <Users className="h-8 w-8 text-muted-foreground" />
          <div>
            <h3 className="font-medium flex items-center gap-1">
              {username || "Anonymous User"}
              {isAdmin && <Star className="h-4 w-4 text-blue-500 fill-blue-500" />}
            </h3>
            <p className="text-sm text-muted-foreground">
              {product_count} products listed
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
