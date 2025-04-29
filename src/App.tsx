
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Routes } from "@/Routes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { SupportedCurrency } from "@/utils/currencyConverter";

// Create a client with optimized configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data remains fresh for 5 minutes
      gcTime: 1000 * 60 * 30, // Cache persists for 30 minutes
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: 'always', // Refetch when reconnecting to ensure data consistency
      retry: 1, // Only retry failed requests once
    },
    mutations: {
      retry: 1,
      networkMode: 'always',
    },
  },
});

const App = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>(() => {
    // Set default currency to USD
    const savedCurrency = localStorage.getItem('selectedCurrency') as SupportedCurrency;
    return savedCurrency || "USD"; 
  });

  const handleCurrencyChange = (currency: SupportedCurrency) => {
    console.log("Changing currency to:", currency);
    
    // Update the selected currency immediately
    setSelectedCurrency(currency);
    
    // Force refresh all relevant queries to ensure immediate updates
    queryClient.invalidateQueries({ queryKey: ['currencies'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['similar-products'] });
    
    // Store the selected currency in local storage for persistence
    localStorage.setItem('selectedCurrency', currency);
  };

  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center">Loading application...</div>}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <Routes 
                selectedCurrency={selectedCurrency}
                onCurrencyChange={handleCurrencyChange}
              />
              <Toaster />
              <SonnerToaster position="top-right" expand={false} closeButton theme="light" richColors />
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </Suspense>
  );
};

export default App;
