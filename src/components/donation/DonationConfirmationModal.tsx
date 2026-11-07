import React, { useState } from 'react';
import { Partner, DonationCategory } from '../../types/donation';
import { DonationFormData } from './DonationDetailsForm';
import {
  CheckCircle2,
  Building2,
  MapPin,
  Calendar,
  AlertCircle,
  PackageCheck,
  ArrowRight
} from 'lucide-react';

interface DonationConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<string>; // returns created donation ID
  formData: DonationFormData;
  partner: Partner | null;
  imagePreview: string | null;
  onViewMyDonations: () => void;
}

export const DonationConfirmationModal: React.FC<DonationConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  formData,
  partner,
  imagePreview,
  onViewMyDonations
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (isSubmitting || createdId) return;
    setIsSubmitting(true);
    try {
      const id = await onConfirm();
      setCreatedId(id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E5E7E4] animate-in fade-in zoom-in-95 duration-150">
        {!createdId ? (
          <>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Final Step
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F5E84D] text-[#171717]">
                Ready to Submit
              </span>
            </div>

            <h3 className="text-2xl font-extrabold text-[#171717] font-['Manrope'] mb-1">
              Confirm your donation
            </h3>
            <p className="text-xs text-[#777777] mb-6">
              Please review your contribution details before notifying the recipient organization.
            </p>

            {/* Item & Partner Summary Card */}
            <div className="bg-[#FAFBF9] border border-[#E5E7E4] rounded-2xl p-4 space-y-4 mb-6">
              <div className="flex items-center gap-3">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt={formData.title}
                    className="w-16 h-16 rounded-xl object-cover border border-[#E5E7E4] shrink-0"
                  />
                )}
                <div className="overflow-hidden">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
                    {formData.category}
                  </span>
                  <h4 className="text-base font-bold text-[#171717] font-['Manrope'] truncate">
                    {formData.title}
                  </h4>
                  <p className="text-xs font-semibold text-[#171717]">
                    Quantity: {formData.quantity} {formData.unit} &bull; Condition: {formData.condition}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E7E4] space-y-2 text-xs">
                {partner && (
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-[#777777] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[#777777]">Recipient Partner: </span>
                      <span className="font-bold text-[#171717]">{partner.name}</span>
                      <span className="text-[#777777]"> ({partner.organizationType})</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#777777] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#777777]">Collection Address: </span>
                    <span className="font-bold text-[#171717]">{formData.pickupLocation}</span>
                  </div>
                </div>

                {formData.expiryDate && (
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-[#777777] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[#777777]">Best Before: </span>
                      <span className="font-bold text-[#171717]">{formData.expiryDate}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-3.5 px-4 rounded-full bg-[#F1F2F0] hover:bg-[#E5E7E4] font-bold text-xs text-[#171717] transition-colors"
              >
                Go Back
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-2 py-3.5 px-6 rounded-full bg-[#F5E84D] hover:bg-[#EBDD3C] font-bold text-xs text-[#171717] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Recording Donation...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Dispatch Intake</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Success Screen */
          <div className="text-center py-4 space-y-5">
            <div className="w-14 h-14 rounded-full bg-[#23845B]/10 text-[#23845B] flex items-center justify-center mx-auto">
              <PackageCheck className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-[#23845B] px-3 py-1 rounded-full bg-[#23845B]/10 border border-[#23845B]/20">
                {createdId}
              </span>
              <h3 className="text-2xl font-extrabold text-[#171717] font-['Manrope'] mt-3">
                Donation successfully submitted!
              </h3>
              <p className="text-xs text-[#777777] max-w-sm mx-auto mt-2 leading-relaxed">
                Your donation has been recorded in the platform ledger. The recipient organization has been notified to schedule courier collection.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-[#E5E7E4] text-xs text-left space-y-1.5 text-[#171717]">
              <div className="flex justify-between">
                <span className="text-[#777777]">Initial Status:</span>
                <span className="font-bold text-[#171717]">Submitted / Awaiting Pickup</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777777]">Partner Assigned:</span>
                <span className="font-bold text-[#171717]">{partner?.name || 'In Network'}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onViewMyDonations}
                className="w-full py-3.5 px-6 rounded-full bg-[#171717] hover:bg-neutral-800 text-[#F5E84D] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View My Donations & Track Status</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
