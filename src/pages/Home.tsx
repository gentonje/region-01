import React from 'react';
import { Navigation, BottomNavigation } from '@/components/Navigation';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4">
        <div className="mt-20">
          {/* Content will be added here later */}
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}