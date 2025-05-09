
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AccountLimits } from "@/types/product";
import { AccountType } from "@/types/profile";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAccountTypeUpdate } from "./hooks/useAccountTypeUpdate";
import { Check } from "lucide-react";

interface UserProps {
  id: string;
  username: string;
  full_name: string;
  account_type: AccountType;
  custom_product_limit: number | null;
}

interface UserAccountCardProps {
  user: UserProps;
  productCount: number;
  accountLimits: AccountLimits;
}

export const UserAccountCard = ({
  user,
  productCount,
  accountLimits,
}: UserAccountCardProps) => {
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
      accountType,
      customLimit: accountType === "enterprise" ? customLimit : null
    }, {
      onSuccess: () => setIsEditing(false)
    });
  };
  
  const displayName = user.full_name || user.username || "Unknown User";

  return (
    <Card className="p-1 border bg-gray-50 dark:bg-gray-700 w-full">
      <div className="flex flex-col space-y-1">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-lg">{displayName}</h4>
          <span className="inline-flex items-center px-1 py-1 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {user.account_type}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-1 text-sm">
          <div>
            <span className="font-medium text-gray-500">Product Limit:</span>
            <span className="m-1"> {getProductLimit()}</span>
          </div>
          
          <div>
            <span className="font-medium text-gray-500">Products:</span>
            <span className={`m-1 ${productCount > getProductLimit() ? "text-red-600 font-semibold" : ""}`}>
              {productCount} / {getProductLimit()}
            </span>
          </div>
        </div>
        
        {!isEditing ? (
          <Button 
            onClick={() => setIsEditing(true)}
            className="mt-1 w-full"
            size="sm"
          >
            Manage Account
          </Button>
        ) : (
          <div className="mt-1 space-y-1 p-1">
            <h4 className="font-medium text-base">Update Account Type</h4>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium">Account Type</label>
              <Select
                value={accountType}
                onValueChange={(value) => setAccountType(value as AccountType)}
              >
                <SelectTrigger className="p-1">
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
            
            {accountType === 'enterprise' && (
              <div className="space-y-1">
                <label className="block text-sm font-medium">Custom Product Limit</label>
                <Input
                  type="number"
                  value={customLimit || ''}
                  onChange={(e) => setCustomLimit(parseInt(e.target.value) || null)}
                  placeholder="Custom limit"
                  className="m-1 p-1"
                />
              </div>
            )}
            
            <div className="flex justify-end gap-1 mt-1">
              <Button 
                variant="outline" 
                onClick={() => {
                  setAccountType(user.account_type);
                  setCustomLimit(user.custom_product_limit);
                  setIsEditing(false);
                }}
                className="m-1 p-1"
                size="sm"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveChanges}
                disabled={updateAccountType.isPending}
                className="m-1 p-1"
                size="sm"
              >
                <Check className="h-4 w-4 mr-1" />
                Update
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
