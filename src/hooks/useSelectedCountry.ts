
import { useOutletContext } from 'react-router-dom';

// Define the type for the context returned by the MainLayout
type LayoutContextType = {
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
};

/**
 * Hook to access the selected country from the layout context
 * Returns the selectedCountry and a function to update it
 */
export const useSelectedCountry = () => {
  return useOutletContext<LayoutContextType>();
};

export default useSelectedCountry;
