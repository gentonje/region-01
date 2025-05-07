
import { Badge } from "@/components/ui/badge";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

interface ProductModifyHeaderProps {
  title: string;
  ownerName: string;
  productId?: string;
}

export const ProductModifyHeader = ({ title, ownerName, productId }: ProductModifyHeaderProps) => {
  return (
    <div className="space-y-1">
      <BreadcrumbNav
        items={[
          { href: "/products", label: "Products" },
          { href: "/my-products", label: "My Products" },
          { label: title, isCurrent: true }
        ]}
      />
      
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Badge variant="secondary" className="ml-2">
          {ownerName}
        </Badge>
      </div>
    </div>
  );
};
