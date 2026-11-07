import React from 'react';
import { Partner } from '../../types/donation';
import {
  X,
  Building2,
  MapPin,
  Clock,
  Phone,
  Mail,
  CheckCircle,
  ShieldCheck,
  Sparkles,
  Warehouse
} from 'lucide-react';

interface PartnerDetailDrawerProps {
  partner: Partner | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectPartner: (partner: Partner) => void;
  isSelected: boolean;
}

export const PartnerDetailDrawer: React.FC<PartnerDetailDrawerProps> = ({
  partner,
  isOpen,
  onClose,
  onSelectPartner,
  isSelected
}) => {
  if (!isOpen || !partner) return null;

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
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Partner Profile
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#23845B]/10 text-[#23845B]">
                Verified Partner
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#F1F2F0] text-[#777777] hover:text-[#171717] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Title & Type */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F1F2F0] text-[#171717]">
                  {partner.organizationType}
                </span>
                <span className="text-xs font-extrabold text-[#23845B] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {partner.matchingScore}% Compatibility Score
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-[#171717] font-['Manrope']">
                {partner.name}
              </h3>
              <p className="text-xs text-[#777777] mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {partner.address}
              </p>
            </div>

            {/* Capacity & Distance Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-[#E5E7E4]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
                  Available Capacity
                </span>
                <div className="text-xl font-extrabold text-[#171717] font-['Manrope'] mt-1 flex items-center gap-1.5">
                  <Warehouse className="w-4 h-4 text-[#23845B]" />
                  <span>{partner.availableCapacity}%</span>
                </div>
                <span className="text-[11px] text-[#777777]">Ready for immediate intake</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-[#E5E7E4]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
                  Logistics Distance
                </span>
                <div className="text-xl font-extrabold text-[#171717] font-['Manrope'] mt-1">
                  {partner.distanceKm} km
                </div>
                <span className="text-[11px] text-[#777777]">Direct courier radius</span>
              </div>
            </div>

            {/* AI Matching Rationales */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#171717] mb-3">
                Why ReGive AI Recommended This Partner
              </h4>
              <div className="space-y-2">
                {partner.matchingReasons.map((reason, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#FAFBF9] border border-[#F1F2F0] text-xs text-[#171717]"
                  >
                    <CheckCircle className="w-4 h-4 text-[#23845B] shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Accepted Categories */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#171717] mb-2">
                Registered Intake Categories
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {partner.acceptedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#F1F2F0] text-[#171717]"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Operational & Contact Details */}
            <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-[#E5E7E4] space-y-2.5 text-xs text-[#171717]">
              <h4 className="font-bold uppercase tracking-wider text-[10px] text-[#777777] mb-2">
                Intake Office Contacts
              </h4>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#777777]" />
                <span>{partner.operatingHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#777777]" />
                <span>{partner.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#777777]" />
                <span>{partner.contactEmail}</span>
              </div>
            </div>
          </div>

          {/* Drawer Footer Action */}
          <div className="p-6 border-t border-[#E5E7E4] bg-white">
            <button
              onClick={() => {
                onSelectPartner(partner);
                onClose();
              }}
              className={`w-full py-3.5 px-6 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                isSelected
                  ? 'bg-[#171717] text-[#F5E84D]'
                  : 'bg-[#F5E84D] hover:bg-[#EBDD3C] text-[#171717]'
              }`}
            >
              {isSelected ? 'Partner Selected (Close)' : 'Select This Partner'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
