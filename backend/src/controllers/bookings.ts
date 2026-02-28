import { Request, Response } from 'express';
import { supabase } from '../db';
import { sendBookingConfirmation, sendAdminBookingAlert } from '../services/email';

export const createBooking = async (req: Request, res: Response) => {
    const { name, email, phone, visit_date, group_size, tour_type, interests, special_requirements } = req.body;

    if (!name || !email || !visit_date || !group_size) {
        return res.status(400).json({ success: false, error: 'Missing required fields', code: 400 });
    }

    const { data, error } = await supabase
        .from('bookings')
        .insert([{ name, email, phone, visit_date, group_size, tour_type, interests, special_requirements }])
        .select()
        .single();

    if (error) {
        return res.status(500).json({ success: false, error: error.message, code: 500 });
    }

    // Trigger emails async without awaiting
    sendBookingConfirmation(email, name, visit_date, tour_type || 'General Visit', group_size).catch(console.error);
    sendAdminBookingAlert(`Name: ${name}\nDate: ${visit_date}\nType: ${tour_type}\nGroup: ${group_size}`).catch(console.error);

    res.status(201).json({ success: true, bookingId: data.id });
};

export const getBookings = async (req: Request, res: Response) => {
    const { status } = req.query;
    let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });

    if (status) {
        query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });

    res.json({ success: true, bookings: data });
};

export const updateBookingStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });

    res.json({ success: true, booking: data });
};

export const deleteBooking = async (req: Request, res: Response) => {
    const { id } = req.params;

    const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });
    res.json({ success: true });
};
