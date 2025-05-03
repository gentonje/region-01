
import { UserStatsCard } from "@/components/admin/UserStatsCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserProductGroup } from "@/components/UserProductGroup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Product } from "@/types/product";

interface UserStat {
  id: string;
  username: string | null;
  product_count: string;
  is_active: boolean;
  user_type?: string;
}

const AdminUsers = () => {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: userStats, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      // Get statistics from profiles table
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id, 
          username, 
          user_type,
          is_active
        `)
        .order("username");

      if (error) throw error;

      // Get product counts for each user
      const statsWithCounts = await Promise.all(
        data.map(async (user) => {
          const { count, error: countError } = await supabase
            .from("products")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", user.id);
          
          if (countError) {
            console.error("Error getting product count:", countError);
            return { ...user, product_count: "0" };
          }
          
          return { ...user, product_count: String(count || 0) };
        })
      );
      
      return statsWithCounts as UserStat[];
    },
  });

  const { data: userProducts, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["user-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          profiles:user_id (
            username,
            full_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group products by user
      const productsByUser: Record<string, any[]> = {};
      
      data.forEach(product => {
        const username = product.profiles?.username || "unknown";
        if (!productsByUser[username]) {
          productsByUser[username] = [];
        }
        productsByUser[username].push(product);
      });

      return productsByUser;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);
      
      if (error) throw error;
      return productId;
    },
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["user-products"] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
    },
    onError: (error) => {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  });

  const handleDelete = async (productId: string) => {
    deleteMutation.mutate(productId);
  };

  const filteredUsers = userStats?.filter(user => 
    (user.username?.toLowerCase() || "").includes(search.toLowerCase()) ||
    String(user.id).includes(search)
  );

  const filteredProducts = userProducts ? 
    Object.fromEntries(
      Object.entries(userProducts).filter(([username]) => 
        username.toLowerCase().includes(search.toLowerCase())
      )
    ) : {};

  return (
    <div className="mx-1 sm:mx-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
      
      <div className="mb-4 flex w-full items-center space-x-2">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products by User</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          {isLoadingUsers ? (
            <div className="text-center py-4">Loading user data...</div>
          ) : filteredUsers?.length === 0 ? (
            <div className="text-center py-4">No users found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUsers?.map((user) => (
                <UserStatsCard
                  key={user.id}
                  id={user.id}
                  username={user.username}
                  product_count={user.product_count}
                  is_active={user.is_active}
                  user_type={user.user_type}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          {isLoadingProducts ? (
            <div className="text-center py-4">Loading product data...</div>
          ) : Object.keys(filteredProducts).length === 0 ? (
            <div className="text-center py-4">No products found</div>
          ) : (
            Object.entries(filteredProducts).map(([username, products]) => (
              <UserProductGroup
                key={username}
                username={username}
                products={products}
                onDelete={handleDelete}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUsers;
