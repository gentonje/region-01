
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccountLimits, DEFAULT_ACCOUNT_LIMITS } from "@/types/product";

export const AccountTypeManager = () => {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedAccountType, setSelectedAccountType] = useState<string>("basic");
  const [customLimit, setCustomLimit] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Get account limits
  const { data: accountLimits } = useQuery({
    queryKey: ["account-limits"],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("*")
        .eq("key", "account_limits")
        .single();

      if (data?.value) {
        return data.value as AccountLimits;
      }
      return DEFAULT_ACCOUNT_LIMITS;
    }
  });

  // Fetch users
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["users", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("id, username, full_name, account_type, custom_product_limit")
        .order("username");
      
      if (searchQuery) {
        query = query.ilike("username", `%${searchQuery}%`);
      }
      
      const { data } = await query;
      return data;
    }
  });

  // Get product counts for each user
  const { data: productCounts } = useQuery({
    queryKey: ["user-product-counts"],
    queryFn: async () => {
      if (!users) return {};
      
      const counts: Record<string, number> = {};
      
      await Promise.all(
        users.map(async (user) => {
          const { count } = await supabase
            .from("products")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", user.id);
            
          counts[user.id] = count || 0;
        })
      );
      
      return counts;
    },
    enabled: !!users
  });

  // Update user account type
  const updateAccountType = useMutation({
    mutationFn: async () => {
      if (!selectedUserId) {
        throw new Error("No user selected");
      }
      
      const { error } = await supabase
        .from("profiles")
        .update({ 
          account_type: selectedAccountType,
          custom_product_limit: selectedAccountType === "enterprise" ? customLimit : null 
        })
        .eq("id", selectedUserId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Account type updated successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSelectedUserId(null);
    },
    onError: (error) => {
      toast.error(`Failed to update account type: ${error.message}`);
    }
  });

  // Update account limits
  const updateAccountLimits = useMutation({
    mutationFn: async (newLimits: AccountLimits) => {
      const { error } = await supabase
        .from("app_settings")
        .upsert({ 
          key: "account_limits",
          value: newLimits
        });
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Account limits updated successfully");
      queryClient.invalidateQueries({ queryKey: ["account-limits"] });
    },
    onError: (error) => {
      toast.error(`Failed to update account limits: ${error.message}`);
    }
  });

  // Handle account type update
  const handleUpdateAccountType = () => {
    updateAccountType.mutate();
  };

  // Handle account limit update
  const handleAccountLimitUpdate = (type: keyof AccountLimits, value: number | null) => {
    if (!accountLimits) return;
    
    const newLimits = {
      ...accountLimits,
      [type]: value
    };
    
    updateAccountLimits.mutate(newLimits);
  };

  const getLimitForAccountType = (type: string) => {
    if (!accountLimits) return 0;
    
    switch (type) {
      case 'basic':
        return accountLimits.basic;
      case 'starter':
        return accountLimits.starter;
      case 'premium':
        return accountLimits.premium;
      case 'enterprise':
        return 'Custom';
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Account Types & Limits</h2>
      
      {/* Account type limits management */}
      <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
        <h3 className="text-md font-semibold mb-2">Product Upload Limits</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Basic Account</label>
            <Input
              type="number"
              value={accountLimits?.basic || 5}
              onChange={(e) => handleAccountLimitUpdate('basic', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Starter Account</label>
            <Input
              type="number"
              value={accountLimits?.starter || 15}
              onChange={(e) => handleAccountLimitUpdate('starter', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Premium Account</label>
            <Input
              type="number"
              value={accountLimits?.premium || 30}
              onChange={(e) => handleAccountLimitUpdate('premium', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      {/* User account type management */}
      <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
        <h3 className="text-md font-semibold mb-2">User Account Management</h3>
        
        <div className="mb-4">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="overflow-auto max-h-64">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product Limit</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Products</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loadingUsers ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center">Loading users...</td>
                </tr>
              ) : (
                users?.map((user) => (
                  <tr key={user.id} className={selectedUserId === user.id ? "bg-blue-50 dark:bg-blue-900/20" : ""}>
                    <td className="px-4 py-2">{user.username || user.full_name || "User"}</td>
                    <td className="px-4 py-2">{user.account_type || "basic"}</td>
                    <td className="px-4 py-2">
                      {user.account_type === 'enterprise' && user.custom_product_limit ? 
                        user.custom_product_limit : 
                        getLimitForAccountType(user.account_type || 'basic')}
                    </td>
                    <td className="px-4 py-2">{productCounts?.[user.id] || 0}</td>
                    <td className="px-4 py-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setSelectedAccountType(user.account_type || 'basic');
                          setCustomLimit(user.custom_product_limit);
                        }}
                      >
                        Select
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {selectedUserId && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
            <h4 className="text-sm font-semibold mb-4">Update Account Type</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Account Type</label>
                <Select
                  value={selectedAccountType}
                  onValueChange={setSelectedAccountType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {selectedAccountType === 'enterprise' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Custom Product Limit</label>
                  <Input
                    type="number"
                    value={customLimit || ''}
                    onChange={(e) => setCustomLimit(parseInt(e.target.value) || null)}
                    placeholder="Custom limit"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedUserId(null)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateAccountType}
                disabled={updateAccountType.isPending}
              >
                Update Account Type
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
