
import { Badge } from "@/components/ui/badge";
import { AccountType } from "@/types/profile";

interface AccountTypeBadgeProps {
  accountType: AccountType;
  className?: string;
}

export const AccountTypeBadge = ({ accountType, className = "" }: AccountTypeBadgeProps) => {
  // Define styling based on account type
  const getStyle = () => {
    switch (accountType) {
      case 'basic':
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case 'starter':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case 'premium':
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case 'enterprise':
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getLabel = () => {
    return accountType.charAt(0).toUpperCase() + accountType.slice(1);
  };

  return (
    <Badge 
      variant="outline" 
      className={`rounded-full text-xs ${getStyle()} ${className}`}
    >
      {getLabel()}
    </Badge>
  );
};
