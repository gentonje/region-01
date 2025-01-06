import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  return (
    <div className="flex items-center space-x-2 relative">
      <Switch
        id={`publish-${productId}`}
        checked={initialStatus === 'published'}
        onCheckedChange={handlePublishChange}
        disabled={isPublishing}
        className="data-[state=checked]:bg-green-500"
      />
      <Label
        htmlFor={`publish-${productId}`}
        className="text-sm text-gray-600 min-w-[80px]"
      >
        {isPublishing ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <span>Updating...</span>
          </div>
        ) : (
          initialStatus === 'published' ? 'Published' : 'Draft'
        )}
      </Label>
    </div>
  );
};