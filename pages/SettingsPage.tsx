import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Unit } from '../types';
import { useBookings } from '../App';

const UnitForm: React.FC<{ unit?: Unit; onClose: () => void; }> = ({ unit, onClose }) => {
    const { addUnit, updateUnit } = useBookings();
    const [name, setName] = useState(unit?.name || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        if (unit) {
            updateUnit({ ...unit, name });
        } else {
            addUnit({ name });
        }
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control w-full">
                <label className="label"><span className="label-text">שם יחידה</span></label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="לדוגמה: סוויטת אבן" className="input input-bordered w-full" required />
            </div>
            <div className="modal-action">
                <button type="button" onClick={onClose} className="btn btn-ghost">ביטול</button>
                <button type="submit" className="btn btn-primary">{unit ? 'שמור שינויים' : 'הוסף יחידה'}</button>
            </div>
        </form>
    );
};

const GeneralSettings: React.FC = () => {
    const { appUrl, updateAppUrl } = useBookings();
    const [url, setUrl] = useState(appUrl);
    const [saved, setSaved] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateAppUrl(url);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };
    
    useEffect(() => {
        setUrl(appUrl);
    }, [appUrl]);

    return (
         <div className="card bg-base-100 shadow-sm mb-6">
            <div className="card-body">
                <h2 className="card-title">הגדרות כלליות</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">כתובת ציבורית של האפליקציה</span>
                        </label>
                        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" className="input input-bordered w-full" required />
                        <label className="label">
                            <span className="label-text-alt">כתובת זו תשמש ליצירת קישורים לשליחה (למשל, בקשות חתימה).</span>
                        </label>
                    </div>
                    <div className="card-actions justify-end">
                         <button type="submit" className={`btn btn-primary ${saved ? 'btn-success' : ''}`}>
                            {saved ? (
                                <>
                                    <i className="fa-solid fa-check"></i>
                                    <span>נשמר!</span>
                                </>
                            ) : (
                                'שמור שינויים'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const SettingsPage: React.FC = () => {
    const { units, deleteUnit, bookings } = useBookings();
    const [modalContent, setModalContent] = useState<'add' | Unit | null>(null);
    const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);
    const modalRef = useRef<HTMLDialogElement>(null);
    const confirmDeleteModalRef = useRef<HTMLDialogElement>(null);

    const openModal = (content: 'add' | Unit) => {
        setModalContent(content);
        modalRef.current?.showModal();
    };
    
    const closeModal = () => {
        modalRef.current?.close();
        // A slight delay to allow closing animation before clearing content
        setTimeout(() => setModalContent(null), 150);
    };

    const openConfirmDelete = (unit: Unit) => {
        setUnitToDelete(unit);
        confirmDeleteModalRef.current?.showModal();
    };
    
    const closeConfirmDelete = () => {
        confirmDeleteModalRef.current?.close();
        setTimeout(() => setUnitToDelete(null), 150);
    };
    
    const handleDelete = () => {
        if (unitToDelete) {
            deleteUnit(unitToDelete.id);
        }
        closeConfirmDelete();
    };

    const getBookingsCountForUnit = (unitId: string) => {
        return bookings.filter(b => b.unitId === unitId).length;
    };

    return (
        <div className="p-4 lg:p-8 max-w-4xl mx-auto">
            <header className="navbar bg-base-100 rounded-box shadow-sm mb-6">
                <div className="navbar-start">
                    <Link to="/" className="btn btn-ghost gap-2">
                        <i className="fa-solid fa-arrow-right"></i>
                        <span>חזרה ליומן</span>
                    </Link>
                </div>
                <div className="navbar-center">
                    <h1 className="text-xl font-bold">הגדרות</h1>
                </div>
                <div className="navbar-end"></div>
            </header>

            <GeneralSettings />

            <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="card-title">ניהול יחידות אירוח</h2>
                        <button onClick={() => openModal('add')} className="btn btn-primary btn-sm gap-2">
                            <i className="fa-solid fa-plus"></i>
                            <span>הוסף יחידה</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>שם היחידה</th>
                                    <th>הזמנות קיימות</th>
                                    <th className="text-left">פעולות</th>
                                </tr>
                            </thead>
                            <tbody>
                                {units.map(unit => (
                                    <tr key={unit.id}>
                                        <td>{unit.name}</td>
                                        <td>{getBookingsCountForUnit(unit.id)}</td>
                                        <td className="text-left">
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => openModal(unit)} className="btn btn-ghost btn-xs gap-2">
                                                    <i className="fa-solid fa-pencil"></i>
                                                    <span>עריכה</span>
                                                </button>
                                                <button onClick={() => openConfirmDelete(unit)} className="btn btn-ghost btn-xs text-error gap-2">
                                                    <i className="fa-solid fa-trash-can"></i>
                                                    <span>מחיקה</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {units.length === 0 && (
                                    <tr><td colSpan={3} className="text-center">לא נמצאו יחידות. אפשר להתחיל בהוספת יחידה חדשה.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <dialog ref={modalRef} className="modal">
                <div className="modal-box">
                    <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute left-2 top-2">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <h3 className="font-bold text-lg mb-4">
                        {modalContent === 'add' ? 'הוספת יחידה חדשה' : 'עריכת שם יחידה'}
                    </h3>
                    {modalContent && <UnitForm onClose={closeModal} unit={modalContent === 'add' ? undefined : modalContent} />}
                </div>
                <form method="dialog" className="modal-backdrop"><button onClick={closeModal}>close</button></form>
            </dialog>
            
            {/* Confirm Delete Modal */}
            <dialog ref={confirmDeleteModalRef} className="modal">
                 <div className="modal-box">
                    <h3 className="font-bold text-lg">אישור מחיקה</h3>
                    <p className="py-4">האם למחוק את היחידה "{unitToDelete?.name}"? פעולה זו אינה הפיכה.</p>
                    <div className="modal-action">
                        <button onClick={closeConfirmDelete} className="btn btn-ghost">ביטול</button>
                        <button onClick={handleDelete} className="btn btn-error">מחק</button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop"><button onClick={closeConfirmDelete}>close</button></form>
            </dialog>
        </div>
    );
};

export default SettingsPage;