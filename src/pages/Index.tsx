import { useState } from "react";
import Confetti from "@/components/Confetti";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [showConfetti, setShowConfetti] = useState(false);

  const handleComplete = () => {
    setShowConfetti(true);
    // Hide confetti after 5 seconds
    setTimeout(() => setShowConfetti(false), 5000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your App</h1>
        <p className="text-xl text-gray-600 mb-8">Click the button to see the confetti celebration!</p>
        <Button onClick={handleComplete}>
          Complete Profile
        </Button>
      </div>
      <Confetti isActive={showConfetti} />
    </div>
  );
};

export default Index;