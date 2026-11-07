import React, { useState } from 'react';
import {
  Donation,
  Partner,
  AIAnalysis,
  ScreenType
} from '../types/donation';
import {
  DonationDetailsForm,
  DonationFormData
} from '../components/donation/DonationDetailsForm';
import { AIProcessingState } from '../components/donation/AIProcessingState';
import { AIAnalysisResults } from '../components/donation/AIAnalysisResults';
import { PartnerRecommendations } from '../components/donation/PartnerRecommendations';
import { PartnerDetailDrawer } from '../components/donation/PartnerDetailDrawer';
import { DonationConfirmationModal } from '../components/donation/DonationConfirmationModal';
import { PresetSample } from '../data/presetSamples';
import {
  analyzeDonationWithAI,
  getRecommendedPartners
} from '../services/aiAnalysisService';
import { createDonationRecord } from '../services/donationService';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

interface CreateDonationProps {
  onNavigate: (screen: ScreenType) => void;
  onDonationCreated: (newDonation: Donation) => void;
}

export const CreateDonation: React.FC<CreateDonationProps> = ({
  onNavigate,
  onDonationCreated
}) => {
  // Form State initialized with realistic default
  const [formData, setFormData] = useState<DonationFormData>({
    category: 'Food',
    title: '',
    quantity: 12,
    unit: 'boxes',
    condition: 'Good',
    pickupLocation: '34 Baker Street, Central Quarter, Apt 4B',
    description: '',
    expiryDate: '2026-11-10',
    storageCondition: 'sealed',
    hoursSinceCooked: 2
  });

  // Image State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // AI Pipeline State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysis | null>(null);
  const [recommendedPartners, setRecommendedPartners] = useState<Partner[]>([]);

  // Partner Selection & Drawers
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [drawerPartner, setDrawerPartner] = useState<Partner | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Confirmation Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Handle Preset Selection
  const handleSelectPreset = (preset: PresetSample) => {
    setImagePreview(preset.imageUrl);
    setImageFile(null);
    setFormData((prev) => ({
      ...prev,
      category: preset.category,
      title: preset.title,
      quantity: preset.quantity,
      unit: preset.unit,
      condition: preset.condition,
      description: preset.description,
      expiryDate: preset.expiryDate || '2026-11-10',
      storageCondition: preset.storageCondition || 'sealed',
      hoursSinceCooked: preset.hoursSinceCooked || 2
    }));
    setErrors({});
    setAnalysisResult(null);
    setSelectedPartner(null);
  };

  // Validation
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!imagePreview) {
      errs.image = 'Please upload a photo of the item you wish to donate.';
    }

    if (!formData.title.trim()) {
      errs.title = 'Please enter an item title or descriptive summary.';
    }

    if (!formData.quantity || formData.quantity <= 0) {
      errs.quantity = 'Quantity must be greater than zero.';
    }

    if (!formData.pickupLocation.trim()) {
      errs.pickupLocation = 'Please provide a valid collection address.';
    }

    if (formData.category === 'Food') {
      if (!formData.expiryDate) {
        errs.expiryDate = 'Please select a best before or expiration date for perishable food items.';
      } else if (new Date(formData.expiryDate) < new Date(new Date().setHours(0, 0, 0, 0))) {
        errs.expiryDate = 'Expiry date cannot be in the past.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Trigger AI Analysis
  const handleStartAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setAiError(null);
    setIsAnalyzing(true);
  };

  // When stage progress finishes
  const handleAIComplete = async () => {
    try {
      setAiError(null);
      const result = await analyzeDonationWithAI(
        {
          category: formData.category,
          title: formData.title,
          description: formData.description,
          condition: formData.condition,
          storageCondition: formData.storageCondition,
          hoursSinceCooked: formData.hoursSinceCooked,
          expiryDate: formData.expiryDate
        },
        imageFile || imagePreview || undefined
      );

      setAnalysisResult(result);

      if (result.category !== formData.category) {
        setFormData((prev) => ({ ...prev, category: result.category }));
      }

      // Fetch matching partners
      const partners = getRecommendedPartners(result.category, formData.pickupLocation);
      setRecommendedPartners(partners);
      if (partners.length > 0) {
        setSelectedPartner(partners[0]); // preselect top match
      }
    } catch (err: any) {
      console.error('AI pipeline error', err);
      setAiError(err.message || 'AI inference error. Please verify the FastAPI backend on port 8000 is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Create Donation Record on Confirmation
  const handleConfirmSubmission = async (): Promise<string> => {
    const newRecord = await createDonationRecord({
      donorId: 'usr-elena-01',
      imageUrl:
        imagePreview ||
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      category: formData.category,
      title: formData.title,
      description: formData.description || analysisResult?.caption || '',
      quantity: formData.quantity,
      unit: formData.unit,
      condition: formData.condition,
      expiryDate: formData.expiryDate,
      storageCondition: formData.storageCondition,
      hoursSinceCooked: formData.hoursSinceCooked,
      pickupLocation: formData.pickupLocation,
      status: 'Submitted',
      selectedPartnerId: selectedPartner?.id,
      partnerName: selectedPartner?.name,
      partnerType: selectedPartner?.organizationType,
      aiAnalysis: analysisResult || undefined
    });

    onDonationCreated(newRecord);
    return newRecord.id;
  };

  return (
    <div className="px-5 sm:px-8 md:px-12 lg:px-16 py-8 md:py-12 max-w-6xl mx-auto w-full">
      {/* Top Header & Breadcrumb */}
      <div className="mb-8">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#777777] hover:text-[#171717] mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        {/* Center Editorial Title Block directly inspired by the user reference */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAFBF9] border border-[#E5E7E4] text-xs font-bold text-[#777777] mb-3">
            <span className="w-2 h-2 rounded-full bg-[#F5E84D]"></span>
            <span>Screen 02 &bull; Donation Intake</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#171717] font-['Manrope'] tracking-tight">
            Support the fund
          </h1>

          <p className="text-sm sm:text-base text-[#777777] mt-3 leading-relaxed">
            If you have surplus prepared meals, bakery items, fresh produce, or packaged groceries to share, complete the food intake below. Our AI loop verifies food safety and connects you to nearby community kitchens and food banks.
          </p>
        </div>
      </div>

      {/* Main Two-Column Core Card (Translating the reference layout) */}
      <DonationDetailsForm
        formData={formData}
        onChange={(fields) => {
          setFormData((prev) => ({ ...prev, ...fields }));
          setErrors((prev) => {
            const copy = { ...prev };
            Object.keys(fields).forEach((k) => delete copy[k]);
            return copy;
          });
        }}
        onSubmit={handleStartAnalysis}
        errors={errors}
        isAnalyzing={isAnalyzing}
        imagePreview={imagePreview}
        onImageChange={(url, file) => {
          setImagePreview(url);
          setImageFile(file || null);
          if (url) {
            setErrors((prev) => {
              const copy = { ...prev };
              delete copy.image;
              return copy;
            });
          }
        }}
        onSelectPreset={handleSelectPreset}
      />

      {/* Mission & Objectives Companion Block (Directly inspired by reference right-hand card) */}
      <div className="mt-8 bg-[#FAFBF9] rounded-[28px] p-6 sm:p-7 border border-[#E5E7E4]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
              Platform Principles
            </span>
            <h3 className="text-xl font-bold text-[#171717] font-['Manrope'] mt-1">
              Mission & objectives
            </h3>
            <p className="text-xs text-[#777777] mt-1.5 leading-relaxed">
              ReGiVe connects food donors with verified local receiving kitchens and pantries to eliminate food waste and fight community hunger.
            </p>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Objective 1 */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E7E4] flex items-start gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-[#F5E84D] text-[#171717] font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                1
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#171717]">Direct Community Meal Intake</h4>
                <p className="text-[11px] text-[#777777] mt-0.5 leading-normal">
                  Surplus prepared meals and fresh bakery items are dispatched to nearby soup kitchens within the critical 4-hour window.
                </p>
              </div>
            </div>

            {/* Objective 2 */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E7E4] flex items-start gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-[#F5E84D] text-[#171717] font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                2
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#171717]">Zero Food Waste Loop</h4>
                <p className="text-[11px] text-[#777777] mt-0.5 leading-normal">
                  Fresh produce, orchard fruit, and sealed pantry groceries are routed to verified food banks and family meal pantries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Processing Simulation State */}
      {isAnalyzing && (
        <div className="mt-8">
          <AIProcessingState onComplete={handleAIComplete} />
        </div>
      )}

      {/* AI Model Inference Error Alert */}
      {aiError && !isAnalyzing && (
        <div className="mt-8 p-4 rounded-2xl bg-[#C94B4B]/10 border border-[#C94B4B]/30 text-[#C94B4B] text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold">Model Connection Error:</span>
            <span>{aiError}</span>
          </div>
          <button
            type="button"
            onClick={() => setAiError(null)}
            className="text-xs font-bold underline ml-4 hover:opacity-80 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Inline AI Results (revealed beneath the form, NO separate screen) */}
      {analysisResult && !isAnalyzing && (
        <div className="mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <AIAnalysisResults
            analysis={analysisResult}
            onUpdateAnalysis={(updated) => {
              setAnalysisResult((prev) => (prev ? { ...prev, ...updated } : prev));
              if (updated.category) {
                setFormData((prev) => ({ ...prev, category: updated.category! }));
              }
            }}
            onReanalyse={() => setIsAnalyzing(true)}
          />

          {/* Partner Recommendations */}
          {recommendedPartners.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7E4] shadow-xs space-y-6">
              <PartnerRecommendations
                partners={recommendedPartners}
                selectedPartnerId={selectedPartner?.id || null}
                onSelectPartner={(partner) => setSelectedPartner(partner)}
                onViewDetails={(partner) => {
                  setDrawerPartner(partner);
                  setIsDrawerOpen(true);
                }}
              />

              {/* Ready to Confirm Banner */}
              {selectedPartner && (
                <div className="mt-8 pt-6 border-t border-[#E5E7E4] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAFBF9] p-5 rounded-2xl">
                  <div>
                    <span className="text-xs font-bold text-[#171717]">
                      Selected Recipient: {selectedPartner.name}
                    </span>
                    <p className="text-xs text-[#777777]">
                      {selectedPartner.location} &bull; Capacity Available: {selectedPartner.availableCapacity}%
                    </p>
                  </div>

                  <button
                    onClick={() => setIsConfirmModalOpen(true)}
                    className="py-3 px-8 rounded-full bg-[#171717] hover:bg-neutral-800 text-[#F5E84D] font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
                  >
                    Proceed to Confirm Donation
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Partner Detail Slide-over Drawer */}
      <PartnerDetailDrawer
        partner={drawerPartner}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelectPartner={(partner) => {
          setSelectedPartner(partner);
        }}
        isSelected={selectedPartner?.id === drawerPartner?.id}
      />

      {/* Final Donation Confirmation Dialog */}
      <DonationConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSubmission}
        formData={formData}
        partner={selectedPartner}
        imagePreview={imagePreview}
        onViewMyDonations={() => onNavigate('donations')}
      />
    </div>
  );
};
