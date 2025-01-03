const exchangeRates = {
  USD: 1,
  KES: 133.45, // Kenyan Shilling
  UGX: 3800.50, // Ugandan Shilling
  SSP: 985.50,  // South Sudanese Pound
};

export type SupportedCurrency = keyof typeof exchangeRates;

export const convertCurrency = (
  amount: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency
): number => {
  // Convert to USD first (base currency)
  const amountInUSD = amount / exchangeRates[fromCurrency];
  // Convert from USD to target currency
  return amountInUSD * exchangeRates[toCurrency];
};