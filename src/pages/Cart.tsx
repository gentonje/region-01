
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCartMutations } from "@/hooks/useCartMutations";
import { useOrderCreation } from "@/components/cart/OrderCreation";
import { PaymentHandler } from "@/components/cart/PaymentHandler";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

export default function Cart() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("stripe");
  const [shippingAddress, setShippingAddress] = useState<string>("");
  const { deleteItemMutation } = useCartMutations();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
  });

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
      return items;
    },
  });

  const orderCreation = useOrderCreation({
    cartItems,
    shippingAddress,
    userId: session?.user?.id || "",
    paymentMethod: selectedPaymentMethod,
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

    try {
      const order = await orderCreation.mutateAsync();
      const { handlePayment } = PaymentHandler({ 
        orderId: order.id, 
        paymentMethod: selectedPaymentMethod 
      });
      await handlePayment();
    } catch (error) {
      // Error is already handled by the mutation
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 mt-16 space-y-6">
        <BreadcrumbNav
          items={[
            { label: "Home", href: "/" },
            { label: "Cart" },
          ]}
        />
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Button>
        </div>
        
        {!cartItems?.length ? (
          <Card className="shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <p className="text-center text-gray-700 dark:text-gray-300 font-medium text-lg">Your cart is empty</p>
                <Button
                  className="mt-4 mx-auto block w-full sm:w-auto px-4 py-2 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => navigate("/")}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Start Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-gray-800 dark:text-gray-100">Cart Items ({cartItems.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
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
              </CardContent>
            </Card>

            <Card className="shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-gray-800 dark:text-gray-100">Checkout Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <CartSummary
                  currency={cartItems[0]?.product.currency || "USD"}
                  totalAmount={cartItems.reduce(
                    (sum, item) => sum + item.product.price * item.quantity,
                    0
                  )}
                  selectedPaymentMethod={selectedPaymentMethod}
                  onPaymentMethodChange={setSelectedPaymentMethod}
                  onCheckout={handleCheckout}
                  isLoading={orderCreation.isPending}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
