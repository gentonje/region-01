
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
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Navigation 
        searchQuery={searchQuery} 
        onSearchChange={onSearchChange}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={onCurrencyChange}
      />
      <div className="w-full pt-16 pb-20 sm:pt-20 sm:pb-24 max-w-none">
        <div className="w-full mx-auto m-0 p-0 max-w-none">
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
