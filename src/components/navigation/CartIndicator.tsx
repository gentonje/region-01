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
import { generateQueryKey } from "@/utils/queryUtils";
import { motion, AnimatePresence } from "framer-motion";

export function CartIndicator() {
  const navigate = useNavigate();

  const { data: cartCount = 0, error } = useQuery({
    queryKey: generateQueryKey("cart_items", { type: "count" }),
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return 0;

      try {
        const { count, error } = await supabase
          .from("cart_items")
          .select("id", { count: "exact" })
          .eq("user_id", session.user.id);

        if (error) throw error;
        return count || 0;
      } catch (err) {
        console.error("Failed to fetch cart count:", err);
        toast.error("Unable to load cart items");
        return 0;
      }
    },
    staleTime: 1000 * 5, // 5 seconds (reduced for more frequent updates)
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              className="relative backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-all duration-300"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="h-5 w-5 icon-glow" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Cart ({cartCount || 0} items)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
