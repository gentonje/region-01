
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
      // Delete product images first
      const { error: imagesError } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productId);

      if (imagesError) throw imagesError;

      // Delete from cart items
      const { error: cartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('product_id', productId);

      if (cartError) throw cartError;

      // Delete from wishlist items
      const { error: wishlistError } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('product_id', productId);

      if (wishlistError) throw wishlistError;

      // Delete orders related to the product
      const { error: ordersError } = await supabase
        .from('orders')
        .delete()
        .eq('product_id', productId);

      if (ordersError) throw ordersError;

      // Delete product views
      const { error: viewsError } = await supabase
        .from('product_views')
        .delete()
        .eq('product_id', productId);

      if (viewsError) throw viewsError;

      // Delete reviews and their replies
      const { data: reviews, error: reviewsFetchError } = await supabase
        .from('reviews')
        .select('id')
        .eq('product_id', productId);

      if (reviewsFetchError) throw reviewsFetchError;

      if (reviews && reviews.length > 0) {
        const reviewIds = reviews.map(review => review.id);

        // Delete review replies
        const { error: repliesError } = await supabase
          .from('review_replies')
          .delete()
          .in('review_id', reviewIds);

        if (repliesError) throw repliesError;

        // Delete reviews
        const { error: reviewsError } = await supabase
          .from('reviews')
          .delete()
          .eq('product_id', productId);

        if (reviewsError) throw reviewsError;
      }

      // Finally delete the product
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
