import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import type { Booking } from '../types';
import { BookingStatus } from '../types';
import { useBookings } from '../App';

// --- SIGNATURE PAD COMPONENT ---
const SignaturePad: React.FC<{ onSignatureChange: (isEmpty: boolean, dataUrl: string | null) => void }> = ({ onSignatureChange }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const isEmpty = useRef(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const resizeCanvas = () => {
            if (!canvas.parentElement) return;
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = 150;
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        };

        const getCoords = (e: MouseEvent | TouchEvent) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
            const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
            return { x: clientX - rect.left, y: clientY - rect.top };
        };

        const startDrawing = (e: MouseEvent | TouchEvent) => { e.preventDefault(); isDrawing.current = true; const { x, y } = getCoords(e); ctx.beginPath(); ctx.moveTo(x, y); };
        const draw = (e: MouseEvent | TouchEvent) => { if (!isDrawing.current) return; e.preventDefault(); const { x, y } = getCoords(e); ctx.lineTo(x, y); ctx.stroke(); isEmpty.current = false; };
        const stopDrawing = () => { if (!isDrawing.current) return; isDrawing.current = false; ctx.closePath(); onSignatureChange(isEmpty.current, canvas.toDataURL()); };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        canvas.addEventListener('mousedown', startDrawing); canvas.addEventListener('mousemove', draw); canvas.addEventListener('mouseup', stopDrawing); canvas.addEventListener('mouseleave', stopDrawing);
        canvas.addEventListener('touchstart', startDrawing, { passive: false }); canvas.addEventListener('touchmove', draw, { passive: false }); canvas.addEventListener('touchend', stopDrawing);
        
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            canvas.removeEventListener('mousedown', startDrawing); canvas.removeEventListener('mousemove', draw); canvas.removeEventListener('mouseup', stopDrawing); canvas.removeEventListener('mouseleave', stopDrawing);
            canvas.removeEventListener('touchstart', startDrawing); canvas.removeEventListener('touchmove', draw); canvas.removeEventListener('touchend', stopDrawing);
        };
    }, [onSignatureChange]);

    const handleClear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        isEmpty.current = true;
        onSignatureChange(true, null);
    };

    return (
        <div>
            <canvas ref={canvasRef} className="bg-base-200 rounded-md w-full touch-none"></canvas>
            <button type="button" onClick={handleClear} className="btn btn-link btn-xs p-0 h-auto min-h-0 mt-1">נקה חתימה</button>
        </div>
    );
};

// --- AGREEMENT TEXT GENERATOR ---
const AgreementText: React.FC<{ booking: Booking, unitName: string }> = ({ booking, unitName }) => (
    <div className="prose prose-sm max-w-none text-base-content/80 leading-relaxed">
        <p>שלום {booking.customer.fullName},<br/> שמחנו לקבל את הזמנתכם לאירוח באחוזת שטרן. אנא קרא/י בעיון את פרטי ההזמנה והתנאים המצורפים, ואשר/י את ההסכם באמצעות חתימה דיגיטלית בתחתית המסמך.</p>
        
        <div className="p-4 bg-base-200 rounded-lg not-prose space-y-2">
            <h3 className="font-bold text-base">1. פרטי ההזמנה:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                <p><strong>מספר הזמנה:</strong> {booking.id}</p>
                <p><strong>שם האורח:</strong> {booking.customer.fullName}</p>
                <p><strong>יחידת האירוח:</strong> {unitName}</p>
                <p><strong>תאריך כניסה:</strong> {booking.startDate.toLocaleDateString('he-IL')} (החל מ-15:00)</p>
                <p><strong>תאריך יציאה:</strong> {booking.endDate.toLocaleDateString('he-IL')} (עד 11:00)</p>
                <p><strong>מספר אורחים:</strong> {booking.adults} מבוגרים, {booking.children} ילדים</p>
            </div>
        </div>

        <h4>2. תנאי התשלום:</h4>
        <p><strong>סה"כ עלות האירוח:</strong> {booking.price.toLocaleString()} ₪. יתרת התשלום תתבצע עם ההגעה למתחם באמצעי התשלום הבאים: אשראי / מזומן / העברה בנקאית.</p>
        
        <h4>3. כללי אירוח והתנהלות במתחם:</h4>
        <ul><li>הכניסה החל מהשעה 15:00 והיציאה עד השעה 11:00.</li><li>העישון בתוך הסוויטות אסור בהחלט.</li><li>השימוש במתקני הבריכה והג'קוזי הינו באחריות האורחים בלבד.</li><li>אין להשמיע מוזיקה רועשת או להקים רעש בשעות המנוחה.</li><li>לא תתאפשר כניסת אורחים נוספים למתחם מעבר למצוין בהזמנה.</li></ul>

        <h4>4. מדיניות ביטולים:</h4>
        <ul><li>הודעת ביטול עד 14 ימים לפני מועד האירוח: ללא דמי ביטול.</li><li>הודעת ביטול בין 14 ל-7 ימים לפני מועד האירוח: חיוב של 50% מעלות ההזמנה.</li><li>הודעת ביטול בפחות מ-7 ימים לפני מועד האירוח או אי-הגעה: חיוב מלא.</li></ul>
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

    useEffect(() => {
        if (!bookingId) return;
        const foundBooking = getBookingById(bookingId);
        if (foundBooking) {
            setBooking(foundBooking);
            setTypedName(foundBooking.customer.fullName);
            if (foundBooking.status === BookingStatus.Confirmed) setIsSigned(true);
        }
    }, [bookingId, getBookingById]);

    const handleSubmit = () => {
        if (!booking || !agreed || !typedName.trim() || !signatureData) {
            alert("יש למלא את כל השדות, לסמן הסכמה ולחתום.");
            return;
        }
        updateBooking({ ...booking, status: BookingStatus.Confirmed, signature: signatureData, signedDate: new Date() });
        setIsSigned(true);
    };

    if (!booking) {
        return <div className="flex items-center justify-center min-h-screen bg-base-200"><span className="loading loading-lg"></span></div>;
    }

    if (isSigned) {
        return (
             <div className="flex items-center justify-center min-h-screen bg-base-200 p-4">
                <div className="card bg-base-100 shadow-xl text-center">
                    <div className="card-body items-center">
                        <i className="fa-solid fa-circle-check text-success text-5xl mb-4"></i>
                        <h1 className="card-title text-2xl">תודה רבה, {booking.customer.fullName}!</h1>
                        <p className="mt-2">הזמנתך אושרה בהצלחה.</p>
                        <p className="text-sm text-base-content/70">עותק חתום של ההסכם יישלח אלייך למייל. נתראה בקרוב!</p>
                    </div>
                </div>
            </div>
        );
    }
    
    const unitName = units.find(u => u.id === booking.unitId)?.name || 'יחידה לא ידועה';

    return (
        <div className="bg-base-200 min-h-screen p-4 sm:p-6 md:p-8 flex justify-center items-center">
            <div className="card w-full max-w-4xl bg-base-100 shadow-xl">
                <div className="card-body p-6 sm:p-8 md:p-10">
                    <header className="text-center border-b border-base-300 pb-6 mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold">אישור הזמנה והסכם אירוח</h1>
                        <p className="text-lg sm:text-xl font-light text-base-content/70 mt-2">אחוזת שטרן</p>
                    </header>
                    
                    <main>
                        <AgreementText booking={booking} unitName={unitName} />
                        <div className="divider mt-8 mb-6">הצהרת האורח וחתימה</div>
                        <div className="space-y-6 bg-blue-50/50 p-6 rounded-lg">
                            <div className="form-control w-full"><label className="label"><span className="label-text">שם מלא (כהצהרה):</span></label><input type="text" value={typedName} onChange={(e) => setTypedName(e.target.value)} className="input input-bordered w-full" /></div>
                            <div className="form-control w-full"><label className="label"><span className="label-text">חתימה:</span></label><SignaturePad onSignatureChange={(isEmpty, data) => setSignatureData(isEmpty ? null : data)} /></div>
                            <div className="form-control"><label className="label cursor-pointer justify-start gap-3"><input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="checkbox checkbox-primary"/><span>אני מאשר/ת שקראתי והבנתי את כל תנאי ההסכם.</span></label></div>
                        </div>
                        <div className="card-actions justify-center mt-8">
                            <button onClick={handleSubmit} disabled={!agreed || !typedName.trim() || !signatureData} className="btn btn-success btn-lg text-white">
                                אשר וחתום על ההזמנה
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default SignaturePage;
