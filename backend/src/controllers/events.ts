import { Request, Response } from 'express';
import { supabase } from '../db';

export const getActiveEvents = async (req: Request, res: Response) => {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('active', true)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });
    res.json({ success: true, events: data });
};

export const getNextEvent = async (req: Request, res: Response) => {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('active', true)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is no rows returned
        return res.status(500).json({ success: false, error: error.message, code: 500 });
    }

    res.json({ success: true, event: data || null });
};

export const createEvent = async (req: Request, res: Response) => {
    const newEvent = req.body;

    const { data, error } = await supabase
        .from('events')
        .insert([newEvent])
        .select()
        .single();

    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });
    res.status(201).json({ success: true, event: data });
};

export const updateEvent = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });
    res.json({ success: true, event: data });
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
