
import { Button } from "@/components/ui/button";
import { addSampleProducts } from "@/utils/sampleProducts";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const SampleProductsButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const handleAddSampleProducts = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to add sample products");
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await addSampleProducts(user.id);
      if (result.success) {
        // Wait for the toast to be shown
        setTimeout(() => {
          window.location.href = "/my-products";
        }, 1500);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      onClick={handleAddSampleProducts}
      variant="outline"
      size="sm"
      className="bg-gradient-to-r from-orange-100 to-blue-100 hover:from-orange-200 hover:to-blue-200 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 transition-all duration-300"
      disabled={isLoading}
    >
      {isLoading ? "Adding Sample Products..." : "Add Sample Products"}
    </Button>
  );
};
