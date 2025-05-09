
import { Input } from "@/components/ui/input";
import { AccountLimits } from "@/types/product";

interface AccountLimitsEditorProps {
  accountLimits: AccountLimits;
  onLimitUpdate: (type: keyof AccountLimits, value: number | null) => void;
}

export const AccountLimitsEditor = ({ accountLimits, onLimitUpdate }: AccountLimitsEditorProps) => {
  return (
    <div className="p-1 border rounded-lg bg-white dark:bg-gray-800 w-full">
      <h3 className="text-md font-semibold m-1">Product Upload Limits</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 m-1">
        <div className="space-y-1">
          <label className="text-sm font-medium">Basic Account</label>
          <Input
            type="number"
            value={accountLimits?.basic || 5}
            onChange={(e) => onLimitUpdate('basic', parseInt(e.target.value))}
            className="w-full m-1 p-1"
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium">Starter Account</label>
          <Input
            type="number"
            value={accountLimits?.starter || 15}
            onChange={(e) => onLimitUpdate('starter', parseInt(e.target.value))}
            className="w-full m-1 p-1"
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium">Premium Account</label>
          <Input
            type="number"
            value={accountLimits?.premium || 30}
            onChange={(e) => onLimitUpdate('premium', parseInt(e.target.value))}
            className="w-full m-1 p-1"
          />
        </div>
      </div>
    </div>
  );
};
