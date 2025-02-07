
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previousProducts = queryClient.getQueryData(['products']);
      queryClient.setQueryData(['products'], (old: any) => {
        return old?.map((p: any) =>
          p.id === productId ? { ...p, product_status: newStatus } : p
        );
      });
      return { previousProducts };
    },
    onError: (err, newStatus, context) => {
      queryClient.setQueryData(['products'], context?.previousProducts);
      toast.error('Failed to update product status');
    },
    onSuccess: (newStatus) => {
      toast.success(`Product ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsPublishing(false);
    },
  });
  
  const handlePublishChange = async () => {
    setIsPublishing(true);
    const newStatus = initialStatus === 'published' ? 'draft' : 'published';
    updateStatusMutation.mutate(newStatus);
  };

  const isPublished = initialStatus === 'published';

  return (
    <div className="flex items-center space-x-2 relative">
      <Switch
        id={`publish-${productId}`}
        checked={isPublished}
        onCheckedChange={handlePublishChange}
        disabled={isPublishing}
        className={`${isPublished ? 'bg-green-500' : 'bg-red-500'}`}
      />
      {isPublished ? (
        <ToggleRight className="h-4 w-4 text-green-500" />
      ) : (
        <ToggleLeft className="h-4 w-4 text-red-500" />
      )}
      {isPublishing && (
        <div className="flex items-center space-x-2">
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
          <span className="text-sm text-gray-600">Updating...</span>
        </div>
      )}
    </div>
  );
};
