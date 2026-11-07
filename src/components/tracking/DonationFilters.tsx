import React from 'react';
import { DonationCategory } from '../../types/donation';
import { Search, Filter } from 'lucide-react';

export type StatusTab = 'all' | 'awaiting' | 'scheduled' | 'completed';

interface DonationFiltersProps {
  activeTab: StatusTab;
  onTabChange: (tab: StatusTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  counts: {
    all: number;
    awaiting: number;
    scheduled: number;
    completed: number;
  };
}

const FOOD_TYPES = [
  'Bakery & Bread',
  'Prepared Meals',
  'Fresh Produce',
  'Packaged Pantry'
];

export const DonationFilters: React.FC<DonationFiltersProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  counts
}) => {
  return (
    <div className="space-y-4">
      {/* 4 Status Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E7E4] pb-4">
        <button
          onClick={() => onTabChange('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-[#171717] text-white shadow-xs'
              : 'bg-[#F1F2F0] text-[#777777] hover:text-[#171717]'
          }`}
        >
          <span>All Donations</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-[#E5E7E4] text-[#171717]'
          }`}>
            {counts.all}
          </span>
        </button>

        <button
          onClick={() => onTabChange('awaiting')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'awaiting'
              ? 'bg-[#171717] text-white shadow-xs'
              : 'bg-[#F1F2F0] text-[#777777] hover:text-[#171717]'
          }`}
        >
          <span>Awaiting Response</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === 'awaiting' ? 'bg-white/20 text-white' : 'bg-[#E5E7E4] text-[#171717]'
          }`}>
            {counts.awaiting}
          </span>
        </button>

        <button
          onClick={() => onTabChange('scheduled')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'scheduled'
              ? 'bg-[#171717] text-white shadow-xs'
              : 'bg-[#F1F2F0] text-[#777777] hover:text-[#171717]'
          }`}
        >
          <span>Accepted / Scheduled</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === 'scheduled' ? 'bg-white/20 text-white' : 'bg-[#E5E7E4] text-[#171717]'
          }`}>
            {counts.scheduled}
          </span>
        </button>

        <button
          onClick={() => onTabChange('completed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'completed'
              ? 'bg-[#171717] text-white shadow-xs'
              : 'bg-[#F1F2F0] text-[#777777] hover:text-[#171717]'
          }`}
        >
          <span>Completed</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === 'completed' ? 'bg-white/20 text-white' : 'bg-[#E5E7E4] text-[#171717]'
          }`}>
            {counts.completed}
          </span>
        </button>
      </div>

      {/* Search & Category Filter Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, partner or ID..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-[#FAFBF9] border border-[#E5E7E4] focus:border-[#171717] focus:bg-white text-xs text-[#171717] outline-hidden transition-all placeholder:text-[#999999]"
          />
          <Search className="w-3.5 h-3.5 text-[#777777] absolute left-3 top-3 pointer-events-none" />
        </div>

        {/* Food Stream Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#777777]" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-[#FAFBF9] border border-[#E5E7E4] text-xs font-semibold text-[#171717] outline-hidden focus:border-[#171717]"
          >
            <option value="ALL">All Food Streams</option>
            {FOOD_TYPES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
