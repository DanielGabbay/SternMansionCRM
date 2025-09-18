import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import type { Booking } from '../types';
import { BookingStatus } from '../types';
import { useBookings } from '../App';
import { ServerEmailService } from '../services/ServerEmailService';
import { generateSimplePDF } from '../utils/simplePDFGenerator';
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


    const handleSubmit = async () => {
        if (!booking || !agreed || !typedName.trim() || !signatureData) {
            alert("יש למלא את כל השדות, לסמן הסכמה ולחתום.");
            return;
        }

        setIsProcessing(true);
        
        try {
            console.log('Starting signature processing...');
            
            // Update booking first
            const signedBooking = { 
                ...booking, 
                status: BookingStatus.Confirmed, 
                signature: signatureData, 
                signedDate: new Date() 
            };
            
            console.log('Updating booking with signed data:', signedBooking);
            await updateBooking(signedBooking);
            console.log('Booking updated successfully');
            
            // Generate PDF
            console.log('Generating PDF...');
            const unitName = units.find(u => u.id === booking.unitId)?.name || 'יחידה לא ידועה';
            
            let pdfDataUrl: string;
            try {
                pdfDataUrl = await generateSimplePDF(signedBooking, unitName, true); // Try compressed first
                console.log('Compressed simple PDF generated successfully');
            } catch (simpleError) {
                console.warn('Compressed PDF failed, trying uncompressed:', simpleError);
                pdfDataUrl = await generateSimplePDF(signedBooking, unitName, false); // Uncompressed fallback
                console.log('Uncompressed simple PDF generated successfully');
            }
            setPdfGenerated(true);
            
            // Send email if configured
            if (ServerEmailService.isConfigured()) {
                console.log('Sending confirmation email via server...');
                try {
                    const emailSuccess = await ServerEmailService.sendConfirmationEmail(signedBooking, unitName, pdfDataUrl);
                    console.log('Email sent:', emailSuccess);
                    setEmailSent(emailSuccess);
                } catch (emailError) {
                    console.error('Email sending failed:', emailError);
                    setEmailSent(false);
                    // Don't fail the whole process if email fails
                }
            } else {
                console.log('Server email service not configured, skipping email');
            }
            
            console.log('Signature processing completed successfully');
            setIsSigned(true);
            
        } catch (error) {
            console.error('Error processing signature:', error);
            console.error('Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                error: error
            });
            
            // More detailed error message
            let errorMessage = 'אירעה שגיאה בעיבוד החתימה.';
            if (error instanceof Error) {
                errorMessage += ` פרטים: ${error.message}`;
            }
            
            alert(errorMessage + ' אנא נסו שוב.');
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
                            
                            {ServerEmailService.isConfigured() ? (
                                <div className={`flex items-center justify-center gap-2 ${emailSent ? 'text-success' : 'text-warning'}`}>
                                    <i className={`fa-solid ${emailSent ? 'fa-envelope-circle-check' : 'fa-envelope'}`}></i>
                                    <span>{emailSent ? 'מייל נשלח בהצלחה' : 'שליחת מייל נכשלה'}</span>
                                </div>
                            ) : (
                                <div className="text-info text-xs">
                                    <i className="fa-solid fa-info-circle mr-1"></i>
                                    שירות המייל לא מוגדר
                                </div>
                            )}
                        </div>
                        
                        <p className="text-sm text-base-content/70 mt-4">
                            {ServerEmailService.isConfigured() ? 
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
