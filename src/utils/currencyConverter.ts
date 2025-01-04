import { supabase } from "@/integrations/supabase/client";

export type SupportedCurrency = string;

const getCurrencyRates = async (): Promise<Record<string, number>> => {
  const { data, error } = await supabase
    .from('currencies')
    .select('code, rate')
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching currency rates:', error);
    return {};
  }

  return data.reduce((acc, curr) => ({
    ...acc,
    [curr.code]: curr.rate
  }), {});
};

let ratesCache: Record<string, number> | null = null;

export const convertCurrency = (
  amount: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency
): number => {
  if (!ratesCache) {
    // If cache is not initialized, return the original amount
    console.warn('Currency rates not loaded yet');
    return amount;
  }

  if (!ratesCache[fromCurrency] || !ratesCache[toCurrency]) {
    console.error('Invalid currency code');
    return amount;
  }

  // Convert to base currency (SSP) first
  const amountInSSP = amount / ratesCache[fromCurrency];
  // Convert from SSP to target currency
  return amountInSSP * ratesCache[toCurrency];
};

// Initialize rates cache
getCurrencyRates().then(rates => {
  ratesCache = rates;
});

// Refresh rates every hour
setInterval(async () => {
  ratesCache = await getCurrencyRates();
}, 3600000);