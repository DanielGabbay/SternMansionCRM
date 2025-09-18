import React, { createContext, useContext, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import type { Booking, Unit, BlockedDate } from './types';
import DashboardPage from './pages/DashboardPage';
import SignaturePage from './pages/SignaturePage';
import SettingsPage from './pages/SettingsPage';
import { Analytics } from '@vercel/analytics/react';
import { useSupabaseData } from './hooks/useSupabaseData';
import LoadingErrorWrapper from './components/LoadingErrorWrapper';



// --- BOOKING CONTEXT ---
interface BookingContextType {
  units: Unit[];
  bookings: Booking[];
  blockedDates: BlockedDate[];
  appUrl: string;
  loading: boolean;
  error: string | null;
  getBookingById: (id: string) => Booking | undefined;
  addBooking: (booking: Omit<Booking, 'id'>) => Promise<Booking>;
  updateBooking: (booking: Booking) => Promise<void>;
  addBlockedDate: (blockedDate: Omit<BlockedDate, 'id'>) => Promise<void>;
  addUnit: (unit: Omit<Unit, 'id'>) => Promise<void>;
  updateUnit: (unit: Unit) => Promise<void>;
  deleteUnit: (unitId: string) => Promise<void>;
  updateAppUrl: (url: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType | null>(null);

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingsProvider');
  }
  return context;
};



// --- APP COMPONENT ---
const App: React.FC = () => {
  const supabaseData = useSupabaseData();

  const contextValue = useMemo(() => ({
    units: supabaseData.units,
    bookings: supabaseData.bookings,
    blockedDates: supabaseData.blockedDates,
    appUrl: supabaseData.appUrl,
    loading: supabaseData.loading,
    error: supabaseData.error,
    getBookingById: supabaseData.getBookingById,
    addBooking: supabaseData.addBooking,
    updateBooking: supabaseData.updateBooking,
    addBlockedDate: supabaseData.addBlockedDate,
    addUnit: supabaseData.addUnit,
    updateUnit: supabaseData.updateUnit,
    deleteUnit: supabaseData.deleteUnit,
    updateAppUrl: supabaseData.updateAppUrl,
    refetch: supabaseData.refetch,
  }), [supabaseData]);

  return (
    <BookingContext.Provider value={contextValue}>
      <Analytics />
      <LoadingErrorWrapper 
        loading={supabaseData.loading} 
        error={supabaseData.error}
        onRetry={supabaseData.refetch}
      >
        <div className="bg-base-200 min-h-screen text-base-content font-sans">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/sign/:bookingId" element={<SignaturePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </LoadingErrorWrapper>
    </BookingContext.Provider>
  );
};

export default App;