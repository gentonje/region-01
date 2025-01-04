import { Check } from "lucide-react";

interface OnboardingStepProps {
  title: string;
  isActive: boolean;
  isCompleted: boolean;
}

export const OnboardingStep = ({ title, isActive, isCompleted }: OnboardingStepProps) => {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
          isCompleted
            ? "bg-green-500 text-white"
            : isActive
            ? "bg-blue-500 text-white"
            : "bg-gray-200"
        }`}
      >
        {isCompleted ? <Check className="w-6 h-6" /> : null}
      </div>
      <span className="text-sm text-center">{title}</span>
    </div>
  );
};