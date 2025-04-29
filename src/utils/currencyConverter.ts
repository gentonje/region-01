
import { supabase } from "@/integrations/supabase/client";

export type SupportedCurrency = string;

interface CurrencyRate {
  code: string;
  rate: number;
}

let ratesCache: Record<string, number> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 seconds - reduced for more immediate updates

const getCurrencyRates = async (): Promise<Record<string, number>> => {
  const currentTime = Date.now();
  
  // Return cached rates if they're still valid
  if (ratesCache && (currentTime - lastFetchTime) < CACHE_DURATION) {
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
      return ratesCache || { USD: 1, SSP: 625 }; // Fallback rates with USD as base
    }

    const rates = data.reduce((acc: Record<string, number>, curr: CurrencyRate) => ({
      ...acc,
      [curr.code]: curr.rate
    }), { USD: 1 }); // USD is our base currency

    console.log('Fetched rates:', rates);
    ratesCache = rates;
    lastFetchTime = currentTime;
    return rates;
  } catch (error) {
    console.error('Error in getCurrencyRates:', error);
    return ratesCache || { USD: 1, SSP: 625 }; // Fallback rates with USD as base
  }
};

// Force a refresh of the rates cache
export const refreshCurrencyRates = async (): Promise<void> => {
  lastFetchTime = 0; // Reset the cache timer to force a fresh fetch
  await getCurrencyRates();
};

export const convertCurrency = async (
  amount: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency
): Promise<number> => {
  try {
    // If currencies are the same, no conversion needed
    if (fromCurrency === toCurrency) {
      return amount;
    }
    
    const rates = await getCurrencyRates();
    console.log(`Converting ${amount} from ${fromCurrency} to ${toCurrency}`, { rates });

    if (!rates[fromCurrency] || !rates[toCurrency]) {
      console.error('Invalid currency code', { fromCurrency, toCurrency, rates });
      return amount;
    }

    // Convert to base currency (USD) first
    const amountInUSD = amount / rates[fromCurrency];
    // Convert from USD to target currency
    const result = Number((amountInUSD * rates[toCurrency]).toFixed(2));
    console.log('Conversion result:', result);
    return result;
  } catch (error) {
    console.error('Error converting currency:', error);
    return amount;
  }
};

// Initialize rates cache
getCurrencyRates().catch(console.error);
