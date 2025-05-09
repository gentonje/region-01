
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AccountType } from "@/types/profile";

interface UpdateAccountTypeParams {
  userId: string;
  accountType: AccountType;
  customLimit: number | null;
}

export const useAccountTypeUpdate = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ userId, accountType, customLimit }: UpdateAccountTypeParams) => {
      if (!userId) {
        throw new Error("No user selected");
      }
      
      const updateData = {
        account_type: accountType,
        custom_product_limit: accountType === "enterprise" ? customLimit : null
      };
      
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Account type updated successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error(`Failed to update account type: ${error.message}`);
    }
  });

  return updateMutation;
};
