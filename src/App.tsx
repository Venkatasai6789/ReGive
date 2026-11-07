import React, { useState, useEffect, useCallback } from 'react';
import { ScreenType, Donation } from './types/donation';
import {
  PartnerScreenType,
  PartnerDashboardData,
  PartnerDonationItem,
  RejectPayload,
  SchedulePayload
} from './types/partner';
import { User } from './types/auth';
import { useAuth } from './context/AuthContext';
import { getStoredDonations, saveDonations, syncDonationsFromBackend } from './services/donationService';
import {
  fetchPartnerDashboard,
  fetchPartnerDonations,
  acceptPartnerDonation,
  rejectPartnerDonation,
  schedulePartnerDonation,
  collectPartnerDonation,
  completePartnerDonation
} from './services/partnerService';

// Layouts
import { DonorLayout } from './components/layout/DonorLayout';
import { PartnerLayout } from './components/partner/PartnerLayout';

// Pages
import { DonorHome } from './pages/DonorHome';
import { CreateDonation } from './pages/CreateDonation';
import { MyDonations } from './pages/MyDonations';
import { LoginPage } from './pages/auth/LoginPage';

// Partner Pages & Components
import { PartnerDashboard } from './pages/partner/PartnerDashboard';
import { PartnerDonationRequests } from './pages/partner/PartnerDonationRequests';
import { PartnerCollectionHistory } from './pages/partner/PartnerCollectionHistory';
import { PartnerDonationDetailsDrawer } from './components/partner/PartnerDonationDetailsDrawer';

export const App: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  // Portal Mode
  const [portalMode, setPortalMode] = useState<'donor' | 'partner'>('donor');

  // Auth UI State
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [returnTarget, setReturnTarget] = useState<ScreenType | null>(null);
  const [destinationNotice, setDestinationNotice] = useState<string | null>(null);

  // Donor State
  const [currentDonorScreen, setCurrentDonorScreen] = useState<ScreenType>('home');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  // Partner State
  const [activePartnerId, setActivePartnerId] = useState<string>('prt-ngo-01');
  const [partnerScreen, setPartnerScreen] = useState<PartnerScreenType>('dashboard');
  const [partnerDashboardData, setPartnerDashboardData] = useState<PartnerDashboardData | null>(null);
  const [partnerDonations, setPartnerDonations] = useState<PartnerDonationItem[]>([]);
  const [selectedPartnerDonation, setSelectedPartnerDonation] = useState<PartnerDonationItem | null>(null);
  const [isPartnerDrawerOpen, setIsPartnerDrawerOpen] = useState(false);
  const [isPartnerLoading, setIsPartnerLoading] = useState(false);

  // Synchronize authenticated role on load or user change
  useEffect(() => {
    if (user) {
      if (user.role === 'ngo' || user.role === 'recycler') {
        setPortalMode('partner');
        if (user.linked_profile_id) {
          setActivePartnerId(user.linked_profile_id);
        }
      } else if (user.role === 'donor') {
        setPortalMode('donor');
      }
    }
  }, [user]);

  // Sync donor donations on initial mount
  useEffect(() => {
    const initial = getStoredDonations();
    setDonations(initial);

    syncDonationsFromBackend().then((backendDonations) => {
      if (backendDonations && backendDonations.length > 0) {
        setDonations(backendDonations);
      }
    });
  }, []);

  // Fetch partner data whenever activePartnerId changes or on reload
  const refreshPartnerData = useCallback(async (pId: string) => {
    setIsPartnerLoading(true);
    try {
      const [dash, donList] = await Promise.all([
        fetchPartnerDashboard(pId),
        fetchPartnerDonations(pId)
      ]);
      setPartnerDashboardData(dash);
      setPartnerDonations(donList);
    } catch (err) {
      console.error('Error fetching partner data:', err);
    } finally {
      setIsPartnerLoading(false);
    }
  }, []);

  useEffect(() => {
    if (portalMode === 'partner') {
      refreshPartnerData(activePartnerId);
    }
  }, [portalMode, activePartnerId, refreshPartnerData]);

  // Guarded donor navigation
  const navigateDonorTo = (screen: ScreenType) => {
    if (!isAuthenticated && (screen === 'create' || screen === 'donations')) {
      setReturnTarget(screen);
      setDestinationNotice(
        screen === 'create'
          ? 'Please log in or select a demo donor account to start a donation intake.'
          : 'Please log in or select a demo donor account to view your contribution history.'
      );
      setIsLoginOpen(true);
      return;
    }
    setCurrentDonorScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Donor handlers
  const handleDonationCreated = (newDonation: Donation) => {
    const updated = [newDonation, ...donations];
    setDonations(updated);
    saveDonations(updated);
    setSelectedDonation(newDonation);
    setUnreadNotifications((prev) => prev + 1);
  };

  const handleSelectDonation = (donation: Donation | null) => {
    setSelectedDonation(donation);
  };

  // Auth Handlers
  const handleLoginSuccess = (authenticatedUser: User) => {
    setIsLoginOpen(false);

    if (authenticatedUser.role === 'donor') {
      setPortalMode('donor');
      const target = returnTarget || 'home';
      setReturnTarget(null);
      setDestinationNotice(null);
      setCurrentDonorScreen(target);
      syncDonationsFromBackend().then((res) => {
        if (res && res.length > 0) setDonations(res);
      });
    } else if (authenticatedUser.role === 'ngo' || authenticatedUser.role === 'recycler') {
      setPortalMode('partner');
      const pId = authenticatedUser.linked_profile_id || 'prt-ngo-01';
      setActivePartnerId(pId);
      setPartnerScreen('dashboard');
      refreshPartnerData(pId);
    } else if (authenticatedUser.role === 'admin') {
      setPortalMode('donor');
      setCurrentDonorScreen('home');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await logout();
    setPartnerDashboardData(null);
    setPartnerDonations([]);
    setSelectedPartnerDonation(null);
    setIsPartnerDrawerOpen(false);
    setPortalMode('donor');
    setCurrentDonorScreen('home');
    setReturnTarget(null);
    setDestinationNotice(null);
    setIsLoginOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPartnerDrawer = (donationItem: PartnerDonationItem) => {
    setSelectedPartnerDonation(donationItem);
    setIsPartnerDrawerOpen(true);
  };

  const handleClosePartnerDrawer = () => {
    setIsPartnerDrawerOpen(false);
  };

  // Partner Action Triggers
  const handlePartnerAccept = async (donationId: string) => {
    const updated = await acceptPartnerDonation(activePartnerId, donationId);
    setSelectedPartnerDonation(updated);
    await refreshPartnerData(activePartnerId);
    syncDonationsFromBackend().then((res) => res && setDonations(res));
  };

  const handlePartnerReject = async (donationId: string, payload: RejectPayload) => {
    const updated = await rejectPartnerDonation(activePartnerId, donationId, payload);
    setSelectedPartnerDonation(updated);
    await refreshPartnerData(activePartnerId);
    syncDonationsFromBackend().then((res) => res && setDonations(res));
  };

  const handlePartnerSchedule = async (donationId: string, payload: SchedulePayload) => {
    const updated = await schedulePartnerDonation(activePartnerId, donationId, payload);
    setSelectedPartnerDonation(updated);
    await refreshPartnerData(activePartnerId);
    syncDonationsFromBackend().then((res) => res && setDonations(res));
  };

  const handlePartnerCollect = async (donationId: string) => {
    const updated = await collectPartnerDonation(activePartnerId, donationId);
    setSelectedPartnerDonation(updated);
    await refreshPartnerData(activePartnerId);
    syncDonationsFromBackend().then((res) => res && setDonations(res));
  };

  const handlePartnerComplete = async (donationId: string) => {
    const updated = await completePartnerDonation(activePartnerId, donationId);
    setSelectedPartnerDonation(updated);
    await refreshPartnerData(activePartnerId);
    syncDonationsFromBackend().then((res) => res && setDonations(res));
  };

  // If Login screen is triggered
  if (isLoginOpen) {
    return (
      <LoginPage
        onSuccess={handleLoginSuccess}
        onCancel={() => {
          setIsLoginOpen(false);
          setReturnTarget(null);
          setDestinationNotice(null);
        }}
        returnUrl={returnTarget || undefined}
        destinationNotice={destinationNotice || undefined}
      />
    );
  }

  // Render Partner Portal
  if (portalMode === 'partner') {
    return (
      <PartnerLayout
        currentScreen={partnerScreen}
        onNavigate={(screen) => {
          setPartnerScreen(screen);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        partner={partnerDashboardData?.partner || null}
        pendingCount={partnerDashboardData?.stats.pending_count || 0}
        onLogout={handleLogout}
        onRefresh={() => refreshPartnerData(activePartnerId)}
      >
        {partnerScreen === 'dashboard' && (
          <PartnerDashboard
            data={partnerDashboardData}
            isLoading={isPartnerLoading}
            onNavigateToRequests={() => setPartnerScreen('requests')}
            onNavigateToHistory={() => setPartnerScreen('history')}
            onSelectDonation={handleOpenPartnerDrawer}
          />
        )}

        {partnerScreen === 'requests' && (
          <PartnerDonationRequests
            donations={partnerDonations}
            isLoading={isPartnerLoading}
            onSelectDonation={handleOpenPartnerDrawer}
            onAccept={handlePartnerAccept}
            onReject={handlePartnerReject}
          />
        )}

        {partnerScreen === 'history' && (
          <PartnerCollectionHistory
            donations={partnerDonations}
            isLoading={isPartnerLoading}
            onSelectDonation={handleOpenPartnerDrawer}
            onCollect={handlePartnerCollect}
            onComplete={handlePartnerComplete}
          />
        )}

        {/* Reusable Partner Details Drawer */}
        <PartnerDonationDetailsDrawer
          donation={selectedPartnerDonation}
          isOpen={isPartnerDrawerOpen}
          onClose={handleClosePartnerDrawer}
          onAccept={handlePartnerAccept}
          onReject={handlePartnerReject}
          onSchedule={handlePartnerSchedule}
          onCollect={handlePartnerCollect}
          onComplete={handlePartnerComplete}
        />
      </PartnerLayout>
    );
  }

  // Render Donor Portal (Completely preserved)
  return (
    <DonorLayout
      currentScreen={currentDonorScreen}
      onNavigate={navigateDonorTo}
      unreadCount={unreadNotifications}
      onOpenLogin={() => {
        setReturnTarget(null);
        setDestinationNotice(null);
        setIsLoginOpen(true);
      }}
    >
      {currentDonorScreen === 'home' && (
        <DonorHome
          donations={donations}
          onNavigate={navigateDonorTo}
          onSelectDonation={(donation) => {
            setSelectedDonation(donation);
            navigateDonorTo('donations');
          }}
        />
      )}

      {currentDonorScreen === 'create' && (
        <CreateDonation
          onNavigate={navigateDonorTo}
          onDonationCreated={handleDonationCreated}
        />
      )}

      {currentDonorScreen === 'donations' && (
        <MyDonations
          donations={donations}
          onNavigate={navigateDonorTo}
          selectedDonation={selectedDonation}
          onSelectDonation={handleSelectDonation}
        />
      )}
    </DonorLayout>
  );
};

export default App;
