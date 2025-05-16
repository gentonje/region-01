
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AccountLimits } from "@/types/product";
import { Save } from "lucide-react";

interface AccountLimitsEditorProps {
  accountLimits: AccountLimits;
  onLimitUpdate: (type: keyof AccountLimits, value: number | null) => void;
}

export const AccountLimitsEditor = ({ accountLimits, onLimitUpdate }: AccountLimitsEditorProps) => {
  const [pendingLimits, setPendingLimits] = useState<AccountLimits>(accountLimits);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Update pending limits when accountLimits prop changes
  useEffect(() => {
    setPendingLimits(accountLimits);
    setHasChanges(false);
  }, [accountLimits]);
  
  // Handle input change - modified to handle empty values
  const handleInputChange = (type: keyof AccountLimits, value: string) => {
    // Allow empty values to be entered temporarily
    if (value === '') {
      setPendingLimits({
        ...pendingLimits,
        [type]: ''
      });
    } else {
      // Only parse if there's a value
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        setPendingLimits({
          ...pendingLimits,
          [type]: numValue
        });
      }
    }
    setHasChanges(true);
  };
  
  // Handle save button click - modified to ensure valid numbers
  const handleSave = () => {
    // Update each changed limit
    Object.keys(pendingLimits).forEach((key) => {
      const limitKey = key as keyof AccountLimits;
      const pendingValue = pendingLimits[limitKey];
      
      // Convert empty strings to default values
      const valueToSave = pendingValue === '' ? 0 : pendingValue;
      
      // Get current value from accountLimits
      const currentValue = accountLimits[limitKey];
      
      // Safe type comparison - convert both to strings for comparison
      const pendingValueStr = String(valueToSave);
      const currentValueStr = String(currentValue);
      
      // Compare as strings to avoid type issues
      if (pendingValueStr !== currentValueStr) {
        // Ensure we're passing a number or null to onLimitUpdate
        const finalValue = valueToSave === '' || valueToSave === null ? null : Number(valueToSave);
        onLimitUpdate(limitKey, finalValue);
      }
    });
    setHasChanges(false);
  };

  return (
    <div className="p-1 border rounded-lg bg-white dark:bg-gray-800 w-full">
      <h3 className="text-md font-semibold m-1">Product Upload Limits</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 m-1">
        <div className="space-y-1">
          <label className="text-sm font-medium">Basic Account</label>
          <Input
            type="text"
            inputMode="numeric"
            value={pendingLimits.basic === null ? '' : pendingLimits.basic}
            onChange={(e) => handleInputChange('basic', e.target.value)}
            className="w-full m-1 p-1"
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium">Starter Account</label>
          <Input
            type="text"
            inputMode="numeric"
            value={pendingLimits.starter === null ? '' : pendingLimits.starter}
            onChange={(e) => handleInputChange('starter', e.target.value)}
            className="w-full m-1 p-1"
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium">Premium Account</label>
          <Input
            type="text"
            inputMode="numeric"
            value={pendingLimits.premium === null ? '' : pendingLimits.premium}
            onChange={(e) => handleInputChange('premium', e.target.value)}
            className="w-full m-1 p-1"
          />
        </div>
      </div>
      
      {hasChanges && (
        <div className="flex justify-end mt-2">
          <Button 
            onClick={handleSave}
            size="sm"
            className="flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
};
