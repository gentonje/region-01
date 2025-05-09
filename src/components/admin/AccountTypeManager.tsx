
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
import { AccountType } from "@/types/profile";
import { AccountLimits, DEFAULT_ACCOUNT_LIMITS } from "@/types/product";

interface User {
  id: string;
  username: string;
  full_name: string;
  account_type: AccountType;
  custom_product_limit: number | null;
}

export const AccountTypeManager = () => {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType>("basic");
  const [customLimit, setCustomLimit] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountLimits, setAccountLimits] = useState<AccountLimits>(DEFAULT_ACCOUNT_LIMITS);

  // Fetch users
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users", searchQuery],
    queryFn: async () => {
      try {
        let query = supabase
          .from("profiles")
          .select("id, username, full_name, account_type, custom_product_limit")
          .order("username");
        
        if (searchQuery) {
          query = query.ilike("username", `%${searchQuery}%`);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching users:", error);
          toast.error("Failed to load users");
          return [];
        }
        
        // Ensure each user has at least basic properties
        return (data || []).map(user => ({
          id: user.id,
          username: user.username || '',
          full_name: user.full_name || '',
          account_type: (user.account_type as AccountType) || 'basic',
          custom_product_limit: user.custom_product_limit
        })) as User[];
      } catch (err) {
        console.error("Error in users query:", err);
        return [] as User[];
      }
    }
  });

  // Get product counts for each user
  const { data: productCounts = {} } = useQuery({
    queryKey: ["user-product-counts"],
    queryFn: async () => {
      if (!users?.length) return {};
      
      try {
        const counts: Record<string, number> = {};
        
        await Promise.all(
          users.map(async (user) => {
            const { count, error } = await supabase
              .from("products")
              .select("*", { count: 'exact', head: true })
              .eq("user_id", user.id);
              
            if (error) {
              console.error(`Error getting product count for user ${user.id}:`, error);
              counts[user.id] = 0;
            } else {
              counts[user.id] = count || 0;
            }
          })
        );
        
        return counts;
      } catch (err) {
        console.error("Error in product counts query:", err);
        return {};
      }
    },
    enabled: !!users?.length
  });

  // Update user account type
  const updateAccountType = useMutation({
    mutationFn: async () => {
      if (!selectedUserId) {
        throw new Error("No user selected");
      }
      
      const updateData = {
        account_type: selectedAccountType,
        custom_product_limit: selectedAccountType === "enterprise" ? customLimit : null
      };
      
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
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

  // Handle account type update
  const handleUpdateAccountType = () => {
    updateAccountType.mutate();
  };

  // Handle account limit update
  const handleAccountLimitUpdate = (type: keyof AccountLimits, value: number | null) => {
    setAccountLimits({
      ...accountLimits,
      [type]: value
    });
    
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} account limit updated successfully`);
  };

  const getLimitForAccountType = (type: string) => {
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
              ) : !users?.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center">No users found</td>
                </tr>
              ) : (
                users.map((user) => (
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
                          setSelectedAccountType((user.account_type as AccountType) || 'basic');
                          setCustomLimit(user.custom_product_limit || null);
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
                  onValueChange={(value) => setSelectedAccountType(value as AccountType)}
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
