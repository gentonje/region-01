import { Card } from "@/components/ui/card";
import { BarChart } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type ProductCategory = Database['public']['Enums']['product_category'];

interface CategoryStatsCardProps {
  category: ProductCategory;
  count: number;
}

export const CategoryStatsCard = ({ category, count }: CategoryStatsCardProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <BarChart className="h-6 w-6 text-muted-foreground" />
        <div>
          <h3 className="font-medium">{category}</h3>
          <p className="text-sm text-muted-foreground">
            {count} products
          </p>
        </div>
      </div>
    </Card>
  );
};