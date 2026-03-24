import { collection, getDocs, query, where, addDoc, orderBy, limit as fsLimit } from 'firebase/firestore';
import { db } from './lib/firebase';

export const getMenu = async () => {
    const qs = await getDocs(collection(db, 'menu'));
    return { data: { items: qs.docs.map(d => ({ id: d.id, ...d.data() })) } };
};

export const getEvents = async () => {
    const qs = await getDocs(collection(db, 'events'));
    return { data: { events: qs.docs.map(d => ({ id: d.id, ...d.data() })) } };
};

export const getNextEvent = async () => {
    const q = query(collection(db, 'events'), where('date', '>=', new Date().toISOString()), orderBy('date', 'asc'), fsLimit(1));
    const qs = await getDocs(q);
    return { data: { event: qs.docs[0] ? { id: qs.docs[0].id, ...qs.docs[0].data() } : null } };
};

export const getBlogPosts = async (params?: { category?: string; limit?: number }) => {
    let q = query(collection(db, 'blog'));
    if (params?.category) q = query(q, where('category', '==', params.category));
    if (params?.limit) q = query(q, fsLimit(params.limit));
    const qs = await getDocs(q);
    return { data: { posts: qs.docs.map(d => ({ id: d.id, ...d.data() })) } };
};

export const getBlogPost = async (slug: string) => {
    const q = query(collection(db, 'blog'), where('slug', '==', slug), fsLimit(1));
    const qs = await getDocs(q);
    return { data: { post: qs.docs[0] ? { id: qs.docs[0].id, ...qs.docs[0].data() } : null } };
};

export const getGallery = async (category?: string) => {
    let q = query(collection(db, 'gallery'));
    if (category) q = query(q, where('category', '==', category));
    const qs = await getDocs(q);
    return { data: { images: qs.docs.map(d => ({ id: d.id, ...d.data() })) } };
};

export const getTestimonials = async () => ({ data: { testimonials: [] } });

export const submitBooking = async (data: Record<string, unknown>) => {
    const docRef = await addDoc(collection(db, 'bookings'), { ...data, status: 'pending', created_at: new Date().toISOString() });
    return { data: { success: true, id: docRef.id } };
};

export const submitContact = async (data: Record<string, unknown>) => {
    const docRef = await addDoc(collection(db, 'messages'), { ...data, created_at: new Date().toISOString() });
    return { data: { success: true, id: docRef.id } };
};

export const subscribeNewsletter = async (email: string) => {
    const docRef = await addDoc(collection(db, 'newsletter_subscribers'), { email, created_at: new Date().toISOString() });
    return { data: { success: true, id: docRef.id } };
};

export const sendChatMessage = async (_sessionId: string, _message: string, _history: any[]) => {
    return { data: { reply: "Hi! The AI chat is currently offline because we migrated to a serverless architecture." } };
};

export const getStats = async () => ({ data: { stats: { diners: 15200, menuItems: 65, rating: 4.8 } } });

export default {};
