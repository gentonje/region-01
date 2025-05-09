
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccountType } from "@/types/profile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AccountTypeEditorProps {
  selectedUserId: string | null;
  selectedAccountType: AccountType;
  customLimit: number | null;
  isPending: boolean;
  onAccountTypeChange: (value: AccountType) => void;
  onCustomLimitChange: (value: number | null) => void;
  onCancel: () => void;
  onUpdate: () => void;
}

export const AccountTypeEditor = ({
  selectedUserId,
  selectedAccountType,
  customLimit,
  isPending,
  onAccountTypeChange,
  onCustomLimitChange,
  onCancel,
  onUpdate
}: AccountTypeEditorProps) => {
  if (!selectedUserId) return null;

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
      <h4 className="text-sm font-semibold mb-4">Update Account Type</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Account Type</label>
          <Select
            value={selectedAccountType}
            onValueChange={(value) => onAccountTypeChange(value as AccountType)}
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
              onChange={(e) => onCustomLimitChange(parseInt(e.target.value) || null)}
              placeholder="Custom limit"
            />
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          onClick={onUpdate}
          disabled={isPending}
        >
          Update Account Type
        </Button>
      </div>
    </div>
  );
};
