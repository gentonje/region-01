
import { useContext } from 'react';
import { SelectedCountryContext } from '@/Routes';

/**
 * Hook to access the selected country context across the application
 * @returns Object containing selectedCountry and setSelectedCountry
 */
export const useSelectedCountry = () => {
  const context = useContext(SelectedCountryContext);
  
  if (context === undefined) {
    return { selectedCountry: "1", setSelectedCountry: () => {} };
  }
  
  return context;
};
