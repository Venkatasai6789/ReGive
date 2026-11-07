import React from 'react';
import { ArrowUpRight, Utensils, Wheat, Apple, Package } from 'lucide-react';
import { ScreenType } from '../../types/donation';

interface ImpactExplainerProps {
  onNavigate: (screen: ScreenType) => void;
}

export const ImpactExplainer: React.FC<ImpactExplainerProps> = ({ onNavigate }) => {
  return (
    <section className="px-6 md:px-12 lg:px-16 py-12 bg-[#FAFBF9] border-t border-[#E5E7E4]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#777777]">
            Platform Mission
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] font-['Manrope'] mt-1">
            Every food donation feeds someone in need.
          </h2>
          <p className="text-sm text-[#777777] mt-2 leading-relaxed">
            ReGiVe bridges the gap between food donors with surplus meals or groceries and verified local soup kitchens and pantries equipped to distribute nourishment immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-[#E5E7E4]">
            <div className="w-9 h-9 rounded-xl bg-[#F5E84D] flex items-center justify-center mb-3 shadow-2xs">
              <Utensils className="w-4 h-4 text-[#171717]" />
            </div>
            <h4 className="font-bold text-sm text-[#171717] font-['Manrope']">Prepared Meals</h4>
            <p className="text-xs text-[#777777] mt-1 leading-relaxed">
              Redirects hot prepared banquet trays and cafeteria meals to shelters within the 4-hour safety window.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E5E7E4]">
            <div className="w-9 h-9 rounded-xl bg-[#F5E84D] flex items-center justify-center mb-3 shadow-2xs">
              <Wheat className="w-4 h-4 text-[#171717]" />
            </div>
            <h4 className="font-bold text-sm text-[#171717] font-['Manrope']">Bakery & Grains</h4>
            <p className="text-xs text-[#777777] mt-1 leading-relaxed">
              Same-day surplus artisanal loaves, rolls, and morning pastries channeled directly to community breakfast programs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E5E7E4]">
            <div className="w-9 h-9 rounded-xl bg-[#F5E84D] flex items-center justify-center mb-3 shadow-2xs">
              <Apple className="w-4 h-4 text-[#171717]" />
            </div>
            <h4 className="font-bold text-sm text-[#171717] font-['Manrope']">Fresh Produce</h4>
            <p className="text-xs text-[#777777] mt-1 leading-relaxed">
              Wholesome orchard fruit, farm vegetables, and crisp salad greens provided to grassroots community kitchens.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E5E7E4]">
            <div className="w-9 h-9 rounded-xl bg-[#F5E84D] flex items-center justify-center mb-3 shadow-2xs">
              <Package className="w-4 h-4 text-[#171717]" />
            </div>
            <h4 className="font-bold text-sm text-[#171717] font-['Manrope']">Packaged Pantry</h4>
            <p className="text-xs text-[#777777] mt-1 leading-relaxed">
              Unopened rice, dry pasta, and canned proteins safely stored and distributed across family neighborhood pantries.
            </p>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-8 p-6 rounded-2xl bg-white border border-[#E5E7E4] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-[#171717] font-['Manrope']">
              Ready to circulate surplus food today?
            </h4>
            <p className="text-xs text-[#777777] mt-0.5">
              Take a quick photo of your surplus food. Our AI models handle the rest.
            </p>
          </div>
          <button
            onClick={() => onNavigate('create')}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#F5E84D] hover:bg-[#EBDD3C] text-[#171717] font-bold text-xs transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <span>Start Food Donation</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
