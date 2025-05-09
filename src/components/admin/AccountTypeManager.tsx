
import { useState } from "react";
import { toast } from "sonner";
import { AccountLimits, DEFAULT_ACCOUNT_LIMITS } from "@/types/product";
import { AccountLimitsEditor } from "./account-types/AccountLimitsEditor";
import { UserAccountsTable } from "./account-types/UserAccountsTable";
import { useUserAccounts } from "./account-types/hooks/useUserAccounts";

export const AccountTypeManager = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [accountLimits, setAccountLimits] = useState<AccountLimits>(DEFAULT_ACCOUNT_LIMITS);

  // Use our custom hooks
  const { users, productCounts, isLoading } = useUserAccounts(searchQuery);

  // Handle account limit update
  const handleAccountLimitUpdate = (type: keyof AccountLimits, value: number | null) => {
    setAccountLimits({
      ...accountLimits,
      [type]: value
    });
    
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} account limit updated successfully`);
  };

  return (
    <div className="space-y-1 p-1 w-full">
      <h2 className="text-lg font-semibold m-1">Account Types & Limits</h2>
      
      {/* Account type limits management */}
      <AccountLimitsEditor 
        accountLimits={accountLimits}
        onLimitUpdate={handleAccountLimitUpdate}
      />
      
      {/* User account type management */}
      <UserAccountsTable
        users={users}
        productCounts={productCounts}
        accountLimits={accountLimits}
        searchQuery={searchQuery}
        loadingUsers={isLoading}
        onSearchChange={setSearchQuery}
      />
    </div>
  );
};
