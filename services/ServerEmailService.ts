import type { Booking } from '../types';

export class ServerEmailService {
  private static baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : window.location.origin;

  /**
   * Check if the server-side email service is configured
   */
  static isConfigured(): boolean {
    // In production, we assume the Vercel function is available
    // In development, we check if the environment variables exist
    return process.env.NODE_ENV === 'production' || 
           !!(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);
  }

  /**
   * Send confirmation email with PDF attachment using server-side function
   */
  static async sendConfirmationEmail(
    booking: Booking,
    unitName: string,
    pdfDataUrl: string
  ): Promise<boolean> {
    try {
      console.log('Sending email via server-side function...');
      
      // Debug booking data
      console.log('Original booking data:', {
        id: booking.id,
        customerEmail: booking.customer?.email,
        customerFullName: booking.customer?.fullName,
        hasCustomer: !!booking.customer
      });
      
      // Validate email before sending
      if (!booking.customer?.email || booking.customer.email.trim() === '') {
        console.error('Customer email is missing or empty:', booking.customer);
        throw new Error('Customer email is required');
      }
      
      // Prepare booking data for the server
      const bookingData = {
        id: booking.id,
        customer: {
          fullName: booking.customer.fullName,
          email: booking.customer.email.trim(),
          phone: booking.customer.phone,
        },
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        unitName: unitName,
        price: booking.price,
        adults: booking.adults,
        children: booking.children,
      };
      
      console.log('Prepared booking data for server:', bookingData);

      // Send POST request to Vercel function
      const response = await fetch(`${this.baseUrl}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking: bookingData,
          pdfData: pdfDataUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server responded with error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Email sent successfully:', result);
      return true;

    } catch (error) {
      console.error('Error sending email via server:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          console.error('Network error - check if the server is running');
        } else if (error.message.includes('Server error: 500')) {
          console.error('Server configuration error - check environment variables');
        }
      }
      
      return false;
    }
  }

  /**
   * Test the email service configuration
   */
  static async testConfiguration(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: true,
        }),
      });

      if (response.ok) {
        return { success: true, message: 'Server email service is configured correctly' };
      } else {
        const error = await response.json().catch(() => ({}));
        return { 
          success: false, 
          message: `Server error: ${error.error || response.statusText}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}