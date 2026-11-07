import React from 'react';
import { HeartHandshake, ShieldCheck, Cpu } from 'lucide-react';

export const DonorFooter: React.FC = () => {
  return (
    <footer className="mt-12 border-t border-[#E5E7E4] pt-8 pb-10 px-6 md:px-10 text-xs text-[#777777] bg-white rounded-b-[28px]">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#F5E84D] flex items-center justify-center font-bold text-[#171717]">
            <HeartHandshake className="w-4 h-4 text-[#171717]" />
          </div>
          <div>
            <span className="font-bold text-[#171717] font-['Manrope']">ReGive Platform</span>
            <span className="ml-2 text-[11px] text-[#777777]">University AI Donation Capstone Project</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-[12px] font-medium text-[#777777]">
          <span className="flex items-center gap-1.5 hover:text-[#171717] transition-colors cursor-default">
            <ShieldCheck className="w-3.5 h-3.5 text-[#23845B]" />
            Verified Intake Standards
          </span>
          <span className="flex items-center gap-1.5 hover:text-[#171717] transition-colors cursor-default">
            <Cpu className="w-3.5 h-3.5 text-[#171717]" />
            Deterministic AI Model Adapter
          </span>
          <span className="hover:text-[#171717] transition-colors cursor-default">
            Zero-Landfill Protocol
          </span>
        </div>

        <div className="text-[11px] text-[#888888]">
          &copy; {new Date().getFullYear()} ReGive Network. Donor Interface v1.0.
        </div>
      </div>
    </footer>
  );
};
