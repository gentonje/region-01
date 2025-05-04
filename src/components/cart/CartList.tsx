
import { CartItem } from "./CartItem";
import { AnimatePresence, motion } from "framer-motion";
import { useCartMutations } from "@/hooks/useCartMutations";
import { CartItemType } from "@/hooks/useCart";

interface CartListProps {
  items: CartItemType[];
}

export function CartList({ items }: CartListProps) {
  const { deleteItemMutation, updateQuantityMutation } = useCartMutations();

  const handleDeleteItem = (cartItemId: string) => {
    deleteItemMutation.mutate(cartItemId);
  };

  // Container animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };

  // Debug cart items
  console.log("CartList items:", items);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <AnimatePresence>
        {items?.map((item) => {
          console.log("Rendering cart item:", item.id, item.product);
          return (
            <CartItem
              key={item.id}
              id={item.id}
              title={item.product?.title || "Unnamed Product"}
              quantity={item.quantity}
              price={item.product?.price || 0}
              currency={item.product?.currency || "SSP"}
              onDelete={() => handleDeleteItem(item.id)}
            />
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
