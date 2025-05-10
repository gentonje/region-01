
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ProfileCompleteAlertProps {
  isProfileComplete: boolean;
}

export const ProfileCompleteAlert = ({ isProfileComplete }: ProfileCompleteAlertProps) => {
  const navigate = useNavigate();
  
  if (isProfileComplete) {
    return null;
  }
  
  return (
    <Alert variant="warning" className="mb-1">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Your profile is incomplete. Please complete your profile before adding products.
        <Button 
          variant="link" 
          className="px-0 py-0 h-auto"
          onClick={() => navigate("/edit-profile")}
        >
          Complete Profile
        </Button>
      </AlertDescription>
    </Alert>
  );
};
