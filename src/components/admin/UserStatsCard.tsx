import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";

interface UserStatsCardProps {
  id: string;
  username: string | null;
  product_count: string;
  is_active: boolean;
}

export const UserStatsCard = ({ id, username, product_count, is_active }: UserStatsCardProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-center">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-muted-foreground" />
          <div>
            <h3 className="font-medium">{username || "Anonymous User"}</h3>
            <p className="text-sm text-muted-foreground">
              {product_count} products listed
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};