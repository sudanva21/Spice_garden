import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function AdminEvents() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
    
    const [editItem, setEditItem] = useState<any>(null);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    async function fetchEvents() {
        setLoading(true);
        try {
            const qs = await getDocs(query(collection(db, 'events'), orderBy('date', 'desc')));
            setEvents(qs.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err: any) {
            toast.error('Error fetching events: ' + err.message);
        }
        setLoading(false);
    }

    const handleSaveEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...editItem };
        if (!payload.title || !payload.date || !payload.venue || payload.capacity <= 0 || payload.price_per_seat < 0) {
            toast.error('Please fill all required fields properly');
            return;
        }

        try {
            const id = payload.id;
            delete payload.id;
            if (id) {
                await updateDoc(doc(db, 'events', id), payload);
                toast.success('Event updated!');
            } else {
                payload.booked_seats = 0;
                await addDoc(collection(db, 'events'), payload);
                toast.success('Event created!');
            }
            setIsFormOpen(false);
            setEditItem(null);
            fetchEvents();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleDeleteEvent = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
        try {
            await deleteDoc(doc(db, 'events', id));
            toast.success('Event deleted!');
            fetchEvents();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const openBookings = async (eventId: string) => {
        setSelectedEventId(eventId);
        setIsSlideOverOpen(true);
        setLoadingBookings(true);
        try {
            const qs = await getDocs(query(collection(db, 'bookings'), where('event_id', '==', eventId), orderBy('created_at', 'desc')));
            setBookings(qs.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err: any) {
            toast.error('Error fetching bookings: ' + err.message);
        } finally {
            setLoadingBookings(false);
        }
    };

    const exportToPDF = () => {
        if (!bookings.length) {
            toast.error('No bookings to export');
            return;
        }
        const currentEvent = events.find(e => e.id === selectedEventId);
        const doc = new jsPDF();
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(20);
        doc.text('Event Bookings Report', 14, 22);
        
        doc.setFontSize(12);
        doc.text(`Event: ${currentEvent?.title || 'Unknown Event'}`, 14, 32);
        doc.text(`Total Bookings: ${bookings.length}`, 14, 40);
        doc.text(`Total Collected: Rs.${bookings.filter(b => b.payment_status === 'paid').reduce((acc, curr) => acc + curr.total_amount, 0)}`, 14, 48);

        const tableColumn = ["Name", "Email", "Phone", "Seats", "Amount (Rs)", "Status", "Date"];
        const tableRows = bookings.map(b => [
            b.attendee_name,
            b.attendee_email,
            b.attendee_phone,
            b.seats,
            b.total_amount,
            b.payment_status,
            new Date(b.created_at).toLocaleDateString()
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 55,
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [212, 168, 67], textColor: 0 } // gold color matching app theme
        });

        doc.save(`bookings-${currentEvent?.title.replace(/\\s+/g, '-').toLowerCase() || 'event'}.pdf`);
        toast.success('PDF exported successfully');
    };

    const exportToExcel = () => {
        if (!bookings.length) {
            toast.error('No bookings to export');
            return;
        }
        const currentEvent = events.find(e => e.id === selectedEventId);
        
        const worksheetData = bookings.map(b => ({
            "Attendee Name": b.attendee_name,
            "Email": b.attendee_email,
            "Phone": b.attendee_phone,
            "Seats": b.seats,
            "Total Amount": b.total_amount,
            "Payment Status": b.payment_status,
            "Booking Date": new Date(b.created_at).toLocaleString()
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
        
        XLSX.writeFile(workbook, `bookings-${currentEvent?.title.replace(/\\s+/g, '-').toLowerCase() || 'event'}.xlsx`);
        toast.success('Excel exported successfully');
    };

    const getStatusColor = (status: string) => {
        if (status === 'active') return 'text-green-500 bg-green-500/10 border-green-500/20';
        if (status === 'draft') return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    };

    return (
        <div className="relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-['Cormorant_Garamond'] text-[var(--gold)]">Event Management</h2>
                <button 
                    onClick={() => { setEditItem({ status: 'draft', capacity: 50, price_per_seat: 1000 }); setIsFormOpen(true); }}
                    className="bg-[var(--gold)] hover:bg-[#a67c00] text-[#0d1a0f] px-5 py-2 rounded-xl font-bold transition-all shadow-lg text-sm font-['DM_Sans']"
                >
                    + Add New Event
                </button>
            </div>

            {/* Main Events Table */}
            {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--gold)]"></div></div>
            ) : events.length === 0 ? (
                <div className="admin-card text-center py-16 text-[var(--muted)]">No events found. Create your first event!</div>
            ) : (
                <div className="admin-card overflow-x-auto">
                    <table className="w-full text-left font-['DM_Sans'] text-sm">
                        <thead>
                            <tr className="border-b border-[var(--gold)]/10 text-[var(--muted)]">
                                <th className="pb-4 font-normal">Event Info</th>
                                <th className="pb-4 font-normal">Date & Venue</th>
                                <th className="pb-4 font-normal">Sales</th>
                                <th className="pb-4 font-normal">Status</th>
                                <th className="pb-4 font-normal text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--gold)]/5">
                            {events.map((ev) => (
                                <tr key={ev.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="py-4 pr-4">
                                        <div className="flex items-center gap-3">
                                            {ev.image_url ? (
                                                <img src={ev.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)]/50">📸</div>
                                            )}
                                            <div>
                                                <p className="font-bold text-white text-base">{ev.title}</p>
                                                <p className="text-xs text-[var(--muted)]">₹{ev.price_per_seat}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-gray-300">
                                        <p>{new Date(ev.date).toLocaleString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' })}</p>
                                        <p className="text-xs text-[var(--muted)]">{ev.venue}</p>
                                    </td>
                                    <td className="py-4">
                                        <p className="text-white font-medium">{ev.booked_seats} <span className="text-[var(--muted)]">/ {ev.capacity}</span></p>
                                        <div className="w-24 h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
                                            <div className="h-full bg-[var(--gold)]" style={{ width: `${Math.min(100, (ev.booked_seats / ev.capacity) * 100)}%` }}></div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(ev.status)}`}>
                                            {ev.status}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right space-x-2">
                                        <button onClick={() => openBookings(ev.id)} className="admin-btn-sm bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20">Bookings</button>
                                        <button onClick={() => { setEditItem(ev); setIsFormOpen(true); }} className="admin-btn-sm admin-btn-edit">Edit</button>
                                        <button onClick={() => handleDeleteEvent(ev.id)} className="admin-btn-sm admin-btn-delete">Del</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Event Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#132318] border border-[var(--gold)]/20 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
                        <div className="p-6 border-b border-[var(--gold)]/10 flex justify-between items-center bg-[#0d1a0f]">
                            <h3 className="text-2xl font-['Cormorant_Garamond'] text-[var(--gold)]">{editItem?.id ? 'Edit Event' : 'Create New Event'}</h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                            <form id="eventForm" onSubmit={handleSaveEvent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4 col-span-1 md:col-span-2">
                                    <label className="block text-sm text-[var(--gold)] font-['DM_Sans'] mb-1">Event Title *</label>
                                    <input type="text" required value={editItem.title || ''} onChange={e => setEditItem({...editItem, title: e.target.value})} className="admin-input" placeholder="Gala Dinner..." />
                                </div>
                                <div className="space-y-4 col-span-1 md:col-span-2">
                                    <label className="block text-sm text-[var(--gold)] font-['DM_Sans'] mb-1">Description *</label>
                                    <textarea required rows={3} value={editItem.description || ''} onChange={e => setEditItem({...editItem, description: e.target.value})} className="admin-textarea" placeholder="Detailed description..."></textarea>
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-sm text-[var(--gold)] font-['DM_Sans'] mb-1">Date & Time *</label>
                                    {/* Supabase expects ISO timestamp, datetime-local provides YYYY-MM-DDThh:mm */}
                                    <input type="datetime-local" required 
                                        value={editItem.date ? new Date(editItem.date).toISOString().slice(0, 16) : ''} 
                                        onChange={e => setEditItem({...editItem, date: new Date(e.target.value).toISOString()})} 
                                        className="admin-input" />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-sm text-[var(--gold)] font-['DM_Sans'] mb-1">Venue *</label>
                                    <input type="text" required value={editItem.venue || ''} onChange={e => setEditItem({...editItem, venue: e.target.value})} className="admin-input" placeholder="Grand Ballroom" />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-sm text-[var(--gold)] font-['DM_Sans'] mb-1">Total Capacity *</label>
                                    <input type="number" min="1" required value={editItem.capacity || ''} onChange={e => setEditItem({...editItem, capacity: parseInt(e.target.value)})} className="admin-input" />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-sm text-[var(--gold)] font-['DM_Sans'] mb-1">Price per Seat (₹) *</label>
                                    <input type="number" min="0" required value={editItem.price_per_seat || ''} onChange={e => setEditItem({...editItem, price_per_seat: parseInt(e.target.value)})} className="admin-input" />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-sm text-[var(--gold)] font-['DM_Sans'] mb-1">Cover Image (Upload)</label>
                                    <div className="flex gap-4 items-center">
                                        <input type="file" accept="image/*" onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                const img = new Image();
                                                img.onload = () => {
                                                    const canvas = document.createElement('canvas');
                                                    let w = img.width, h = img.height; const max = 800;
                                                    if (w > h) { if (w > max) { h *= max/w; w = max; } } else { if (h > max) { w *= max/h; h = max; } }
                                                    canvas.width = w; canvas.height = h;
                                                    canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
                                                    setEditItem({...editItem, image_url: canvas.toDataURL('image/jpeg', 0.7)});
                                                };
                                                img.src = event.target?.result as string;
                                            };
                                            reader.readAsDataURL(file);
                                        }} className="admin-input flex-1 p-2" />
                                        {editItem.image_url && <img src={editItem.image_url} alt="" className="h-10 w-10 rounded-lg object-cover border border-[var(--gold)]" />}
                                    </div>
                                    {!editItem.image_url && <input type="url" value={editItem.image_url || ''} onChange={e => setEditItem({...editItem, image_url: e.target.value})} className="admin-input mt-2" placeholder="Or paste URL here..." />}
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-sm text-[var(--gold)] font-['DM_Sans'] mb-1">Status</label>
                                    <select value={editItem.status || 'draft'} onChange={e => setEditItem({...editItem, status: e.target.value})} className="admin-select w-full">
                                        <option value="active">Active</option>
                                        <option value="draft">Draft</option>
                                        <option value="past">Past</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-[var(--gold)]/10 bg-[#0d1a0f] flex justify-end gap-4">
                            <button onClick={() => setIsFormOpen(false)} className="btn btn-outline border-gray-600 text-gray-300">Cancel</button>
                            <button type="submit" form="eventForm" className="btn btn-gold bg-[var(--gold)] text-[#0d1a0f] px-8 rounded-xl font-bold shadow-lg">Save Event</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bookings Slide-Over */}
            {isSlideOverOpen && (
                <div className="fixed inset-0 z-[100] flex">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsSlideOverOpen(false)}></div>
                    <div className="relative ml-auto w-full max-w-md h-full bg-[#132318] border-l border-[var(--gold)]/20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex flex-col transform transition-transform duration-300 animate-slide-left">
                        <div className="p-6 border-b border-[var(--gold)]/10 flex justify-between items-center bg-[#0d1a0f] shrink-0">
                            <div>
                                <h3 className="text-xl font-['Cormorant_Garamond'] text-[var(--gold)] font-bold">Event Bookings</h3>
                                <p className="text-xs text-[var(--muted)] font-['DM_Sans'] truncate max-w-[200px]">{events.find(e => e.id === selectedEventId)?.title}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {bookings.length > 0 && (
                                    <>
                                        <button onClick={exportToPDF} className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded bg-red-400/10 border border-red-400/20 transition-colors" title="Download PDF">
                                            PDF
                                        </button>
                                        <button onClick={exportToExcel} className="text-green-400 hover:text-green-300 text-xs px-2 py-1 rounded bg-green-400/10 border border-green-400/20 transition-colors" title="Download Excel">
                                            Excel
                                        </button>
                                    </>
                                )}
                                <button onClick={() => setIsSlideOverOpen(false)} className="text-gray-400 hover:text-white text-xl ml-2">✕</button>
                            </div>
                        </div>
                        
                        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                            {loadingBookings ? (
                                <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div></div>
                            ) : bookings.length === 0 ? (
                                <p className="text-center text-[var(--muted)] mt-10">No bookings yet for this event.</p>
                            ) : (
                                <div className="space-y-4">
                                    {bookings.map(book => (
                                        <div key={book.id} className="bg-[#0a0f0d]/60 border border-[var(--gold)]/10 rounded-xl p-4 hover:border-[var(--gold)]/30 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="font-bold text-white text-base font-['DM_Sans']">{book.attendee_name}</p>
                                                <span className={`px-2 py-0.5 rounded text-[0.65rem] uppercase font-bold tracking-wider border ${
                                                    book.payment_status === 'paid' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                                                    book.payment_status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                                                    'bg-red-500/10 border-red-500/30 text-red-400'
                                                }`}>
                                                    {book.payment_status}
                                                </span>
                                            </div>
                                            <div className="text-xs text-[var(--muted)] space-y-1 font-['DM_Sans']">
                                                <p className="flex justify-between"><span>{book.attendee_email}</span> <span>{book.attendee_phone}</span></p>
                                                <p className="flex justify-between font-mono">
                                                    <span>{book.seats} Seat{book.seats > 1 ? 's' : ''}</span> 
                                                    <span className="text-[var(--gold)] font-bold font-sans">₹{book.total_amount}</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-[var(--gold)]/10 bg-[#0d1a0f] flex justify-between items-center shrink-0">
                            <span className="text-sm text-[var(--muted)] font-['DM_Sans']">Total Collected (Paid)</span>
                            <span className="text-2xl font-['Cormorant_Garamond'] text-[var(--gold)] font-bold">
                                ₹{bookings.filter(b => b.payment_status === 'paid').reduce((acc, curr) => acc + curr.total_amount, 0)}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                .animate-slide-left { animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(212,168,67,0.2); border-radius: 10px; }
            `}</style>
        </div>
    );
}
