
import { useState } from "react";
import { CartSummary } from "./CartSummary";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

interface CheckoutSectionProps {
  totalAmount: number;
  isProcessing: boolean;
}

export function CheckoutSection({ totalAmount, isProcessing }: CheckoutSectionProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("stripe");
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const proceedToCheckout = async () => {
    try {
      toast({
        title: "Processing",
        description: "Your order is being processed...",
      });

      // Get user profile for shipping address
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not logged in");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("address")
        .eq("id", user.user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile.address) {
        toast({
          title: "Missing address",
          description: "Please update your shipping address in your profile",
          variant: "destructive",
        });
        navigate("/edit-profile");
        return;
      }

      // Simulate checkout process
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Success",
        description: "Your order has been placed!",
      });

      // Clear cart
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart_items", { type: "count" }] });
      navigate("/products");
    } catch (error) {
      toast({
        title: "Checkout failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border"
    >
      <h2 className="text-lg font-medium border-b pb-2 mb-4">
        Checkout Summary
      </h2>
      <CartSummary
        currency="SSP"
        totalAmount={totalAmount}
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodChange={setSelectedPaymentMethod}
        onCheckout={proceedToCheckout}
        isLoading={isProcessing}
      />
    </motion.div>
  );
}
