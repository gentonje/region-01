import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingStep } from "./OnboardingStep";
import { ProfileStep } from "./steps/ProfileStep";
import { ShopStep } from "./steps/ShopStep";
import { ProductStep } from "./steps/ProductStep";
import { toast } from "sonner";

export const OnboardingWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const { data: onboardingProgress, isLoading } = useQuery({
    queryKey: ["onboarding-progress"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("onboarding_progress")
        .select("step")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (onboardingProgress?.length === 3) {
      navigate("/");
    } else if (onboardingProgress) {
      setCurrentStep(onboardingProgress.length);
    }
  }, [onboardingProgress, navigate]);

  const steps = [
    {
      title: "Complete Your Profile",
      component: <ProfileStep onComplete={() => setCurrentStep(1)} />,
      step: "profile_complete"
    },
    {
      title: "Create Your Shop",
      component: <ShopStep onComplete={() => setCurrentStep(2)} />,
      step: "shop_created"
    },
    {
      title: "Add Your First Product",
      component: <ProductStep onComplete={() => navigate("/")} />,
      step: "first_product"
    }
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Welcome! Let's get you started</h1>
          <div className="flex justify-between mb-8">
            {steps.map((step, index) => (
              <OnboardingStep
                key={index}
                title={step.title}
                isActive={currentStep === index}
                isCompleted={index < currentStep}
              />
            ))}
          </div>
        </div>
        {steps[currentStep].component}
      </div>
    </div>
  );
};