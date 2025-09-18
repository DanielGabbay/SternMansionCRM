import { createClient } from '@supabase/supabase-js'
import type { Booking, Unit, BlockedDate } from './types'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      units: {
        Row: Unit
        Insert: Omit<Unit, 'id'>
        Update: Partial<Unit>
      }
      bookings: {
        Row: Omit<Booking, 'startDate' | 'endDate' | 'signedDate'> & {
          start_date: string
          end_date: string
          signed_date?: string
          full_name: string
          phone: string
          email: string
          id_number: string
        }
        Insert: Omit<Booking, 'id' | 'startDate' | 'endDate' | 'signedDate'> & {
          start_date: string
          end_date: string
          signed_date?: string
          full_name: string
          phone: string
          email: string
          id_number: string
        }
        Update: Partial<Booking>
      }
      blocked_dates: {
        Row: Omit<BlockedDate, 'startDate' | 'endDate'> & {
          start_date: string
          end_date: string
        }
        Insert: Omit<BlockedDate, 'id' | 'startDate' | 'endDate'> & {
          start_date: string
          end_date: string
        }
        Update: Partial<BlockedDate>
      }
      app_settings: {
        Row: {
          id: string
          key: string
          value: string
          created_at: string
          updated_at: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: Partial<{
          key: string
          value: string
        }>
      }
    }
  }
}

export type SupabaseClient = typeof supabase