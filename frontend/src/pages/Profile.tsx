import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface OrderItem {
    name: string;
    qty: number;
    price: number;
}

interface Order {
    id: string;
    created_at: string;
    items: OrderItem[];
    total: number;
    order_status: string;
}

interface EventBooking {
    id: string;
    created_at: string;
    ticket_count: number;
    total_amount: number;
    payment_status: string;
    events: {
        title: string;
        event_date: string;
        image_url: string;
    };
}

export default function Profile() {
    const { user, openAuthModal, logout } = useAuth();

    const [orders, setOrders] = useState<Order[]>([]);
    const [eventBookings, setEventBookings] = useState<EventBooking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchProfileData = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/users/${user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error('Failed to fetch profile data');
                const data = await res.json();
                setOrders(data.orders || []);
                setEventBookings(data.eventBookings || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [user, token]);

    if (!user) {
        return (
            <div className="container" style={{ paddingTop: '120px', minHeight: '60vh', textAlign: 'center' }}>
                <h1 className="section-title">Your Profile</h1>
                <p style={{ color: 'var(--light)', marginBottom: '20px' }}>Please log in to view your past orders and tickets.</p>
                <button className="btn btn-gold" onClick={openAuthModal}>Log In</button>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '120px', minHeight: '80vh', paddingBottom: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '8px' }}>Hello, {user.name || 'Guest'}</h1>
                    <p style={{ color: 'var(--light)' }}>{user.phone} {user.email && `| ${user.email}`}</p>
                </div>
                <button onClick={logout} style={{ background: 'transparent', border: '1px solid #ff4d4f', color: '#ff4d4f', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
            </div>

            {loading ? (
                <p style={{ color: 'var(--light)' }}>Loading your history...</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>

                    {/* FOOD ORDERS */}
                    <div>
                        <h2 style={{ color: 'var(--gold)', fontFamily: '"Playfair Display", serif', marginBottom: '20px', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '10px' }}>
                            Past Food Orders
                        </h2>
                        {orders.length === 0 ? (
                            <p style={{ color: 'var(--light)', opacity: 0.7 }}>No past orders found.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {orders.map(order => (
                                    <div key={order.id} style={{ background: '#1E231F', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{new Date(order.created_at).toLocaleDateString()}</span>
                                            <span style={{
                                                fontSize: '0.8rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px',
                                                background: order.order_status === 'delivered' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 193, 7, 0.2)',
                                                color: order.order_status === 'delivered' ? '#4CAF50' : '#FFC107'
                                            }}>
                                                {order.order_status.toUpperCase()}
                                            </span>
                                        </div>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--light)' }}>
                                            {order.items.map((item, idx) => (
                                                <li key={idx} style={{ marginBottom: '4px' }}>{item.qty}x {item.name}</li>
                                            ))}
                                        </ul>
                                        <div style={{ fontWeight: 'bold', color: 'var(--gold)' }}>Total: ₹{order.total}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* EVENT TICKETS */}
                    <div>
                        <h2 style={{ color: 'var(--gold)', fontFamily: '"Playfair Display", serif', marginBottom: '20px', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '10px' }}>
                            Event Tickets
                        </h2>
                        {eventBookings.length === 0 ? (
                            <p style={{ color: 'var(--light)', opacity: 0.7 }}>No event tickets purchased.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {eventBookings.map(booking => (
                                    <div key={booking.id} style={{ display: 'flex', gap: '16px', background: '#1E231F', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        {booking.events?.image_url && (
                                            <img src={booking.events.image_url} alt={booking.events.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#fff' }}>{booking.events?.title}</h3>
                                            <p style={{ fontSize: '0.8rem', color: '#aaa', margin: '0 0 8px 0' }}>
                                                {new Date(booking.events?.event_date).toLocaleDateString()}
                                            </p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                                <span style={{ color: 'var(--light)' }}>{booking.ticket_count} Ticket(s)</span>
                                                <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>₹{booking.total_amount}</span>
                                            </div>
                                            <div style={{ marginTop: '8px', fontSize: '0.8rem', color: booking.payment_status === 'paid' ? '#4CAF50' : '#FFC107' }}>
                                                {booking.payment_status.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
}
