import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Booking, Unit, BlockedDate } from '../types';
import { BookingStatus } from '../types';
import { useBookings } from '../App';

// --- HELPER FUNCTIONS ---
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const formatDate = (date: Date) => date.toISOString().split('T')[0];

// --- UI COMPONENTS ---
const StatusBadge: React.FC<{ status: BookingStatus | 'Blocked' }> = ({ status }) => {
    const statusMap: Record<BookingStatus | 'Blocked', { text: string, className: string }> = {
        [BookingStatus.Pending]: { text: "בהמתנה", className: "badge-warning" },
        [BookingStatus.Confirmed]: { text: "מאושרת", className: "badge-error text-white" },
        [BookingStatus.Cancelled]: { text: "מבוטלת", className: "badge-ghost" },
        'Blocked': { text: "חסום", className: "badge-neutral" }
    };
    const { text, className } = statusMap[status];
    return <span className={`badge ${className}`}>{text}</span>;
};

const FormField: React.FC<{label: string, children: React.ReactNode}> = ({label, children}) => (
    <div className="form-control w-full">
        <label className="label">
            <span className="label-text">{label}</span>
        </label>
        {children}
    </div>
);

const BookingForm: React.FC<{
    booking?: Booking | null;
    unitId?: string;
    date?: Date;
    onClose: () => void;
}> = ({ booking, unitId, date, onClose }) => {
    const { units, addBooking, updateBooking } = useBookings();
    const [formData, setFormData] = useState({
        unitId: booking?.unitId || unitId || units[0]?.id || '',
        startDate: formatDate(booking?.startDate || date || new Date()),
        endDate: formatDate(booking?.endDate || (date ? new Date(date.getTime() + 86400000) : new Date())),
        customerFullName: booking?.customer.fullName || '',
        customerPhone: booking?.customer.phone || '',
        customerEmail: booking?.customer.email || '',
        customerIdNumber: booking?.customer.idNumber || '',
        adults: booking?.adults || 2,
        children: booking?.children || 0,
        price: booking?.price || 0,
        internalNotes: booking?.internalNotes || '',
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const bookingData = {
            unitId: formData.unitId,
            startDate: new Date(formData.startDate),
            endDate: new Date(formData.endDate),
            customer: { fullName: formData.customerFullName, phone: formData.customerPhone, email: formData.customerEmail, idNumber: formData.customerIdNumber },
            adults: Number(formData.adults),
            children: Number(formData.children),
            price: Number(formData.price),
            internalNotes: formData.internalNotes,
            status: booking?.status || BookingStatus.Pending,
        };

        if (booking) {
            updateBooking({ ...booking, ...bookingData });
        } else {
            addBooking(bookingData);
        }
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <FormField label="יחידת אירוח"><select name="unitId" value={formData.unitId} onChange={handleChange} className="select select-bordered w-full"><option disabled>בחר יחידה</option>{units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></FormField>
                <FormField label="מספר מבוגרים"><input type="number" name="adults" value={formData.adults} onChange={handleChange} className="input input-bordered w-full" /></FormField>
                <FormField label="תאריך כניסה"><input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="input input-bordered w-full" /></FormField>
                <FormField label="מספר ילדים"><input type="number" name="children" value={formData.children} onChange={handleChange} className="input input-bordered w-full" /></FormField>
                <FormField label="תאריך יציאה"><input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="input input-bordered w-full" /></FormField>
                <FormField label="מחיר סופי"><input type="number" name="price" value={formData.price} onChange={handleChange} className="input input-bordered w-full" /></FormField>
            </div>
            <div className="divider pt-2">פרטי לקוח</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <FormField label="שם מלא"><input type="text" name="customerFullName" value={formData.customerFullName} onChange={handleChange} className="input input-bordered w-full" /></FormField>
                <FormField label="טלפון"><input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleChange} className="input input-bordered w-full" /></FormField>
                <FormField label="אימייל"><input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} className="input input-bordered w-full" /></FormField>
                <FormField label="תעודת זהות"><input type="text" name="customerIdNumber" value={formData.customerIdNumber} onChange={handleChange} className="input input-bordered w-full" /></FormField>
            </div>
            <FormField label="הערות פנימיות"><textarea name="internalNotes" value={formData.internalNotes} onChange={handleChange} rows={3} className="textarea textarea-bordered w-full"></textarea></FormField>
            <div className="modal-action">
                <button type="button" onClick={onClose} className="btn btn-ghost">ביטול</button>
                <button type="submit" className="btn btn-primary">{booking ? 'עדכון הזמנה' : 'שמור ושלח הסכם'}</button>
            </div>
        </form>
    );
};

const BookingDetails: React.FC<{ booking: Booking, onEdit: () => void, onClose: () => void }> = ({ booking, onEdit, onClose }) => {
    const { units, appUrl } = useBookings();
    const signatureLink = `${appUrl}/#/sign/${booking.id}`;
    const [linkCopied, setLinkCopied] = useState(false);

    const copyLink = () => {
        navigator.clipboard.writeText(signatureLink).then(() => {
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        });
    };
    
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold">{booking.customer.fullName}</h3>
                    <p className="text-sm text-base-content/70">{booking.customer.phone} | {booking.customer.email}</p>
                </div>
                <StatusBadge status={booking.status} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm p-4 bg-base-200 rounded-lg">
                <div><strong>יחידת אירוח:</strong> {units.find(u => u.id === booking.unitId)?.name}</div>
                <div><strong>תאריכים:</strong> {booking.startDate.toLocaleDateString('he-IL')} - {booking.endDate.toLocaleDateString('he-IL')}</div>
                <div><strong>אורחים:</strong> {booking.adults} מבוגרים, {booking.children} ילדים</div>
                <div><strong>מחיר:</strong> {booking.price.toLocaleString()} ₪</div>
            </div>

            {booking.internalNotes && <div className="text-sm"><strong>הערות פנימיות:</strong><p className="p-2 bg-base-200 rounded-lg mt-1">{booking.internalNotes}</p></div>}

            {booking.status === BookingStatus.Pending && (
                <div role="alert" className="alert alert-info mt-4">
                    <i className="fa-solid fa-circle-info fa-lg"></i>
                    <div>
                        <h3 className="font-bold">ההזמנה ממתינה לחתימת הלקוח.</h3>
                        <div className="form-control mt-2"><div className="join w-full"><input type="text" readOnly value={signatureLink} className="input input-bordered join-item w-full text-xs" /><button onClick={copyLink} className="btn btn-secondary join-item">{linkCopied ? 'הועתק!' : 'העתק'}</button></div></div>
                    </div>
                </div>
            )}

            {booking.status === BookingStatus.Confirmed && (
                 <div role="alert" className="alert alert-success mt-4">
                    <i className="fa-solid fa-circle-check fa-lg"></i>
                    <span>ההסכם נחתם בתאריך {booking.signedDate?.toLocaleDateString('he-IL')}.</span>
                </div>
            )}
            
            <div className="modal-action">
                <button type="button" onClick={onClose} className="btn btn-ghost">סגור</button>
                <button type="button" onClick={onEdit} className="btn btn-primary">ערוך הזמנה</button>
            </div>
        </div>
    );
};

const BlockDateForm: React.FC<{ unitId?: string, date?: Date, onClose: () => void }> = ({ unitId, date, onClose }) => {
    const { units, addBlockedDate } = useBookings();
    const [formData, setFormData] = useState({
        unitId: unitId || 'all',
        startDate: formatDate(date || new Date()),
        endDate: formatDate(date ? new Date(date.getTime() + 86400000) : new Date()),
        reason: 'תחזוקה',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { unitId, startDate, endDate, reason } = formData;
        const sDate = new Date(startDate);
        const eDate = new Date(endDate);
        const unitsToBlock = unitId === 'all' ? units : units.filter(u => u.id === unitId);
        unitsToBlock.forEach(unit => { addBlockedDate({ unitId: unit.id, startDate: sDate, endDate: eDate, reason }); });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="יחידת אירוח"><select name="unitId" value={formData.unitId} onChange={handleChange} className="select select-bordered w-full"><option value="all">כל המתחם</option>{units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="מתאריך"><input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="input input-bordered w-full" /></FormField>
                <FormField label="עד תאריך"><input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="input input-bordered w-full" /></FormField>
            </div>
            <FormField label="סיבה"><input type="text" name="reason" value={formData.reason} onChange={handleChange} className="input input-bordered w-full" /></FormField>
            <div className="modal-action">
                <button type="button" onClick={onClose} className="btn btn-ghost">ביטול</button>
                <button type="submit" className="btn btn-error">חסימת תאריכים</button>
            </div>
        </form>
    );
};

// --- MAIN DASHBOARD PAGE ---
const DashboardPage: React.FC = () => {
    const { units, bookings, blockedDates } = useBookings();
    const [currentDate, setCurrentDate] = useState(new Date());

    const [modalData, setModalData] = useState<{ type: 'new' | 'edit' | 'details' | 'block'; data?: any } | null>(null);
    const modalRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = modalRef.current;
        if (!dialog) return;
        const handleClose = () => setModalData(null);
        dialog.addEventListener('close', handleClose);
        return () => dialog.removeEventListener('close', handleClose);
    }, []);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const changeMonth = (offset: number) => { setCurrentDate(new Date(year, month + offset, 1)); };

    const openModal = (type: 'new' | 'edit' | 'details' | 'block', data?: any) => {
        setModalData({ type, data });
        modalRef.current?.showModal();
    };

    const closeModal = () => { modalRef.current?.close(); };
    
    const getEventForDate = (unitId: string, date: Date) => {
        const checkDate = date.getTime();
        const booking = bookings.find(b => b.unitId === unitId && checkDate >= new Date(b.startDate.toDateString()).getTime() && checkDate < new Date(b.endDate.toDateString()).getTime());
        if (booking) return { type: 'booking', data: booking as Booking };

        const blocked = blockedDates.find(b => b.unitId === unitId && checkDate >= new Date(b.startDate.toDateString()).getTime() && checkDate < new Date(b.endDate.toDateString()).getTime());
        if (blocked) return { type: 'blocked', data: blocked as BlockedDate };
        
        return null;
    };
    
    const renderModalContent = () => {
        if (!modalData) return null;
        const { type, data } = modalData;
        switch (type) {
            case 'new': return <> <h3 className="font-bold text-lg">יצירת הזמנה חדשה</h3> <BookingForm onClose={closeModal} unitId={data?.unitId} date={data?.date} /> </>;
            case 'edit': return <> <h3 className="font-bold text-lg">עריכת הזמנה</h3> <BookingForm onClose={closeModal} booking={data} /> </>;
            case 'details': return <> <h3 className="font-bold text-lg">פרטי הזמנה</h3> <BookingDetails booking={data} onClose={closeModal} onEdit={() => openModal('edit', data)} /> </>;
            case 'block': return <> <h3 className="font-bold text-lg">חסימת תאריכים</h3> <BlockDateForm onClose={closeModal} unitId={data?.unitId} date={data?.date} /> </>;
            default: return null;
        }
    };
    
    const isStartDate = (eventData: Booking | BlockedDate, date: Date) => eventData.startDate.toDateString() === date.toDateString();
    
    const getBookingColorClass = (status: BookingStatus) => {
        const map = { [BookingStatus.Pending]: 'bg-yellow-400', [BookingStatus.Confirmed]: 'bg-red-500', [BookingStatus.Cancelled]: 'bg-gray-400' };
        return map[status] || 'bg-gray-200';
    }

    return (
        <div className="p-4 lg:p-8">
            <header className="navbar bg-base-100 rounded-box shadow-sm mb-6">
                <div className="navbar-start">
                    <div className="text-lg sm:text-xl font-bold">יומן אירוח - אחוזת שטרן</div>
                </div>
                <div className="navbar-end gap-2">
                     <Link to="/settings" className="btn btn-ghost btn-circle" aria-label="הגדרות">
                        <i className="fa-solid fa-gear text-xl"></i>
                    </Link>
                    <div className="divider divider-horizontal mx-0"></div>
                    <button onClick={() => openModal('block')} className="btn btn-neutral btn-sm md:btn-md">
                        <i className="fa-solid fa-lock"></i>
                        <span className="hidden sm:inline">חסום תאריכים</span>
                    </button>
                    <button onClick={() => openModal('new')} className="btn btn-primary btn-sm md:btn-md">
                        <i className="fa-solid fa-plus"></i>
                        <span className="hidden sm:inline">הוסף הזמנה</span>
                    </button>
                </div>
            </header>
            
            <div className="card bg-base-100 shadow-sm mb-4">
              <div className="card-body p-4 flex-row justify-between items-center">
                <div className="join"><button onClick={() => changeMonth(-1)} className="join-item btn">«</button><button className="join-item btn btn-disabled text-base-content no-animation capitalize">{currentDate.toLocaleString('he-IL', { month: 'long', year: 'numeric' })}</button><button onClick={() => changeMonth(1)} className="join-item btn">»</button></div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-box shadow-sm bg-base-100">
                <table className="table table-zebra table-pin-rows table-pin-cols table-sm w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="sticky right-0 bg-base-300 z-20">יחידה</th>
                            {Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1).map(day => {
                                const d = new Date(year, month, day);
                                const isWeekend = d.getDay() === 5 || d.getDay() === 6;
                                return (
                                <th key={day} className={`text-center ${isWeekend ? 'bg-base-200' : 'bg-base-100'}`}>
                                    <div className="font-normal text-xs text-base-content/60">{d.toLocaleDateString('he-IL', { weekday: 'short' })}</div>
                                    <div>{day}</div>
                                </th>
                            )})}
                        </tr>
                    </thead>
                    <tbody>
                        {units.map(unit => (
                            <tr key={unit.id}>
                                <th className="sticky right-0 bg-base-100 z-10">{unit.name}</th>
                                {Array.from({ length: getDaysInMonth(year, month) }, (_, i) => {
                                    const day = i + 1;
                                    const date = new Date(year, month, day);
                                    const event = getEventForDate(unit.id, date);
                                    
                                    if (event) {
                                        const isStart = isStartDate(event.data, date);
                                        const textColor = 'text-white';
                                        // FIX: Use the `in` operator as a type guard. This helps TypeScript correctly
                                        // differentiate between `Booking` and `BlockedDate` types within the union,
                                        // resolving errors when accessing type-specific properties.
                                        if ('status' in event.data) {
                                            const booking = event.data;
                                            const bgColor = getBookingColorClass(booking.status);
                                            return <td key={day} className={`p-0 align-top cursor-pointer ${bgColor} ${textColor}`} onClick={() => openModal('details', booking)}><div className="p-1 h-full">{isStart && <span className="text-xs font-semibold truncate block whitespace-nowrap">{booking.customer.fullName}</span>}</div></td>;
                                        } else { // 'blocked'
                                            const blocked = event.data;
                                            return <td key={day} className={`p-0 align-top bg-gray-500 ${textColor}`}><div className="p-1 h-full">{isStart && <span className="text-xs font-semibold truncate block whitespace-nowrap">{blocked.reason}</span>}</div></td>;
                                        }
                                    }
                                    return <td key={day} className="hover:bg-green-100 cursor-pointer transition-colors" onClick={() => openModal('new', { unitId: unit.id, date })}></td>
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <dialog ref={modalRef} className="modal">
                <div className="modal-box w-11/12 max-w-3xl">
                    <form method="dialog"><button className="btn btn-sm btn-circle btn-ghost absolute left-2 top-2"><i className="fa-solid fa-xmark"></i></button></form>
                    {modalData && renderModalContent()}
                </div>
                 <form method="dialog" className="modal-backdrop"><button>close</button></form>
            </dialog>
        </div>
    );
};

export default DashboardPage;