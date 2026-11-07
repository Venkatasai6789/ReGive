import React from 'react';
import { ArrowUpRight, Camera, Cpu, Sparkles, CheckCircle2, Shield } from 'lucide-react';
import { ScreenType } from '../../types/donation';

interface HeroSectionProps {
  onNavigate: (screen: ScreenType) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  return (
    <section className="px-6 md:px-12 lg:px-16 pt-10 md:pt-16 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left Column: Bold Editorial Heading & Calls to Action */}
        <div className="lg:col-span-7 space-y-6 md:space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F1F2F0] border border-[#E5E7E4] text-xs font-semibold text-[#171717]">
            <span className="w-2 h-2 rounded-full bg-[#23845B] animate-pulse"></span>
            <span>AI-Powered Food Rescue & Circulation</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#171717] leading-[1.08] font-['Manrope']">
            Give surplus food <br />
            <span className="relative inline-block">
              a second life.
              <span className="absolute bottom-1 left-0 w-full h-3 bg-[#F5E84D]/60 -z-10 rounded-sm"></span>
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#777777] max-w-xl font-normal leading-relaxed">
            Turn surplus meals, fresh produce, and bakery goods into community nourishment. Connect directly with verified food banks and soup kitchens through automated AI food safety verification and smart routing.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('create')}
              className="flex items-center gap-2 px-8 py-4 rounded-full bg-[#F5E84D] hover:bg-[#EBDD3C] text-[#171717] font-bold text-base transition-all shadow-sm hover:shadow active:scale-95"
            >
              <span>Start Donating</span>
              <ArrowUpRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => onNavigate('donations')}
              className="flex items-center gap-2 px-7 py-4 rounded-full bg-[#F1F2F0] hover:bg-[#E5E7E4] text-[#171717] font-semibold text-base transition-colors"
            >
              <span>Explore Donations</span>
            </button>
          </div>

          {/* Trust reassurance pills */}
          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-[#777777]">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#23845B]" />
              100% Verified Community Partners
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#23845B]" />
              Zero-Landfill Commitment
            </span>
          </div>
        </div>

        {/* Right Column: Information Panel Inspired by Reference 'Mission & Objectives' */}
        <div className="lg:col-span-5">
          <div className="bg-[#FAFBF9] border border-[#E5E7E4] rounded-3xl p-6 md:p-8 space-y-6">
            <div className="border-b border-[#E5E7E4] pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                How ReGive Works
              </span>
              <h3 className="text-2xl font-bold text-[#171717] font-['Manrope'] mt-1">
                A simple 3-stage journey
              </h3>
              <p className="text-xs text-[#777777] mt-1 leading-relaxed">
                From your photo to recipient intake in minutes without complex paperwork.
              </p>
            </div>

            {/* 3-Stage Process Nodes */}
            <div className="space-y-4">
              {/* Stage 1 */}
              <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white border border-[#E5E7E4] transition-transform hover:-translate-y-0.5 duration-150">
                <div className="w-10 h-10 rounded-full bg-[#F5E84D] flex items-center justify-center font-extrabold text-sm text-[#171717] shrink-0 font-['Manrope']">
                  01
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-[#171717]">
                    <Camera className="w-4 h-4 text-[#777777]" />
                    <h4>Share Resources</h4>
                  </div>
                  <p className="text-xs text-[#777777] mt-0.5 leading-relaxed">
                    Upload an item photo and specify quantity and location.
                  </p>
                </div>
              </div>

              {/* Stage 2 */}
              <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white border border-[#E5E7E4] transition-transform hover:-translate-y-0.5 duration-150">
                <div className="w-10 h-10 rounded-full bg-[#171717] text-white flex items-center justify-center font-extrabold text-sm shrink-0 font-['Manrope']">
                  02
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-[#171717]">
                    <Cpu className="w-4 h-4 text-[#777777]" />
                    <h4>Find the Right Partner</h4>
                  </div>
                  <p className="text-xs text-[#777777] mt-0.5 leading-relaxed">
                    AI classifies items and matches local food banks, shelters, or recyclers.
                  </p>
                </div>
              </div>

              {/* Stage 3 */}
              <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white border border-[#E5E7E4] transition-transform hover:-translate-y-0.5 duration-150">
                <div className="w-10 h-10 rounded-full bg-[#23845B] text-white flex items-center justify-center font-extrabold text-sm shrink-0 font-['Manrope']">
                  03
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-[#171717]">
                    <Sparkles className="w-4 h-4 text-[#777777]" />
                    <h4>Make an Impact</h4>
                  </div>
                  <p className="text-xs text-[#777777] mt-0.5 leading-relaxed">
                    Coordinate door collection and track delivery through transparent updates.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Link */}
            <div className="pt-2">
              <button
                onClick={() => onNavigate('create')}
                className="w-full py-3 px-4 rounded-full bg-white hover:bg-[#F1F2F0] border border-[#E5E7E4] font-semibold text-xs text-[#171717] text-center flex items-center justify-center gap-2 transition-colors"
              >
                <span>Upload an item photo to begin</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
