import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Profile {
  id: string;
  user_type: string;
  contact_email?: string | null;
  full_name?: string | null;
}

const AdminManagement = () => {
  const [isUpdating, setIsUpdating] = useState(false);

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

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Admin Management</h1>
      <div className="rounded-lg border bg-card">
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px] min-w-[120px]">Name</TableHead>
                  <TableHead className="w-[200px] min-w-[150px]">Email</TableHead>
                  <TableHead className="w-[100px] min-w-[80px]">Role</TableHead>
                  <TableHead className="w-[120px] min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles?.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.full_name || 'N/A'}</TableCell>
                    <TableCell>{profile.contact_email || 'N/A'}</TableCell>
                    <TableCell>{profile.user_type || 'user'}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full whitespace-nowrap"
                        onClick={() => handleToggleAdmin(profile.id, profile.user_type !== 'admin')}
                        disabled={isUpdating || profile.user_type === 'super_admin'}
                      >
                        {profile.user_type === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AdminManagement;