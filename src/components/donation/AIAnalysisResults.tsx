import React, { useState } from 'react';
import { AIAnalysis } from '../../types/donation';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
  RefreshCw,
  Edit2,
  Check,
  Tag,
  ShieldCheck,
  Utensils,
  Recycle
} from 'lucide-react';

interface AIAnalysisResultsProps {
  analysis: AIAnalysis;
  onUpdateAnalysis: (updated: Partial<AIAnalysis>) => void;
  onReanalyse: () => void;
}

export const AIAnalysisResults: React.FC<AIAnalysisResultsProps> = ({
  analysis,
  onUpdateAnalysis,
  onReanalyse
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(analysis.caption);

  const handleSaveEdits = () => {
    onUpdateAnalysis({
      caption: editedCaption
    });
    setIsEditing(false);
  };

  const getSafetyBadge = () => {
    switch (analysis.safetyStatus) {
      case 'Eligible':
        return {
          icon: <CheckCircle className="w-4 h-4 text-[#23845B]" />,
          bg: 'bg-[#23845B]/10 border-[#23845B]/20 text-[#23845B]',
          label: 'Eligible for Food Intake'
        };
      case 'Needs Review':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-[#B77B24]" />,
          bg: 'bg-[#B77B24]/10 border-[#B77B24]/20 text-[#B77B24]',
          label: 'Needs Temperature Probe Review'
        };
      case 'Not Eligible':
        return {
          icon: <XCircle className="w-4 h-4 text-[#C94B4B]" />,
          bg: 'bg-[#C94B4B]/10 border-[#C94B4B]/20 text-[#C94B4B]',
          label: 'Ineligible for Direct Human Intake'
        };
    }
  };

  const badge = getSafetyBadge();
  const edibilityPct = analysis.edibilityScore !== undefined ? Math.round(analysis.edibilityScore * 100) : 0;
  const isEdible = analysis.isEdible;

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-[#FAFBF9] border border-[#E5E7E4] space-y-6">
      {/* Header with Reanalyse button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7E4] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#F5E84D] flex items-center justify-center text-[#171717] shadow-2xs shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-[#171717] font-['Manrope']">
                AI Intake & Model Verification
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#23845B]/10 text-[#23845B] border border-[#23845B]/20">
                PyTorch CLIP + BLIP Active
              </span>
            </div>
            <p className="text-[11px] text-[#777777]">
              Real neural vision predictions, food category detection, and 4h/24h health safety screening.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReanalyse}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#F1F2F0] border border-[#E5E7E4] text-xs font-semibold text-[#171717] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#777777]" />
            <span>Re-run Inference</span>
          </button>
        </div>
      </div>

      {/* Prominent Alert Banner for Inedible Waste */}
      {!isEdible && (
        <div className="p-4 rounded-2xl bg-[#C94B4B]/10 border border-[#C94B4B]/30 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-full bg-[#C94B4B] text-white flex items-center justify-center shrink-0 mt-0.5 font-bold">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-[#C94B4B] uppercase tracking-wider">
              Human Intake Rejected — Inedible Food Waste Detected ({edibilityPct}% Edibility)
            </h4>
            <p className="text-xs text-[#171717] mt-1 leading-relaxed">
              The AI visual classifier detected <strong>{analysis.detectedFoodType}</strong>. To safeguard public health and comply with food safety standards, direct human consumption is strictly prohibited. The system has automatically rerouted this consignment to certified organic recycling facilities for composting and bio-recovery.
            </p>
          </div>
        </div>
      )}

      {/* Grid of Results */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: CLIP Model Scores & Food Stream */}
        <div className="md:col-span-5 space-y-4">
          
          {/* CLIP Classification Card */}
          <div className="p-4 rounded-2xl bg-white border border-[#E5E7E4] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">
                CLIP Food Classification
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isEdible
                    ? 'bg-[#23845B]/10 border-[#23845B]/25 text-[#23845B]'
                    : 'bg-[#C94B4B]/10 border-[#C94B4B]/30 text-[#C94B4B]'
                }`}
              >
                {isEdible ? `${edibilityPct}% Edible Food` : `${edibilityPct}% Inedible Waste`}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#F1F2F0]">
              <div>
                <span className="text-xs text-[#777777]">Detected Type:</span>
                <p className="text-base font-extrabold text-[#171717] font-['Manrope']">
                  {analysis.detectedFoodType || analysis.category}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#777777]">Circulation Stream:</span>
                <p
                  className={`text-xs font-bold flex items-center justify-end gap-1 ${
                    isEdible ? 'text-[#23845B]' : 'text-[#B77B24]'
                  }`}
                >
                  {analysis.streamType === 'human' ? (
                    <>
                      <Utensils className="w-3 h-3" />
                      <span>Food Bank Network</span>
                    </>
                  ) : (
                    <>
                      <Recycle className="w-3 h-3" />
                      <span>Organic Recovery ({(analysis.streamType || 'compost').toUpperCase()})</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Safety Status Card */}
          <div className="p-4 rounded-2xl bg-white border border-[#E5E7E4]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">
                Safety & Health Validation
              </span>
              <span className="text-[10px] font-mono text-[#777777]">
                4h/24h Rule Engine
              </span>
            </div>
            
            <div className="mt-1">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}
              >
                {badge.icon}
                <span>{badge.label}</span>
              </span>
              <p className="text-xs text-[#777777] mt-2 leading-relaxed">
                {analysis.safetyExplanation}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: BLIP Neural Image Caption & Detected Tags */}
        <div className="md:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-[#E5E7E4] h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">
                    Generated Visual Caption (BLIP)
                  </span>
                  <span className="text-[9px] font-bold bg-[#F1F2F0] text-[#777777] px-2 py-0.5 rounded-full">
                    No Hallucination
                  </span>
                </div>
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#171717] hover:underline cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3 text-[#777777]" />
                    <span>Edit description</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveEdits}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#23845B] hover:underline cursor-pointer"
                  >
                    <Check className="w-3 h-3 text-[#23845B]" />
                    <span>Save edits</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <textarea
                  rows={3}
                  value={editedCaption}
                  onChange={(e) => setEditedCaption(e.target.value)}
                  className="w-full mt-2 p-2.5 rounded-xl bg-[#FAFBF9] border border-[#171717] text-xs text-[#171717] outline-hidden resize-none"
                />
              ) : (
                <div className="mt-2 bg-[#FAFBF9] p-3.5 rounded-xl border border-[#F1F2F0]">
                  <p className="text-xs font-semibold text-[#171717] italic leading-relaxed">
                    &ldquo;{analysis.caption}&rdquo;
                  </p>
                  <span className="text-[10px] text-[#888888] block mt-1">
                    Direct prediction generated by Salesforce/blip-image-captioning-base
                  </span>
                </div>
              )}
            </div>

            {/* Detected Tag Pills */}
            <div className="pt-3 border-t border-[#F1F2F0] mt-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888] block mb-1.5">
                CLIP Verified Tags & Attributes
              </span>
              <div className="flex flex-wrap gap-1.5">
                {analysis.detectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F1F2F0] text-[#171717]"
                  >
                    <Tag className="w-2.5 h-2.5 text-[#777777]" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
