import emailjs from '@emailjs/browser'
import type { Booking } from '../types'

// EmailJS configuration
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || ''
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || ''
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''

export interface EmailData {
  booking: Booking
  unitName: string
  pdfBase64: string
  pdfFileName: string
}

export class EmailService {
  static async init() {
    if (!EMAILJS_PUBLIC_KEY) {
      console.warn('EmailJS public key not configured')
      return false
    }
    
    try {
      emailjs.init(EMAILJS_PUBLIC_KEY)
      return true
    } catch (error) {
      console.error('Failed to initialize EmailJS:', error)
      return false
    }
  }

  static async sendAgreementEmail(data: EmailData): Promise<boolean> {
    try {
      const initialized = await this.init()
      if (!initialized) {
        throw new Error('EmailJS not properly configured')
      }

      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
        throw new Error('EmailJS service or template ID not configured')
      }

      // Prepare email template parameters
      const templateParams = {
        to_email: data.booking.customer.email,
        to_name: data.booking.customer.fullName,
        customer_name: data.booking.customer.fullName,
        booking_id: data.booking.id,
        unit_name: data.unitName,
        checkin_date: data.booking.startDate.toLocaleDateString('he-IL'),
        checkout_date: data.booking.endDate.toLocaleDateString('he-IL'),
        total_price: data.booking.price.toLocaleString(),
        adults: data.booking.adults,
        children: data.booking.children,
        pdf_attachment: data.pdfBase64,
        pdf_filename: data.pdfFileName,
        reply_to: 'info@stern-mansion.co.il'
      }

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      )

      console.log('Email sent successfully:', response)
      return true

    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  static async sendConfirmationEmail(booking: Booking, unitName: string, pdfDataUrl: string): Promise<boolean> {
    try {
      // Convert PDF data URL to base64 string (remove the data:application/pdf;base64, prefix)
      const base64Pdf = pdfDataUrl.split(',')[1] || pdfDataUrl
      
      const emailData: EmailData = {
        booking,
        unitName,
        pdfBase64: base64Pdf,
        pdfFileName: `הזמנה_${booking.customer.fullName}_${booking.id}.pdf`
      }

      return await this.sendAgreementEmail(emailData)
      
    } catch (error) {
      console.error('Error in sendConfirmationEmail:', error)
      return false
    }
  }

  static isConfigured(): boolean {
    return !!(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY)
  }

  static getConfigStatus(): { configured: boolean; missing: string[] } {
    const missing: string[] = []
    
    if (!EMAILJS_SERVICE_ID) missing.push('VITE_EMAILJS_SERVICE_ID')
    if (!EMAILJS_TEMPLATE_ID) missing.push('VITE_EMAILJS_TEMPLATE_ID')  
    if (!EMAILJS_PUBLIC_KEY) missing.push('VITE_EMAILJS_PUBLIC_KEY')

    return {
      configured: missing.length === 0,
      missing
    }
  }
}