import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, ShoppingBag } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCartMutations } from "@/hooks/useCartMutations";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    title: string;
    price: number;
    currency: string;
    user_id: string;
  };
}

export default function Cart() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("stripe");
  const [shippingAddress, setShippingAddress] = useState<string>("");
  const { deleteItemMutation, clearCartMutation } = useCartMutations();

  // Get current user's ID
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
  });

  // Get user's shipping address
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile", session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("address")
        .eq("id", session?.user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Set shipping address from profile when available
  useEffect(() => {
    if (userProfile?.address) {
      setShippingAddress(userProfile.address);
    }
  }, [userProfile]);

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
            currency,
            user_id
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
      if (!session?.user?.id) throw new Error("User not authenticated");
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
          buyer_id: session.user.id,
          seller_id: cartItems[0].product.user_id,
        })
        .select()
        .single();

      if (orderError) throw orderError;
      return order;
    },
    onSuccess: async (order) => {
      switch (selectedPaymentMethod) {
        case "stripe":
          const { data: sessionUrl, error } = await supabase.functions.invoke("create-checkout-session", {
            body: { orderId: order.id }
          });
          if (error) throw error;
          window.location.href = sessionUrl.url;
          break;
        
        case "paypal":
          navigate(`/checkout/paypal/${order.id}`);
          break;
        
        case "mpesa":
          navigate(`/checkout/mpesa/${order.id}`);
          break;
        
        case "mtn_momo":
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

    if (!shippingAddress) {
      toast({
        title: "Shipping address required",
        description: "Please add a shipping address to your profile",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate(selectedPaymentMethod);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
            {cartItems?.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => clearCartMutation.mutate()}
                disabled={clearCartMutation.isPending}
              >
                {clearCartMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Clear Cart"
                )}
              </Button>
            )}
          </div>
        </div>
        
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
                  <CartItem
                    key={item.id}
                    id={item.id}
                    title={item.product.title}
                    quantity={item.quantity}
                    price={item.product.price}
                    currency={item.product.currency}
                    onDelete={() => deleteItemMutation.mutate(item.id)}
                  />
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Checkout</h2>
              <CartSummary
                currency={cartItems[0]?.product.currency || "USD"}
                totalAmount={cartItems.reduce(
                  (sum, item) => sum + item.product.price * item.quantity,
                  0
                )}
                selectedPaymentMethod={selectedPaymentMethod}
                onPaymentMethodChange={setSelectedPaymentMethod}
                onCheckout={handleCheckout}
                isLoading={createOrderMutation.isPending}
              />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
