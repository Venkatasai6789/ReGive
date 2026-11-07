import React from 'react';
import {
  Inbox,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  TrendingUp,
  Recycle,
  Utensils,
  Truck,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { PartnerDashboardData, PartnerDonationItem } from '../../types/partner';

interface PartnerDashboardProps {
  data: PartnerDashboardData | null;
  isLoading: boolean;
  onNavigateToRequests: () => void;
  onNavigateToHistory: () => void;
  onSelectDonation: (donation: PartnerDonationItem) => void;
}

export const PartnerDashboard: React.FC<PartnerDashboardProps> = ({
  data,
  isLoading,
  onNavigateToRequests,
  onNavigateToHistory,
  onSelectDonation
}) => {
  if (isLoading || !data) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#F5E84D] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-[#777777]">Loading partner live operational data...</p>
        </div>
      </div>
    );
  }

  const { partner, stats, incoming_preview, upcoming_collections, recent_activity } = data;
  const isRecycler = partner.organization_type.toLowerCase().includes('recycler');

  const todayStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="flex-1 flex flex-col p-5 md:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">
      {/* Top Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAFBF9] p-6 rounded-3xl border border-[#E5E7E4]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#171717] font-['Manrope'] tracking-tight">
              {partner.name}
            </h1>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#23845B]/10 text-[#23845B] border border-[#23845B]/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Partner Node
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isRecycler
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {isRecycler ? 'Organic Recovery Partner' : 'Food Rescue NGO'}
            </span>
          </div>
          <p className="text-xs text-[#777777]">
            {isRecycler
              ? 'Industrial organic conversion, composting & sustainable waste diversion portal.'
              : 'Community hunger alleviation & surplus food rescue redistribution portal.'}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="text-right hidden sm:block">
            <span className="block text-[10px] uppercase font-bold text-[#888888]">Operating Status</span>
            <span className="text-xs font-bold text-[#171717]">{todayStr}</span>
          </div>
          <button
            onClick={onNavigateToRequests}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F5E84D] hover:bg-[#EBDD3C] text-[#171717] font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <span>Review Intake Requests</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Requests */}
        <div
          onClick={onNavigateToRequests}
          className="bg-white p-5 rounded-3xl border border-[#E5E7E4] shadow-xs hover:border-[#171717]/20 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">
              Pending Requests
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#171717] font-['Manrope']">
              {stats.pending_count}
            </span>
            {stats.pending_count > 0 && (
              <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Action needed
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#888888] mt-1">Awaiting acceptance confirmation</p>
        </div>

        {/* Accepted Donations */}
        <div
          onClick={onNavigateToHistory}
          className="bg-white p-5 rounded-3xl border border-[#E5E7E4] shadow-xs hover:border-[#171717]/20 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">
              Accepted
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#171717] font-['Manrope']">
              {stats.accepted_count}
            </span>
            <span className="text-[11px] font-bold text-blue-600">Ready to schedule</span>
          </div>
          <p className="text-[11px] text-[#888888] mt-1">Confirmed for logistics pickup</p>
        </div>

        {/* Scheduled Collections */}
        <div
          onClick={onNavigateToHistory}
          className="bg-white p-5 rounded-3xl border border-[#E5E7E4] shadow-xs hover:border-[#171717]/20 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">
              Scheduled
            </span>
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#171717] font-['Manrope']">
              {stats.scheduled_count}
            </span>
            <span className="text-[11px] font-bold text-purple-600">Dispatches queued</span>
          </div>
          <p className="text-[11px] text-[#888888] mt-1">Assigned pickup windows</p>
        </div>

        {/* Completed Circulation or Processed Volume */}
        <div
          onClick={onNavigateToHistory}
          className="bg-white p-5 rounded-3xl border border-[#E5E7E4] shadow-xs hover:border-[#171717]/20 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">
              {isRecycler ? 'Processed Volume' : 'Completed Rescue'}
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#171717] font-['Manrope']">
              {isRecycler ? `${stats.total_quantity_processed} bxs` : stats.completed_count}
            </span>
            <span className="text-[11px] font-bold text-emerald-600">Circulated</span>
          </div>
          <p className="text-[11px] text-[#888888] mt-1">
            {isRecycler ? 'Diverted from landfill' : 'Safely distributed to community'}
          </p>
        </div>
      </div>

      {/* Incoming Donation Preview Section */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E7E4] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#171717] font-['Manrope']">
              Incoming Donation Preview
            </h2>
            <p className="text-xs text-[#777777]">
              Latest donations mapped and assigned to your organization.
            </p>
          </div>
          <button
            onClick={onNavigateToRequests}
            className="text-xs font-bold text-[#171717] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({stats.total_assigned})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {incoming_preview.length === 0 ? (
          <div className="p-8 text-center bg-[#FAFBF9] rounded-2xl border border-dashed border-[#E5E7E4] space-y-2">
            <Inbox className="w-8 h-8 text-[#888888] mx-auto" />
            <p className="text-xs font-bold text-[#171717]">No pending donations assigned.</p>
            <p className="text-[11px] text-[#777777]">
              When donors submit matching resources, they will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {incoming_preview.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectDonation(item)}
                className="bg-[#FAFBF9] p-4 rounded-2xl border border-[#E5E7E4] hover:border-[#171717]/30 hover:bg-white transition-all cursor-pointer flex flex-col justify-between group shadow-2xs"
              >
                <div className="flex gap-3 items-start">
                  {item.image_url ? (
                    <img
                      src={item.image_url.startsWith('http') || item.image_url.startsWith('/') ? item.image_url : `/${item.image_url}`}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-xl border border-[#E5E7E4] shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/backend/data/test_images/f10.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-[#F1F2F0] rounded-xl border border-[#E5E7E4] flex items-center justify-center text-[#888888] shrink-0">
                      <Utensils className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-[#777777]">
                        {item.id}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          item.status === 'Submitted'
                            ? 'bg-[#F5E84D] text-[#171717]'
                            : item.status === 'Accepted'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-[#23845B]/10 text-[#23845B]'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#171717] truncate group-hover:text-black">
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-2 text-[11px] text-[#777777]">
                      <span>{item.quantity} {item.unit}</span>
                      <span>•</span>
                      <span className="truncate">{item.food_type || item.category}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#F1F2F0] flex items-center justify-between text-[11px]">
                  <span className="text-[#888888]">
                    {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                  <span className="font-bold text-[#171717] group-hover:underline flex items-center gap-1">
                    Details
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two Column Layout: Upcoming Collections & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Collections */}
        <div className="bg-white rounded-3xl p-6 border border-[#E5E7E4] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[#171717] font-['Manrope']">
                Upcoming Collections
              </h2>
              <p className="text-xs text-[#777777]">
                Logistics pickup windows and transport logistics.
              </p>
            </div>
            <button
              onClick={onNavigateToHistory}
              className="text-xs font-bold text-[#171717] hover:underline"
            >
              Full Schedule
            </button>
          </div>

          {upcoming_collections.length === 0 ? (
            <div className="p-8 text-center bg-[#FAFBF9] rounded-2xl border border-dashed border-[#E5E7E4] space-y-1">
              <Calendar className="w-6 h-6 text-[#888888] mx-auto" />
              <p className="text-xs font-bold text-[#171717]">No scheduled pickups right now.</p>
              <p className="text-[11px] text-[#777777]">
                Accept incoming requests to schedule courier dispatch.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming_collections.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectDonation(item)}
                  className="p-3.5 rounded-2xl bg-[#FAFBF9] border border-[#E5E7E4] hover:bg-white transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-[#777777]">{item.id}</span>
                      <span className="text-xs font-bold text-[#171717] truncate">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#777777]">
                      <span className="flex items-center gap-1 text-purple-700 font-semibold">
                        <Clock className="w-3 h-3" />
                        {item.scheduled_date || 'Awaiting slot'} {item.scheduled_time || ''}
                      </span>
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{item.pickup_location}</span>
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#171717] text-[#F5E84D] shrink-0">
                    Coordinate
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-3xl p-6 border border-[#E5E7E4] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[#171717] font-['Manrope']">
                Chronological Activity
              </h2>
              <p className="text-xs text-[#777777]">
                Live physical circulation events persisted in database.
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAFBF9] text-[#777777] border border-[#E5E7E4]">
              Audit Log
            </span>
          </div>

          {recent_activity.length === 0 ? (
            <div className="p-8 text-center bg-[#FAFBF9] rounded-2xl border border-dashed border-[#E5E7E4] space-y-1">
              <Clock className="w-6 h-6 text-[#888888] mx-auto" />
              <p className="text-xs font-bold text-[#171717]">No events recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recent_activity.slice(0, 5).map((ev) => (
                <div key={ev.id} className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAFBF9] border border-[#F1F2F0]">
                  <div className="w-7 h-7 rounded-full bg-[#171717] text-[#F5E84D] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {ev.stage_id}
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#171717]">{ev.label}</span>
                      <span className="text-[10px] text-[#888888] font-mono">{ev.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-[#666666] truncate">{ev.detail}</p>
                    <span className="text-[10px] font-mono text-[#888888]">
                      Donation: {ev.donation_title} ({ev.donation_id})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
