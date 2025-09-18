import jsPDF from 'jspdf'
import type { Booking } from '../types'

export const generateSimplePDF = async (booking: Booking, unitName: string): Promise<string> => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Hebrew date formatting
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date)
    }

    // Set up RTL text direction and Hebrew font
    pdf.setR2L(true)
    
    let y = 20 // Starting Y position
    const pageWidth = 210
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)

    // Title
    pdf.setFontSize(24)
    pdf.setFont(undefined, 'bold')
    pdf.text('אישור הזמנה והסכם אירוח', pageWidth / 2, y, { align: 'center' })
    
    y += 10
    pdf.setFontSize(18)
    pdf.setFont(undefined, 'normal')
    pdf.text('אחוזת שטרן', pageWidth / 2, y, { align: 'center' })
    
    y += 20
    
    // Greeting
    pdf.setFontSize(14)
    const greeting = `שלום ${booking.customer.fullName},`
    pdf.text(greeting, pageWidth - margin, y, { align: 'right' })
    
    y += 10
    const intro = 'שמחנו לקבל את הזמנתכם לאירוח באחוזת שטרן. להלן פרטי ההזמנה והתנאים:'
    const introLines = pdf.splitTextToSize(intro, contentWidth - 10)
    pdf.text(introLines, pageWidth - margin, y, { align: 'right' })
    
    y += introLines.length * 7 + 10
    
    // Booking details box
    pdf.setDrawColor(200, 200, 200)
    pdf.setFillColor(245, 245, 245)
    pdf.roundedRect(margin, y, contentWidth, 50, 3, 3, 'FD')
    
    y += 7
    pdf.setFontSize(16)
    pdf.setFont(undefined, 'bold')
    pdf.text('פרטי ההזמנה:', pageWidth - margin - 5, y, { align: 'right' })
    
    y += 10
    pdf.setFontSize(12)
    pdf.setFont(undefined, 'normal')
    
    const details = [
      `מספר הזמנה: ${booking.id}`,
      `שם האורח: ${booking.customer.fullName}`,
      `יחידת האירוח: ${unitName}`,
      `תאריך כניסה: ${formatDate(booking.startDate)} (החל מ-15:00)`,
      `תאריך יציאה: ${formatDate(booking.endDate)} (עד 11:00)`,
      `מספר אורחים: ${booking.adults} מבוגרים, ${booking.children} ילדים`
    ]
    
    // Split details into two columns
    const leftColumn = details.slice(0, 3)
    const rightColumn = details.slice(3)
    
    let detailY = y
    rightColumn.forEach(detail => {
      pdf.text(detail, pageWidth - margin - 5, detailY, { align: 'right' })
      detailY += 6
    })
    
    detailY = y
    leftColumn.forEach(detail => {
      pdf.text(detail, pageWidth / 2 - 5, detailY, { align: 'right' })
      detailY += 6
    })
    
    y += 60
    
    // Payment terms
    pdf.setFontSize(14)
    pdf.setFont(undefined, 'bold')
    pdf.text('תנאי התשלום:', pageWidth - margin, y, { align: 'right' })
    
    y += 10
    pdf.setFontSize(12)
    pdf.setFont(undefined, 'normal')
    const paymentText = `סה"כ עלות האירוח: ${booking.price.toLocaleString()} ₪`
    pdf.text(paymentText, pageWidth - margin, y, { align: 'right' })
    
    y += 7
    const paymentDetails = 'יתרת התשלום תתבצע עם ההגעה למתחם באמצעי התשלום: אשראי / מזומן / העברה בנקאית.'
    const paymentLines = pdf.splitTextToSize(paymentDetails, contentWidth - 10)
    pdf.text(paymentLines, pageWidth - margin, y, { align: 'right' })
    
    y += paymentLines.length * 7 + 15
    
    // Rules section
    pdf.setFontSize(14)
    pdf.setFont(undefined, 'bold')
    pdf.text('כללי אירוח והתנהלות במתחם:', pageWidth - margin, y, { align: 'right' })
    
    y += 10
    pdf.setFontSize(12)
    pdf.setFont(undefined, 'normal')
    
    const rules = [
      'הכניסה החל מהשעה 15:00 והיציאה עד השעה 11:00.',
      'העישון בתוך הסוויטות אסור בהחלט.',
      'השימוש במתקני הבריכה והג\'קוזי הינו באחריות האורחים בלבד.',
      'אין להשמיע מוזיקה רועשת או להקים רעש בשעות המנוחה.',
      'לא תתאפשר כניסת אורחים נוספים למתחם מעבר למצוין בהזמנה.'
    ]
    
    rules.forEach(rule => {
      const bullet = '• '
      const ruleText = bullet + rule
      const ruleLines = pdf.splitTextToSize(ruleText, contentWidth - 10)
      pdf.text(ruleLines, pageWidth - margin, y, { align: 'right' })
      y += ruleLines.length * 7 + 2
    })
    
    y += 10
    
    // Cancellation policy
    pdf.setFontSize(14)
    pdf.setFont(undefined, 'bold')
    pdf.text('מדיניות ביטולים:', pageWidth - margin, y, { align: 'right' })
    
    y += 10
    pdf.setFontSize(12)
    pdf.setFont(undefined, 'normal')
    
    const cancellationRules = [
      'הודעת ביטול עד 14 ימים לפני מועד האירוח: ללא דמי ביטול.',
      'הודעת ביטול בין 14 ל-7 ימים לפני מועד האירוח: חיוב של 50% מעלות ההזמנה.',
      'הודעת ביטול בפחות מ-7 ימים לפני מועד האירוח או אי-הגעה: חיוב מלא.'
    ]
    
    cancellationRules.forEach(rule => {
      const bullet = '• '
      const ruleText = bullet + rule
      const ruleLines = pdf.splitTextToSize(ruleText, contentWidth - 10)
      pdf.text(ruleLines, pageWidth - margin, y, { align: 'right' })
      y += ruleLines.length * 7 + 2
    })
    
    y += 15
    
    // Signature section
    pdf.setDrawColor(0, 0, 0)
    pdf.line(margin, y, pageWidth - margin, y)
    
    y += 10
    pdf.setFontSize(14)
    pdf.setFont(undefined, 'bold')
    pdf.text('הצהרת האורח וחתימה:', pageWidth - margin, y, { align: 'right' })
    
    y += 10
    pdf.setFontSize(12)
    pdf.setFont(undefined, 'normal')
    pdf.text('אני מאשר/ת שקראתי והבנתי את כל תנאי ההסכם.', pageWidth - margin, y, { align: 'right' })
    
    y += 15
    
    // Customer details
    pdf.text(`שם מלא: ${booking.customer.fullName}`, pageWidth - margin, y, { align: 'right' })
    y += 7
    const signedDateText = `תאריך חתימה: ${formatDate(booking.signedDate || new Date())}`
    pdf.text(signedDateText, pageWidth - margin, y, { align: 'right' })
    
    // Signature box
    const signatureX = margin + 20
    const signatureY = y - 15
    pdf.setDrawColor(0, 0, 0)
    pdf.rect(signatureX, signatureY, 60, 20)
    pdf.setFontSize(10)
    pdf.text('חתימת האורח', signatureX + 30, signatureY + 25, { align: 'center' })
    
    // Add signature image if available
    if (booking.signature) {
      try {
        pdf.addImage(booking.signature, 'PNG', signatureX + 2, signatureY + 2, 56, 16)
      } catch (signatureError) {
        console.warn('Could not add signature to PDF:', signatureError)
      }
    }
    
    y += 30
    
    // Footer
    pdf.setFontSize(10)
    pdf.setFont(undefined, 'normal')
    pdf.setDrawColor(200, 200, 200)
    pdf.line(margin, y, pageWidth - margin, y)
    
    y += 7
    pdf.text('מסמך זה נוצר אוטומטית על ידי מערכת ניהול אחוזת שטרן', pageWidth / 2, y, { align: 'center' })
    y += 5
    pdf.text('לפניות: info@stern-mansion.co.il | 052-1234567', pageWidth / 2, y, { align: 'center' })
    
    return pdf.output('datauristring')
    
  } catch (error) {
    console.error('Error generating simple PDF:', error)
    throw new Error('שגיאה ביצירת המסמך הפשוט')
  }
}