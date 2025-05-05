
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { CurrencyManager } from "@/components/admin/CurrencyManager";

interface User {
  id: string;
  username: string | null;
  user_type: string;
}

const AdminManagement = () => {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  // Fetch users from profiles with user type
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get profile data including user type - but exclude email since it doesn't exist in profiles table
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, user_type")
        .order("username", { ascending: true });

      if (error) throw error;
      return data as User[];
    },
  });

  // Mutation to update user role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string, newRole: 'user' | 'admin' }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update({ user_type: newRole })
        .eq("id", userId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User role updated successfully");
    },
    onError: (error) => {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  });

  const handleUpdateUserRole = (userId: string, role: 'user' | 'admin') => {
    updateRoleMutation.mutate({ userId, newRole: role });
  };

  const filteredUsers = users?.filter(
    (user) =>
      (user.username?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="mx-1 sm:mx-1 py-1 space-y-1">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mx-1">Admin Management</h1>

      <div className="mb-1 flex w-full items-center space-x-1 mx-1">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-1 border mx-1">
        <h2 className="text-xl font-semibold mb-1 mx-1">Users</h2>
        {isLoading ? (
          <div className="text-center py-1">Loading...</div>
        ) : (
          <div className="space-y-1 mx-1">
            {filteredUsers?.map((user) => (
              <div
                key={user.id}
                className="border p-1 rounded-lg bg-gray-50 dark:bg-gray-900 my-1"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                  <div>
                    <h3 className="font-medium text-lg">{user.username || 'No username'}</h3>
                    <div className="mt-1">
                      <span className="text-xs font-medium px-1 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Role: {user.user_type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {user.user_type === "user" ? (
                      <Button
                        size="sm"
                        className="h-8 flex items-center gap-1"
                        onClick={() => handleUpdateUserRole(user.id, "admin")}
                      >
                        <UserCheck className="h-4 w-4" /> 
                        <span>Make Admin</span>
                      </Button>
                    ) : user.user_type === "admin" ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 flex items-center gap-1"
                        onClick={() => handleUpdateUserRole(user.id, "user")}
                      >
                        <UserX className="h-4 w-4" /> 
                        <span>Remove Admin</span>
                      </Button>
                    ) : (
                      <span className="text-xs bg-purple-100 text-purple-800 rounded-full px-1 py-1">
                        Super Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-1 border mx-1 my-1">
        <h2 className="text-xl font-semibold mb-1 mx-1">Manage Settings</h2>
        <div className="space-y-1 mx-1">
          <div>
            <CurrencyManager />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
