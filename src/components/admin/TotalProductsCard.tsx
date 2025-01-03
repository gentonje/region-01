import { Card } from "@/components/ui/card";
import { Package } from "lucide-react";

interface TotalProductsCardProps {
  total: number;
}

export const TotalProductsCard = ({ total }: TotalProductsCardProps) => {
  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center gap-3">
        <Package className="h-8 w-8 text-muted-foreground" />
        <div>
          <h3 className="font-medium">Total Products</h3>
          <p className="text-2xl font-bold">{total}</p>
        </div>
      </div>
    </Card>
  );
};