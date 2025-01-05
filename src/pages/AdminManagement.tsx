import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, UserCheck, UserX, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const AdminManagement = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  // Query to get all users with their profiles
  const { data: users, isLoading } = useQuery({
    queryKey: ["users-with-profiles"],
    queryFn: async () => {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) {
        toast.error("Failed to fetch users");
        throw profilesError;
      }

      // Then get the emails for these profiles
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        toast.error("Failed to fetch user emails");
        throw authError;
      }

      // Combine the data
      const usersWithEmails = profiles.map(profile => ({
        ...profile,
        auth_users: {
          email: authData.users.find(user => user.id === profile.id)?.email
        }
      }));

      return usersWithEmails;
    },
  });

  // Mutation to toggle admin status
  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, shouldBeAdmin }: { userId: string; shouldBeAdmin: boolean }) => {
      const { error } = await supabase.rpc("manage_admin_user", {
        target_user_id: userId,
        should_be_admin: shouldBeAdmin,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-with-profiles"] });
      toast.success("User admin status updated successfully");
    },
    onError: (error) => {
      console.error("Error updating admin status:", error);
      toast.error("Failed to update user admin status");
    },
  });

  const handleToggleAdmin = (userId: string, currentType: string | null) => {
    const shouldBeAdmin = currentType !== "admin";
    toggleAdminMutation.mutate({ userId, shouldBeAdmin });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-16">
        <Navigation />
        <main className="container mx-auto px-4 pt-20">
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <Navigation />
      <main className="container mx-auto px-4 pt-20">
        <BreadcrumbNav items={[{ label: "Admin Management" }]} />
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Admin Management</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users?.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{user.full_name || "Unnamed User"}</h3>
                  <p className="text-sm text-muted-foreground">{user.username || "No username"}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Mail className="h-3 w-3" />
                    <span>{user.auth_users?.email || "No email"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Type: {user.user_type || "regular user"}
                  </p>
                </div>
                {user.user_type !== "super_admin" && (
                  <Button
                    variant={user.user_type === "admin" ? "destructive" : "default"}
                    size="sm"
                    onClick={() => handleToggleAdmin(user.id, user.user_type)}
                    disabled={toggleAdminMutation.isPending}
                  >
                    {user.user_type === "admin" ? (
                      <UserX className="h-4 w-4 mr-1" />
                    ) : (
                      <UserCheck className="h-4 w-4 mr-1" />
                    )}
                    {user.user_type === "admin" ? "Remove Admin" : "Make Admin"}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminManagement;