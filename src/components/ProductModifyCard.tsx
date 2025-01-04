import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface ProductModifyCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    product_status?: string;
    profiles?: {
      username?: string;
      full_name?: string;
    };
  };
  onDelete: (productId: string) => Promise<void>;
}

export const ProductModifyCard = ({ product, onDelete }: ProductModifyCardProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const ownerName = product.profiles?.username || product.profiles?.full_name || 'Unknown User';
  const [isPublishing, setIsPublishing] = useState(false);

  // Query to check if the current user is an admin
  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const { data, error } = await supabase.rpc('is_admin', {
        user_id: user.id
      });
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      return data;
    }
  });

  // Mutation for updating product status
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await supabase
        .from('products')
        .update({ product_status: newStatus })
        .eq('id', product.id);

      if (error) throw error;
      return newStatus;
    },
    onMutate: async (newStatus) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['products'] });

      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData(['products']);

      // Optimistically update to the new value
      queryClient.setQueryData(['products'], (old: any) => {
        return old?.map((p: any) =>
          p.id === product.id ? { ...p, product_status: newStatus } : p
        );
      });

      return { previousProducts };
    },
    onError: (err, newStatus, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['products'], context?.previousProducts);
      toast.error('Failed to update product status');
    },
    onSuccess: (newStatus) => {
      toast.success(`Product ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the correct data
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsPublishing(false);
    },
  });
  
  const handlePublishChange = async () => {
    setIsPublishing(true);
    const newStatus = product.product_status === 'published' ? 'draft' : 'published';
    updateStatusMutation.mutate(newStatus);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-xl font-semibold">{product.title}</h2>
        <Badge variant="secondary" className="ml-2">
          {ownerName}
        </Badge>
      </div>
      <p className="text-gray-600 mb-4">{product.description}</p>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-lg font-bold">${product.price}</span>
          {isAdmin && (
            <div className="flex items-center space-x-2 relative">
              <Switch
                id={`publish-${product.id}`}
                checked={product.product_status === 'published'}
                onCheckedChange={handlePublishChange}
                disabled={isPublishing}
                className="data-[state=checked]:bg-green-500"
              />
              <Label
                htmlFor={`publish-${product.id}`}
                className="text-sm text-gray-600 min-w-[80px]"
              >
                {isPublishing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  product.product_status === 'published' ? 'Published' : 'Draft'
                )}
              </Label>
            </div>
          )}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/edit-product/${product.id}`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this product? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => await onDelete(product.id)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};