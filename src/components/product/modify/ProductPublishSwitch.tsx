
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ToggleLeft, ToggleRight } from "lucide-react";

interface ProductPublishSwitchProps {
  productId: string;
  initialStatus: string;
}

export const ProductPublishSwitch = ({ productId, initialStatus }: ProductPublishSwitchProps) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await supabase
        .from('products')
        .update({ product_status: newStatus })
        .eq('id', productId);

      if (error) throw error;
      return newStatus;
    },
    onMutate: async (newStatus) => {
      await queryClient.cancelQueries({ queryKey: ['users-products'] });
      const previousProducts = queryClient.getQueryData(['users-products']);
      // Update optimistically
      setCurrentStatus(newStatus);
      
      queryClient.setQueryData(['users-products'], (old: any) => {
        return old?.map((user: any) => ({
          ...user,
          products: user.products.map((p: any) =>
            p.id === productId ? { ...p, product_status: newStatus } : p
          )
        }));
      });
      return { previousProducts };
    },
    onError: (err, newStatus, context) => {
      // Roll back to the previous state on error
      setCurrentStatus(initialStatus);
      queryClient.setQueryData(['users-products'], context?.previousProducts);
      toast.error('Failed to update product status');
    },
    onSuccess: (newStatus) => {
      toast.success(`Product ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users-products'] });
      setIsPublishing(false);
    },
  });
  
  const handlePublishChange = async () => {
    setIsPublishing(true);
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    updateStatusMutation.mutate(newStatus);
  };

  const isPublished = currentStatus === 'published';

  return (
    <div className="flex items-center space-x-3 relative p-1 bg-background/50 backdrop-blur-sm rounded-lg shadow-sm">
      <Switch
        id={`publish-${productId}`}
        checked={isPublished}
        onCheckedChange={handlePublishChange}
        disabled={isPublishing}
        className={`${isPublished ? 'bg-green-500' : 'bg-red-500'} h-6 w-12 relative`}
      />
      <div className="flex items-center gap-1">
        {isPublished ? (
          <ToggleRight className="h-5 w-5 text-green-500" />
        ) : (
          <ToggleLeft className="h-5 w-5 text-red-500" />
        )}
        <span className="text-xs font-medium">
          {isPublished ? 'Published' : 'Draft'}
        </span>
      </div>
      {isPublishing && (
        <div className="flex items-center space-x-2 absolute right-0 top-0 bottom-0 bg-background/80 backdrop-blur-sm rounded-r-lg px-2">
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
          <span className="text-sm text-gray-600">Updating...</span>
        </div>
      )}
    </div>
  );
};
