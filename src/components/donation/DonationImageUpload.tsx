import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { PRESET_SAMPLES, PresetSample } from '../../data/presetSamples';

interface DonationImageUploadProps {
  imagePreview: string | null;
  onImageChange: (imageUrl: string | null, file?: File | null) => void;
  onSelectPreset?: (preset: PresetSample) => void;
  error?: string;
}

export const DonationImageUpload: React.FC<DonationImageUploadProps> = ({
  imagePreview,
  onImageChange,
  onSelectPreset,
  error
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validateAndProcessFile = (file: File) => {
    setLocalError(null);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setLocalError('Supported formats: JPG, JPEG, PNG, or WEBP only.');
      return;
    }
    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      setLocalError('Image size exceeds 10 MB limit. Please choose a smaller photo.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    onImageChange(objectUrl, file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#171717]">
          Donation Photo <span className="text-[#C94B4B]">*</span>
        </label>
        <span className="text-[11px] text-[#777777]">JPG, PNG, WEBP (Max 10MB)</span>
      </div>

      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Upload Dropzone or Live Preview */}
      {!imagePreview ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[260px] ${
            isDragging
              ? 'border-[#171717] bg-[#F5E84D]/10'
              : 'border-[#E5E7E4] hover:border-[#171717] bg-[#FAFBF9]'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-white border border-[#E5E7E4] flex items-center justify-center shadow-xs mb-3 text-[#171717]">
            <UploadCloud className="w-6 h-6 text-[#171717]" />
          </div>
          <h4 className="font-bold text-sm text-[#171717] font-['Manrope']">
            Drag & drop donation image here
          </h4>
          <p className="text-xs text-[#777777] mt-1 max-w-xs leading-relaxed">
            Upload a clear photo of the items you want to donate for automated AI classification.
          </p>

          <button
            type="button"
            className="mt-4 px-4 py-2 rounded-full bg-white hover:bg-[#F1F2F0] border border-[#E5E7E4] text-xs font-bold text-[#171717] transition-colors"
          >
            Browse files
          </button>
        </div>
      ) : (
        <div className="relative rounded-3xl overflow-hidden border border-[#E5E7E4] bg-neutral-900 group">
          <img
            src={imagePreview}
            alt="Donation preview"
            className="w-full h-64 sm:h-72 object-cover"
          />

          {/* Action Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-between p-4">
            <div className="text-white">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-white/90">
                <ImageIcon className="w-3.5 h-3.5" />
                Image ready for AI analysis
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full bg-white/90 hover:bg-white text-[#171717] text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                title="Replace photo"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">Replace</span>
              </button>

              <button
                type="button"
                onClick={handleRemove}
                className="p-2 rounded-full bg-[#C94B4B] hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all"
                title="Remove photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Errors */}
      {(localError || error) && (
        <div className="flex items-center gap-2 text-xs font-medium text-[#C94B4B] bg-[#C94B4B]/10 p-3 rounded-xl border border-[#C94B4B]/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{localError || error}</span>
        </div>
      )}

      {/* Quick Test Presets (Evaluation Convenience) */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-[#777777] uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#B77B24]" />
            Quick Demo Presets
          </span>
          <span className="text-[10px] text-[#888888]">1-click test fill</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_SAMPLES.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset && onSelectPreset(preset)}
              className="text-left p-2 rounded-xl bg-[#FAFBF9] hover:bg-[#F1F2F0] border border-[#E5E7E4] hover:border-[#171717] transition-all duration-150 group"
            >
              <div className="w-full h-12 rounded-lg overflow-hidden bg-neutral-200 mb-1.5">
                <img
                  src={preset.imageUrl}
                  alt={preset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="text-[11px] font-bold text-[#171717] truncate">
                {preset.name}
              </div>
              <div className="text-[9px] text-[#777777] uppercase tracking-tight">
                {preset.badge}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
