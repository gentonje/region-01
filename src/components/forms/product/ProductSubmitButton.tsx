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
      className="w-full" 
      disabled={isLoading || !isValid}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        submitButtonText
      )}
    </Button>
  );
};