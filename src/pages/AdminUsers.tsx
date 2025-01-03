import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Navigation, BottomNavigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Users, BarChart, Package } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type ProductCategory = Database['public']['Enums']['product_category'];

interface UserStats {
  id: string;
  username: string | null;
  product_count: string;
}

interface CategoryStats {
  category: ProductCategory;
  count: number;
}

const AdminUsers = () => {
  const { data: users, isLoading: isUsersLoading } = useQuery({
    queryKey: ["users-stats"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username');

      if (profilesError) throw profilesError;

      const profilesWithCounts = await Promise.all(
        profiles.map(async (profile) => {
          const { count, error: countError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);

          if (countError) throw countError;

          return {
            ...profile,
            product_count: String(count || 0)
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
            {/* Total Products Card */}
            <Card className="p-4 mb-6">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Total Products</h3>
                  <p className="text-2xl font-bold">{totalProducts}</p>
                </div>
              </div>
            </Card>

            {/* Category Statistics */}
            <h2 className="text-xl font-semibold mb-4">Products by Category</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {categoryStats?.map((stat) => (
                <Card key={stat.category} className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">{stat.category}</h3>
                      <p className="text-sm text-muted-foreground">
                        {stat.count} products
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* User Statistics */}
            <h2 className="text-xl font-semibold mb-4">Users</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {users?.map((user) => (
                <Card key={user.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">{user.username || "Anonymous User"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {user.product_count} products listed
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default AdminUsers;