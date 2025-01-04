import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { Navigation } from "@/components/Navigation";

const Onboarding = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="pt-20">
        <OnboardingWizard />
      </main>
    </div>
  );
};

export default Onboarding;