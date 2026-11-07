import React from 'react';
import { Package, CheckCircle, Clock } from 'lucide-react';

interface DonationOverviewProps {
  total: number;
  completed: number;
  awaiting: number;
  onFilterClick?: (statusGroup: string) => void;
}

export const DonationOverview: React.FC<DonationOverviewProps> = ({
  total,
  completed,
  awaiting,
  onFilterClick
}) => {
  return (
    <section className="px-6 md:px-12 lg:px-16 py-8 border-y border-[#E5E7E4] bg-[#FAFBF9]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#777777]">
              Donor Account Summary
            </h3>
            <p className="text-sm font-semibold text-[#171717]">
              Elena Rostova &bull; Personal Contributions
            </p>
          </div>
          <span className="text-xs text-[#777777] hidden sm:inline">
            Active since October 2026
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Block 1: Total Donations */}
          <div
            onClick={() => onFilterClick && onFilterClick('all')}
            className="p-5 rounded-2xl bg-white border border-[#E5E7E4] hover:border-[#171717] transition-all cursor-pointer group h-full flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#777777]">Total Donations</span>
              <div className="w-8 h-8 rounded-full bg-[#F1F2F0] group-hover:bg-[#F5E84D] flex items-center justify-center transition-colors">
                <Package className="w-4 h-4 text-[#171717]" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#171717] font-['Manrope']">
                {total}
              </span>
              <span className="text-xs text-[#777777]">recorded items</span>
            </div>
            <p className="text-[11px] text-[#777777] mt-1">
              Diverted from waste streams to registered community partners.
            </p>
          </div>

          {/* Block 2: Completed Donations */}
          <div
            onClick={() => onFilterClick && onFilterClick('completed')}
            className="p-5 rounded-2xl bg-white border border-[#E5E7E4] hover:border-[#23845B] transition-all cursor-pointer group h-full flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#777777]">Completed Donations</span>
              <div className="w-8 h-8 rounded-full bg-[#23845B]/10 group-hover:bg-[#23845B]/20 flex items-center justify-center transition-colors">
                <CheckCircle className="w-4 h-4 text-[#23845B]" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#23845B] font-['Manrope']">
                {completed}
              </span>
              <span className="text-xs text-[#777777]">collected & verified</span>
            </div>
            <p className="text-[11px] text-[#777777] mt-1">
              Successfully delivered with confirmed recipient receipt.
            </p>
          </div>

          {/* Block 3: Awaiting Response */}
          <div
            onClick={() => onFilterClick && onFilterClick('awaiting')}
            className="p-5 rounded-2xl bg-white border border-[#E5E7E4] hover:border-[#B77B24] transition-all cursor-pointer group h-full flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#777777]">Awaiting Response</span>
              <div className="w-8 h-8 rounded-full bg-[#B77B24]/10 group-hover:bg-[#B77B24]/20 flex items-center justify-center transition-colors">
                <Clock className="w-4 h-4 text-[#B77B24]" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#B77B24] font-['Manrope']">
                {awaiting}
              </span>
              <span className="text-xs text-[#777777]">active / in transit</span>
            </div>
            <p className="text-[11px] text-[#777777] mt-1">
              Partner matching or scheduled for courier pickup.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
