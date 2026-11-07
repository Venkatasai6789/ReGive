import React, { useState, useMemo } from 'react';
import { Donation, ScreenType } from '../types/donation';
import { DonationFilters, StatusTab } from '../components/tracking/DonationFilters';
import { DonationList } from '../components/tracking/DonationList';
import { DonationDetailDrawer } from '../components/tracking/DonationDetailDrawer';
import { Sparkles, ArrowLeft } from 'lucide-react';

interface MyDonationsProps {
  donations: Donation[];
  onNavigate: (screen: ScreenType) => void;
  selectedDonation: Donation | null;
  onSelectDonation: (donation: Donation | null) => void;
}

export const MyDonations: React.FC<MyDonationsProps> = ({
  donations,
  onNavigate,
  selectedDonation,
  onSelectDonation
}) => {
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Compute stats
  const counts = useMemo(() => {
    return {
      all: donations.length,
      awaiting: donations.filter((d) =>
        ['Submitted', 'Processing', 'Awaiting Partner'].includes(d.status)
      ).length,
      scheduled: donations.filter((d) =>
        ['Accepted', 'Collection Scheduled', 'Collected'].includes(d.status)
      ).length,
      completed: donations.filter((d) => d.status === 'Completed').length
    };
  }, [donations]);

  // Filter donations
  const filteredDonations = useMemo(() => {
    return donations.filter((item) => {
      // 1. Tab filter
      if (activeTab === 'awaiting') {
        if (!['Submitted', 'Processing', 'Awaiting Partner'].includes(item.status)) return false;
      } else if (activeTab === 'scheduled') {
        if (!['Accepted', 'Collection Scheduled', 'Collected'].includes(item.status)) return false;
      } else if (activeTab === 'completed') {
        if (item.status !== 'Completed') return false;
      }

      // 2. Food Stream / Type filter
      if (selectedCategory !== 'ALL') {
        const streamKeywords: Record<string, string[]> = {
          'Bakery & Bread': ['bread', 'bakery', 'bagel', 'loaf', 'baked'],
          'Prepared Meals': ['meal', 'pasta', 'catered', 'cooked', 'warm', 'tray'],
          'Fresh Produce': ['produce', 'apple', 'green', 'fruit', 'vegetable', 'crate'],
          'Packaged Pantry': ['pantry', 'canned', 'rice', 'grain', 'staple', 'packaged']
        };
        const keywords = streamKeywords[selectedCategory] || [selectedCategory.toLowerCase()];
        const combinedText = `${item.title} ${item.description} ${item.aiAnalysis?.caption || ''}`.toLowerCase();
        const hasKeywordMatch = keywords.some((kw) => combinedText.includes(kw));
        if (!hasKeywordMatch && item.category !== selectedCategory) {
          return false;
        }
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchId = item.id.toLowerCase().includes(q);
        const matchPartner = item.partnerName?.toLowerCase().includes(q);
        const matchCategory = item.category.toLowerCase().includes(q);
        if (!matchTitle && !matchId && !matchPartner && !matchCategory) return false;
      }

      return true;
    });
  }, [donations, activeTab, selectedCategory, searchQuery]);

  const handleOpenDetails = (donation: Donation) => {
    onSelectDonation(donation);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className="px-6 md:px-12 lg:px-16 py-10 md:py-14 max-w-6xl mx-auto w-full">
      {/* Top Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#777777] hover:text-[#171717] mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#777777]">
              Screen 03 &bull; Contribution Ledger
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F5E84D] text-[#171717]">
              Live Tracking
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#171717] font-['Manrope'] mt-1 tracking-tight">
            My Donations
          </h1>
          <p className="text-sm sm:text-base text-[#777777] mt-2 max-w-xl leading-relaxed">
            Keep track of your contributions and their journey from collection to partner distribution.
          </p>
        </div>

        <button
          onClick={() => onNavigate('create')}
          className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#F5E84D] hover:bg-[#EBDD3C] text-[#171717] font-bold text-xs shadow-sm transition-all active:scale-95 shrink-0"
        >
          <span>New Donation</span>
          <Sparkles className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter Tabs, Search & Category Filter */}
      <DonationFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        counts={counts}
      />

      {/* Donation List (Desktop Table + Mobile Cards) */}
      <DonationList
        donations={filteredDonations}
        onSelectDonation={handleOpenDetails}
        onCreateNew={() => onNavigate('create')}
      />

      {/* Tracking & Lifecycle Drawer */}
      <DonationDetailDrawer
        donation={selectedDonation}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onFindNewPartner={() => {
          onNavigate('create');
        }}
      />
    </div>
  );
};
