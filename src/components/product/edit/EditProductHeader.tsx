import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface EditProductHeaderProps {
  title: string;
}

export const EditProductHeader = ({ title }: EditProductHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      <Button 
        variant="outline" 
        onClick={() => navigate("/modify-products")}
        className="ml-4"
      >
        Cancel
      </Button>
    </div>
  );
};