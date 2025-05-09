
import { Input } from "@/components/ui/input";
import { UserAccountRow } from "./UserAccountRow";
import { AccountLimits } from "@/types/product";
import { AccountType } from "@/types/profile";

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
  selectedUserId: string | null;
  accountLimits: AccountLimits;
  searchQuery: string;
  loadingUsers: boolean;
  onSearchChange: (query: string) => void;
  onSelectUser: (userId: string) => void;
}

export const UserAccountsTable = ({
  users,
  productCounts,
  selectedUserId,
  accountLimits,
  searchQuery,
  loadingUsers,
  onSearchChange,
  onSelectUser
}: UserAccountsTableProps) => {
  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <h3 className="text-md font-semibold mb-2">User Account Management</h3>
      
      <div className="mb-4">
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
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
                <UserAccountRow
                  key={user.id}
                  user={user}
                  productCount={productCounts[user.id] || 0}
                  isSelected={selectedUserId === user.id}
                  accountLimits={accountLimits}
                  onSelectUser={onSelectUser}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
