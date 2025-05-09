
import { Button } from "@/components/ui/button";
import { AccountLimits } from "@/types/product";
import { AccountType } from "@/types/profile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useAccountTypeUpdate } from "./hooks/useAccountTypeUpdate";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";

interface UserProps {
  id: string;
  username: string;
  full_name: string;
  account_type: AccountType;
  custom_product_limit: number | null;
}

interface UserAccountRowProps {
  user: UserProps;
  productCount: number;
  isSelected: boolean;
  accountLimits: AccountLimits;
  onSelectUser: (userId: string) => void;
}

export const UserAccountRow = ({
  user,
  productCount,
  isSelected,
  accountLimits,
  onSelectUser,
}: UserAccountRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>(user.account_type);
  const [customLimit, setCustomLimit] = useState<number | null>(user.custom_product_limit);
  
  const updateAccountType = useAccountTypeUpdate();

  // Get the product limit for the current account type
  const getProductLimit = () => {
    if (user.account_type === "enterprise" && user.custom_product_limit !== null) {
      return user.custom_product_limit;
    }
    return accountLimits[user.account_type] || 0;
  };

  const handleSaveChanges = () => {
    updateAccountType.mutate({
      userId: user.id,
      accountType: accountType,
      customLimit: accountType === "enterprise" ? customLimit : null
    }, {
      onSuccess: () => setIsEditing(false)
    });
  };
  
  const displayName = user.full_name || user.username || "Unknown User";

  return (
    <tr className={`${isSelected ? "bg-gray-100 dark:bg-gray-700" : ""}`}>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="text-sm font-medium">{displayName}</div>
        </div>
      </td>
      
      <td className="px-4 py-4 whitespace-nowrap">
        {isEditing ? (
          <Select
            value={accountType}
            onValueChange={(value) => setAccountType(value as AccountType)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Account Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {user.account_type}
          </span>
        )}
      </td>
      
      <td className="px-4 py-4 whitespace-nowrap text-sm">
        {isEditing && accountType === "enterprise" ? (
          <Input
            type="number"
            value={customLimit || ""}
            onChange={(e) => setCustomLimit(parseInt(e.target.value) || null)}
            className="w-24 h-8"
          />
        ) : (
          <span>{getProductLimit()}</span>
        )}
      </td>
      
      <td className={`px-4 py-4 whitespace-nowrap text-sm ${productCount > getProductLimit() ? "text-red-600 font-semibold" : ""}`}>
        {productCount} / {getProductLimit()}
      </td>
      
      <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
        <div className="flex justify-end space-x-2">
          {isEditing ? (
            <>
              <Button 
                size="sm" 
                onClick={handleSaveChanges}
                disabled={updateAccountType.isPending}
              >
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setAccountType(user.account_type);
                  setCustomLimit(user.custom_product_limit);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button 
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
};
