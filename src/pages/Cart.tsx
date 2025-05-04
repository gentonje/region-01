
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generateQueryKey } from "@/utils/queryUtils";

interface CartItemType {
  id: string;
  quantity: number;
  product_id: string;
  product: {
    id: string;
    title: string;
    price: number;
    currency: string;
    in_stock: boolean;
    user_id: string;
  };
}

const Cart = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("stripe");

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: generateQueryKey("cart", {}),
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not logged in");

      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          id, 
          quantity,
          product_id,
          product:products(
            id, 
            title, 
            price, 
            currency,
            in_stock,
            user_id
          )
        `)
        .eq("user_id", user.user.id);

      if (error) throw error;
      
      // Transform the data to match CartItemType
      const transformedData: CartItemType[] = data?.map(item => ({
        ...item,
        product: Array.isArray(item.product) && item.product.length > 0 
          ? item.product[0] 
          : { 
              id: "", 
              title: "", 
              price: 0, 
              currency: "SSP", 
              in_stock: false, 
              user_id: "" 
            }
      })) || [];
      
      return transformedData;
    },
  });

  const deleteCartItemMutation = useMutation({
    mutationFn: async (cartItemId: string) => {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", cartItemId);

      if (error) throw error;
      return cartItemId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart_items", { type: "count" }] });
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove item: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

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

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  ) || 0;

  const handleDeleteItem = (cartItemId: string) => {
    deleteCartItemMutation.mutate(cartItemId);
  };

  return (
    <div className="max-w-3xl mx-auto px-1 py-8">
      <BreadcrumbNav
        items={[
          { href: "/products", label: "Home" },
          { label: "Cart" },
        ]}
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading cart...</div>
      ) : cartItems?.length === 0 ? (
        <div className="text-center py-8 space-y-4">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400" />
          <h2 className="text-xl font-medium">Your cart is empty</h2>
          <p className="text-gray-500">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Button onClick={() => navigate("/products")}>Start Shopping</Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4 border">
            <h2 className="text-lg font-medium border-b pb-2">
              Cart Items ({cartItems?.length})
            </h2>
            <div className="space-y-4">
              {cartItems?.map((item) => (
                <CartItem
                  key={item.id}
                  id={item.id}
                  title={item.product.title}
                  quantity={item.quantity}
                  price={item.product.price}
                  currency={item.product.currency || "SSP"}
                  onDelete={() => handleDeleteItem(item.id)}
                />
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border">
            <h2 className="text-lg font-medium border-b pb-2 mb-4">
              Checkout Summary
            </h2>
            <CartSummary
              currency="SSP"
              totalAmount={totalAmount}
              selectedPaymentMethod={selectedPaymentMethod}
              onPaymentMethodChange={setSelectedPaymentMethod}
              onCheckout={proceedToCheckout}
              isLoading={deleteCartItemMutation.isPending}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
