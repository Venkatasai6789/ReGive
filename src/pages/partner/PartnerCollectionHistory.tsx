import React, { useState } from 'react';
import {
  Calendar,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  Filter,
  Inbox,
  User,
  ArrowRight
} from 'lucide-react';
import { PartnerDonationItem } from '../../types/partner';

interface PartnerCollectionHistoryProps {
  donations: PartnerDonationItem[];
  isLoading: boolean;
  onSelectDonation: (donation: PartnerDonationItem) => void;
  onCollect: (donationId: string) => Promise<void>;
  onComplete: (donationId: string) => Promise<void>;
}

export const PartnerCollectionHistory: React.FC<PartnerCollectionHistoryProps> = ({
  donations,
  isLoading,
  onSelectDonation,
  onCollect,
  onComplete
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');

  const historyDonations = donations.filter((d) => d.status !== 'Submitted' && d.status !== 'Rejected');

  const filteredDonations = (activeTab === 'all' ? historyDonations : historyDonations.filter((d) => d.status === activeTab));

  const acceptedCount = historyDonations.filter((d) => d.status === 'Accepted').length;
  const scheduledCount = historyDonations.filter((d) => d.status === 'Collection Scheduled').length;
  const collectedCount = historyDonations.filter((d) => d.status === 'Collected').length;
  const completedCount = historyDonations.filter((d) => d.status === 'Completed').length;

  return (
    <div className="flex-1 flex flex-col p-5 md:p-8 lg:p-10 space-y-6 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E5E7E4]">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#171717] font-['Manrope'] tracking-tight">
            Collection & History
          </h1>
          <p className="text-xs text-[#777777] mt-0.5">
            Coordinate dispatch, update transport lifecycle, and track completed distributions.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-[#FAFBF9] p-1.5 rounded-full border border-[#E5E7E4] overflow-x-auto">
          {[
            { id: 'all', label: 'All History', count: historyDonations.length },
            { id: 'Accepted', label: 'Accepted', count: acceptedCount },
            { id: 'Collection Scheduled', label: 'Scheduled', count: scheduledCount },
            { id: 'Collected', label: 'Collected', count: collectedCount },
            { id: 'Completed', label: 'Completed', count: completedCount }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#171717] text-white shadow-xs'
                  : 'text-[#777777] hover:text-[#171717]'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs font-bold text-[#777777]">
          Loading collection records...
        </div>
      ) : filteredDonations.length === 0 ? (
        <div className="p-12 text-center bg-[#FAFBF9] rounded-3xl border border-dashed border-[#E5E7E4] space-y-2">
          <Truck className="w-10 h-10 text-[#888888] mx-auto" />
          <h3 className="text-sm font-bold text-[#171717]">No records in this category</h3>
          <p className="text-xs text-[#777777]">
            Accept incoming donation requests to coordinate collection schedules.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDonations.map((d) => (
            <div
              key={d.id}
              onClick={() => onSelectDonation(d)}
              className="bg-white rounded-3xl p-5 border border-[#E5E7E4] shadow-xs hover:border-[#171717]/30 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#777777] bg-[#FAFBF9] px-2.5 py-0.5 rounded-full border border-[#E5E7E4]">
                    {d.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      d.status === 'Completed'
                        ? 'bg-[#23845B]/10 text-[#23845B]'
                        : d.status === 'Accepted'
                        ? 'bg-blue-100 text-blue-800'
                        : d.status === 'Collection Scheduled'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-[#F5E84D] text-[#171717]'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>

                {/* Thumbnail & Title */}
                <div className="flex gap-3 items-center">
                  {d.image_url ? (
                    <img
                      src={d.image_url.startsWith('http') || d.image_url.startsWith('/') ? d.image_url : `/${d.image_url}`}
                      alt={d.title}
                      className="w-14 h-14 object-cover rounded-2xl border border-[#E5E7E4] shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/backend/data/test_images/f10.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-14 h-14 bg-[#F1F2F0] rounded-2xl flex items-center justify-center text-[#888888] shrink-0">
                      <Truck className="w-6 h-6" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#171717] truncate group-hover:text-black">
                      {d.title}
                    </h3>
                    <p className="text-[11px] text-[#777777] mt-0.5">
                      Volume: <strong className="text-[#171717]">{d.quantity} {d.unit}</strong>
                    </p>
                  </div>
                </div>

                {/* Logistics Info Box */}
                <div className="p-3 rounded-2xl bg-[#FAFBF9] border border-[#F1F2F0] space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[#777777]">
                    <User className="w-3.5 h-3.5 text-[#888888] shrink-0" />
                    <span className="truncate">Donor: <strong className="text-[#171717]">{d.donor_name}</strong></span>
                  </div>

                  <div className="flex items-start gap-2 text-[#777777]">
                    <MapPin className="w-3.5 h-3.5 text-[#888888] shrink-0 mt-0.5" />
                    <span className="truncate text-[11px]">{d.pickup_location}</span>
                  </div>

                  {d.scheduled_date && (
                    <div className="flex items-center gap-2 text-purple-700 font-semibold pt-1 border-t border-[#E5E7E4]/50">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{d.scheduled_date} at {d.scheduled_time || '14:00'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#F1F2F0] flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onSelectDonation(d)}
                  className="text-xs font-bold text-[#171717] hover:underline flex items-center gap-1"
                >
                  <span>Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {d.status === 'Accepted' && (
                  <button
                    onClick={() => onSelectDonation(d)}
                    className="px-3.5 py-1.5 rounded-full bg-[#F5E84D] text-[#171717] font-bold text-xs hover:bg-[#EBDD3C] transition-colors"
                  >
                    Schedule Slot
                  </button>
                )}

                {d.status === 'Collection Scheduled' && (
                  <button
                    onClick={() => onCollect(d.id)}
                    className="px-3.5 py-1.5 rounded-full bg-[#171717] text-white font-bold text-xs hover:bg-neutral-800 transition-colors"
                  >
                    Confirm Pickup
                  </button>
                )}

                {d.status === 'Collected' && (
                  <button
                    onClick={() => onComplete(d.id)}
                    className="px-3.5 py-1.5 rounded-full bg-[#23845B] text-white font-bold text-xs hover:bg-[#1D6F4C] transition-colors"
                  >
                    Complete
                  </button>
                )}

                {d.status === 'Completed' && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-[#23845B]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Delivered
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
