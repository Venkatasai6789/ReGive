import React from 'react';
import { Partner } from '../../types/donation';
import {
  Building2,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Warehouse
} from 'lucide-react';

interface PartnerRecommendationsProps {
  partners: Partner[];
  selectedPartnerId: string | null;
  onSelectPartner: (partner: Partner) => void;
  onViewDetails: (partner: Partner) => void;
}

export const PartnerRecommendations: React.FC<PartnerRecommendationsProps> = ({
  partners,
  selectedPartnerId,
  onSelectPartner,
  onViewDetails
}) => {
  const isRecyclerStream = partners.some((p) => p.organizationType === 'Recycler');

  return (
    <div className="space-y-6 pt-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#777777]">
            {isRecyclerStream ? 'Organic Recovery Routing' : 'Automated Routing'}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isRecyclerStream
                ? 'bg-[#B77B24]/10 text-[#B77B24] border border-[#B77B24]/20'
                : 'bg-[#F5E84D] text-[#171717]'
            }`}
          >
            MiniLM + FAISS {isRecyclerStream ? 'Recycler Matched' : 'Matched'}
          </span>
        </div>
        <h3 className="text-2xl font-extrabold text-[#171717] font-['Manrope'] mt-1">
          {isRecyclerStream
            ? 'Recommended Recyclers & Organic Processors.'
            : 'Recommended for your donation.'}
        </h3>
        <p className="text-sm text-[#777777] mt-1">
          {isRecyclerStream
            ? 'Inedible organic items are diverted away from food banks and routed to verified composting, biogas, and animal recovery facilities.'
            : 'Select an organization below to handle intake and collection logistics.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {partners.map((partner) => {
          const isSelected = selectedPartnerId === partner.id;

          return (
            <div
              key={partner.id}
              className={`rounded-3xl p-6 transition-all duration-200 border flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-[#171717] ring-2 ring-[#171717] shadow-md'
                  : 'bg-white border-[#E5E7E4] hover:border-[#171717] hover:shadow-xs'
              }`}
            >
              <div>
                {/* Top Badge: Organization Type & Match Score */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#F1F2F0] text-[#171717] border border-[#E5E7E4]">
                    {partner.organizationType}
                  </span>
                  <span className="text-xs font-extrabold text-[#23845B] flex items-center gap-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {partner.matchingScore}% Match
                  </span>
                </div>

                {/* Organization Name */}
                <h4 className="text-lg font-bold text-[#171717] font-['Manrope'] leading-snug">
                  {partner.name}
                </h4>

                {/* Location & Distance */}
                <div className="flex items-center gap-1.5 text-xs text-[#777777] mt-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>{partner.location}</span>
                </div>

                {/* Capacity */}
                <div className="mt-3 flex items-center gap-1.5 text-xs text-[#171717]">
                  <Warehouse className="w-3.5 h-3.5 text-[#23845B]" />
                  <span className="font-semibold">{partner.availableCapacity}% Intake Capacity</span>
                </div>

                {/* AI Matching Explanation */}
                <div className="mt-4 p-3 rounded-2xl bg-[#FAFBF9] border border-[#F1F2F0]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#777777] block mb-1">
                    Why this partner matches:
                  </span>
                  <p className="text-xs text-[#777777] leading-relaxed">
                    {partner.matchingReasons[0]}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-6 pt-4 border-t border-[#F1F2F0] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onViewDetails(partner)}
                  className="flex-1 py-2.5 px-3 rounded-full bg-[#F1F2F0] hover:bg-[#E5E7E4] text-xs font-bold text-[#171717] transition-colors"
                >
                  View Details
                </button>

                <button
                  type="button"
                  onClick={() => onSelectPartner(partner)}
                  className={`flex-1 py-2.5 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#171717] text-[#F5E84D]'
                      : 'bg-[#F5E84D] hover:bg-[#EBDD3C] text-[#171717]'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Selected</span>
                    </>
                  ) : (
                    <span>Select Partner</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
