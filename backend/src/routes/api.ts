import { Router } from 'express';
import { requireAdmin } from '../middleware/auth';

import * as bookings from '../controllers/bookings';
import * as contact from '../controllers/contact';
import * as newsletter from '../controllers/newsletter';
import * as blog from '../controllers/blog';
import * as events from '../controllers/events';
import * as gallery from '../controllers/gallery';
import * as menu from '../controllers/menu';
import * as orders from '../controllers/orders';
import * as testimonials from '../controllers/testimonials';
import * as chat from '../controllers/chat';
import * as adminAuth from '../controllers/adminAuth';
import * as stats from '../controllers/stats';
import * as auth from '../controllers/auth';
import * as eventBookings from '../controllers/eventBookings';

const router = Router();

// Menu
router.get('/menu', menu.getMenuItems);
router.post('/menu', menu.createMenuItem);
router.patch('/menu/:id', menu.updateMenuItem);
router.delete('/menu/:id', menu.deleteMenuItem);

// Orders
router.post('/orders', orders.createOrder);
router.get('/orders', orders.getOrders);
router.patch('/orders/:id', orders.updateOrderStatus);
router.delete('/orders/:id', requireAdmin, orders.deleteOrder);

// Bookings (table reservations)
router.post('/bookings', bookings.createBooking);
router.get('/bookings', bookings.getBookings);
router.patch('/bookings/:id', bookings.updateBookingStatus);
router.delete('/bookings/:id', requireAdmin, bookings.deleteBooking);

// Contact
router.post('/contact', contact.submitContact);

// Newsletter
router.post('/newsletter', newsletter.subscribe);
router.delete('/newsletter/:email', newsletter.unsubscribe);

// Blog
router.get('/blog', blog.getPublishedPosts);
router.get('/blog/:slug', blog.getPostBySlug);
router.post('/blog', blog.createPost);
router.patch('/blog/:id', blog.updatePost);
router.delete('/blog/:id', blog.deletePost);

// Events
router.get('/events', events.getActiveEvents);
router.get('/events/next', events.getNextEvent);
router.post('/events', events.createEvent);
router.patch('/events/:id', events.updateEvent);
router.delete('/events/:id', events.deleteEvent);

// Gallery
router.get('/gallery', gallery.getGallery);
router.post('/gallery', gallery.uploadImage);
router.delete('/gallery/:id', gallery.deleteImage);

// Testimonials
router.get('/testimonials', testimonials.getApprovedTestimonials);
router.post('/testimonials', testimonials.submitTestimonial);
router.patch('/testimonials/:id', testimonials.updateTestimonialAuth);

// Chat
router.post('/chat', chat.processMessage);

// Admin Auth
router.post('/admin/login', adminAuth.login);
router.post('/admin/logout', requireAdmin, adminAuth.logout);
router.get('/admin/me', requireAdmin, adminAuth.getMe);

// Stats
router.get('/stats', stats.getHomeStats);

// Auth & Users
router.post('/auth/request-otp', auth.requestOtp);
router.post('/auth/verify-otp', auth.verifyOtp);
router.post('/auth/sync', auth.syncUser);
router.get('/auth/users/:userId', auth.getUserProfile);

// Event Bookings
router.post('/event-bookings', eventBookings.createEventBooking);
router.get('/event-bookings', eventBookings.getEventBookings);
router.patch('/event-bookings/:id', eventBookings.updateEventBookingStatus);
router.delete('/event-bookings/:id', requireAdmin, eventBookings.deleteEventBooking);
router.get('/auth/users/:userId/event-bookings', eventBookings.getUserEventBookings);

export default router;
