
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
import { generateQueryKey, optimizedSelect } from "@/utils/queryUtils";

export function CartIndicator() {
  const navigate = useNavigate();

  const { data: cartCount = 0, error } = useQuery({
    queryKey: generateQueryKey("cart_items", { type: "count" }),
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return 0;

      try {
        const query = optimizedSelect("cart_items", "id", {
          filters: { user_id: session.user.id },
        });
        const { count, error } = await query;

        if (error) throw error;
        return count || 0;
      } catch (err) {
        console.error("Failed to fetch cart count:", err);
        toast.error("Unable to load cart items");
        return 0;
      }
    },
    staleTime: 1000 * 30, // 30 seconds
    cacheTime: 1000 * 60 * 5, // 5 minutes
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
