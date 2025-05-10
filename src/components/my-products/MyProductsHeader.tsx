
import { useNavigate } from "react-router-dom";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface MyProductsHeaderProps {
  isProfileComplete: boolean;
}

export const MyProductsHeader = ({ isProfileComplete }: MyProductsHeaderProps) => {
  const navigate = useNavigate();
  
  const handleAddProduct = () => {
    if (!isProfileComplete) {
      toast.warning("Please complete your profile before adding products", {
        action: {
          label: "Edit Profile",
          onClick: () => navigate("/edit-profile")
        }
      });
      return;
    }
    
    navigate("/add-product");
  };
  
  return (
    <div className="space-y-1">
      <BreadcrumbNav
        items={[
          { href: "/products", label: "Home" },
          { label: "My Products", isCurrent: true }
        ]}
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
        <h1 className="text-2xl font-bold">My Products</h1>
        <Button 
          onClick={handleAddProduct} 
          className="flex items-center gap-1"
          disabled={!isProfileComplete}
        >
          <Plus size={16} /> Add New Product
        </Button>
      </div>
    </div>
  );
};
