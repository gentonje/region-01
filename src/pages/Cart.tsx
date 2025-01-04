import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    title: string;
    price: number;
    currency: string;
  };
}

export default function Cart() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("stripe");

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ["cartItems"],
    queryFn: async () => {
      const { data: items, error } = await supabase
        .from("cart_items")
        .select(`
          *,
          product:products (
            title,
            price,
            currency
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return items as CartItem[];
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (paymentMethod: string) => {
      if (!cartItems?.length) throw new Error("Cart is empty");

      // Calculate total amount
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + (item.product.price * item.quantity),
        0
      );

      // Get user's shipping address from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("address")
        .single();

      if (!profile?.address) {
        throw new Error("Please add a shipping address to your profile");
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          product_id: cartItems[0].product_id, // For simplicity, using first item
          quantity: cartItems[0].quantity,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          shipping_address: profile.address,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Clear cart after successful order creation
      const { error: clearCartError } = await supabase
        .from("cart_items")
        .delete()
        .neq("id", "placeholder");

      if (clearCartError) throw clearCartError;

      return order;
    },
    onSuccess: async (order) => {
      queryClient.invalidateQueries({ queryKey: ["cartItems"] });
      
      // Handle different payment methods
      switch (selectedPaymentMethod) {
        case "stripe":
          const { data: sessionUrl, error } = await supabase.functions.invoke("create-checkout-session", {
            body: { orderId: order.id }
          });
          if (error) throw error;
          window.location.href = sessionUrl.url;
          break;
        
        case "paypal":
          // Redirect to PayPal checkout
          navigate(`/checkout/paypal/${order.id}`);
          break;
        
        case "mpesa":
          // Redirect to M-Pesa checkout
          navigate(`/checkout/mpesa/${order.id}`);
          break;
        
        case "mtn_momo":
          // Redirect to MTN MoMo checkout
          navigate(`/checkout/mtn-momo/${order.id}`);
          break;
        
        default:
          toast({
            title: "Error",
            description: "Invalid payment method selected",
            variant: "destructive",
          });
      }
    },
    onError: (error) => {
      toast({
        title: "Error creating order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCheckout = async () => {
    if (!cartItems?.length) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate(selectedPaymentMethod);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 mt-16">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
        
        {!cartItems?.length ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">Your cart is empty</p>
            <Button
              className="mt-4 mx-auto block"
              onClick={() => navigate("/")}
            >
              Continue Shopping
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Cart Items</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border-b pb-4"
                  >
                    <div>
                      <h3 className="font-medium">{item.product.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      {item.product.currency} {item.product.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Checkout</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Payment Method
                  </label>
                  <Select
                    value={selectedPaymentMethod}
                    onValueChange={setSelectedPaymentMethod}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Credit Card (Stripe)</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="mtn_momo">MTN Mobile Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t">
                  <p className="flex justify-between mb-2">
                    <span>Total</span>
                    <span className="font-bold">
                      {cartItems[0]?.product.currency}{" "}
                      {cartItems.reduce(
                        (sum, item) => sum + item.product.price * item.quantity,
                        0
                      )}
                    </span>
                  </p>
                  <Button
                    className="w-full"
                    onClick={handleCheckout}
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Proceed to Checkout"
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}