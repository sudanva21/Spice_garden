import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' }
});

// Attach bearer token for admin routes if present
api.interceptors.request.use(config => {
    const token = localStorage.getItem('sg_admin_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

export const getMenu = () => api.get('/menu');

export const getEvents = () => api.get('/events');
export const getNextEvent = () => api.get('/events/next');

export const getBlogPosts = (params?: { category?: string; limit?: number }) =>
    api.get('/blog', { params });
export const getBlogPost = (slug: string) => api.get(`/blog/${slug}`);

export const getGallery = (category?: string) =>
    api.get('/gallery', { params: category ? { category } : {} });

export const getTestimonials = () => api.get('/testimonials');

export const submitBooking = (data: Record<string, unknown>) => api.post('/bookings', data);
export const submitContact = (data: Record<string, unknown>) => api.post('/contact', data);
export const subscribeNewsletter = (email: string) => api.post('/newsletter', { email });

export const sendChatMessage = (sessionId: string, message: string, history: { role: string; content: string }[]) =>
    api.post('/chat', { sessionId, message, history });

export const getStats = () => api.get('/stats');

export default api;
