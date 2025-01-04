import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/ProductForm";
import { toast } from "sonner";
import { ProductCategory } from "@/types/product";

interface ProductStepProps {
  onComplete: () => void;
}

export const ProductStep = ({ onComplete }: ProductStepProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "Other" as ProductCategory,
    available_quantity: "0",
  });

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: shop } = await supabase
        .from("shops")
        .select("id")
        .eq("owner_id", user.id)
        .single();

      if (!shop) throw new Error("Shop not found");

      const { error: productError } = await supabase
        .from("products")
        .insert({
          title: data.title,
          description: data.description,
          price: Number(data.price),
          category: data.category,
          available_quantity: Number(data.available_quantity),
          user_id: user.id,
          shop_id: shop.id,
          storage_path: "placeholder.svg"
        });

      if (productError) throw productError;

      const { error: progressError } = await supabase
        .from("onboarding_progress")
        .insert({
          user_id: user.id,
          step: "first_product"
        });

      if (progressError) throw progressError;

      toast.success("Product created successfully!");
      onComplete();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ProductForm
        formData={formData}
        setFormData={setFormData}
        isLoading={isLoading}
        submitButtonText="Complete Onboarding"
        onSubmit={handleSubmit}
      />
    </div>
  );
};