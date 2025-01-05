import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ProductSubmitButtonProps {
  isLoading: boolean;
  isValid: boolean;
  submitButtonText: string;
}

export const ProductSubmitButton = ({
  isLoading,
  isValid,
  submitButtonText,
}: ProductSubmitButtonProps) => {
  return (
    <Button 
      type="submit" 
      className="w-full bg-primary dark:bg-gray-800 text-primary-foreground dark:text-gray-200 hover:bg-primary/90 dark:hover:bg-gray-700 disabled:bg-gray-300 dark:disabled:bg-gray-900 disabled:text-gray-500 dark:disabled:text-gray-600" 
      disabled={isLoading || !isValid}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span className="dark:text-gray-300">Processing...</span>
        </>
      ) : (
        <span className="dark:text-gray-200">{submitButtonText}</span>
      )}
    </Button>
  );
};