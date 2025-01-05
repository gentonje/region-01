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

export function CartIndicator() {
  const navigate = useNavigate();

  const { data: cartCount } = useQuery({
    queryKey: ["cartCount"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("cart_items")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 5000, // Refetch every 5 seconds
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
          <p>Cart ({cartCount} items)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}