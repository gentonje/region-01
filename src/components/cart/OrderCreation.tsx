import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PaymentHandler } from "./PaymentHandler";

interface OrderCreationProps {
  cartItems: any[];
  shippingAddress: string;
  userId: string;
  paymentMethod: string;
}

export const useOrderCreation = ({ cartItems, shippingAddress, userId, paymentMethod }: OrderCreationProps) => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      if (!cartItems?.length) throw new Error("Cart is empty");
      if (!userId) throw new Error("User not authenticated");
      if (!shippingAddress) throw new Error("Shipping address is required");

      // Calculate total amount
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + (item.product.price * item.quantity),
        0
      );

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          product_id: cartItems[0].product_id,
          quantity: cartItems[0].quantity,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          shipping_address: shippingAddress,
          buyer_id: userId,
          seller_id: cartItems[0].product.user_id,
        })
        .select()
        .single();

      if (orderError) throw orderError;
      return order;
    },
    onError: (error) => {
      toast({
        title: "Error creating order",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
};