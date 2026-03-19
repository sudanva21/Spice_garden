import { Request, Response } from 'express';
import { supabase } from '../db';

// Helper function to map ticket_url string to ticket_price number when returning from DB
const mapEventsFromDB = (event: any) => {
    if (!event) return event;
    return {
        ...event,
        ticket_price: event.ticket_url && !isNaN(parseFloat(event.ticket_url)) ? parseFloat(event.ticket_url) : 0
    };
};

export const getActiveEvents = async (req: Request, res: Response) => {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'active')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true });

    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });
    res.json({ success: true, events: data ? data.map(mapEventsFromDB) : [] });
};

export const getNextEvent = async (req: Request, res: Response) => {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'active')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is no rows returned
        return res.status(500).json({ success: false, error: error.message, code: 500 });
    }

    res.json({ success: true, event: data ? mapEventsFromDB(data) : null });
};

export const createEvent = async (req: Request, res: Response) => {
    const newEvent = { ...req.body };

    // Map ticket_price back to ticket_url since schema lacks ticket_price
    if (newEvent.ticket_price !== undefined) {
        newEvent.ticket_url = newEvent.ticket_price.toString();
        delete newEvent.ticket_price;
    }

    const { data, error } = await supabase
        .from('events')
        .insert([newEvent])
        .select()
        .single();

    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });
    res.status(201).json({ success: true, event: mapEventsFromDB(data) });
};

export const updateEvent = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = { ...req.body };

    // Don't modify the ID itself
    delete updates.id;

    // Map ticket_price back to ticket_url since schema lacks ticket_price
    if (updates.ticket_price !== undefined) {
        updates.ticket_url = updates.ticket_price.toString();
        delete updates.ticket_price;
    }

    const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });
    res.json({ success: true, event: mapEventsFromDB(data) });
};

export const deleteEvent = async (req: Request, res: Response) => {
    const { id } = req.params;

    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });
    res.json({ success: true });
};
