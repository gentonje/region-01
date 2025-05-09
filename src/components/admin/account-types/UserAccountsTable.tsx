
import { Input } from "@/components/ui/input";
import { AccountLimits } from "@/types/product";
import { AccountType } from "@/types/profile";
import { Card } from "@/components/ui/card";
import { UserAccountCard } from "./UserAccountCard";

interface User {
  id: string;
  username: string;
  full_name: string;
  account_type: AccountType;
  custom_product_limit: number | null;
}

interface UserAccountsTableProps {
  users: User[];
  productCounts: Record<string, number>;
  accountLimits: AccountLimits;
  searchQuery: string;
  loadingUsers: boolean;
  onSearchChange: (query: string) => void;
}

export const UserAccountsTable = ({
  users,
  productCounts,
  accountLimits,
  searchQuery,
  loadingUsers,
  onSearchChange
}: UserAccountsTableProps) => {
  return (
    <Card className="p-1 border rounded-lg bg-white dark:bg-gray-800 w-full">
      <h3 className="text-md font-semibold m-1">User Account Management</h3>
      
      <div className="m-1">
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="space-y-1 m-1">
        {loadingUsers ? (
          <div className="text-center py-1">Loading users...</div>
        ) : !users?.length ? (
          <div className="text-center py-1">No users found</div>
        ) : (
          users.map((user) => (
            <UserAccountCard
              key={user.id}
              user={user}
              productCount={productCounts[user.id] || 0}
              accountLimits={accountLimits}
            />
          ))
        )}
      </div>
    </Card>
  );
};
