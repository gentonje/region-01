
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Navigation, BottomNavigation } from "@/components/Navigation";
import { Database } from "@/integrations/supabase/types";
import { UserStatsCard } from "@/components/admin/UserStatsCard";
import { CategoryStatsCard } from "@/components/admin/CategoryStatsCard";
import { TotalProductsCard } from "@/components/admin/TotalProductsCard";
import { useAuth } from "@/contexts/AuthContext";
import { UserProductGroup } from "@/components/UserProductGroup";
import { toast } from "sonner";

type ProductCategory = Database['public']['Enums']['product_category'];

interface UserStats {
  id: string;
  username: string | null;
  product_count: string;
  is_active: boolean;
  categories?: { category: ProductCategory; count: number }[];
}

interface CategoryStats {
  category: ProductCategory;
  count: number;
}

const AdminUsers = () => {
  const { session } = useAuth();
  const { data: users, isLoading: isUsersLoading, refetch } = useQuery({
    queryKey: ["users-products"],
    queryFn: async () => {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, is_active');

      if (profilesError) throw profilesError;

      // Then for each profile, get their products with all product images
      const profilesWithProducts = await Promise.all(
        profiles.map(async (profile) => {
          const { data: products, error: productsError } = await supabase
            .from('products')
            .select('*, product_images(*), profiles:user_id(username, full_name)')
            .eq('user_id', profile.id);

          if (productsError) throw productsError;

          return {
            ...profile,
            products: products || []
          };
        })
      );

      return profilesWithProducts;
    }
  });

  const handleDeleteProduct = async (productId: string) => {
    try {
      // First delete all product images
      const { error: imagesError } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productId);

      if (imagesError) throw imagesError;

      // Then delete the product
      const { error: productError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (productError) throw productError;
      
      // Refetch the data to update the UI
      await refetch();
      
      toast.success('Product deleted successfully');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Failed to delete product');
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <Navigation />
      <main className="container mx-auto px-4 pt-20">
        <BreadcrumbNav items={[{ label: "Admin Users" }]} />
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        
        {isUsersLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {users?.map((user) => (
              <UserProductGroup
                key={user.id}
                username={user.username || 'Anonymous User'}
                products={user.products}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        )}
      </main>
      <BottomNavigation isAuthenticated={!!session} />
    </div>
  );
};

export default AdminUsers;
