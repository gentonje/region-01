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
    <div className="min-h-screen pb-14">
      <Navigation 
        searchQuery={searchQuery} 
        onSearchChange={onSearchChange}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={onCurrencyChange}
      />
      <div className="container mx-auto px-4 pt-14 pb-16">
        {children || <Outlet />}
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
