import React, { useState, useEffect } from 'react';
import { ScreenType, Donation } from './types/donation';
import { getStoredDonations, saveDonations, syncDonationsFromBackend } from './services/donationService';
import { DonorLayout } from './components/layout/DonorLayout';
import { DonorHome } from './pages/DonorHome';
import { CreateDonation } from './pages/CreateDonation';
import { MyDonations } from './pages/MyDonations';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  // Initialize donations from storage and sync with SQLite backend
  useEffect(() => {
    const initial = getStoredDonations();
    setDonations(initial);

    // Sync with SQLite backend
    syncDonationsFromBackend().then((backendDonations) => {
      if (backendDonations && backendDonations.length > 0) {
        setDonations(backendDonations);
      }
    });
  }, []);

  // Update storage whenever donations change
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

  const navigateTo = (screen: ScreenType) => {
    setCurrentScreen(screen);
    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <DonorLayout
      currentScreen={currentScreen}
      onNavigate={navigateTo}
      unreadCount={unreadNotifications}
    >
      {currentScreen === 'home' && (
        <DonorHome
          donations={donations}
          onNavigate={navigateTo}
          onSelectDonation={(donation) => {
            setSelectedDonation(donation);
            navigateTo('donations');
          }}
        />
      )}

      {currentScreen === 'create' && (
        <CreateDonation
          onNavigate={navigateTo}
          onDonationCreated={handleDonationCreated}
        />
      )}

      {currentScreen === 'donations' && (
        <MyDonations
          donations={donations}
          onNavigate={navigateTo}
          selectedDonation={selectedDonation}
          onSelectDonation={handleSelectDonation}
        />
      )}
    </DonorLayout>
  );
};

export default App;
