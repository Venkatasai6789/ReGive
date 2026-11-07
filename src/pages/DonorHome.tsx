import React from 'react';
import { Donation, ScreenType } from '../types/donation';
import { HeroSection } from '../components/home/HeroSection';
import { DonationOverview } from '../components/home/DonationOverview';
import { RecentDonations } from '../components/home/RecentDonations';
import { ImpactExplainer } from '../components/home/ImpactExplainer';

interface DonorHomeProps {
  donations: Donation[];
  onNavigate: (screen: ScreenType) => void;
  onSelectDonation: (donation: Donation) => void;
}

export const DonorHome: React.FC<DonorHomeProps> = ({
  donations,
  onNavigate,
  onSelectDonation
}) => {
  const total = donations.length;
  const completed = donations.filter((d) => d.status === 'Completed').length;
  const awaiting = donations.filter((d) =>
    ['Submitted', 'Processing', 'Awaiting Partner', 'Accepted', 'Collection Scheduled'].includes(d.status)
  ).length;

  return (
    <div className="w-full flex flex-col">
      {/* 1. Hero Section */}
      <HeroSection onNavigate={onNavigate} />

      {/* 2. Compact Donor Overview */}
      <DonationOverview
        total={total}
        completed={completed}
        awaiting={awaiting}
        onFilterClick={() => onNavigate('donations')}
      />

      {/* 3. Recent Donations (Latest 3) */}
      <RecentDonations
        donations={donations}
        onNavigate={onNavigate}
        onSelectDonation={onSelectDonation}
      />

      {/* 4. Compact Mission & Impact Explainer */}
      <ImpactExplainer onNavigate={onNavigate} />
    </div>
  );
};
