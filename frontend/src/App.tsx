import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './index.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import StickyContact from './components/StickyContact';
import { AuthProvider } from './context/AuthContext';
import AuthModal from './components/AuthModal';

import Home from './pages/Home';
import Menu from './pages/Menu';
import Gallery from './pages/Gallery';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import BookingSuccess from './pages/BookingSuccess';
import Services from './pages/Services';
import Contact from './pages/Contact';
import BookTicket from './pages/BookTicket';
import AskAI from './pages/AskAI';
import About from './pages/About';
import Legal from './pages/Legal';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import AdminLogin from './pages/AdminLogin';

import BookingFailed from './pages/BookingFailed';
import { Navigate } from 'react-router-dom';
import React from 'react';

declare global {
    interface Window {
        ADMIN_TOKEN?: string;
    }
}

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
    const token = window.ADMIN_TOKEN;
    if (token !== '805520' && token !== 'a805520') {
        return <Navigate to="/admin/login" replace />;
    }
    return children;
}

function Layout() {
    const loc = useLocation();
    const isAskAI = loc.pathname === '/ask-ai';
    const isAdmin = loc.pathname.startsWith('/admin');

    return (
        <>
            {!isAskAI && !isAdmin && <Navbar />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/booking/:id" element={<BookingSuccess />} />
                <Route path="/booking-failed" element={<BookingFailed />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/book" element={<BookTicket />} />
                <Route path="/ask-ai" element={<AskAI />} />
                <Route path="/about" element={<About />} />
                <Route path="/terms" element={<Legal type="terms" />} />
                <Route path="/privacy" element={<Legal type="privacy" />} />
                <Route path="/disclaimer" element={<Legal type="disclaimer" />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<ProtectedAdminRoute><Admin /></ProtectedAdminRoute>} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
            {!isAskAI && !isAdmin && <Footer />}
            {!isAdmin && <StickyContact />}
            {!isAdmin && <ChatWidget />}
            <AuthModal />
        </>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Layout />
            </BrowserRouter>
        </AuthProvider>
    );
}
