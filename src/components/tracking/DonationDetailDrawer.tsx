import React from 'react';
import { Donation } from '../../types/donation';
import {
  X,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  ShieldCheck,
  Package,
  ArrowRight
} from 'lucide-react';

interface DonationDetailDrawerProps {
  donation: Donation | null;
  isOpen: boolean;
  onClose: () => void;
  onFindNewPartner?: (donation: Donation) => void;
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

export const DonationDetailDrawer: React.FC<DonationDetailDrawerProps> = ({
  donation,
  isOpen,
  onClose,
  onFindNewPartner
}) => {
  if (!isOpen || !donation) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-[#E5E7E4]">
          {/* Header */}
          <div className="p-6 border-b border-[#E5E7E4] flex items-center justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-[#777777]">
                {donation.id}
              </span>
              <h3 className="text-xl font-extrabold text-[#171717] font-['Manrope']">
                Donation Tracking & Lifecycle
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#F1F2F0] text-[#777777] hover:text-[#171717] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Top Image & Title */}
            <div className="space-y-3">
              <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-[#F1F2F0] border border-[#E5E7E4]">
                <img
                  src={donation.imageUrl}
                  alt={donation.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-[#171717] shadow-xs">
                    {donation.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-xs bg-white/95 ${getStatusBadge(
                      donation.status
                    )}`}
                  >
                    {donation.status}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xl font-bold text-[#171717] font-['Manrope']">
                  {donation.title}
                </h4>
                <p className="text-xs text-[#777777] mt-1 leading-relaxed">
                  {donation.description}
                </p>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#FAFBF9] border border-[#E5E7E4]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
                  Quantity & Unit
                </span>
                <div className="text-base font-extrabold text-[#171717] font-['Manrope'] mt-0.5">
                  {donation.quantity} {donation.unit}
                </div>
                <span className="text-[11px] text-[#777777]">Condition: {donation.condition}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAFBF9] border border-[#E5E7E4]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
                  Intake Partner
                </span>
                <div className="text-base font-extrabold text-[#171717] font-['Manrope'] mt-0.5 truncate">
                  {donation.partnerName || 'Pending Match'}
                </div>
                <span className="text-[11px] text-[#777777]">
                  {donation.partnerType || 'Open Pool'}
                </span>
              </div>
            </div>

            {/* Pickup Location & Date */}
            <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-[#E5E7E4] space-y-2 text-xs text-[#171717]">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#777777] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#777777]">Pickup Address: </span>
                  <span className="font-semibold">{donation.pickupLocation}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#777777] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#777777]">Registered on: </span>
                  <span className="font-semibold">
                    {new Date(donation.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {donation.expiryDate && (
                <div className="flex items-start gap-2 text-[#B77B24]">
                  <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <div>
                    <span>Best Before: </span>
                    <span className="font-bold">{donation.expiryDate}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Rejection Alert & Re-match Action */}
            {donation.status === 'Rejected' && (
              <div className="p-4 rounded-2xl bg-[#C94B4B]/10 border border-[#C94B4B]/20 space-y-3">
                <div className="flex items-start gap-2 text-[#C94B4B] text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Intake Notice:</span>
                    <span>
                      {donation.rejectionReason ||
                        'The previous organization had temporary intake storage limitations.'}
                    </span>
                  </div>
                </div>
                {onFindNewPartner && (
                  <button
                    onClick={() => {
                      onFindNewPartner(donation);
                      onClose();
                    }}
                    className="w-full py-2 px-3 rounded-full bg-[#171717] hover:bg-neutral-800 text-white font-bold text-xs transition-colors"
                  >
                    Find Alternate Eligible Partner
                  </button>
                )}
              </div>
            )}

            {/* Tracking Progress Timeline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#171717] mb-3">
                5-Stage Journey Timeline
              </h4>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E7E4]">
                {donation.trackingTimeline.map((stage) => {
                  return (
                    <div key={stage.stageId} className="relative">
                      {/* Node Bullet */}
                      <div
                        className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 transition-colors flex items-center justify-center ${
                          stage.isCompleted
                            ? 'bg-[#23845B] border-[#23845B] text-white'
                            : stage.isCurrent
                            ? 'bg-[#F5E84D] border-[#171717] ring-4 ring-[#F5E84D]/40'
                            : 'bg-white border-[#E5E7E4]'
                        }`}
                      >
                        {stage.isCompleted && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>

                      <div className="leading-tight">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold ${
                              stage.isCompleted
                                ? 'text-[#171717]'
                                : stage.isCurrent
                                ? 'text-[#171717]'
                                : 'text-[#888888]'
                            }`}
                          >
                            {stage.label}
                          </span>
                          {stage.timestamp && (
                            <span className="text-[10px] text-[#777777] font-mono">
                              {stage.timestamp}
                            </span>
                          )}
                        </div>

                        {stage.detail && (
                          <p className="text-[11px] text-[#777777] mt-1 leading-relaxed">
                            {stage.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#E5E7E4] bg-white">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-full bg-[#F1F2F0] hover:bg-[#E5E7E4] font-bold text-xs text-[#171717] transition-colors"
            >
              Close Tracking Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
