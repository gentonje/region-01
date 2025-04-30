
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Database } from "@/integrations/supabase/types";
import { UserStatsCard } from "@/components/admin/UserStatsCard";
import { useAuth } from "@/contexts/AuthContext";
import { UserProductGroup } from "@/components/UserProductGroup";
import { toast } from "sonner";
import { MainLayout } from "@/components/layouts/MainLayout";

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
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, is_active');

      if (profilesError) throw profilesError;

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
      const { error: productError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (productError) throw productError;

      await refetch();
      
      toast.success('Product deleted successfully');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Failed to delete product');
    }
  };

  return (
    <div className="w-full">
      <div className="container w-full mx-auto px-0 md:px-0 pt-20 pb-16">
        <div className="w-full max-w-none mx-auto space-y-1 m-1 p-1">
          <BreadcrumbNav items={[{ label: "Admin Users" }]} />
          <h1 className="text-xl md:text-2xl font-bold mb-6 dark:text-gray-100 m-1 p-1">User Management</h1>
          
          {isUsersLoading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid gap-1 space-y-1 m-1 p-1">
              {users?.map((user) => (
                <div 
                  key={user.id}
                  className="rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg dark:hover:shadow-primary/5"
                >
                  <UserProductGroup
                    username={user.username || 'Anonymous User'}
                    products={user.products}
                    onDelete={handleDeleteProduct}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
