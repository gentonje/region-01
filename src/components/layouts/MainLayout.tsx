
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { BottomNav } from '@/components/navigation/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { CurrencySelector } from '@/components/navigation/CurrencySelector';
import { SupportedCurrency } from '@/utils/currencyConverter';
import { useIsMobile } from '@/hooks/use-mobile';

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
    <div className="min-h-screen pb-16">
      <Navigation searchQuery={searchQuery} onSearchChange={onSearchChange} />
      <div className="container mx-auto px-4 pt-20 pb-20">
        {children || <Outlet />}
      </div>
      
      {/* Only show bottom nav on mobile */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <BottomNav 
            isAuthenticated={isAuthenticated} 
            selectedCurrency={selectedCurrency}
            onCurrencyChange={onCurrencyChange}
          />
        </div>
      )}
      
      {/* Show currency selector in bottom right corner on desktop */}
      {!isMobile && onCurrencyChange && (
        <div className="fixed bottom-4 right-4 z-50">
          <CurrencySelector 
            currency={selectedCurrency} 
            onCurrencyChange={onCurrencyChange} 
          />
        </div>
      )}
    </div>
  );
};
