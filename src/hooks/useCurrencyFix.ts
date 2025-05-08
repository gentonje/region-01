
import { useEffect, useState } from "react";
import { fixAllProductCurrencies } from "@/services/currencyService";

/**
 * Hook to fix product currencies on app initialization
 * @returns An object with the loading state during currency initialization
 */
export const useCurrencyFix = () => {
  const [isFixing, setIsFixing] = useState(false);

  useEffect(() => {
    const runCurrencyFix = async () => {
      try {
        setIsFixing(true);
        await fixAllProductCurrencies();
      } catch (error) {
        console.error("Error in currency fix hook:", error);
      } finally {
        setIsFixing(false);
      }
    };

    // Run currency fix on component mount
    runCurrencyFix();
  }, []);

  return { isFixing };
};
