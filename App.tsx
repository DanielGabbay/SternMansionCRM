import React, { useState, createContext, useContext, useCallback, useMemo, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import type { Booking, Unit, BlockedDate, Customer } from './types';
import { BookingStatus } from './types';
import DashboardPage from './pages/DashboardPage';
import SignaturePage from './pages/SignaturePage';
import SettingsPage from './pages/SettingsPage';

// --- INITIAL DATA ---
const INITIAL_UNITS: Unit[] = [
  { id: 'unit1', name: 'סוויטת אבן' },
  { id: 'unit2', name: 'סוויטת עץ' },
  { id: 'unit3', name: 'בקתת יוקרה' },
];

const today = new Date();
const getFutureDate = (days: number) => new Date(new Date().setDate(today.getDate() + days));

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'booking1',
    unitId: 'unit1',
    customer: { fullName: 'משפחת כהן', phone: '052-1234567', email: 'cohen@email.com', idNumber: '123456789' },
    startDate: getFutureDate(3),
    endDate: getFutureDate(5),
    adults: 2,
    children: 0,
    price: 2400,
    status: BookingStatus.Confirmed,
    signedDate: getFutureDate(0),
    signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
  },
  {
    id: 'booking2',
    unitId: 'unit2',
    customer: { fullName: 'זוג לוי', phone: '054-7654321', email: 'levi@email.com', idNumber: '987654321' },
    startDate: getFutureDate(8),
    endDate: getFutureDate(10),
    adults: 2,
    children: 0,
    price: 2200,
    status: BookingStatus.Pending,
  },
];

const INITIAL_BLOCKED_DATES: BlockedDate[] = [
    { id: 'block1', unitId: 'unit3', startDate: getFutureDate(12), endDate: getFutureDate(15), reason: 'תחזוקה' }
];


// --- BOOKING CONTEXT ---
interface BookingContextType {
  units: Unit[];
  bookings: Booking[];
  blockedDates: BlockedDate[];
  appUrl: string;
  getBookingById: (id: string) => Booking | undefined;
  addBooking: (booking: Omit<Booking, 'id'>) => Booking;
  updateBooking: (booking: Booking) => void;
  addBlockedDate: (blockedDate: Omit<BlockedDate, 'id'>) => void;
  addUnit: (unit: Omit<Unit, 'id'>) => void;
  updateUnit: (unit: Unit) => void;
  deleteUnit: (unitId: string) => void;
  updateAppUrl: (url: string) => void;
}

const BookingContext = createContext<BookingContextType | null>(null);

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingsProvider');
  }
  return context;
};

// --- DATA PERSISTENCE HELPERS ---
const loadFromStorage = (key: string, fallbackData: any[]) => {
    try {
        const item = window.localStorage.getItem(key);
        if (!item) return fallbackData;
        
        const parsed = JSON.parse(item);

        if (key === 'bookings') {
            return parsed.map((b: any) => ({
                ...b,
                startDate: new Date(b.startDate),
                endDate: new Date(b.endDate),
                signedDate: b.signedDate ? new Date(b.signedDate) : undefined,
            }));
        }
        if (key === 'blockedDates') {
            return parsed.map((b: any) => ({
                ...b,
                startDate: new Date(b.startDate),
                endDate: new Date(b.endDate),
            }));
        }
        return parsed;
    } catch (error) {
        console.error(`Error loading ${key} from localStorage`, error);
        return fallbackData;
    }
};

const saveToStorage = (key: string, data: any) => {
    try {
        window.localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving ${key} to localStorage`, error);
    }
};


// --- APP COMPONENT ---
const App: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>(() => loadFromStorage('units', INITIAL_UNITS));
  const [bookings, setBookings] = useState<Booking[]>(() => loadFromStorage('bookings', INITIAL_BOOKINGS));
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>(() => loadFromStorage('blockedDates', INITIAL_BLOCKED_DATES));
  const [appUrl, setAppUrl] = useState<string>(() => window.localStorage.getItem('appUrl') || window.location.origin);

  useEffect(() => { saveToStorage('units', units); }, [units]);
  useEffect(() => { saveToStorage('bookings', bookings); }, [bookings]);
  useEffect(() => { saveToStorage('blockedDates', blockedDates); }, [blockedDates]);
  useEffect(() => { saveToStorage('appUrl', appUrl); }, [appUrl]);

  const getBookingById = useCallback((id: string) => {
    return bookings.find(b => b.id === id);
  }, [bookings]);

  const addBooking = useCallback((bookingData: Omit<Booking, 'id'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: `booking_${Date.now()}`,
    };
    setBookings(prev => [...prev, newBooking]);
    return newBooking;
  }, []);

  const updateBooking = useCallback((updatedBooking: Booking) => {
    setBookings(prev => prev.map(b => (b.id === updatedBooking.id ? updatedBooking : b)));
  }, []);
    
  const addBlockedDate = useCallback((data: Omit<BlockedDate, 'id'>) => {
    const newBlockedDate: BlockedDate = {
      ...data,
      id: `block_${Date.now()}`,
    };
    setBlockedDates(prev => [...prev, newBlockedDate]);
  }, []);

  const addUnit = useCallback((unitData: Omit<Unit, 'id'>) => {
      const newUnit: Unit = {
          ...unitData,
          id: `unit_${Date.now()}`,
      };
      setUnits(prev => [...prev, newUnit]);
  }, []);

  const updateUnit = useCallback((updatedUnit: Unit) => {
      setUnits(prev => prev.map(u => u.id === updatedUnit.id ? updatedUnit : u));
  }, []);

  const deleteUnit = useCallback((unitId: string) => {
      setUnits(prev => prev.filter(u => u.id !== unitId));
  }, []);

  const updateAppUrl = useCallback((url: string) => {
      setAppUrl(url);
  }, []);

  const contextValue = useMemo(() => ({
    units,
    bookings,
    blockedDates,
    appUrl,
    getBookingById,
    addBooking,
    updateBooking,
    addBlockedDate,
    addUnit,
    updateUnit,
    deleteUnit,
    updateAppUrl,
  }), [units, bookings, blockedDates, appUrl, getBookingById, addBooking, updateBooking, addBlockedDate, addUnit, updateUnit, deleteUnit, updateAppUrl]);

  return (
    <BookingContext.Provider value={contextValue}>
      <div className="bg-base-200 min-h-screen text-base-content font-sans">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/sign/:bookingId" element={<SignaturePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </BookingContext.Provider>
  );
};

export default App;