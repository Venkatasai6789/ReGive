import React from 'react';
import { Donation } from '../../types/donation';
import {
  Calendar,
  Building2,
  PackageOpen,
  ArrowRight,
  Eye,
  Clock,
  Sparkles
} from 'lucide-react';

interface DonationListProps {
  donations: Donation[];
  onSelectDonation: (donation: Donation) => void;
  onCreateNew: () => void;
}

const getStatusBadge = (status: Donation['status']) => {
  switch (status) {
    case 'Completed':
      return 'bg-[#23845B]/10 text-[#23845B] border-[#23845B]/20';
    case 'Accepted':
    case 'Collection Scheduled':
      return 'bg-[#171717] text-[#F5E84D] border-[#171717]';
    case 'Awaiting Partner':
    case 'Processing':
    case 'Submitted':
      return 'bg-[#B77B24]/10 text-[#B77B24] border-[#B77B24]/20';
    case 'Rejected':
    case 'Expired':
      return 'bg-[#C94B4B]/10 text-[#C94B4B] border-[#C94B4B]/20';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const DonationList: React.FC<DonationListProps> = ({
  donations,
  onSelectDonation,
  onCreateNew
}) => {
  if (donations.length === 0) {
    return (
      <div className="bg-[#FAFBF9] border border-[#E5E7E4] rounded-3xl p-12 text-center space-y-4 my-6">
        <div className="w-12 h-12 rounded-full bg-white border border-[#E5E7E4] text-[#777777] flex items-center justify-center mx-auto shadow-xs">
          <PackageOpen className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-bold text-[#171717] font-['Manrope']">
            No matching donation records found
          </h3>
          <p className="text-xs text-[#777777] mt-1 leading-relaxed">
            There are no donation records that match your active filter criteria. Try resetting filters or submit a new contribution.
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#F5E84D] hover:bg-[#EBDD3C] text-xs font-bold text-[#171717] shadow-xs transition-all"
        >
          <span>Create New Donation</span>
          <Sparkles className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="my-6">
      {/* Desktop Table View (Hidden on mobile) */}
      <div className="hidden md:block overflow-hidden rounded-3xl border border-[#E5E7E4] bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FAFBF9] border-b border-[#E5E7E4] text-[11px] font-bold uppercase tracking-wider text-[#777777]">
              <th className="py-3.5 px-5">Item</th>
              <th className="py-3.5 px-5">Category & Quantity</th>
              <th className="py-3.5 px-5">Assigned Partner</th>
              <th className="py-3.5 px-5">Submitted</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F2F0] text-xs">
            {donations.map((item) => (
              <tr
                key={item.id}
                onClick={() => onSelectDonation(item)}
                className="hover:bg-[#FAFBF9] transition-colors cursor-pointer group"
              >
                {/* Thumbnail & Title */}
                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-12 h-12 rounded-xl object-cover border border-[#E5E7E4] shrink-0"
                    />
                    <div className="max-w-xs">
                      <span className="font-mono text-[10px] text-[#777777] block">
                        {item.id}
                      </span>
                      <span className="font-bold text-[#171717] group-hover:text-black line-clamp-1 font-['Manrope'] text-sm">
                        {item.title}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Category & Quantity */}
                <td className="py-4 px-5">
                  <div className="font-semibold text-[#171717]">
                    {item.quantity} {item.unit}
                  </div>
                  <div className="text-[11px] text-[#777777]">
                    {item.category}
                  </div>
                </td>

                {/* Partner */}
                <td className="py-4 px-5">
                  <div className="flex items-center gap-1.5 font-bold text-[#171717]">
                    <Building2 className="w-3.5 h-3.5 text-[#777777] shrink-0" />
                    <span className="truncate max-w-[160px]">
                      {item.partnerName || 'Awaiting Partner'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#777777]">
                    {item.partnerType || 'Open Intake Pool'}
                  </span>
                </td>

                {/* Date */}
                <td className="py-4 px-5 text-[#777777]">
                  <div className="flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3 h-3 text-[#777777]" />
                    <span>
                      {new Date(item.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="py-4 px-5">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </td>

                {/* Action */}
                <td className="py-4 px-5 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDonation(item);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F1F2F0] hover:bg-[#E5E7E4] font-bold text-xs text-[#171717] transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View & Track</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (Shown on screens < 768px) */}
      <div className="md:hidden space-y-4">
        {donations.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectDonation(item)}
            className="p-4 rounded-2xl bg-white border border-[#E5E7E4] shadow-xs hover:border-[#171717] transition-all space-y-3 cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-16 h-16 rounded-xl object-cover border border-[#E5E7E4] shrink-0"
              />
              <div className="overflow-hidden flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#777777]">{item.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-[#171717] font-['Manrope'] truncate mt-0.5">
                  {item.title}
                </h4>
                <p className="text-xs text-[#777777]">
                  {item.quantity} {item.unit} &bull; {item.category}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#F1F2F0] flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-[#777777]">
                <Building2 className="w-3.5 h-3.5" />
                <span className="truncate max-w-[140px] font-semibold text-[#171717]">
                  {item.partnerName || 'Pending Partner'}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[#171717] font-bold">
                <span>Track</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
