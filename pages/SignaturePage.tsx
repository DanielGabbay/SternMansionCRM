import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Booking } from '../types';
import { BookingStatus } from '../types';
import { useBookings } from '../App';
import { EmailService } from '../services/EmailService';
import '../signature-pad.css';

// --- SIGNATURE PAD COMPONENT ---
const SignaturePad: React.FC<{ onSignatureChange: (isEmpty: boolean, dataUrl: string | null) => void }> = ({ onSignatureChange }) => {
    const sigPadRef = useRef<SignatureCanvas>(null);
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    const handleEnd = () => {
        if (!sigPadRef.current) return;
        const isEmpty = sigPadRef.current.isEmpty();
        const dataUrl = isEmpty ? null : sigPadRef.current.toDataURL('image/png', 1.0);
        console.log('Signature ended:', { isEmpty, hasData: !!dataUrl });
        onSignatureChange(isEmpty, dataUrl);
    };

    const handleClear = () => {
        if (!sigPadRef.current) return;
        sigPadRef.current.clear();
        onSignatureChange(true, null);
    };

    // Calculate canvas dimensions based on container
    const getCanvasWidth = () => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            return Math.min(containerWidth - 4, 600); // Max width 600px, minus border
        }
        return isMobile ? 350 : 500;
    };

    return (
        <div className="w-full" ref={containerRef}>
            <div className="border-2 border-base-300 rounded-md bg-base-200 overflow-hidden touch-none">
                <SignatureCanvas
                    ref={sigPadRef}
                    onEnd={handleEnd}
                    canvasProps={{
                        width: getCanvasWidth(),
                        height: isMobile ? 140 : 120,
                        className: 'signature-canvas w-full'
                    }}
                    backgroundColor="#f3f4f6"
                    penColor="#1f2937"
                    minWidth={isMobile ? 1.5 : 0.8}
                    maxWidth={isMobile ? 3.5 : 2.5}
                    throttle={16}
                    velocityFilterWeight={0.7}
                    dotSize={isMobile ? 1.5 : 1}
                />
            </div>
            <div className="flex items-center justify-between mt-2">
                <button type="button" onClick={handleClear} 
                        className="btn btn-link btn-xs p-0 h-auto min-h-0 text-base-content/60 hover:text-base-content">
                    <i className="fa-solid fa-eraser mr-1"></i>
                    נקה חתימה
                </button>
                <span className="text-xs text-base-content/50">
                    {isMobile ? 'חתמו באצבע' : 'חתמו בעכבר או באצבע'}
                </span>
            </div>
        </div>
    );
};

// --- AGREEMENT TEXT GENERATOR ---
const AgreementText: React.FC<{ booking: Booking, unitName: string }> = ({ booking, unitName }) => (
    <div className="prose prose-sm sm:prose-base max-w-none text-base-content/80 leading-relaxed">
        <p className="text-base sm:text-lg">
            שלום {booking.customer.fullName},<br/> 
            שמחנו לקבל את הזמנתכם לאירוח באחוזת שטרן. אנא קרא/י בעיון את פרטי ההזמנה והתנאים המצורפים, ואשר/י את ההסכם באמצעות חתימה דיגיטלית בתחתית המסמך.
        </p>
        
        <div className="p-4 sm:p-6 bg-base-200 rounded-lg not-prose space-y-3 sm:space-y-4">
            <h3 className="font-bold text-base sm:text-lg">1. פרטי ההזמנה:</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
                <p><strong>מספר הזמנה:</strong> <span className="break-all">{booking.id}</span></p>
                <p><strong>שם האורח:</strong> {booking.customer.fullName}</p>
                <p><strong>יחידת האירוח:</strong> {unitName}</p>
                <p><strong>תאריך כניסה:</strong> {booking.startDate.toLocaleDateString('he-IL')} (החל מ-15:00)</p>
                <p><strong>תאריך יציאה:</strong> {booking.endDate.toLocaleDateString('he-IL')} (עד 11:00)</p>
                <p><strong>מספר אורחים:</strong> {booking.adults} מבוגרים, {booking.children} ילדים</p>
            </div>
        </div>

        <h4 className="text-base sm:text-lg font-bold mt-6">2. תנאי התשלום:</h4>
        <p className="text-sm sm:text-base">
            <strong>סה"כ עלות האירוח:</strong> {booking.price.toLocaleString()} ₪. 
            יתרת התשלום תתבצע עם ההגעה למתחם באמצעי התשלום הבאים: אשראי / מזומן / העברה בנקאית.
        </p>
        
        <h4 className="text-base sm:text-lg font-bold mt-6">3. כללי אירוח והתנהלות במתחם:</h4>
        <ul className="text-sm sm:text-base space-y-2">
            <li>הכניסה החל מהשעה 15:00 והיציאה עד השעה 11:00.</li>
            <li>העישון בתוך הסוויטות אסור בהחלט.</li>
            <li>השימוש במתקני הבריכה והג'קוזי הינו באחריות האורחים בלבד.</li>
            <li>אין להשמיע מוזיקה רועשת או להקים רעש בשעות המנוחה.</li>
            <li>לא תתאפשر כניסת אורחים נוספים למתחם מעבר למצוין בהזמנה.</li>
        </ul>

        <h4 className="text-base sm:text-lg font-bold mt-6">4. מדיניות ביטולים:</h4>
        <ul className="text-sm sm:text-base space-y-2">
            <li>הודעת ביטול עד 14 ימים לפני מועד האירוח: ללא דמי ביטול.</li>
            <li>הודעת ביטול בין 14 ל-7 ימים לפני מועד האירוח: חיוב של 50% מעלות ההזמנה.</li>
            <li>הודעת ביטול בפחות מ-7 ימים לפני מועד האירוח או אי-הגעה: חיוב מלא.</li>
        </ul>
    </div>
);

// --- MAIN SIGNATURE PAGE ---
const SignaturePage: React.FC = () => {
    const { bookingId } = useParams<{ bookingId: string }>();
    const { getBookingById, updateBooking, units } = useBookings();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [isSigned, setIsSigned] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [typedName, setTypedName] = useState('');
    const [signatureData, setSignatureData] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [pdfGenerated, setPdfGenerated] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    useEffect(() => {
        if (!bookingId) return;
        const foundBooking = getBookingById(bookingId);
        if (foundBooking) {
            setBooking(foundBooking);
            setTypedName(foundBooking.customer.fullName);
            if (foundBooking.status === BookingStatus.Confirmed) setIsSigned(true);
        }
    }, [bookingId, getBookingById]);

    const generatePDF = async (signedBooking: Booking, unitName: string): Promise<string> => {
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
                    שלום ${signedBooking.customer.fullName},<br/>
                    שמחנו לקבל את הזמנתכם לאירוח באחוזת שטרן. להלן פרטי ההזמנה והתנאים שאושרו על ידכם:
                </p>
            </div>

            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h3 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0;">פרטי ההזמנה:</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <p style="margin: 5px 0;"><strong>מספר הזמנה:</strong><br/>${signedBooking.id}</p>
                    <p style="margin: 5px 0;"><strong>שם האורח:</strong><br/>${signedBooking.customer.fullName}</p>
                    <p style="margin: 5px 0;"><strong>יחידת האירוח:</strong><br/>${unitName}</p>
                    <p style="margin: 5px 0;"><strong>תאריך כניסה:</strong><br/>${formatDate(signedBooking.startDate)} (החל מ-15:00)</p>
                    <p style="margin: 5px 0;"><strong>תאריך יציאה:</strong><br/>${formatDate(signedBooking.endDate)} (עד 11:00)</p>
                    <p style="margin: 5px 0;"><strong>מספר אורחים:</strong><br/>${signedBooking.adults} מבוגרים, ${signedBooking.children} ילדים</p>
                </div>
            </div>

            <h4 style="font-size: 16px; font-weight: bold; margin: 25px 0 15px 0;">תנאי התשלום:</h4>
            <p style="margin-bottom: 20px;">
                <strong>סה"כ עלות האירוח:</strong> ${signedBooking.price.toLocaleString()} ₪<br/>
                יתרת התשלום תתבצע עם ההגעה למתחם באמצעי התשלום הבאים: אשראי / מזומן / העברה בנקאית.
            </p>

            <div style="border-top: 2px solid #333; padding-top: 20px; margin-top: 40px;">
                <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">הצהרת האורח וחתימה:</h4>
                <p style="margin-bottom: 15px;">אני מאשר/ת שקראתי והבנתי את כל תנאי ההסכם.</p>
                
                <div style="display: flex; justify-content: space-between; align-items: end; margin-top: 30px;">
                    <div style="flex: 1;">
                        <p style="margin: 0;"><strong>שם מלא:</strong> ${signedBooking.customer.fullName}</p>
                        <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">תאריך חתימה: ${formatDate(signedBooking.signedDate || new Date())}</p>
                    </div>
                    <div style="flex: 0 0 200px; text-align: center;">
                        <div style="border: 1px solid #333; height: 80px; width: 200px; margin: 0 auto; background: white; display: flex; align-items: center; justify-content: center;">
                            ${signedBooking.signature ? `<img src="${signedBooking.signature}" style="max-width: 190px; max-height: 70px;" />` : '<span style="color: #999;">חתימה</span>'}
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
            width: 794,
            height: 1123,
        })

        // Create PDF
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        })

        const imgData = canvas.toDataURL('image/png')
        const imgWidth = 210
        const pageHeight = 297
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        let heightLeft = imgHeight
        let position = 0

        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight

        // Add additional pages if needed
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight
            pdf.addPage()
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
            heightLeft -= pageHeight
        }

        // Clean up
        document.body.removeChild(pdfContent)

        return pdf.output('datauristring')
    }

    const handleSubmit = async () => {
        if (!booking || !agreed || !typedName.trim() || !signatureData) {
            alert("יש למלא את כל השדות, לסמן הסכמה ולחתום.");
            return;
        }

        setIsProcessing(true);
        
        try {
            // Update booking first
            const signedBooking = { 
                ...booking, 
                status: BookingStatus.Confirmed, 
                signature: signatureData, 
                signedDate: new Date() 
            };
            
            await updateBooking(signedBooking);
            
            // Generate PDF
            const unitName = units.find(u => u.id === booking.unitId)?.name || 'יחידה לא ידועה';
            const pdfDataUrl = await generatePDF(signedBooking, unitName);
            setPdfGenerated(true);
            
            // Send email if configured
            if (EmailService.isConfigured()) {
                const emailSuccess = await EmailService.sendConfirmationEmail(signedBooking, unitName, pdfDataUrl);
                setEmailSent(emailSuccess);
            }
            
            setIsSigned(true);
            
        } catch (error) {
            console.error('Error processing signature:', error);
            alert('אירעה שגיאה בעיבוד החתימה. אנא נסו שוב.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!booking) {
        return <div className="flex items-center justify-center min-h-screen bg-base-200"><span className="loading loading-lg"></span></div>;
    }

    if (isSigned) {
        return (
             <div className="flex items-center justify-center min-h-screen bg-base-200 p-4">
                <div className="card bg-base-100 shadow-xl text-center max-w-md">
                    <div className="card-body items-center">
                        <i className="fa-solid fa-circle-check text-success text-5xl mb-4"></i>
                        <h1 className="card-title text-2xl">תודה רבה, {booking.customer.fullName}!</h1>
                        <p className="mt-2">הזמנתך אושרה בהצלחה.</p>
                        
                        <div className="mt-4 space-y-2 text-sm">
                            {pdfGenerated && (
                                <div className="flex items-center justify-center gap-2 text-success">
                                    <i className="fa-solid fa-file-pdf"></i>
                                    <span>PDF נוצר בהצלחה</span>
                                </div>
                            )}
                            
                            {EmailService.isConfigured() ? (
                                <div className="flex items-center justify-center gap-2 text-success">
                                    <i className="fa-solid fa-envelope"></i>
                                    <span>{emailSent ? 'מייל נשלח בהצלחה' : 'שולח מייל...'}</span>
                                </div>
                            ) : (
                                <div className="text-warning text-xs">
                                    שירות המייל לא מוגדר - פנו למנהל
                                </div>
                            )}
                        </div>
                        
                        <p className="text-sm text-base-content/70 mt-4">
                            {EmailService.isConfigured() ? 
                                'עותק חתום של ההסכם נשלח למייל. נתראה בקרוב!' :
                                'צרו קשר עם אחוזת שטרן לקבלת המסמך. נתראה בקרוב!'
                            }
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    
    const unitName = units.find(u => u.id === booking.unitId)?.name || 'יחידה לא ידועה';

    return (
        <div className="bg-base-200 min-h-screen p-3 sm:p-6 md:p-8 flex justify-center items-start sm:items-center">
            <div className="card w-full max-w-4xl bg-base-100 shadow-xl my-4 sm:my-0">
                <div className="card-body p-4 sm:p-6 md:p-8 lg:p-10">
                    <header className="text-center border-b border-base-300 pb-4 sm:pb-6 mb-4 sm:mb-6">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">אישור הזמנה והסכם אירוח</h1>
                        <p className="text-base sm:text-lg md:text-xl font-light text-base-content/70 mt-2">אחוזת שטרן</p>
                    </header>
                    
                    <main className="space-y-4 sm:space-y-6">
                        <AgreementText booking={booking} unitName={unitName} />
                        <div className="divider mt-6 sm:mt-8 mb-4 sm:mb-6">הצהרת האורח וחתימה</div>
                        <div className="space-y-4 sm:space-y-6 bg-blue-50/50 p-4 sm:p-6 rounded-lg">
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-semibold">שם מלא (כהצהרה):</span>
                                </label>
                                <input type="text" value={typedName} onChange={(e) => setTypedName(e.target.value)} 
                                       className="input input-bordered w-full text-base" />
                            </div>
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-semibold">חתימה:</span>
                                </label>
                                <SignaturePad onSignatureChange={(isEmpty, data) => setSignatureData(isEmpty ? null : data)} />
                            </div>
                            <div className="form-control">
                                <label className="label cursor-pointer justify-start gap-3 py-4">
                                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} 
                                           className="checkbox checkbox-primary flex-shrink-0"/>
                                    <span className="label-text text-base leading-relaxed">אני מאשר/ת שקראתי והבנתי את כל תנאי ההסכם.</span>
                                </label>
                            </div>
                        </div>
                        <div className="card-actions justify-center mt-6 sm:mt-8">
                            <button 
                                onClick={handleSubmit} 
                                disabled={!agreed || !typedName.trim() || !signatureData || isProcessing} 
                                className="btn btn-success btn-lg w-full sm:w-auto text-white text-base sm:text-lg px-8"
                            >
                                {isProcessing ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm ml-2"></span>
                                        מעבד חתימה...
                                    </>
                                ) : (
                                    'אשר וחתום על ההזמנה'
                                )}
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default SignaturePage;
