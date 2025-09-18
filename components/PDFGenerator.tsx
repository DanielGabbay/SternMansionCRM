import React from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { Booking, Unit } from '../types'

interface PDFGeneratorProps {
  booking: Booking
  unitName: string
  children: React.ReactNode
}

export const PDFGenerator: React.FC<PDFGeneratorProps> = ({ booking, unitName, children }) => {
  
  const generatePDF = async (): Promise<string> => {
    try {
      // Create a temporary div for PDF content
      const pdfContent = document.createElement('div')
      pdfContent.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 210mm;
        min-height: 297mm;
        padding: 20mm;
        background: white;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #333;
        direction: rtl;
      `

      // Hebrew date formatting
      const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('he-IL', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(date)
      }

      // Create PDF HTML content
      pdfContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #333; padding-bottom: 20px;">
          <h1 style="font-size: 28px; margin: 0; font-weight: bold;">אישור הזמנה והסכם אירוח</h1>
          <h2 style="font-size: 20px; margin: 10px 0 0 0; color: #666;">אחוזת שטרן</h2>
        </div>

        <div style="margin-bottom: 30px;">
          <p style="font-size: 16px; margin-bottom: 20px;">
            שלום ${booking.customer.fullName},<br/>
            שמחנו לקבל את הזמנתכם לאירוח באחוזת שטרן. להלן פרטי ההזמנה והתנאים שאושרו על ידכם:
          </p>
        </div>

        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #333;">פרטי ההזמנה:</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <p style="margin: 5px 0;"><strong>מספר הזמנה:</strong><br/>${booking.id}</p>
            <p style="margin: 5px 0;"><strong>שם האורח:</strong><br/>${booking.customer.fullName}</p>
            <p style="margin: 5px 0;"><strong>יחידת האירוח:</strong><br/>${unitName}</p>
            <p style="margin: 5px 0;"><strong>תאריך כניסה:</strong><br/>${formatDate(booking.startDate)} (החל מ-15:00)</p>
            <p style="margin: 5px 0;"><strong>תאריך יציאה:</strong><br/>${formatDate(booking.endDate)} (עד 11:00)</p>
            <p style="margin: 5px 0;"><strong>מספר אורחים:</strong><br/>${booking.adults} מבוגרים, ${booking.children} ילדים</p>
          </div>
        </div>

        <h4 style="font-size: 16px; font-weight: bold; margin: 25px 0 15px 0;">תנאי התשלום:</h4>
        <p style="margin-bottom: 20px;">
          <strong>סה"כ עלות האירוח:</strong> ${booking.price.toLocaleString()} ₪<br/>
          יתרת התשלום תתבצע עם ההגעה למתחם באמצעי התשלום הבאים: אשראי / מזומן / העברה בנקאית.
        </p>

        <h4 style="font-size: 16px; font-weight: bold; margin: 25px 0 15px 0;">כללי אירוח והתנהלות במתחם:</h4>
        <ul style="margin-bottom: 20px; padding-right: 20px;">
          <li style="margin-bottom: 8px;">הכניסה החל מהשעה 15:00 והיציאה עד השעה 11:00.</li>
          <li style="margin-bottom: 8px;">העישון בתוך הסוויטות אסור בהחלט.</li>
          <li style="margin-bottom: 8px;">השימוש במתקני הבריכה והג'קוזי הינו באחריות האורחים בלבד.</li>
          <li style="margin-bottom: 8px;">אין להשמיע מוזיקה רועשת או להקים רעש בשעות המנוחה.</li>
          <li style="margin-bottom: 8px;">לא תתאפשר כניסת אורחים נוספים למתחם מעבר למצוין בהזמנה.</li>
        </ul>

        <h4 style="font-size: 16px; font-weight: bold; margin: 25px 0 15px 0;">מדיניות ביטולים:</h4>
        <ul style="margin-bottom: 30px; padding-right: 20px;">
          <li style="margin-bottom: 8px;">הודעת ביטול עד 14 ימים לפני מועד האירוח: ללא דמי ביטול.</li>
          <li style="margin-bottom: 8px;">הודעת ביטול בין 14 ל-7 ימים לפני מועד האירוח: חיוב של 50% מעלות ההזמנה.</li>
          <li style="margin-bottom: 8px;">הודעת ביטול בפחות מ-7 ימים לפני מועד האירוח או אי-הגעה: חיוב מלא.</li>
        </ul>

        <div style="border-top: 2px solid #333; padding-top: 20px; margin-top: 40px;">
          <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">הצהרת האורח וחתימה:</h4>
          <p style="margin-bottom: 15px;">אני מאשר/ת שקראתי והבנתי את כל תנאי ההסכם.</p>
          
          <div style="display: flex; justify-content: space-between; align-items: end; margin-top: 30px;">
            <div style="flex: 1;">
              <p style="margin: 0;"><strong>שם מלא:</strong> ${booking.customer.fullName}</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">תאריך חתימה: ${formatDate(booking.signedDate || new Date())}</p>
            </div>
            <div style="flex: 0 0 200px; text-align: center;">
              <div id="signature-container" style="border: 1px solid #333; height: 80px; width: 200px; margin: 0 auto; background: white; display: flex; align-items: center; justify-content: center;">
                ${booking.signature ? `<img src="${booking.signature}" style="max-width: 190px; max-height: 70px;" />` : '<span style="color: #999;">חתימה</span>'}
              </div>
              <p style="margin: 5px 0 0 0; font-size: 12px;">חתימת האורח</p>
            </div>
          </div>
        </div>

        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">
          <p>מסמך זה נוצר אוטומטית על ידי מערכת ניהול אחוזת שטרן</p>
          <p>לפניות: info@stern-mansion.co.il | 052-1234567</p>
        </div>
      `

      document.body.appendChild(pdfContent)

      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Convert to canvas
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
      })

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const imgData = canvas.toDataURL('image/png')
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Add additional pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Clean up
      document.body.removeChild(pdfContent)

      // Return PDF as data URL
      return pdf.output('datauristring')

    } catch (error) {
      console.error('Error generating PDF:', error)
      throw new Error('שגיאה ביצירת המסמך')
    }
  }

  const downloadPDF = async () => {
    try {
      const pdfDataUrl = await generatePDF()
      
      // Create download link
      const link = document.createElement('a')
      link.href = pdfDataUrl
      link.download = `הזמנה_${booking.customer.fullName}_${booking.id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      alert('שגיאה בהורדת המסמך. אנא נסו שוב.')
    }
  }

  return (
    <div>
      {children}
      <button
        onClick={downloadPDF}
        className="btn btn-secondary btn-sm"
        title="הורד הסכם כ-PDF"
      >
        <i className="fa-solid fa-file-pdf mr-1"></i>
        הורד PDF
      </button>
    </div>
  )
}

export { PDFGenerator as default }