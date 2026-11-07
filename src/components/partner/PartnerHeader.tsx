import React, { useState } from 'react';
import { PartnerScreenType, PartnerProfile } from '../../types/partner';
import { useAuth } from '../../context/AuthContext';
import {
  HeartHandshake,
  Bell,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Package,
  Clock,
  LogOut,
  RefreshCw,
  Search,
  Globe,
  Building2,
  CheckCircle2,
  Recycle,
  Utensils
} from 'lucide-react';

interface PartnerHeaderProps {
  currentScreen: PartnerScreenType;
  onNavigate: (screen: PartnerScreenType) => void;
  partner: PartnerProfile | null;
  pendingCount?: number;
  onLogout: () => void;
  onRefresh?: () => void;
}

export const PartnerHeader: React.FC<PartnerHeaderProps> = ({
  currentScreen,
  onNavigate,
  partner,
  pendingCount = 0,
  onLogout,
  onRefresh
}) => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isRecycler = partner?.organization_type?.toLowerCase().includes('recycler') || user?.role === 'recycler';
  const orgName = partner?.name || user?.display_name || 'Partner Organization';
  const orgEmail = partner?.contact_email || user?.email || 'partner@regive.network';
  const orgId = partner?.id || user?.linked_profile_id || 'portal';

  // Compute initials
  const getInitials = () => {
    if (!orgName) return 'PT';
    const words = orgName.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return orgName.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="relative w-full border-b border-[#E5E7E4] bg-white">
        {/* Browser window accent header matching donor reference */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#FAFBF9] border-b border-[#F1F2F0] text-xs text-[#777777]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] inline-block shadow-2xs"></span>
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] inline-block shadow-2xs"></span>
            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] inline-block shadow-2xs"></span>
            <span className="ml-2 font-mono text-[11px] text-[#888888]">
              regive.network/partner-portal/{orgId}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[11px] font-medium">
            <span className="flex items-center gap-1 text-[#23845B]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Enterprise Partner Node
            </span>
            <span className="text-[#E5E7E4]">|</span>
            <span className="flex items-center gap-1 text-[#171717]">
              {isRecycler ? (
                <>
                  <Recycle className="w-3.5 h-3.5 text-[#23845B]" />
                  Organic Recovery Stream
                </>
              ) : (
                <>
                  <Utensils className="w-3.5 h-3.5 text-[#D97706]" />
                  Human Food Rescue Intake
                </>
              )}
            </span>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="flex items-center justify-between px-5 md:px-8 py-4">
          {/* Left: Platform Logo & Organization Info */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate('dashboard')}
          >
            <div className="w-10 h-10 rounded-full bg-[#F5E84D] flex items-center justify-center font-bold text-[#171717] shadow-sm group-hover:bg-[#EBDD3C] transition-colors">
              <HeartHandshake className="w-5 h-5 text-[#171717]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xl font-bold tracking-tight text-[#171717] font-['Manrope']">
                  ReGive
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#171717] text-white rounded-full">
                  Partner Portal
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                    isRecycler
                      ? 'bg-[#10B981]/10 text-[#059669] border-[#10B981]/30'
                      : 'bg-[#F59E0B]/10 text-[#D97706] border-[#F59E0B]/30'
                  }`}
                >
                  {isRecycler ? 'Bio-Recycler' : 'Food NGO'}
                </span>
              </div>
              <p className="text-[11px] text-[#777777] hidden sm:block -mt-0.5 font-medium">
                {orgName} • Verified Node
              </p>
            </div>
          </div>

          {/* Center: Partner Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#F1F2F0] p-1.5 rounded-full border border-[#E5E7E4]">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
                currentScreen === 'dashboard'
                  ? 'bg-white text-[#171717] shadow-sm'
                  : 'text-[#777777] hover:text-[#171717]'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('requests')}
              className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                currentScreen === 'requests'
                  ? 'bg-white text-[#171717] shadow-sm'
                  : 'text-[#777777] hover:text-[#171717]'
              }`}
            >
              <span>Donation Requests</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#F5E84D] text-[#171717] border border-[#171717]/10">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onNavigate('history')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
                currentScreen === 'history'
                  ? 'bg-white text-[#171717] shadow-sm'
                  : 'text-[#777777] hover:text-[#171717]'
              }`}
            >
              Collection & History
            </button>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                title="Refresh Live Data"
                className="p-2 rounded-full hover:bg-[#F1F2F0] text-[#171717] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-[#171717]" />
              </button>
            )}

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
              {pendingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C94B4B] ring-2 ring-white"></span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-[#E5E7E4] hover:bg-[#F1F2F0] transition-colors text-left cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-[#171717] text-[#F5E84D] flex items-center justify-center text-xs font-bold font-['Manrope']">
                  {getInitials()}
                </div>
                <div className="leading-tight hidden sm:block">
                  <span className="block text-xs font-bold text-[#171717] truncate max-w-[120px]">
                    {orgName}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-[#777777]" />
              </button>

              {/* Profile Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E5E7E4] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-4 py-3 border-b border-[#F1F2F0]">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-[#171717] truncate">{orgName}</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#23845B]/10 text-[#23845B]">
                        Verified Node
                      </span>
                    </div>
                    <p className="text-[11px] text-[#777777] truncate">{orgEmail}</p>
                    <p className="text-[10px] text-[#888888] mt-1 font-mono">Profile ID: {orgId}</p>
                    <div className="mt-2 pt-2 border-t border-[#F1F2F0] flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-[#555555]">Authenticated Role:</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#171717] text-[#F5E84D]">
                        {user?.role || 'Partner'}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#C94B4B] hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-[#C94B4B]" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

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
                onNavigate('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold ${
                currentScreen === 'dashboard'
                  ? 'bg-[#F5E84D] text-[#171717]'
                  : 'text-[#171717] hover:bg-[#F1F2F0]'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                onNavigate('requests');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between ${
                currentScreen === 'requests'
                  ? 'bg-[#F5E84D] text-[#171717]'
                  : 'text-[#171717] hover:bg-[#F1F2F0]'
              }`}
            >
              <span>Donation Requests</span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#171717] text-white">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                onNavigate('history');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold ${
                currentScreen === 'history'
                  ? 'bg-[#F5E84D] text-[#171717]'
                  : 'text-[#171717] hover:bg-[#F1F2F0]'
              }`}
            >
              Collection & History
            </button>

            <div className="pt-2 border-t border-[#F1F2F0] space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#C94B4B] bg-red-50 rounded-xl flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
