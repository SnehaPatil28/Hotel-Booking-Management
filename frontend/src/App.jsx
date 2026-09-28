import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import RoomGrid from './components/RoomGrid';
import ReservationEngine from './components/ReservationEngine';
import BillingModule from './components/BillingModule';
import HousekeepingTracker from './components/HousekeepingTracker';
import BookingModal from './components/BookingModal';
import PortalSelection from './components/PortalSelection';

// ─── Staff PMS Shell ─────────────────────────────────────────────────────────
function StaffApp({ onSwitchPortal }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { userRole } = useApp();

  // Default landing tab per role
  React.useEffect(() => {
    if (userRole === 'HOUSEKEEPING') {
      setActiveTab('housekeeping');
    } else {
      setActiveTab('dashboard');
    }
  }, [userRole]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSwitchPortal={onSwitchPortal}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            setActiveTab={setActiveTab}
            onOpenBookingModal={() => setIsBookingModalOpen(true)}
          />
        )}
        {activeTab === 'rooms' && <RoomGrid />}
        {activeTab === 'reservations' && (
          <ReservationEngine onOpenBookingModal={() => setIsBookingModalOpen(true)} />
        )}
        {activeTab === 'billing' && <BillingModule />}
        {activeTab === 'housekeeping' && <HousekeepingTracker />}
      </main>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />

      <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-400 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Aura Boutique Hotel — Property Management System</span>
          <div className="flex items-center gap-4 text-[11px] text-gray-400">
            <span>Client-side Sync</span>
            <span>•</span>
            <span>Role-Based Access Control</span>
            <span>•</span>
            <span>Automated Refunds</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Root App Router ──────────────────────────────────────────────────────────
function AppRouter() {
  const { userRole, switchRole } = useApp();

  // No role selected → Portal Selection screen
  if (!userRole) {
    return <PortalSelection />;
  }

  // Staff portal (ADMIN, FRONT_DESK, HOUSEKEEPING)
  return (
    <StaffApp onSwitchPortal={() => switchRole(null)} />
  );
}

// ─── Entry Point ──────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
