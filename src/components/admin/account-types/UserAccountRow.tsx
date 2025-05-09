
import { Button } from "@/components/ui/button";
import { AccountType } from "@/types/profile";
import { AccountTypeBadge } from "@/components/navigation/AccountTypeBadge";

interface User {
  id: string;
  username: string;
  full_name: string;
  account_type: AccountType;
  custom_product_limit: number | null;
}

interface UserAccountRowProps {
  user: User;
  productCount: number;
  isSelected: boolean;
  accountLimits: Record<string, number | null>;
  onSelectUser: (userId: string) => void;
}

export const UserAccountRow = ({ 
  user, 
  productCount, 
  isSelected, 
  accountLimits,
  onSelectUser 
}: UserAccountRowProps) => {
  
  const getLimitForAccountType = (type: AccountType): string | number => {
    if (type === 'enterprise' && user.custom_product_limit) {
      return user.custom_product_limit;
    }
    return accountLimits[type] || 'Unknown';
  };

  return (
    <tr className={isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""}>
      <td className="px-4 py-2">{user.username || user.full_name || "User"}</td>
      <td className="px-4 py-2">
        <AccountTypeBadge accountType={user.account_type} />
      </td>
      <td className="px-4 py-2">
        {getLimitForAccountType(user.account_type)}
      </td>
      <td className="px-4 py-2">{productCount}</td>
      <td className="px-4 py-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onSelectUser(user.id)}
        >
          Select
        </Button>
      </td>
    </tr>
  );
};
