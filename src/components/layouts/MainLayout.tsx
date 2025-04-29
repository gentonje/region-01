
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SupportedCurrency } from '@/utils/currencyConverter';
import { useIsMobile } from '@/hooks/use-mobile';
import { BottomNav } from '@/components/navigation/BottomNav';

type MainLayoutProps = {
  children?: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedCurrency?: SupportedCurrency;
  onCurrencyChange?: (currency: SupportedCurrency) => void;
};

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  searchQuery = '',
  onSearchChange,
  selectedCurrency = 'SSP',
  onCurrencyChange,
}) => {
  const { session } = useAuth();
  const isAuthenticated = !!session;
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Navigation 
        searchQuery={searchQuery} 
        onSearchChange={onSearchChange}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={onCurrencyChange}
      />
      <div className="container mx-auto p-2 md:px-4 pt-16 pb-20 sm:pt-20 sm:pb-24 space-y-2 md:space-y-4">
        <div className="max-w-7xl mx-auto space-y-2 md:space-y-4">
          {children || <Outlet />}
        </div>
      </div>
      
      {isAuthenticated && (
        <BottomNav 
          isAuthenticated={isAuthenticated}
          selectedCurrency={selectedCurrency}
          onCurrencyChange={onCurrencyChange}
        />
      )}
    </div>
  );
};
