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
  // Helper function to compress base64 data or check size
  static compressBase64(base64String: string, maxSizeKB: number = 45): string | null {
    const sizeInKB = (base64String.length * 3) / 4 / 1024 // Approximate size in KB
    
    console.log(`PDF size: ${sizeInKB.toFixed(2)}KB, limit: ${maxSizeKB}KB`)
    
    if (sizeInKB <= maxSizeKB) {
      return base64String
    }
    
    console.warn('PDF too large for email attachment, email will be sent without PDF')
    return null
  }

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
      console.log('Starting email send process...')
      
      const initialized = await this.init()
      if (!initialized) {
        console.error('EmailJS initialization failed')
        return false
      }

      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
        console.error('EmailJS configuration missing:', { 
          hasServiceId: !!EMAILJS_SERVICE_ID, 
          hasTemplateId: !!EMAILJS_TEMPLATE_ID,
          hasPublicKey: !!EMAILJS_PUBLIC_KEY
        })
        return false
      }

      console.log('EmailJS configured, preparing email...')
      
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
        pdf_attachment: data.pdfBase64 || '',
        pdf_filename: data.pdfFileName || '',
        has_pdf: !!data.pdfBase64,
        pdf_note: data.pdfBase64 ? 'במצורף תמצאו את ההסכם החתום.' : 'עקב גודל המסמך, אנא פנו אלינו לקבלת ההסכם החתום.',
        reply_to: 'info@stern-mansion.co.il'
      }

      console.log('Sending email with params:', {
        to_email: templateParams.to_email,
        customer_name: templateParams.customer_name,
        booking_id: templateParams.booking_id,
        has_pdf: !!templateParams.pdf_attachment
      })

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      )

      console.log('Email sent successfully:', response)
      return true

    } catch (error) {
      console.error('Error sending email:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      
      // If it's a configuration error, don't retry
      if (error instanceof Error && error.message.includes('not configured')) {
        console.warn('EmailJS not configured properly, email sending disabled')
      }
      
      return false
    }
  }

  static async sendConfirmationEmail(booking: Booking, unitName: string, pdfDataUrl: string): Promise<boolean> {
    try {
      // Convert PDF data URL to base64 string (remove the data:application/pdf;base64, prefix)
      const base64Pdf = pdfDataUrl.split(',')[1] || pdfDataUrl
      
      // Check and potentially compress the PDF
      const compressedPdf = this.compressBase64(base64Pdf)
      
      const emailData: EmailData = {
        booking,
        unitName,
        pdfBase64: compressedPdf || '', // Empty string if too large
        pdfFileName: compressedPdf ? `הזמנה_${booking.customer.fullName}_${booking.id}.pdf` : ''
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