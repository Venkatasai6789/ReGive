import React from 'react';
import { ScreenType } from '../../types/donation';
import { DonorHeader } from './DonorHeader';
import { DonorFooter } from './DonorFooter';

interface DonorLayoutProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  unreadCount?: number;
  onOpenLogin: () => void;
  children: React.ReactNode;
}

export const DonorLayout: React.FC<DonorLayoutProps> = ({
  currentScreen,
  onNavigate,
  unreadCount,
  onOpenLogin,
  children
}) => {
  return (
    <div className="min-h-screen bg-[#F5E84D] p-2.5 sm:p-4 md:p-6 lg:p-8 flex flex-col items-center justify-start">
      {/* Central White Application Surface Container */}
      <div className="w-full max-w-[1440px] bg-white rounded-[24px] sm:rounded-[32px] md:rounded-[38px] shadow-sm border border-[#E5E7E4]/80 overflow-hidden flex flex-col min-h-[92vh]">
        {/* Minimal Horizontal Navigation */}
        <DonorHeader
          currentScreen={currentScreen}
          onNavigate={onNavigate}
          unreadCount={unreadCount}
          onOpenLogin={onOpenLogin}
        />

        {/* Dynamic Screen Content */}
        <main className="flex-1 w-full bg-white flex flex-col">
          {children}
        </main>

        {/* Minimal Footer */}
        <DonorFooter />
      </div>
    </div>
  );
};
