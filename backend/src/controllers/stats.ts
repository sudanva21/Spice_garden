import { Request, Response } from 'express';
import { supabase } from '../db';

export const getHomeStats = async (req: Request, res: Response) => {
    // Example simplistic stats implementation
    try {
        const [{ count: bookingsCount }, { count: subscribersCount }] = await Promise.all([
            supabase.from('bookings').select('*', { count: 'exact', head: true }),
            supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('active', true)
        ]);

        res.json({
            success: true,
            stats: {
                totalBookings: bookingsCount || 0,
                thisMonthVisitors: 2400 + (bookingsCount || 0) * 2, // arbitrary display stat
                subscriberCount: subscribersCount || 0
            }
        });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message, code: 500 });
    }
};
