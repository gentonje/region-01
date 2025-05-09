
import { useState } from "react";
import { toast } from "sonner";
import { AccountLimits, DEFAULT_ACCOUNT_LIMITS } from "@/types/product";
import { AccountType } from "@/types/profile";
import { AccountLimitsEditor } from "./account-types/AccountLimitsEditor";
import { UserAccountsTable } from "./account-types/UserAccountsTable";
import { AccountTypeEditor } from "./account-types/AccountTypeEditor";
import { useUserAccounts } from "./account-types/hooks/useUserAccounts";
import { useAccountTypeUpdate } from "./account-types/hooks/useAccountTypeUpdate";

export const AccountTypeManager = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType>("basic");
  const [customLimit, setCustomLimit] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountLimits, setAccountLimits] = useState<AccountLimits>(DEFAULT_ACCOUNT_LIMITS);

  // Use our custom hooks
  const { users, productCounts, isLoading } = useUserAccounts(searchQuery);
  const updateAccountType = useAccountTypeUpdate();

  // Handle account type update
  const handleUpdateAccountType = () => {
    if (!selectedUserId) return;

    updateAccountType.mutate({
      userId: selectedUserId,
      accountType: selectedAccountType,
      customLimit
    }, {
      onSuccess: () => setSelectedUserId(null)
    });
  };

  // Handle account limit update
  const handleAccountLimitUpdate = (type: keyof AccountLimits, value: number | null) => {
    setAccountLimits({
      ...accountLimits,
      [type]: value
    });
    
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} account limit updated successfully`);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Account Types & Limits</h2>
      
      {/* Account type limits management */}
      <AccountLimitsEditor 
        accountLimits={accountLimits}
        onLimitUpdate={handleAccountLimitUpdate}
      />
      
      {/* User account type management */}
      <UserAccountsTable
        users={users}
        productCounts={productCounts}
        selectedUserId={selectedUserId}
        accountLimits={accountLimits}
        searchQuery={searchQuery}
        loadingUsers={isLoading}
        onSearchChange={setSearchQuery}
        onSelectUser={(userId) => {
          const user = users.find(u => u.id === userId);
          if (user) {
            setSelectedUserId(userId);
            setSelectedAccountType(user.account_type);
            setCustomLimit(user.custom_product_limit);
          }
        }}
      />
      
      {/* Editor for updating account type */}
      {selectedUserId && (
        <AccountTypeEditor
          selectedUserId={selectedUserId}
          selectedAccountType={selectedAccountType}
          customLimit={customLimit}
          isPending={updateAccountType.isPending}
          onAccountTypeChange={setSelectedAccountType}
          onCustomLimitChange={setCustomLimit}
          onCancel={() => setSelectedUserId(null)}
          onUpdate={handleUpdateAccountType}
        />
      )}
    </div>
  );
};
