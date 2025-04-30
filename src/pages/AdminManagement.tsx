
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { ProductFilters } from "@/components/ProductFilters";
import { Star } from "lucide-react";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

interface Profile {
  id: string;
  user_type: string;
  contact_email?: string | null;
  full_name?: string | null;
}

const AdminManagement = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: profiles, isLoading, refetch } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      try {
        console.log("Fetching profiles...");
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select(`
            id,
            user_type,
            full_name,
            contact_email
          `);

        if (error) {
          console.error("Error fetching profiles:", error);
          toast.error("Failed to fetch profiles");
          throw error;
        }

        console.log("Fetched profiles:", profiles);
        return profiles as Profile[];
      } catch (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }
    }
  });

  const handleToggleAdmin = async (userId: string, shouldBeAdmin: boolean) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase.rpc('manage_admin_user', {
        target_user_id: userId,
        should_be_admin: shouldBeAdmin
      });

      if (error) {
        console.error('Error updating admin status:', error);
        throw error;
      }

      await refetch();
      toast.success(`User ${shouldBeAdmin ? 'promoted to' : 'demoted from'} admin successfully`);
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast.error('Failed to update admin status');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredProfiles = profiles?.filter((profile) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      profile.full_name?.toLowerCase().includes(searchLower) ||
      profile.contact_email?.toLowerCase().includes(searchLower)
    );
  });

  // Sort profiles: admins first, then other users
  const sortedProfiles = filteredProfiles?.sort((a, b) => {
    if (a.user_type === 'admin' && b.user_type !== 'admin') return -1;
    if (a.user_type !== 'admin' && b.user_type === 'admin') return 1;
    return 0;
  });

  // Separate admins and regular users
  const adminProfiles = sortedProfiles?.filter(profile => profile.user_type === 'admin');
  const regularProfiles = sortedProfiles?.filter(profile => profile.user_type !== 'admin');

  return (
    <div className="w-full">
      <div className="container w-full mx-auto px-0 md:px-0 pt-20 pb-16">
        <div className="w-full max-w-none mx-auto space-y-1 m-1 p-1">
          <BreadcrumbNav items={[{ label: "Admin Management" }]} />
          <h1 className="text-2xl font-bold mb-4 dark:text-gray-100 m-1 p-1">Admin Management</h1>
          <ProductFilters onSearchChange={setSearchQuery} />
          
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Admin Section */}
              {adminProfiles && adminProfiles.length > 0 && (
                <div className="w-full space-y-1 m-1 p-1">
                  <h2 className="text-xl font-semibold mt-1 mb-1">Administrators</h2>
                  <div className="grid gap-1 md:grid-cols-2 lg:grid-cols-3">
                    {adminProfiles.map((profile) => (
                      <Card key={profile.id} className="overflow-hidden m-1 shadow-sm">
                        <CardContent className="p-1 space-y-1">
                          <div className="space-y-1">
                            <div className="font-medium flex items-center gap-1">
                              {profile.full_name || 'N/A'}
                              <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {profile.contact_email || 'N/A'}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="font-medium">Role</div>
                            <div className="text-sm text-muted-foreground">
                              {profile.user_type || 'user'}
                            </div>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-1"
                            onClick={() => handleToggleAdmin(profile.id, profile.user_type !== 'admin')}
                            disabled={isUpdating || profile.user_type === 'super_admin'}
                          >
                            {profile.user_type === 'admin' ? 'Remove Admin' : 'Make Admin'}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Users Section */}
              {regularProfiles && regularProfiles.length > 0 && (
                <div className="w-full space-y-1 m-1 p-1">
                  <h2 className="text-xl font-semibold mt-1 mb-1">Users</h2>
                  <div className="grid gap-1 md:grid-cols-2 lg:grid-cols-3">
                    {regularProfiles.map((profile) => (
                      <Card key={profile.id} className="overflow-hidden m-1 shadow-sm">
                        <CardContent className="p-1 space-y-1">
                          <div className="space-y-1">
                            <div className="font-medium">
                              {profile.full_name || 'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {profile.contact_email || 'N/A'}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="font-medium">Role</div>
                            <div className="text-sm text-muted-foreground">
                              {profile.user_type || 'user'}
                            </div>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-1"
                            onClick={() => handleToggleAdmin(profile.id, profile.user_type !== 'admin')}
                            disabled={isUpdating || profile.user_type === 'super_admin'}
                          >
                            {profile.user_type === 'admin' ? 'Remove Admin' : 'Make Admin'}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
