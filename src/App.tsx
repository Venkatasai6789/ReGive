import React, { useState, useEffect, useCallback } from 'react';
import { ScreenType, Donation } from './types/donation';
import {
  PartnerScreenType,
  PartnerDashboardData,
  PartnerDonationItem,
  RejectPayload,
  SchedulePayload
} from './types/partner';
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

// Donor Pages
import { DonorHome } from './pages/DonorHome';
import { CreateDonation } from './pages/CreateDonation';
import { MyDonations } from './pages/MyDonations';

// Partner Pages & Components
import { PartnerDashboard } from './pages/partner/PartnerDashboard';
import { PartnerDonationRequests } from './pages/partner/PartnerDonationRequests';
import { PartnerCollectionHistory } from './pages/partner/PartnerCollectionHistory';
import { PartnerDonationDetailsDrawer } from './components/partner/PartnerDonationDetailsDrawer';

export const App: React.FC = () => {
  // Portal Mode
  const [portalMode, setPortalMode] = useState<'donor' | 'partner'>('donor');

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

  const navigateDonorTo = (screen: ScreenType) => {
    setCurrentDonorScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Partner handlers
  const handleSwitchToPartner = (partnerId?: string) => {
    const targetId = partnerId || activePartnerId || 'prt-ngo-01';
    setActivePartnerId(targetId);
    setPortalMode('partner');
    setPartnerScreen('dashboard');
    refreshPartnerData(targetId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchToDonor = () => {
    setPortalMode('donor');
    setCurrentDonorScreen('home');
    // Refresh donor data
    syncDonationsFromBackend().then((res) => {
      if (res && res.length > 0) setDonations(res);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchPartnerOrg = (newPartnerId: string) => {
    setActivePartnerId(newPartnerId);
    refreshPartnerData(newPartnerId);
  };

  const handlePartnerLogout = () => {
    // Clear active partner session and return to donor mode
    setPartnerDashboardData(null);
    setPartnerDonations([]);
    setSelectedPartnerDonation(null);
    setIsPartnerDrawerOpen(false);
    setPortalMode('donor');
    setCurrentDonorScreen('home');
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
    // sync back to donor state
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
        onSwitchToDonor={handleSwitchToDonor}
        onSwitchPartner={handleSwitchPartnerOrg}
        onLogout={handlePartnerLogout}
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
      onSwitchToPartner={handleSwitchToPartner}
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
