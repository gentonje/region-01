import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Navigation, BottomNavigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";

interface UserStats {
  id: string;
  username: string | null;
  product_count: string; // Changed to string as count returns a string
}

const AdminUsers = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ["users-stats"],
    queryFn: async () => {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username');

      if (profilesError) throw profilesError;

      // Then get product counts for each profile
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
        )}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default AdminUsers;