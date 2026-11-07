import React, { useRef, useState } from 'react';
import {
  DonationCategory,
  DonationCondition
} from '../../types/donation';
import { PRESET_SAMPLES, PresetSample } from '../../data/presetSamples';
import {
  Sparkles,
  Layers,
  ShieldCheck,
  MapPin,
  Compass,
  ChevronDown,
  UploadCloud,
  Image as ImageIcon,
  RefreshCw,
  Trash2,
  AlertCircle,
  Calendar,
  Utensils
} from 'lucide-react';

export interface DonationFormData {
  category: DonationCategory;
  foodType?: string;
  title: string;
  quantity: number;
  unit: string;
  condition: DonationCondition;
  pickupLocation: string;
  description: string;
  expiryDate?: string;
  storageCondition?: 'room' | 'fridge' | 'sealed';
  hoursSinceCooked?: number;
}

export interface FormErrors {
  category?: string;
  title?: string;
  quantity?: string;
  unit?: string;
  pickupLocation?: string;
  expiryDate?: string;
  image?: string;
}

interface DonationDetailsFormProps {
  formData: DonationFormData;
  onChange: (fields: Partial<DonationFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  errors: FormErrors;
  isAnalyzing: boolean;
  imagePreview: string | null;
  onImageChange: (imageUrl: string | null, file?: File | null) => void;
  onSelectPreset: (preset: PresetSample) => void;
}

interface FoodStreamOption {
  id: string;
  label: string;
  foodType: string;
  defaultUnit: string;
  defaultTitle: string;
}

const FOOD_STREAMS: FoodStreamOption[] = [
  {
    id: 'prepared',
    label: '🍲 Prepared Meals',
    foodType: 'Prepared Meals',
    defaultUnit: 'meals',
    defaultTitle: 'Catered Vegetable Pasta & Rice Trays'
  },
  {
    id: 'bakery',
    label: '🥖 Bakery & Bread',
    foodType: 'Bakery & Bread',
    defaultUnit: 'boxes',
    defaultTitle: 'Fresh Artisanal Sourdough & Bagels'
  },
  {
    id: 'produce',
    label: '🥦 Fresh Produce',
    foodType: 'Fresh Produce',
    defaultUnit: 'crates',
    defaultTitle: 'Farm-Fresh Apples & Leafy Greens'
  },
  {
    id: 'pantry',
    label: '🥫 Packaged Pantry',
    foodType: 'Packaged Pantry',
    defaultUnit: 'packs',
    defaultTitle: 'Unopened Rice, Grains & Canned Goods'
  }
];

const FOOD_UNITS = ['boxes', 'meals', 'kg', 'portions', 'packs', 'crates', 'trays'];

const CONDITIONS: DonationCondition[] = ['New', 'Good', 'Usable', 'Needs Sorting'];

export const DonationDetailsForm: React.FC<DonationDetailsFormProps> = ({
  formData,
  onChange,
  onSubmit,
  errors,
  isAnalyzing,
  imagePreview,
  onImageChange,
  onSelectPreset
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localUploadError, setLocalUploadError] = useState<string | null>(null);
  const [activeStreamId, setActiveStreamId] = useState<string>('bakery');

  // Handle stream pill change (All food streams)
  const handleStreamSelect = (stream: FoodStreamOption) => {
    setActiveStreamId(stream.id);
    onChange({
      category: 'Food',
      foodType: stream.foodType,
      unit: stream.defaultUnit,
      title: formData.title ? formData.title : stream.defaultTitle,
      storageCondition: stream.id === 'produce' ? 'fridge' : stream.id === 'prepared' ? 'room' : 'sealed',
      hoursSinceCooked: stream.id === 'prepared' ? 2 : 0,
      expiryDate: formData.expiryDate || '2026-11-10'
    });
  };

  // Image Upload Handlers
  const validateAndProcessFile = (file: File) => {
    setLocalUploadError(null);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setLocalUploadError('Supported formats: JPG, PNG, or WEBP only.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setLocalUploadError('Image size exceeds 10 MB limit.');
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

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full" noValidate>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Main Two-Column Card Grid directly translating the reference layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: Food Intake & Hero Quantity (~58% width)    */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Pill Segmented Tab Bar (Exclusively Food Rescue Streams) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#777777] mb-2.5">
              Select Food Donation Stream
            </label>
            <div className="bg-[#F1F2F0] p-1.5 rounded-full flex items-center justify-between gap-1 border border-[#E5E7E4]/60 w-full">
              {FOOD_STREAMS.map((stream) => {
                const isActive =
                  activeStreamId === stream.id ||
                  (formData.foodType && formData.foodType === stream.foodType);
                return (
                  <button
                    key={stream.id}
                    type="button"
                    onClick={() => handleStreamSelect(stream)}
                    className={`flex-1 px-2.5 sm:px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-150 text-center whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-[#F5E84D] text-[#171717] shadow-xs'
                        : 'text-[#777777] hover:text-[#171717] hover:bg-white/60'
                    }`}
                  >
                    {stream.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Hero Quantity Display & Preset Chips (Translates: ₴ 1 000 UAH + chips) */}
          <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#E5E7E4] shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Food Quantity & Volume
              </span>
              <span className="text-[11px] font-bold text-[#23845B] bg-[#23845B]/10 px-2.5 py-0.5 rounded-full border border-[#23845B]/20 flex items-center gap-1">
                <Utensils className="w-3 h-3" />
                Food Intake Only
              </span>
            </div>

            {/* Massive Typography Amount Display */}
            <div className="flex items-baseline justify-between gap-4 py-2 border-b border-[#F1F2F0]">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#171717] font-['Manrope'] select-none">
                  🍱
                </span>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity || ''}
                  onChange={(e) =>
                    onChange({ quantity: Math.max(1, parseInt(e.target.value, 10) || 1) })
                  }
                  className="w-28 sm:w-36 text-4xl sm:text-5xl lg:text-6xl font-black text-[#171717] font-['Manrope'] bg-transparent border-none outline-hidden tracking-tight focus:ring-0 p-0"
                />
              </div>

              {/* Food Unit Dropdown Pill */}
              <div className="relative">
                <select
                  value={formData.unit}
                  onChange={(e) => onChange({ unit: e.target.value })}
                  className="appearance-none bg-[#F1F2F0] hover:bg-[#E5E7E4] text-[#171717] font-bold text-sm sm:text-base px-5 py-3 pr-9 rounded-full cursor-pointer outline-hidden transition-colors border border-[#E5E7E4]"
                >
                  {FOOD_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#171717] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Quick Increment Chips (Translates: +100 UAH, +500 UAH, +1000 UAH, +2000 UAH) */}
            <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs">
              <button
                type="button"
                onClick={() => onChange({ quantity: 1 })}
                className="px-3.5 py-1.5 rounded-full font-bold bg-[#F1F2F0] text-[#777777] hover:text-[#171717] hover:bg-[#E5E7E4] transition-colors shrink-0"
              >
                Reset
              </button>
              {[5, 10, 25, 50].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => onChange({ quantity: (formData.quantity || 0) + inc })}
                  className="px-3.5 py-1.5 rounded-full font-bold bg-[#F1F2F0] text-[#171717] hover:bg-[#E5E7E4] transition-colors shrink-0"
                >
                  +{inc} {formData.unit}
                </button>
              ))}
            </div>

            {errors.quantity && (
              <p className="text-xs text-[#C94B4B] flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.quantity}
              </p>
            )}
          </div>

          {/* 3. Item Title & Notes */}
          <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#E5E7E4] shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-2">
                Food Item Title / Summary <span className="text-[#C94B4B]">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="e.g. Fresh Artisanal Sourdough & Bagels"
                className="w-full px-4 py-3.5 rounded-2xl bg-[#FAFBF9] border border-[#E5E7E4] focus:border-[#171717] focus:bg-white text-sm font-semibold text-[#171717] placeholder:text-[#999999] outline-hidden transition-all"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-[#C94B4B] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-2">
                Food Packaging & Handling Notes (Optional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="e.g. Packaged in sealed food-grade bags, stored at 4°C"
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFBF9] border border-[#E5E7E4] focus:border-[#171717] focus:bg-white text-xs sm:text-sm text-[#171717] placeholder:text-[#999999] outline-hidden transition-all"
              />
            </div>
          </div>

          {/* 4. Integrated Photo Upload & 1-Click Food Presets */}
          <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#E5E7E4] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#171717]">
                  Food Photo for AI Intake <span className="text-[#C94B4B]">*</span>
                </label>
                <p className="text-[11px] text-[#777777]">
                  Processed by CLIP food classifier & BLIP captioning
                </p>
              </div>
              <span className="text-[11px] text-[#888888] font-mono">JPG, PNG, WEBP</span>
            </div>

            {/* Dropzone or Preview */}
            {!imagePreview ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[180px] ${
                  isDragging
                    ? 'border-[#171717] bg-[#F5E84D]/10'
                    : 'border-[#E5E7E4] hover:border-[#171717] bg-[#FAFBF9]'
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-white border border-[#E5E7E4] flex items-center justify-center shadow-xs mb-2.5 text-[#171717]">
                  <UploadCloud className="w-5 h-5 text-[#171717]" />
                </div>
                <h4 className="font-bold text-sm text-[#171717] font-['Manrope']">
                  Click or drag food photo here
                </h4>
                <p className="text-xs text-[#777777] mt-0.5">
                  Clear photo enables automated food categorization & safety validation
                </p>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-[#E5E7E4] bg-neutral-900 group">
                <img
                  src={imagePreview}
                  alt="Food donation preview"
                  className="w-full h-48 sm:h-56 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-between p-3.5">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-white/95">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Food photo verified for AI
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-[#171717] text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Replace</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-1.5 rounded-full bg-[#C94B4B] hover:bg-red-700 text-white shadow-xs transition-all"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {(localUploadError || errors.image) && (
              <p className="text-xs text-[#C94B4B] flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {localUploadError || errors.image}
              </p>
            )}

            {/* 1-Click Demo Food Presets */}
            <div className="pt-3 border-t border-[#F1F2F0]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#777777] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#B77B24]" />
                  1-Click Food Presets
                </span>
                <span className="text-[10px] text-[#888888]">Instant evaluation fill</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_SAMPLES.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      onSelectPreset(preset);
                      if (preset.id === 'sample-bakery') setActiveStreamId('bakery');
                      if (preset.id === 'sample-cooked') setActiveStreamId('prepared');
                      if (preset.id === 'sample-produce') setActiveStreamId('produce');
                      if (preset.id === 'sample-pantry') setActiveStreamId('pantry');
                    }}
                    className="text-left p-2 rounded-xl bg-[#FAFBF9] hover:bg-[#F1F2F0] border border-[#E5E7E4] hover:border-[#171717] transition-all group cursor-pointer"
                  >
                    <div className="w-full h-10 rounded-lg overflow-hidden bg-neutral-200 mb-1.5">
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
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: The "Details" Panel (~42% width)            */}
        {/* Directly mirrors the grey card in the user reference      */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 bg-[#F1F2F0] rounded-[32px] p-6 sm:p-8 border border-[#E5E7E4]/70 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            {/* Header: Details */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#E5E7E4]">
              <h3 className="font-['Manrope'] font-bold text-xl text-[#171717]">
                Details
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white border border-[#E5E7E4] text-[#171717]">
                Food Safety Protocol
              </span>
            </div>

            {/* List with Signature Circular Yellow Icon Badges */}
            <div className="space-y-5">
              
              {/* Row 1: AI Food Verification Pipeline */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#F5E84D] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <Sparkles className="w-4 h-4 text-[#171717]" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
                    AI Verification Pipeline
                  </p>
                  <p className="text-sm font-bold text-[#171717]">
                    CLIP ViT-B/32 + BLIP-Base
                  </p>
                  <p className="text-[11px] text-[#23845B] font-semibold flex items-center gap-1 mt-0.5">
                    ● Food Safety & Hygiene Validation Ready
                  </p>
                </div>
              </div>

              {/* Row 2: Condition / Freshness Assessment */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#F5E84D] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <Layers className="w-4 h-4 text-[#171717]" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-1.5">
                    Freshness & Condition Rating
                  </p>
                  <div className="grid grid-cols-4 gap-1">
                    {CONDITIONS.map((cond) => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => onChange({ condition: cond })}
                        className={`py-1.5 px-1 rounded-lg text-[11px] font-bold text-center transition-all cursor-pointer ${
                          formData.condition === cond
                            ? 'bg-[#171717] text-white shadow-2xs'
                            : 'bg-white text-[#171717] border border-[#E5E7E4] hover:bg-[#FAFBF9]'
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 3: Perishable Food Safety Protocol */}
              <div className="flex items-start gap-3.5 bg-white/70 p-3.5 rounded-2xl border border-[#E5E7E4]">
                <div className="w-9 h-9 rounded-full bg-[#F5E84D] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-[#171717]" />
                </div>
                <div className="flex-1 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#171717]">
                      Perishable Safety Protocol
                    </p>
                    <span className="text-[9px] font-bold text-[#B77B24] bg-[#B77B24]/10 px-2 py-0.5 rounded-full">
                      4h / 24h Rule
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#777777] font-semibold mb-1">
                      Best Before / Expiry Date <span className="text-[#C94B4B]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.expiryDate || '2026-11-10'}
                        onChange={(e) => onChange({ expiryDate: e.target.value })}
                        className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#E5E7E4] focus:border-[#171717] outline-hidden"
                      />
                      <Calendar className="w-3.5 h-3.5 text-[#777777] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {errors.expiryDate && (
                      <p className="mt-1 text-[11px] text-[#C94B4B]">
                        {errors.expiryDate}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-[#777777] font-semibold mb-1">
                        Storage State
                      </label>
                      <select
                        value={formData.storageCondition || 'sealed'}
                        onChange={(e) => onChange({ storageCondition: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#E5E7E4] focus:border-[#171717] outline-hidden"
                      >
                        <option value="sealed">Clean / Sealed Pack</option>
                        <option value="room">Ambient / Room Temp</option>
                        <option value="fridge">Refrigerated (2–4°C)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#777777] font-semibold mb-1">
                        Hours Since Prepared
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="72"
                        value={formData.hoursSinceCooked ?? 2}
                        onChange={(e) => onChange({ hoursSinceCooked: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#E5E7E4] focus:border-[#171717] outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4: Pickup Address */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#F5E84D] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <MapPin className="w-4 h-4 text-[#171717]" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-1">
                    Food Collection Address <span className="text-[#C94B4B]">*</span>
                  </p>
                  <input
                    type="text"
                    value={formData.pickupLocation}
                    onChange={(e) => onChange({ pickupLocation: e.target.value })}
                    placeholder="Enter pickup address"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E7E4] text-xs font-semibold text-[#171717] outline-hidden focus:border-[#171717]"
                  />
                  {errors.pickupLocation && (
                    <p className="mt-1 text-[11px] text-[#C94B4B]">
                      {errors.pickupLocation}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 5: Circulation Target */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#F5E84D] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <Compass className="w-4 h-4 text-[#171717]" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
                    Target Food Distribution Loop
                  </p>
                  <p className="text-sm font-bold text-[#171717]">
                    Verified Local Food Banks, Soup Kitchens & Community Pantries
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Full-Width Signature Yellow Action Button */}
          <div className="pt-4 border-t border-[#E5E7E4]">
            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full py-4 px-6 rounded-full font-bold text-sm sm:text-base text-[#171717] bg-[#F5E84D] hover:bg-[#EBDD3C] transition-all shadow-xs active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>
                {isAnalyzing
                  ? 'Running Zero-Shot AI Pipeline...'
                  : 'Analyse Food Donation & Find Partners ↗'}
              </span>
            </button>
            <p className="text-[11px] text-[#777777] text-center mt-2.5">
              Runs CLIP zero-shot classification, automated captioning, and food safety validation.
            </p>
          </div>
        </div>

      </div>
    </form>
  );
};
