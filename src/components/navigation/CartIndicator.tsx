import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

export function CartIndicator() {
  const navigate = useNavigate();

  const { data: cartCount, error } = useQuery({
    queryKey: ["cartCount"],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from("cart_items")
          .select("*", { count: "exact", head: true });

        if (error) {
          console.error("Error fetching cart count:", error);
          throw error;
        }
        return count || 0;
      } catch (err) {
        console.error("Failed to fetch cart count:", err);
        toast.error("Unable to load cart items. Please try again later.");
        return 0;
      }
    },
    refetchInterval: 5000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-all duration-300"
            onClick={() => navigate("/cart")}
          >
            <ShoppingCart className="h-5 w-5 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Cart ({cartCount || 0} items)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}