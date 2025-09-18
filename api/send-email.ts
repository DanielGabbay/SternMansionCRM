import { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

interface BookingData {
  id: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  startDate: string;
  endDate: string;
  unitName: string;
  price: number;
  adults: number;
  children: number;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { booking, pdfData }: { booking: BookingData; pdfData: string } = request.body;

    if (!booking || !pdfData) {
      return response.status(400).json({ error: 'Missing required data' });
    }
    
    // Validate booking data
    if (!booking.customer || !booking.customer.email || booking.customer.email.trim() === '') {
      console.error('Invalid booking data:', {
        hasCustomer: !!booking.customer,
        email: booking.customer?.email,
        booking: booking
      });
      return response.status(400).json({ error: 'Customer email is required' });
    }

    // Validate environment variables
    const emailConfig = {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };

    if (!emailConfig.host || !emailConfig.auth.user || !emailConfig.auth.pass) {
      return response.status(500).json({ error: 'Email configuration missing' });
    }

    // Create transporter
    const transporter = nodemailer.createTransporter(emailConfig);

    // Convert base64 PDF to buffer
    const pdfBuffer = Buffer.from(pdfData.split(',')[1] || pdfData, 'base64');

    // Format dates for Hebrew locale
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // Email content in Hebrew
    const emailSubject = `אישור הזמנה - אחוזת שטרן - ${booking.customer.fullName}`;
    
    const emailHtml = `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c5aa0; text-align: center; border-bottom: 2px solid #2c5aa0; padding-bottom: 10px;">
          אחוזת שטרן - אישור הזמנה
        </h2>
        
        <p>שלום ${booking.customer.fullName},</p>
        
        <p>תודה שבחרת באחוזת שטרן! ההזמנה שלך אושרה בהצלחה.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c5aa0;">פרטי ההזמנה:</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 8px 0;"><strong>מספר הזמנה:</strong> ${booking.id}</li>
            <li style="margin: 8px 0;"><strong>יחידת אירוח:</strong> ${booking.unitName}</li>
            <li style="margin: 8px 0;"><strong>תאריך כניסה:</strong> ${formatDate(booking.startDate)} (החל מ-15:00)</li>
            <li style="margin: 8px 0;"><strong>תאריך יציאה:</strong> ${formatDate(booking.endDate)} (עד 11:00)</li>
            <li style="margin: 8px 0;"><strong>מספר אורחים:</strong> ${booking.adults} מבוגרים, ${booking.children} ילדים</li>
            <li style="margin: 8px 0;"><strong>מחיר סופי:</strong> ${booking.price.toLocaleString()} ₪</li>
          </ul>
        </div>
        
        <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #0066cc;">מידע חשוב:</h4>
          <ul>
            <li>הכניסה החל מהשעה 15:00 והיציאה עד השעה 11:00</li>
            <li>יתרת התשלום תתבצע עם ההגעה למתחם</li>
            <li>במצורף ההסכם החתום למסמכיכם</li>
          </ul>
        </div>
        
        <p>נשמח לראותכם בקרוב!</p>
        
        <div style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 20px; font-size: 14px; color: #666;">
          <p><strong>אחוזת שטרן</strong></p>
          <p>טלפון: 052-1234567 | אימייל: info@stern-mansion.co.il</p>
        </div>
      </div>
    `;

    const emailText = `
שלום ${booking.customer.fullName},

תודה שבחרת באחוזת שטרן! ההזמנה שלך אושרה בהצלחה.

פרטי ההזמנה:
- מספר הזמנה: ${booking.id}
- יחידת אירוח: ${booking.unitName}
- תאריך כניסה: ${formatDate(booking.startDate)} (החל מ-15:00)
- תאריך יציאה: ${formatDate(booking.endDate)} (עד 11:00)
- מספר אורחים: ${booking.adults} מבוגרים, ${booking.children} ילדים
- מחיר סופי: ${booking.price.toLocaleString()} ₪

מידע חשוב:
- הכניסה החל מהשעה 15:00 והיציאה עד השעה 11:00
- יתרת התשלום תתבצע עם ההגעה למתחם
- במצורף ההסכם החתום למסמכיכם

נשמח לראותכם בקרוב!

אחוזת שטרן
טלפון: 052-1234567
אימייל: info@stern-mansion.co.il
    `;

    // Send email
    const mailOptions = {
      from: {
        name: 'אחוזת שטרן',
        address: emailConfig.auth.user,
      },
      to: booking.customer.email,
      bcc: emailConfig.auth.user, // Send copy to business
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
      attachments: [
        {
          filename: `הזמנה_${booking.customer.fullName}_${booking.id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return response.status(200).json({ 
      success: true, 
      message: 'Email sent successfully' 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return response.status(500).json({ 
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}