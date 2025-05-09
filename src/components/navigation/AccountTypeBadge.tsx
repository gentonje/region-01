
import { Badge } from "../ui/badge";
import { Profile } from "@/types/profile";
import { Crown, Star, VerifiedIcon } from "lucide-react";

interface AccountTypeBadgeProps {
  accountType?: string;
  className?: string;
}

export const AccountTypeBadge = ({ accountType, className }: AccountTypeBadgeProps) => {
  if (!accountType || accountType === 'basic') {
    return null; // Don't show badge for basic accounts
  }

  const getBadgeContent = () => {
    switch(accountType) {
      case 'starter':
        return {
          label: 'Starter',
          icon: <Star className="h-3 w-3 mr-1" />,
          variant: 'secondary' as const,
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        };
      case 'premium':
        return {
          label: 'Premium',
          icon: <Crown className="h-3 w-3 mr-1" />,
          variant: 'default' as const,
          className: 'bg-amber-500 text-white'
        };
      case 'enterprise':
        return {
          label: 'Enterprise',
          icon: <VerifiedIcon className="h-3 w-3 mr-1" />,
          variant: 'default' as const,
          className: 'bg-purple-600 text-white'
        };
      default:
        return null;
    }
  };

  const badgeContent = getBadgeContent();
  if (!badgeContent) return null;

  return (
    <Badge 
      variant={badgeContent.variant} 
      className={`text-xs flex items-center ${badgeContent.className} ${className}`}
    >
      {badgeContent.icon}
      {badgeContent.label}
    </Badge>
  );
};
