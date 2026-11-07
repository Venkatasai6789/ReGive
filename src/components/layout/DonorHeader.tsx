import React, { useState } from 'react';
import { ScreenType } from '../../types/donation';
import {
  HeartHandshake,
  Bell,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Package,
  Layers,
  Search,
  Globe
} from 'lucide-react';

interface DonorHeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  unreadCount?: number;
}

export const DonorHeader: React.FC<DonorHeaderProps> = ({
  currentScreen,
  onNavigate,
  unreadCount = 2
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  return (
    <>
      <header className="relative w-full border-b border-[#E5E7E4] bg-white">
        {/* Subtle browser window accent header inspired by reference mockup */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#FAFBF9] border-b border-[#F1F2F0] text-xs text-[#777777]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] inline-block shadow-2xs"></span>
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] inline-block shadow-2xs"></span>
            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] inline-block shadow-2xs"></span>
            <span className="ml-2 font-mono text-[11px] text-[#888888]">regive.network/donor-portal</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[11px] font-medium">
            <span className="flex items-center gap-1 text-[#23845B]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified NGO & Recycler Network
            </span>
            <span className="text-[#E5E7E4]">|</span>
            <span>AI Intake: CLIP + BLIP + MiniLM</span>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="flex items-center justify-between px-5 md:px-8 py-4">
          {/* Left: Platform Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <div className="w-10 h-10 rounded-full bg-[#F5E84D] flex items-center justify-center font-bold text-[#171717] shadow-sm group-hover:bg-[#EBDD3C] transition-colors">
              <HeartHandshake className="w-5 h-5 text-[#171717]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-[#171717] font-['Manrope']">
                  ReGive
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#F1F2F0] text-[#171717] rounded-full border border-[#E5E7E4]">
                  Donor
                </span>
              </div>
              <p className="text-[11px] text-[#777777] hidden sm:block -mt-0.5">
                AI Resource Circulation Loop
              </p>
            </div>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#F1F2F0] p-1.5 rounded-full border border-[#E5E7E4]">
            <button
              onClick={() => onNavigate('home')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
                currentScreen === 'home'
                  ? 'bg-white text-[#171717] shadow-sm'
                  : 'text-[#777777] hover:text-[#171717]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('donations')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
                currentScreen === 'donations'
                  ? 'bg-white text-[#171717] shadow-sm'
                  : 'text-[#777777] hover:text-[#171717]'
              }`}
            >
              My Donations
            </button>
            <button
              onClick={() => setAboutModalOpen(true)}
              className="px-5 py-2 rounded-full text-sm font-semibold text-[#777777] hover:text-[#171717] transition-colors"
            >
              About the Platform
            </button>
          </nav>

          {/* Right: Actions matching the reference design */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Minimal Search Button */}
            <button
              title="Search"
              className="p-2 rounded-full hover:bg-[#F1F2F0] text-[#171717] transition-colors"
            >
              <Search className="w-4 h-4 text-[#171717]" />
            </button>

            {/* Language/Region switcher pill */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold text-[#171717] hover:bg-[#F1F2F0] cursor-pointer transition-colors border border-transparent hover:border-[#E5E7E4]">
              <Globe className="w-3.5 h-3.5 text-[#777777]" />
              <span>UA</span>
            </div>

            {/* Notification Bell */}
            <button
              title="Notifications"
              className="relative p-2 rounded-full hover:bg-[#F1F2F0] text-[#171717] transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C94B4B] ring-2 ring-white"></span>
              )}
            </button>

            {/* Profile Menu */}
            <div className="relative hidden lg:block">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-[#E5E7E4] hover:bg-[#F1F2F0] transition-colors text-left"
              >
                <div className="w-6 h-6 rounded-full bg-[#171717] text-white flex items-center justify-center text-[10px] font-bold font-['Manrope']">
                  ER
                </div>
                <div className="leading-tight">
                  <span className="block text-xs font-bold text-[#171717]">Elena</span>
                </div>
                <ChevronDown className="w-3 h-3 text-[#777777]" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E7E4] rounded-2xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-[#F1F2F0]">
                    <p className="text-xs font-bold text-[#171717]">Elena Rostova</p>
                    <p className="text-[11px] text-[#777777]">elena.rostova@university.edu</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onNavigate('donations');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-[#171717] hover:bg-[#F1F2F0] flex items-center gap-2"
                    >
                      <Package className="w-3.5 h-3.5 text-[#777777]" />
                      My Contribution History
                    </button>
                    <button
                      onClick={() => {
                        setAboutModalOpen(true);
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-[#171717] hover:bg-[#F1F2F0] flex items-center gap-2"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#777777]" />
                      Platform Impact Metrics
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Donate Pill Button directly mirroring the reference mockup */}
            <button
              onClick={() => onNavigate('create')}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full font-bold text-sm text-[#171717] bg-[#F5E84D] hover:bg-[#EBDD3C] transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <span>Donate</span>
              <ChevronDown className="w-4 h-4 text-[#171717]" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden rounded-lg hover:bg-[#F1F2F0] text-[#171717]"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5E7E4] px-5 py-4 bg-white space-y-2">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold ${
                currentScreen === 'home'
                  ? 'bg-[#F5E84D] text-[#171717]'
                  : 'text-[#171717] hover:bg-[#F1F2F0]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('donations');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold ${
                currentScreen === 'donations'
                  ? 'bg-[#F5E84D] text-[#171717]'
                  : 'text-[#171717] hover:bg-[#F1F2F0]'
              }`}
            >
              My Donations
            </button>
            <button
              onClick={() => {
                setAboutModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-[#171717] hover:bg-[#F1F2F0]"
            >
              About the Platform
            </button>
            <div className="pt-2 border-t border-[#F1F2F0] flex items-center justify-between">
              <span className="text-xs text-[#777777]">Donor Account: Elena Rostova</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#23845B]/10 text-[#23845B]">
                Active
              </span>
            </div>
          </div>
        )}
      </header>

      {/* About Platform Modal */}
      {aboutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-[#E5E7E4]">
            <button
              onClick={() => setAboutModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#F1F2F0] text-[#777777] hover:text-[#171717]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#F5E84D] flex items-center justify-center mb-4">
              <HeartHandshake className="w-6 h-6 text-[#171717]" />
            </div>

            <h3 className="text-2xl font-extrabold text-[#171717] font-['Manrope'] mb-2">
              About the ReGive Platform
            </h3>
            <p className="text-sm text-[#777777] leading-relaxed mb-4">
              ReGive is an AI-powered physical resource circulation platform designed to divert usable goods and surplus foodstuffs from waste streams directly into verified nonprofit programs, community shelters, and ethical recyclers.
            </p>

            <div className="space-y-3 bg-[#F1F2F0] p-4 rounded-2xl mb-6 text-xs text-[#171717]">
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#171717] min-w-[70px]">Vision:</span>
                <span>Zero avoidable landfill waste through automated AI categorization and partner matching.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#171717] min-w-[70px]">AI Pipeline:</span>
                <span>OpenAI CLIP (classification), Salesforce BLIP (captioning), and MiniLM + FAISS (similarity routing).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#171717] min-w-[70px]">Verification:</span>
                <span>Strict food safety thresholds and registered NGO intake screening.</span>
              </div>
            </div>

            <button
              onClick={() => setAboutModalOpen(false)}
              className="w-full py-3 rounded-full bg-[#171717] text-white font-bold text-sm hover:bg-neutral-800 transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </>
  );
};
