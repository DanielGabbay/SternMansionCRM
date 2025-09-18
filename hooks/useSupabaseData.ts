import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import type { Booking, Unit, BlockedDate, BookingStatus } from '../types'

// Helper functions to convert between app types and database types
const dbBookingToBooking = (dbBooking: any): Booking => ({
  ...dbBooking,
  customer: {
    fullName: dbBooking.full_name,
    phone: dbBooking.phone,
    email: dbBooking.email,
    idNumber: dbBooking.id_number,
  },
  startDate: new Date(dbBooking.start_date),
  endDate: new Date(dbBooking.end_date),
  signedDate: dbBooking.signed_date ? new Date(dbBooking.signed_date) : undefined,
})

const bookingToDbBooking = (booking: Omit<Booking, 'id'>) => ({
  unit_id: booking.unitId,
  full_name: booking.customer.fullName,
  phone: booking.customer.phone,
  email: booking.customer.email,
  id_number: booking.customer.idNumber,
  start_date: booking.startDate.toISOString(),
  end_date: booking.endDate.toISOString(),
  adults: booking.adults,
  children: booking.children,
  price: booking.price,
  status: booking.status,
  internal_notes: booking.internalNotes,
  signature: booking.signature,
  signed_date: booking.signedDate?.toISOString(),
})

const dbBlockedDateToBlockedDate = (dbBlockedDate: any): BlockedDate => ({
  ...dbBlockedDate,
  startDate: new Date(dbBlockedDate.start_date),
  endDate: new Date(dbBlockedDate.end_date),
})

const blockedDateToDbBlockedDate = (blockedDate: Omit<BlockedDate, 'id'>) => ({
  unit_id: blockedDate.unitId,
  start_date: blockedDate.startDate.toISOString(),
  end_date: blockedDate.endDate.toISOString(),
  reason: blockedDate.reason,
})

export const useSupabaseData = () => {
  const [units, setUnits] = useState<Unit[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [appUrl, setAppUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load units
      const { data: unitsData, error: unitsError } = await supabase
        .from('units')
        .select('*')

      if (unitsError) throw unitsError

      // Load bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')

      if (bookingsError) throw bookingsError

      // Load blocked dates
      const { data: blockedDatesData, error: blockedDatesError } = await supabase
        .from('blocked_dates')
        .select('*')

      if (blockedDatesError) throw blockedDatesError

      // Load app settings
      const { data: appUrlData, error: appUrlError } = await supabase
        .from('app_settings')
        .select('*')
        .eq('key', 'app_url')
        .single()

      if (appUrlError && appUrlError.code !== 'PGRST116') throw appUrlError

      setUnits(unitsData || [])
      setBookings(bookingsData?.map(dbBookingToBooking) || [])
      setBlockedDates(blockedDatesData?.map(dbBlockedDateToBlockedDate) || [])
      setAppUrl(appUrlData?.value || window.location.origin)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Units operations
  const addUnit = useCallback(async (unitData: Omit<Unit, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('units')
        .insert([unitData])
        .select()
        .single()

      if (error) throw error

      setUnits(prev => [...prev, data])
    } catch (err) {
      console.error('Error adding unit:', err)
      throw err
    }
  }, [])

  const updateUnit = useCallback(async (unit: Unit) => {
    try {
      const { error } = await supabase
        .from('units')
        .update({ name: unit.name })
        .eq('id', unit.id)

      if (error) throw error

      setUnits(prev => prev.map(u => u.id === unit.id ? unit : u))
    } catch (err) {
      console.error('Error updating unit:', err)
      throw err
    }
  }, [])

  const deleteUnit = useCallback(async (unitId: string) => {
    try {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', unitId)

      if (error) throw error

      setUnits(prev => prev.filter(u => u.id !== unitId))
    } catch (err) {
      console.error('Error deleting unit:', err)
      throw err
    }
  }, [])

  // Bookings operations
  const addBooking = useCallback(async (bookingData: Omit<Booking, 'id'>) => {
    try {
      const dbData = bookingToDbBooking(bookingData)
      const { data, error } = await supabase
        .from('bookings')
        .insert([dbData])
        .select()
        .single()

      if (error) throw error

      const newBooking = dbBookingToBooking(data)
      setBookings(prev => [...prev, newBooking])
      return newBooking
    } catch (err) {
      console.error('Error adding booking:', err)
      throw err
    }
  }, [])

  const updateBooking = useCallback(async (booking: Booking) => {
    try {
      const dbData = bookingToDbBooking(booking)
      const { error } = await supabase
        .from('bookings')
        .update(dbData)
        .eq('id', booking.id)

      if (error) throw error

      setBookings(prev => prev.map(b => b.id === booking.id ? booking : b))
    } catch (err) {
      console.error('Error updating booking:', err)
      throw err
    }
  }, [])

  // Blocked dates operations
  const addBlockedDate = useCallback(async (blockedDateData: Omit<BlockedDate, 'id'>) => {
    try {
      const dbData = blockedDateToDbBlockedDate(blockedDateData)
      const { data, error } = await supabase
        .from('blocked_dates')
        .insert([dbData])
        .select()
        .single()

      if (error) throw error

      const newBlockedDate = dbBlockedDateToBlockedDate(data)
      setBlockedDates(prev => [...prev, newBlockedDate])
    } catch (err) {
      console.error('Error adding blocked date:', err)
      throw err
    }
  }, [])

  // App URL operations
  const updateAppUrl = useCallback(async (url: string) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key: 'app_url', value: url })

      if (error) throw error

      setAppUrl(url)
    } catch (err) {
      console.error('Error updating app URL:', err)
      throw err
    }
  }, [])

  const getBookingById = useCallback((id: string) => {
    return bookings.find(b => b.id === id)
  }, [bookings])

  return {
    units,
    bookings,
    blockedDates,
    appUrl,
    loading,
    error,
    getBookingById,
    addBooking,
    updateBooking,
    addBlockedDate,
    addUnit,
    updateUnit,
    deleteUnit,
    updateAppUrl,
    refetch: loadData,
  }
}