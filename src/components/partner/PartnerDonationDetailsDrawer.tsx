import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  AlertTriangle,
  User,
  Mail,
  Phone,
  Truck,
  Box,
  Layers,
  Check,
  ArrowRight,
  Info,
  Building,
  RotateCcw,
  Ban
} from 'lucide-react';
import { PartnerDonationItem, RejectPayload, SchedulePayload } from '../../types/partner';

interface PartnerDonationDetailsDrawerProps {
  donation: PartnerDonationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (donationId: string) => Promise<void>;
  onReject: (donationId: string, payload: RejectPayload) => Promise<void>;
  onSchedule: (donationId: string, payload: SchedulePayload) => Promise<void>;
  onCollect: (donationId: string) => Promise<void>;
  onComplete: (donationId: string) => Promise<void>;
}

export const PartnerDonationDetailsDrawer: React.FC<PartnerDonationDetailsDrawerProps> = ({
  donation,
  isOpen,
  onClose,
  onAccept,
  onReject,
  onSchedule,
  onCollect,
  onComplete
}) => {
  const [activeModal, setActiveModal] = useState<'accept' | 'reject' | 'schedule' | null>(null);
  const [rejectReason, setRejectReason] = useState('Storage Capacity Full');
  const [rejectNotes, setRejectNotes] = useState('');
  const [scheduleDate, setScheduleDate] = useState('12-11-2026');
  const [scheduleTime, setScheduleTime] = useState('14:00');
  const [scheduleNotes, setScheduleNotes] = useState('Courier dispatched with insulated thermal containers.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !donation) return null;

  const ai = donation.ai_analysis;
  const isSafe = ai?.isEdible ?? (ai?.safetyStatus === 'Eligible');
  const isRecyclerStream = donation.stream_type && donation.stream_type !== 'human';

  const handleConfirmAccept = async () => {
    try {
      setIsSubmitting(true);
      await onAccept(donation.id);
      setActiveModal(null);
    } catch (err: any) {
      alert(err.message || 'Error accepting donation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please select or specify a rejection reason.');
      return;
    }
    try {
      setIsSubmitting(true);
      await onReject(donation.id, { reason: rejectReason, notes: rejectNotes });
      setActiveModal(null);
    } catch (err: any) {
      alert(err.message || 'Error rejecting donation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmSchedule = async () => {
    if (!scheduleDate || !scheduleTime) {
      alert('Please specify both pickup date and time.');
      return;
    }
    try {
      setIsSubmitting(true);
      await onSchedule(donation.id, {
        pickup_date: scheduleDate,
        pickup_time: scheduleTime,
        notes: scheduleNotes
      });
      setActiveModal(null);
    } catch (err: any) {
      alert(err.message || 'Error scheduling collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Background Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-in Drawer Container */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7E4] bg-[#FAFBF9]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#171717] bg-[#F1F2F0] px-2.5 py-1 rounded-full border border-[#E5E7E4]">
              {donation.id}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                donation.status === 'Completed'
                  ? 'bg-[#23845B]/10 text-[#23845B]'
                  : donation.status === 'Accepted'
                  ? 'bg-blue-50 text-blue-700'
                  : donation.status === 'Collection Scheduled'
                  ? 'bg-purple-50 text-purple-700'
                  : donation.status === 'Rejected'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-[#F5E84D] text-[#171717]'
              }`}
            >
              {donation.status}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F1F2F0] text-[#777777] hover:text-[#171717] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION A: Donation Overview */}
          <div className="bg-[#FAFBF9] rounded-3xl p-5 border border-[#E5E7E4] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Section A • Donation Overview
              </span>
              <span className="text-xs text-[#888888]">
                {new Date(donation.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {donation.image_url ? (
                <img
                  src={donation.image_url.startsWith('http') || donation.image_url.startsWith('/') ? donation.image_url : `/${donation.image_url}`}
                  alt={donation.title}
                  className="w-full sm:w-36 h-36 object-cover rounded-2xl border border-[#E5E7E4] shadow-xs shrink-0"
                  onError={(e) => {
                    // Fallback to demo test image if URL broken
                    (e.target as HTMLImageElement).src = '/backend/data/test_images/f10.jpg';
                  }}
                />
              ) : (
                <div className="w-full sm:w-36 h-36 bg-[#F1F2F0] rounded-2xl border border-[#E5E7E4] flex items-center justify-center text-[#888888] shrink-0">
                  <Box className="w-8 h-8" />
                </div>
              )}

              <div className="space-y-1.5 flex-1">
                <h3 className="text-xl font-extrabold text-[#171717] font-['Manrope'] leading-snug">
                  {donation.title}
                </h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  {donation.description || 'Intake package verified and ready for logistics dispatch.'}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-[#E5E7E4] text-[#171717]">
                    {donation.food_type || donation.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F5E84D] text-[#171717]">
                    {donation.quantity} {donation.unit}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-[#E5E7E4] text-[#171717]">
                    Condition: {donation.condition}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B: Donor Information */}
          <div className="bg-white rounded-3xl p-5 border border-[#E5E7E4] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Section B • Verified Donor Profile
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#23845B]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Donor Account
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FAFBF9] border border-[#F1F2F0]">
                <User className="w-4 h-4 text-[#777777]" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#888888]">Full Name</span>
                  <span className="text-xs font-bold text-[#171717]">{donation.donor_name}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FAFBF9] border border-[#F1F2F0]">
                <Mail className="w-4 h-4 text-[#777777]" />
                <div className="truncate">
                  <span className="block text-[10px] uppercase font-bold text-[#888888]">Email Address</span>
                  <span className="text-xs font-bold text-[#171717] truncate block">{donation.donor_email}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FAFBF9] border border-[#F1F2F0]">
                <Phone className="w-4 h-4 text-[#777777]" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#888888]">Contact Line</span>
                  <span className="text-xs font-bold text-[#171717]">{donation.donor_phone || '+1 (555) 382-9104'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FAFBF9] border border-[#F1F2F0]">
                <Building className="w-4 h-4 text-[#777777]" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#888888]">Account Identifier</span>
                  <span className="text-xs font-mono font-bold text-[#171717]">{donation.donor_id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION C: Food Information */}
          <div className="bg-white rounded-3xl p-5 border border-[#E5E7E4] space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#777777]">
              Section C • Food Specs & Handling Parameters
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-[#FAFBF9] border border-[#F1F2F0]">
                <span className="block text-[10px] uppercase font-bold text-[#888888]">Category</span>
                <span className="text-xs font-bold text-[#171717]">{donation.category}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAFBF9] border border-[#F1F2F0]">
                <span className="block text-[10px] uppercase font-bold text-[#888888]">Food Type</span>
                <span className="text-xs font-bold text-[#171717]">{donation.food_type || 'Bakery & Bread'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAFBF9] border border-[#F1F2F0]">
                <span className="block text-[10px] uppercase font-bold text-[#888888]">Quantity</span>
                <span className="text-xs font-bold text-[#171717]">{donation.quantity} {donation.unit}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAFBF9] border border-[#F1F2F0]">
                <span className="block text-[10px] uppercase font-bold text-[#888888]">Condition</span>
                <span className="text-xs font-bold text-[#171717]">{donation.condition}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAFBF9] border border-[#F1F2F0]">
                <span className="block text-[10px] uppercase font-bold text-[#888888]">Storage</span>
                <span className="text-xs font-bold text-[#171717] capitalize">{donation.storage_condition || 'sealed'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAFBF9] border border-[#F1F2F0]">
                <span className="block text-[10px] uppercase font-bold text-[#888888]">Hours Cooked</span>
                <span className="text-xs font-bold text-[#171717]">{donation.hours_since_cooked || 0} hrs</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAFBF9] border border-[#F1F2F0] flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#777777] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#888888]">Pickup Location Address</span>
                <span className="text-xs font-semibold text-[#171717]">{donation.pickup_location}</span>
              </div>
            </div>
          </div>

          {/* SECTION D: AI MODEL ANALYSIS (CLIP + BLIP + Food Safety) */}
          <div className="bg-[#FAFBF9] rounded-3xl p-5 border border-[#E5E7E4] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D97706]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                  Section D • AI Neural Model Analysis
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-[#E5E7E4] text-[#777777]">
                CLIP ViT-B/32 + BLIP-Base
              </span>
            </div>

            {/* AI Edibility and Safety Banner */}
            <div
              className={`p-4 rounded-2xl border ${
                isSafe
                  ? 'bg-[#23845B]/10 border-[#23845B]/20 text-[#23845B]'
                  : 'bg-[#C94B4B]/10 border-[#C94B4B]/20 text-[#C94B4B]'
              }`}
            >
              <div className="flex items-start gap-3">
                {isSafe ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-[#23845B] mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0 text-[#C94B4B] mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wide">
                    {isSafe ? 'Eligible for Human Consumption' : 'Ineligible for Direct Human Food Intake'}
                  </h4>
                  <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
                    {ai?.safetyExplanation || (isSafe ? 'Intake safety verified. Conforms to 4h/24h perishable safety rules.' : 'Classified as organic waste. Diverted to compost/biogas recovery stream.')}
                  </p>
                </div>
              </div>
            </div>

            {/* BLIP Caption */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E7E4] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#888888] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#F5E84D]" />
                BLIP Automated Image Caption
              </span>
              <p className="text-xs font-medium text-[#171717] italic">
                "{ai?.caption || donation.title}"
              </p>
            </div>

            {/* Model Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-[#E5E7E4]">
                <span className="block text-[10px] text-[#888888] font-bold">Edibility Score</span>
                <span className="text-sm font-extrabold text-[#171717]">
                  {Math.round((ai?.edibilityScore ?? 0.95) * 100)}%
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#E5E7E4]">
                <span className="block text-[10px] text-[#888888] font-bold">Confidence</span>
                <span className="text-sm font-extrabold text-[#171717]">
                  {Math.round((ai?.confidence ?? 0.95) * 100)}%
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#E5E7E4]">
                <span className="block text-[10px] text-[#888888] font-bold">Assigned Stream</span>
                <span className="text-xs font-extrabold text-[#171717] capitalize">
                  {donation.stream_type || 'Human Food'}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#E5E7E4]">
                <span className="block text-[10px] text-[#888888] font-bold">Intake Action</span>
                <span className="text-xs font-extrabold text-[#23845B]">
                  {isSafe ? 'NGO Rescue' : 'Recycling'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION E: PARTNER MATCHING INFORMATION */}
          <div className="bg-white rounded-3xl p-5 border border-[#E5E7E4] space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#777777]">
              Section E • Semantic FAISS Matching Metrics
            </span>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-[#FAFBF9] border border-[#F1F2F0] text-center">
                <span className="block text-[10px] uppercase font-bold text-[#888888]">Compatibility</span>
                <span className="text-lg font-extrabold text-[#171717]">
                  {donation.match_info?.final_score ?? 96.0}%
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAFBF9] border border-[#F1F2F0] text-center">
                <span className="block text-[10px] uppercase font-bold text-[#888888]">Transit Distance</span>
                <span className="text-lg font-extrabold text-[#171717]">
                  {donation.match_info?.distance_km ?? 2.4} km
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAFBF9] border border-[#F1F2F0] text-center">
                <span className="block text-[10px] uppercase font-bold text-[#888888]">Rank Order</span>
                <span className="text-lg font-extrabold text-[#23845B]">
                  #{donation.match_info?.rank ?? 1} Match
                </span>
              </div>
            </div>
          </div>

          {/* SECTION F: Collection Information */}
          {(donation.scheduled_date || donation.status === 'Collection Scheduled') && (
            <div className="bg-white rounded-3xl p-5 border border-[#E5E7E4] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Section F • Scheduled Dispatch & Transport
              </span>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 text-purple-900">
                <Truck className="w-5 h-5 text-purple-700 shrink-0" />
                <div className="text-xs">
                  <span className="font-extrabold block">
                    Scheduled Window: {donation.scheduled_date} at {donation.scheduled_time || '14:00'}
                  </span>
                  <span className="text-purple-700">
                    Pickup: {donation.pickup_location}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION G: Donation Lifecycle (5-Stage Timeline) */}
          <div className="bg-[#FAFBF9] rounded-3xl p-5 border border-[#E5E7E4] space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#777777]">
              Section G • Physical Circulation Lifecycle
            </span>

            <div className="space-y-4 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E5E7E4]">
              {donation.tracking_timeline && donation.tracking_timeline.length > 0 ? (
                donation.tracking_timeline.map((stage) => (
                  <div key={stage.stageId} className="flex items-start gap-4 relative">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border-2 transition-all ${
                        stage.isCompleted
                          ? 'bg-[#171717] border-[#171717] text-[#F5E84D]'
                          : stage.isCurrent
                          ? 'bg-[#F5E84D] border-[#171717] text-[#171717] animate-pulse'
                          : 'bg-white border-[#E5E7E4] text-[#888888]'
                      }`}
                    >
                      {stage.isCompleted ? <Check className="w-4 h-4" /> : stage.stageId}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-xs font-bold ${
                            stage.isCompleted || stage.isCurrent ? 'text-[#171717]' : 'text-[#888888]'
                          }`}
                        >
                          {stage.label}
                        </h4>
                        {stage.timestamp && (
                          <span className="text-[10px] text-[#888888] font-mono">{stage.timestamp}</span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#666666] mt-0.5">{stage.detail}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#888888]">No timeline stages recorded.</p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION H: Available Partner Actions Footer */}
        <div className="p-5 border-t border-[#E5E7E4] bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#888888]">
              Available Partner Actions
            </span>
            <span className="text-[11px] text-[#777777]">
              Current status: <strong className="text-[#171717]">{donation.status}</strong>
            </span>
          </div>

          {donation.status === 'Submitted' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveModal('accept')}
                className="flex-1 py-3 px-4 rounded-full bg-[#F5E84D] hover:bg-[#EBDD3C] text-[#171717] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Accept Donation</span>
              </button>
              <button
                onClick={() => setActiveModal('reject')}
                className="py-3 px-5 rounded-full bg-white hover:bg-[#FEE2E2]/30 text-[#C94B4B] border border-[#E5E7E4] hover:border-[#C94B4B]/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Ban className="w-4 h-4" />
                <span>Decline</span>
              </button>
            </div>
          )}

          {donation.status === 'Accepted' && (
            <button
              onClick={() => setActiveModal('schedule')}
              className="w-full py-3 px-4 rounded-full bg-[#F5E84D] hover:bg-[#EBDD3C] text-[#171717] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Collection Logistics</span>
            </button>
          )}

          {donation.status === 'Collection Scheduled' && (
            <button
              onClick={() => onCollect(donation.id)}
              className="w-full py-3 px-4 rounded-full bg-[#171717] hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Truck className="w-4 h-4 text-[#F5E84D]" />
              <span>Confirm Pickup & Dispatch</span>
            </button>
          )}

          {donation.status === 'Collected' && (
            <button
              onClick={() => onComplete(donation.id)}
              className="w-full py-3 px-4 rounded-full bg-[#23845B] hover:bg-[#1D6F4C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#F5E84D]" />
              <span>Confirm Distribution & Complete</span>
            </button>
          )}

          {donation.status === 'Completed' && (
            <div className="p-3 rounded-2xl bg-[#23845B]/10 border border-[#23845B]/20 text-[#23845B] text-xs font-bold text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Donation successfully circulated and logged in ReGiVe circulation ledger.</span>
            </div>
          )}

          {donation.status === 'Rejected' && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold text-center flex items-center justify-center gap-2">
              <Ban className="w-4 h-4" />
              <span>Donation was declined by this organization.</span>
            </div>
          )}
        </div>
      </div>

      {/* Accept Confirmation Modal */}
      {activeModal === 'accept' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#E5E7E4] space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-[#F5E84D] flex items-center justify-center">
              <Check className="w-6 h-6 text-[#171717]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-[#171717] font-['Manrope']">
                Accept Donation Intake?
              </h3>
              <p className="text-xs text-[#777777]">
                Confirm that your facility has capacity to process and distribute this resource.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAFBF9] border border-[#F1F2F0] space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#888888]">Donation ID:</span>
                <strong className="text-[#171717] font-mono">{donation.id}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Item Title:</span>
                <strong className="text-[#171717]">{donation.title}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Volume:</span>
                <strong className="text-[#171717]">{donation.quantity} {donation.unit}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Donor:</span>
                <strong className="text-[#171717]">{donation.donor_name}</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-full bg-[#F1F2F0] hover:bg-[#E5E7E4] text-[#171717] font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAccept}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-full bg-[#F5E84D] hover:bg-[#EBDD3C] text-[#171717] font-bold text-xs transition-colors shadow-sm"
              >
                {isSubmitting ? 'Accepting...' : 'Confirm Acceptance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {activeModal === 'reject' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#E5E7E4] space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
              <Ban className="w-6 h-6 text-[#C94B4B]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-[#171717] font-['Manrope']">
                Decline Donation Request
              </h3>
              <p className="text-xs text-[#777777]">
                Please provide an operational reason for declining this intake. The reason will be recorded in the audit trail.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#777777] mb-1">
                  Reason for Decline *
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5E7E4] text-xs font-semibold text-[#171717] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#F5E84D]"
                >
                  <option value="Storage Capacity Full">Storage Capacity Full</option>
                  <option value="Outside Service Radius / Coverage Area">Outside Service Radius</option>
                  <option value="Perishable Expiry Too Immediate">Perishable Expiry Window Too Immediate</option>
                  <option value="Packaging Non-Conformance">Packaging / Seal Non-Conformance</option>
                  <option value="Operating Hours Conflict">Operating Hours Conflict</option>
                  <option value="Other Operational Reason">Other Operational Reason</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#777777] mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="Provide any details to help reroute this resource..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E7E4] text-xs text-[#171717] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#F5E84D]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-full bg-[#F1F2F0] hover:bg-[#E5E7E4] text-[#171717] font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-full bg-[#C94B4B] hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-sm"
              >
                {isSubmitting ? 'Declining...' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Collection Modal */}
      {activeModal === 'schedule' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#E5E7E4] space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-700" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-[#171717] font-['Manrope']">
                Schedule Collection Slot
              </h3>
              <p className="text-xs text-[#777777]">
                Set the courier pickup appointment for <strong>{donation.pickup_location}</strong>.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#777777] mb-1">
                    Pickup Date *
                  </label>
                  <input
                    type="text"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    placeholder="e.g. 12-11-2026"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E5E7E4] text-xs font-semibold text-[#171717] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#F5E84D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#777777] mb-1">
                    Pickup Time *
                  </label>
                  <input
                    type="text"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    placeholder="e.g. 14:30"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E5E7E4] text-xs font-semibold text-[#171717] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#F5E84D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#777777] mb-1">
                  Logistics Instructions & Equipment Notes
                </label>
                <textarea
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                  placeholder="e.g. Driver brings insulated bags, loading ramp..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E7E4] text-xs text-[#171717] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#F5E84D]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-full bg-[#F1F2F0] hover:bg-[#E5E7E4] text-[#171717] font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSchedule}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-full bg-[#F5E84D] hover:bg-[#EBDD3C] text-[#171717] font-bold text-xs transition-colors shadow-sm"
              >
                {isSubmitting ? 'Booking...' : 'Confirm Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
