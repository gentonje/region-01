
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

interface EditProductHeaderProps {
  title: string;
  productId?: string;
  productTitle?: string;
}

export const EditProductHeader = ({ title, productId, productTitle }: EditProductHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-1">
      <BreadcrumbNav
        items={[
          { href: "/products", label: "Products" },
          { href: "/my-products", label: "My Products" },
          { label: productTitle || "Edit Product", isCurrent: true }
        ]}
      />
      
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate("/my-products")}
          className="ml-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
