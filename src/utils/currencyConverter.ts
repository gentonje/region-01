
import { supabase } from "@/integrations/supabase/client";

export type SupportedCurrency = string;

interface CurrencyRate {
  code: string;
  rate: number;
}

let ratesCache: Record<string, number> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

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
      return ratesCache || { SSP: 1, USD: 0.0016 }; // Fallback rates
    }

    const rates = data.reduce((acc: Record<string, number>, curr: CurrencyRate) => ({
      ...acc,
      [curr.code]: curr.rate
    }), { SSP: 1 }); // SSP is our base currency

    console.log('Fetched rates:', rates);
    ratesCache = rates;
    lastFetchTime = currentTime;
    return rates;
  } catch (error) {
    console.error('Error in getCurrencyRates:', error);
    return ratesCache || { SSP: 1, USD: 0.0016 }; // Fallback rates
  }
};

export const convertCurrency = async (
  amount: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency
): Promise<number> => {
  try {
    const rates = await getCurrencyRates();
    console.log(`Converting ${amount} from ${fromCurrency} to ${toCurrency}`, { rates });

    if (!rates[fromCurrency] || !rates[toCurrency]) {
      console.error('Invalid currency code', { fromCurrency, toCurrency, rates });
      return amount;
    }

    // Convert to base currency (SSP) first
    const amountInSSP = amount / rates[fromCurrency];
    // Convert from SSP to target currency
    const result = Number((amountInSSP * rates[toCurrency]).toFixed(2));
    console.log('Conversion result:', result);
    return result;
  } catch (error) {
    console.error('Error converting currency:', error);
    return amount;
  }
};

// Initialize rates cache
getCurrencyRates().catch(console.error);
