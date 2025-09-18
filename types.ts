
export enum BookingStatus {
  Pending = 'בהמתנה',
  Confirmed = 'מאושרת',
  Cancelled = 'מבוטלת',
}

export interface Unit {
  id: string;
  name: string;
}

export interface Customer {
  fullName: string;
  phone: string;
  email: string;
  idNumber: string;
}

export interface Booking {
  id: string;
  unitId: string;
  customer: Customer;
  startDate: Date;
  endDate: Date;
  adults: number;
  children: number;
  price: number;
  status: BookingStatus;
  internalNotes?: string;
  signature?: string; // base64 data URL
  signedDate?: Date;
}

export interface BlockedDate {
  id: string;
  unitId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
}
