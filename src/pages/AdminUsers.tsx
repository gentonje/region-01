import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Navigation, BottomNavigation } from "@/components/Navigation";
import { Database } from "@/integrations/supabase/types";
import { UserStatsCard } from "@/components/admin/UserStatsCard";
import { CategoryStatsCard } from "@/components/admin/CategoryStatsCard";
import { TotalProductsCard } from "@/components/admin/TotalProductsCard";
import { useAuth } from "@/contexts/AuthContext";

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
  const { data: users, isLoading: isUsersLoading } = useQuery({
    queryKey: ["users-stats"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, is_active');

      if (profilesError) throw profilesError;

      const profilesWithCounts = await Promise.all(
        profiles.map(async (profile) => {
          const { count, error: countError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);

          if (countError) throw countError;

          const { data: categoryData, error: categoryError } = await supabase
            .from('products')
            .select('category')
            .eq('user_id', profile.id);

          if (categoryError) throw categoryError;

          const categoryCounts: Record<string, number> = {};
          categoryData.forEach(product => {
            if (product.category) {
              categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
            }
          });

          const categories = Object.entries(categoryCounts).map(([category, count]) => ({
            category: category as ProductCategory,
            count
          }));

          return {
            ...profile,
            product_count: String(count || 0),
            categories
          };
        })
      );

      return profilesWithCounts;
    }
  });

  const { data: categoryStats, isLoading: isCategoryLoading } = useQuery({
    queryKey: ["category-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category');

      if (error) throw error;

      const categoryCounts: Record<string, number> = {};
      data.forEach(product => {
        if (product.category) {
          categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
        }
      });

      return Object.entries(categoryCounts).map(([category, count]) => ({
        category: category as ProductCategory,
        count
      }));
    }
  });

  const { data: totalProducts, isLoading: isTotalLoading } = useQuery({
    queryKey: ["total-products"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    }
  });

  const isLoading = isUsersLoading || isCategoryLoading || isTotalLoading;

  return (
    <div className="min-h-screen pb-16">
      <Navigation />
      <main className="container mx-auto px-4 pt-20">
        <BreadcrumbNav items={[{ label: "Admin Users" }]} />
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            <TotalProductsCard total={totalProducts || 0} />

            <h2 className="text-xl font-semibold mb-4">Products by Category</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {categoryStats?.map((stat) => (
                <CategoryStatsCard
                  key={stat.category}
                  category={stat.category}
                  count={stat.count}
                />
              ))}
            </div>

            <h2 className="text-xl font-semibold mb-4">Users</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {users?.map((user) => (
                <UserStatsCard
                  key={user.id}
                  id={user.id}
                  username={user.username}
                  product_count={user.product_count}
                  is_active={user.is_active}
                />
              ))}
            </div>
          </>
        )}
      </main>
      <BottomNavigation isAuthenticated={!!session} />
    </div>
  );
};

export default AdminUsers;