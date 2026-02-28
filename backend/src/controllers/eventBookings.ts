import { Request, Response } from 'express';
import { supabase } from '../db';

export const createEventBooking = async (req: Request, res: Response) => {
    try {
        const { event_id, user_id, ticket_count, total_amount, payment_method } = req.body;

        const { data, error } = await supabase
            .from('event_bookings')
            .insert({
                event_id,
                user_id,
                ticket_count,
                total_amount,
                payment_method,
                payment_status: payment_method === 'upi' ? 'paid' : 'pending' // Simulated payment
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating event booking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getEventBookings = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('event_bookings')
            .select(`
        *,
        users(name, phone, email),
        events(title, event_date)
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching event bookings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateEventBookingStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;

        const { data, error } = await supabase
            .from('event_bookings')
            .update({ payment_status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('Error updating event booking status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteEventBooking = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('event_bookings')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error deleting event booking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const getUserEventBookings = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('event_bookings')
            .select('*, events(title, event_date, image_url)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching user event bookings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
