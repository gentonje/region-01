
import { supabase } from "@/integrations/supabase/client";

export type SupportedCurrency = string;

interface CurrencyRate {
  code: string;
  rate: number;
}

let ratesCache: Record<string, number> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 300000; // 5 minutes - increased from 30 seconds

// Force a refresh of the rates cache
export const refreshCurrencyRates = async (): Promise<void> => {
  console.log('Forcing refresh of currency rates');
  lastFetchTime = 0; // Reset the cache timer to force a fresh fetch
  ratesCache = null; // Clear the cache completely
  await getCurrencyRates();
};

const getCurrencyRates = async (): Promise<Record<string, number>> => {
  const currentTime = Date.now();
  
  // Return cached rates if they're still valid
  if (ratesCache && (currentTime - lastFetchTime) < CACHE_DURATION) {
    console.log('Using cached currency rates');
    return ratesCache;
  }

  try {
    console.log('Fetching fresh currency rates from Supabase...');
    const { data, error } = await supabase
      .from('currencies')
      .select('code, rate')
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching currency rates:', error);
      return ratesCache || { USD: 0.0016, SSP: 1 }; // Fallback rates with SSP as base (1 SSP = 0.0016 USD)
    }

    const rates = data.reduce((acc: Record<string, number>, curr: CurrencyRate) => ({
      ...acc,
      [curr.code]: curr.rate
    }), {}); // Build rates from database

    console.log('Fetched rates:', rates);
    ratesCache = rates;
    lastFetchTime = currentTime;
    return rates;
  } catch (error) {
    console.error('Error in getCurrencyRates:', error);
    return ratesCache || { USD: 0.0016, SSP: 1 }; // Fallback rates with SSP as base
  }
};

export const convertCurrency = async (
  amount: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency
): Promise<number> => {
  try {
    // If currencies are the same, no conversion needed
    if (fromCurrency === toCurrency) {
      return Math.round(amount);
    }
    
    const rates = await getCurrencyRates();
    
    // Only log conversions for debugging when currencies differ
    if (fromCurrency !== toCurrency) {
      console.log(`Converting ${amount} from ${fromCurrency} to ${toCurrency}`);
      console.log(`Using rates: ${fromCurrency}=${rates[fromCurrency]}, ${toCurrency}=${rates[toCurrency]}`);
    }

    if (!rates[fromCurrency] || !rates[toCurrency]) {
      console.error('Invalid currency code', { fromCurrency, toCurrency, rates });
      return Math.round(amount);
    }

    // For SSP to USD: amount * (USD rate / SSP rate)
    // For USD to SSP: amount * (SSP rate / USD rate)
    // General formula: amount * (target rate / source rate)
    const result = Math.round(amount * rates[toCurrency] / rates[fromCurrency]);
    
    // Only log result for debugging when currencies differ
    if (fromCurrency !== toCurrency) {
      console.log(`Conversion result: ${amount} ${fromCurrency} = ${result} ${toCurrency}`);
    }
    
    return result;
  } catch (error) {
    console.error('Error converting currency:', error);
    return Math.round(amount);
  }
};

// Initialize rates cache
getCurrencyRates().catch(console.error);
