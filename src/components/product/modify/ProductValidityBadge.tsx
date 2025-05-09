
import { Badge } from "@/components/ui/badge";
import { useProductValidity } from "@/hooks/useProductValidity";
import { Clock, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProductValidityBadgeProps {
  productId: string;
}

export const ProductValidityBadge = ({ productId }: ProductValidityBadgeProps) => {
  const { data: validity } = useProductValidity(productId);
  
  if (!validity || !validity.expires_at) {
    return null;
  }
  
  const daysRemaining = validity.daysRemaining;
  
  // Determine badge styling based on days remaining
  let badgeStyle = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  let icon = <Clock className="h-3 w-3 mr-1" />;
  
  if (daysRemaining <= 3) {
    badgeStyle = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    icon = <AlertCircle className="h-3 w-3 mr-1" />;
  } else if (daysRemaining <= 7) {
    badgeStyle = "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
  }
  
  const validityLabel = validity.validity_period === 'day' ? '1 Day' : 
                        validity.validity_period === 'week' ? '1 Week' : '1 Month';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`rounded-full text-xs ${badgeStyle} flex items-center`}
          >
            {icon}
            {daysRemaining} days left
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Validity: {validityLabel}</p>
          <p>Expires: {new Date(validity.expires_at).toLocaleDateString()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
