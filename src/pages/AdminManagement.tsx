
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { CurrencyManager } from "@/components/admin/CurrencyManager";

interface User {
  id: string;
  username: string;
  email: string;
  user_type: string;
}

const AdminManagement = () => {
  const [search, setSearch] = useState("");

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_all_users");
      if (error) throw error;
      return data as User[];
    },
  });

  const updateUserRole = async (userId: string, role: 'user' | 'admin') => {
    try {
      const { error } = await supabase.rpc("update_user_role", {
        user_id_param: userId,
        new_role_param: role,
      });

      if (error) throw error;

      toast.success(`User role updated to ${role}`);
      refetch();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  const filteredUsers = users?.filter(
    (user) =>
      user.username?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-1 sm:mx-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Management</h1>

      <div className="mb-4 flex w-full items-center space-x-2">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border">
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="space-y-6">
            {filteredUsers?.map((user) => (
              <div
                key={user.id}
                className="border p-4 rounded-lg bg-gray-50 dark:bg-gray-900"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-medium text-lg">{user.username || 'No username'}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    <div className="mt-1">
                      <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Role: {user.user_type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {user.user_type === "user" ? (
                      <Button
                        size="sm"
                        className="h-8 flex items-center gap-1"
                        onClick={() => updateUserRole(user.id, "admin")}
                      >
                        <UserCheck className="h-4 w-4" /> 
                        <span>Make Admin</span>
                      </Button>
                    ) : user.user_type === "admin" ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 flex items-center gap-1"
                        onClick={() => updateUserRole(user.id, "user")}
                      >
                        <UserX className="h-4 w-4" /> 
                        <span>Remove Admin</span>
                      </Button>
                    ) : (
                      <span className="text-xs bg-purple-100 text-purple-800 rounded-full px-2 py-1">
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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border">
        <h2 className="text-xl font-semibold mb-4">Manage Settings</h2>
        <div className="space-y-4">
          <div>
            <CurrencyManager />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
