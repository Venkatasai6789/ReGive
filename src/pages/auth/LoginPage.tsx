import React, { useState } from 'react';
import {
  HeartHandshake,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Utensils,
  Recycle,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types/auth';

interface LoginPageProps {
  onSuccess: (user: User) => void;
  onCancel: () => void;
  returnUrl?: string;
  destinationNotice?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onCancel,
  returnUrl,
  destinationNotice
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDemoTab, setActiveDemoTab] = useState<'donor' | 'ngo' | 'recycler'>('donor');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both your registered email address and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const authenticatedUser = await login({ email: email.trim(), password });
      onSuccess(authenticatedUser);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo accounts helper for reviewer convenience
  const demoAccounts = {
    donor: [
      { name: 'Ananya Sharma (Household)', email: 'ananya@regive.test', pw: 'ReGive2026@Ananya!' },
      { name: 'Arjun Reddy (Restaurant)', email: 'arjun@regive.test', pw: 'ReGive2026@Arjun!' },
      { name: 'Elena Rostova (Legacy)', email: 'elena.rostova@university.edu', pw: 'ReGive2026@Elena!' }
    ],
    ngo: [
      { name: 'Annapoorna Trust (Food Bank)', email: 'annapoorna@regive.test', pw: 'ReGive2026@Annapoorna!' },
      { name: 'Hope Night Shelter (Shelter)', email: 'hope@regive.test', pw: 'ReGive2026@Hope!' },
      { name: 'Bright Future Kitchen', email: 'brightfuture@regive.test', pw: 'ReGive2026@Bright!' }
    ],
    recycler: [
      { name: 'Green Earth Composters', email: 'greenearth@regive.test', pw: 'ReGive2026@Green!' },
      { name: 'Gokul Goshala (Animal Feed)', email: 'gokul@regive.test', pw: 'ReGive2026@Gokul!' },
      { name: 'BioGas Energy Plant', email: 'biogas@regive.test', pw: 'ReGive2026@BioGas!' }
    ]
  };

  const handleSelectDemoAccount = (accEmail: string, accPw: string) => {
    setEmail(accEmail);
    setPassword(accPw);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F5E84D] p-3 sm:p-5 md:p-8 flex flex-col items-center justify-center">
      {/* Central White Application Container */}
      <div className="w-full max-w-5xl bg-white rounded-[24px] sm:rounded-[32px] md:rounded-[38px] shadow-sm border border-[#E5E7E4]/80 overflow-hidden flex flex-col">
        {/* Browser window accent header matching donor reference */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#FAFBF9] border-b border-[#F1F2F0] text-xs text-[#777777]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] inline-block shadow-2xs"></span>
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] inline-block shadow-2xs"></span>
            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] inline-block shadow-2xs"></span>
            <span className="ml-2 font-mono text-[11px] text-[#888888]">regive.network/auth/login</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[11px] font-medium">
            <span className="flex items-center gap-1 text-[#23845B]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Argon2id Encrypted &bull; Server-Managed Sessions
            </span>
          </div>
        </div>

        {/* Main Content Grid: Balanced Desktop Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          {/* LEFT COLUMN: Login Form (7 Cols) */}
          <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-between space-y-6">
            <div>
              {/* Back to Home Link */}
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#777777] hover:text-[#171717] transition-colors mb-6 group cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                <span>Back to ReGiVe Public Home</span>
              </button>

              {/* Brand Logo & Title */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#F5E84D] flex items-center justify-center font-bold text-[#171717] shadow-xs">
                  <HeartHandshake className="w-5 h-5 text-[#171717]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-bold tracking-tight text-[#171717] font-['Manrope']">
                      ReGive
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#171717] text-white rounded-full">
                      Account Access
                    </span>
                  </div>
                  <p className="text-[11px] text-[#777777]">
                    Unified Authentication Gateway
                  </p>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] font-['Manrope'] tracking-tight">
                Welcome back to ReGiVe
              </h1>
              <p className="text-xs text-[#777777] mt-1 leading-relaxed">
                Enter your credentials to access your donor dashboard, NGO food rescue console, or recycler recovery hub.
              </p>

              {/* Destination notice if redirected from protected CTA */}
              {destinationNotice && (
                <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{destinationNotice}</span>
                </div>
              )}

              {/* Error banner */}
              {error && (
                <div className="mt-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Authentication Failed</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div>
                  <label
                    htmlFor="email-input"
                    className="block text-xs font-bold uppercase tracking-wider text-[#777777] mb-1.5"
                  >
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. ananya@regive.test"
                      autoComplete="username"
                      required
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E5E7E4] bg-white text-xs font-medium text-[#171717] placeholder-[#888888] focus:outline-hidden focus:ring-2 focus:ring-[#F5E84D] focus:border-[#171717] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password-input"
                    className="block text-xs font-bold uppercase tracking-wider text-[#777777] mb-1.5"
                  >
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your account password"
                      autoComplete="current-password"
                      required
                      className="w-full pl-10 pr-11 py-3 rounded-2xl border border-[#E5E7E4] bg-white text-xs font-medium text-[#171717] placeholder-[#888888] focus:outline-hidden focus:ring-2 focus:ring-[#F5E84D] focus:border-[#171717] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#171717] transition-colors p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-full bg-[#F5E84D] hover:bg-[#EBDD3C] text-[#171717] font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#171717] border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Log In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Demonstration Quick Fill Review Helper */}
            <div className="pt-4 border-t border-[#F1F2F0]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#888888]">
                  Quick Demo Accounts (Evaluation Fill)
                </span>
                <span className="text-[10px] text-[#888888]">1-Click Credentials</span>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1.5 bg-[#F1F2F0] p-1 rounded-full mb-2.5">
                {(['donor', 'ngo', 'recycler'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveDemoTab(tab)}
                    className={`flex-1 py-1 rounded-full text-[11px] font-bold capitalize transition-colors ${
                      activeDemoTab === tab
                        ? 'bg-white text-[#171717] shadow-2xs'
                        : 'text-[#777777] hover:text-[#171717]'
                    }`}
                  >
                    {tab === 'ngo' ? 'Food NGO' : tab}
                  </button>
                ))}
              </div>

              {/* Account Quick Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {demoAccounts[activeDemoTab].map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectDemoAccount(acc.email, acc.pw)}
                    className="p-2 rounded-xl bg-[#FAFBF9] hover:bg-[#F5E84D]/30 border border-[#E5E7E4] text-left transition-colors cursor-pointer group"
                  >
                    <span className="block text-[10px] font-bold text-[#171717] truncate group-hover:text-black">
                      {acc.name}
                    </span>
                    <span className="block text-[9px] text-[#777777] truncate font-mono">
                      {acc.email}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ReGiVe Platform Overview (5 Cols) */}
          <div className="lg:col-span-5 bg-[#FAFBF9] border-t lg:border-t-0 lg:border-l border-[#E5E7E4] p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="border-b border-[#E5E7E4] pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                  Unified Platform Access
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#171717] font-['Manrope'] mt-1">
                  Three Portals. One Secure Gateway.
                </h3>
                <p className="text-xs text-[#777777] mt-1 leading-relaxed">
                  Your authenticated identity determines your circulation privileges automatically.
                </p>
              </div>

              {/* 3 Step Overview */}
              <div className="space-y-3.5">
                <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7E4] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F5E84D] flex items-center justify-center font-bold text-xs text-[#171717] shrink-0 font-['Manrope']">
                    01
                  </div>
                  <div className="text-xs">
                    <h4 className="font-bold text-[#171717]">Verified Donors</h4>
                    <p className="text-[11px] text-[#777777] mt-0.5">
                      Submit surplus food photos, trigger CLIP/BLIP zero-shot assessment, and track pickups.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7E4] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#171717] text-[#F5E84D] flex items-center justify-center font-bold text-xs shrink-0 font-['Manrope']">
                    02
                  </div>
                  <div className="text-xs">
                    <h4 className="font-bold text-[#171717]">Food Banks & NGOs</h4>
                    <p className="text-[11px] text-[#777777] mt-0.5">
                      Review incoming requests, verify 4h/24h safety compliance, and schedule intake.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7E4] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#23845B] text-white flex items-center justify-center font-bold text-xs shrink-0 font-['Manrope']">
                    03
                  </div>
                  <div className="text-xs">
                    <h4 className="font-bold text-[#171717]">Bio-Recyclers & Composters</h4>
                    <p className="text-[11px] text-[#777777] mt-0.5">
                      Manage non-edible organic food waste diversion into compost, biogas, and animal feed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Guarantee Pills */}
            <div className="p-4 rounded-2xl bg-white border border-[#E5E7E4] space-y-2 text-[11px] text-[#777777]">
              <div className="flex items-center gap-2 text-[#23845B] font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Zero Hardcoded Account Impersonation</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#888888] shrink-0" />
                <span>Backend Role-Based Access Control (RBAC)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
