
import { Input } from "@/components/ui/input";
import { UserAccountRow } from "./UserAccountRow";
import { AccountLimits } from "@/types/product";
import { AccountType } from "@/types/profile";
import { Card } from "@/components/ui/card";

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
    <Card className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <h3 className="text-md font-semibold mb-4">User Account Management</h3>
      
      <div className="mb-4">
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="overflow-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Limit</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Products</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
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

      {/* Mobile view - cards instead of table for small screens */}
      <div className="block md:hidden mt-4 space-y-4">
        {loadingUsers ? (
          <div className="text-center py-4">Loading users...</div>
        ) : !users?.length ? (
          <div className="text-center py-4">No users found</div>
        ) : (
          users.map((user) => (
            <div 
              key={user.id} 
              className={`p-4 rounded-lg border ${selectedUserId === user.id ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}`}
            >
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{user.full_name || user.username || "Unknown User"}</h4>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {user.account_type}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Product Limit:</span>
                    <span> {user.account_type === "enterprise" && user.custom_product_limit !== null ? 
                      user.custom_product_limit : accountLimits[user.account_type] || 0}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-500">Products:</span>
                    <span className={productCounts[user.id] > (user.account_type === "enterprise" && user.custom_product_limit !== null ? 
                      user.custom_product_limit : accountLimits[user.account_type] || 0) ? " text-red-600" : ""}>
                      {" "}{productCounts[user.id] || 0}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => onSelectUser(user.id)}
                  className="w-full mt-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                >
                  Manage Account
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
