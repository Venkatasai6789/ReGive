import React from 'react';
import { PartnerScreenType, PartnerProfile } from '../../types/partner';
import { PartnerHeader } from './PartnerHeader';
import { DonorFooter } from '../layout/DonorFooter';

interface PartnerLayoutProps {
  currentScreen: PartnerScreenType;
  onNavigate: (screen: PartnerScreenType) => void;
  partner: PartnerProfile | null;
  pendingCount?: number;
  onLogout: () => void;
  onRefresh?: () => void;
  children: React.ReactNode;
}

export const PartnerLayout: React.FC<PartnerLayoutProps> = ({
  currentScreen,
  onNavigate,
  partner,
  pendingCount,
  onLogout,
  onRefresh,
  children
}) => {
  return (
    <div className="min-h-screen bg-[#F5E84D] p-2.5 sm:p-4 md:p-6 lg:p-8 flex flex-col items-center justify-start">
      {/* Central White Application Surface Container matching DonorLayout */}
      <div className="w-full max-w-[1440px] bg-white rounded-[24px] sm:rounded-[32px] md:rounded-[38px] shadow-sm border border-[#E5E7E4]/80 overflow-hidden flex flex-col min-h-[92vh]">
        {/* Partner Navigation Header */}
        <PartnerHeader
          currentScreen={currentScreen}
          onNavigate={onNavigate}
          partner={partner}
          pendingCount={pendingCount}
          onLogout={onLogout}
          onRefresh={onRefresh}
        />

        {/* Dynamic Partner Screen Content */}
        <main className="flex-1 w-full bg-white flex flex-col">
          {children}
        </main>

        {/* Reused Minimal Footer */}
        <DonorFooter />
      </div>
    </div>
  );
};
