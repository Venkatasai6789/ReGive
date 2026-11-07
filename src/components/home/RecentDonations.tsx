import React from 'react';
import { Donation, ScreenType } from '../../types/donation';
import { ArrowRight, PackageOpen, Building2, Calendar, Sparkles } from 'lucide-react';

interface RecentDonationsProps {
  donations: Donation[];
  onNavigate: (screen: ScreenType) => void;
  onSelectDonation: (donation: Donation) => void;
}

const getStatusBadge = (status: Donation['status']) => {
  switch (status) {
    case 'Completed':
      return 'bg-[#23845B]/10 text-[#23845B] border-[#23845B]/20';
    case 'Accepted':
    case 'Collection Scheduled':
      return 'bg-[#171717]/10 text-[#171717] border-[#171717]/20';
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

export const RecentDonations: React.FC<RecentDonationsProps> = ({
  donations,
  onNavigate,
  onSelectDonation
}) => {
  const recentItems = donations.slice(0, 3);

  return (
    <section className="px-6 md:px-12 lg:px-16 py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#777777]">
            Active Activity
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] font-['Manrope'] mt-1">
            Recent contributions
          </h2>
          <p className="text-sm text-[#777777] mt-1">
            Review the latest status of items you have contributed to the circulation network.
          </p>
        </div>

        <button
          onClick={() => onNavigate('donations')}
          className="flex items-center gap-2 text-sm font-bold text-[#171717] hover:underline underline-offset-4 shrink-0"
        >
          <span>View all {donations.length} donations</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {recentItems.length === 0 ? (
        <div className="bg-[#FAFBF9] border border-[#E5E7E4] rounded-3xl p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#F1F2F0] text-[#777777] flex items-center justify-center mx-auto">
            <PackageOpen className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-[#171717] font-['Manrope']">
              No donations created yet
            </h3>
            <p className="text-sm text-[#777777] mt-1 leading-relaxed">
              You haven't submitted any resources yet. Take a quick photo of surplus food, apparel, or books to get started.
            </p>
          </div>
          <button
            onClick={() => onNavigate('create')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F5E84D] hover:bg-[#EBDD3C] text-[#171717] font-bold text-sm shadow-sm transition-all"
          >
            <span>Create First Donation</span>
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onSelectDonation(item);
                onNavigate('donations');
              }}
              className="bg-white rounded-3xl border border-[#E5E7E4] overflow-hidden hover:border-[#171717] hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group h-full"
            >
              {/* Image thumbnail */}
              <div className="relative h-44 w-full bg-[#F1F2F0] overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-[#171717] shadow-xs backdrop-blur-xs">
                    {item.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-xs bg-white/90 ${getStatusBadge(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-mono text-[#777777] mb-1">
                    {item.id}
                  </div>
                  <h3 className="font-bold text-base text-[#171717] line-clamp-1 font-['Manrope'] group-hover:text-neutral-800">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#777777] line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#F1F2F0] space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#777777]">
                    <span className="font-medium">Quantity:</span>
                    <span className="font-bold text-[#171717]">
                      {item.quantity} {item.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#777777]">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      Partner:
                    </span>
                    <span className="font-semibold text-[#171717] truncate max-w-[150px]">
                      {item.partnerName || 'Pending Match'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#777777] text-[11px]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Submitted:
                    </span>
                    <span>
                      {new Date(item.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
