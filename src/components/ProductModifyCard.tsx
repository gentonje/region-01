import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductModifyHeader } from "./product/modify/ProductModifyHeader";
import { ProductModifyActions } from "./product/modify/ProductModifyActions";
import { ProductPublishSwitch } from "./product/modify/ProductPublishSwitch";

interface ProductModifyCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    product_status?: string;
    profiles?: {
      username?: string;
      full_name?: string;
    };
  };
  onDelete: (productId: string) => Promise<void>;
}

export const ProductModifyCard = ({ product, onDelete }: ProductModifyCardProps) => {
  const ownerName = product.profiles?.username || product.profiles?.full_name || 'Unknown User';

  const { data: isAdminOrSuper } = useQuery({
    queryKey: ["isAdminOrSuper"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin', {
        user_id: user.id
      });
      
      if (adminError) {
        console.error('Error checking admin status:', adminError);
        return false;
      }

      const { data: isSuperAdmin, error: superError } = await supabase.rpc('is_super_admin', {
        user_id: user.id
      });
      
      if (superError) {
        console.error('Error checking super admin status:', superError);
        return false;
      }
      
      return isAdmin || isSuperAdmin;
    }
  });

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <ProductModifyHeader title={product.title} ownerName={ownerName} />
      <p className="text-gray-600 mb-4">{product.description}</p>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-lg font-bold">${product.price}</span>
          {isAdminOrSuper && (
            <ProductPublishSwitch 
              productId={product.id} 
              initialStatus={product.product_status || 'draft'} 
            />
          )}
        </div>
        <ProductModifyActions productId={product.id} onDelete={onDelete} />
      </div>
    </div>
  );
};