
// Mapping of country IDs to their respective currency codes
export const countryToCurrency: Record<string, string> = {
  "1": "KES", // Kenya
  "2": "UGX", // Uganda
  "3": "SSP", // South Sudan
  "4": "ETB", // Ethiopia
  "5": "RWF", // Rwanda
};

/**
 * Get the currency code for a country ID
 * @param countryId - The country ID as a string
 * @returns The currency code or "SSP" as default
 */
export const getCurrencyForCountry = (countryId: string | null | undefined): string => {
  if (!countryId) return "SSP";
  
  return countryToCurrency[countryId] || "SSP";
};
