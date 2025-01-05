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
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select(`
            id,
            user_type,
            full_name,
            contact_email
          `)
          .in('user_type', ['buyer', 'seller', 'admin'])
          .not('user_type', 'eq', 'super_admin');

        if (error) {
          console.error("Error fetching profiles:", error);
          toast.error("Failed to fetch profiles");
          throw error;
        }

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

      if (error) throw error;

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Management</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles?.map((profile) => (
            <TableRow key={profile.id}>
              <TableCell>{profile.full_name || 'N/A'}</TableCell>
              <TableCell>{profile.contact_email || 'N/A'}</TableCell>
              <TableCell>{profile.user_type}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  onClick={() => handleToggleAdmin(profile.id, profile.user_type !== 'admin')}
                  disabled={isUpdating}
                >
                  {profile.user_type === 'admin' ? 'Remove Admin' : 'Make Admin'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminManagement;