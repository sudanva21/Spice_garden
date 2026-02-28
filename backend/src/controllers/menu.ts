import { Request, Response } from 'express';
import { supabase } from '../db';

export async function getMenuItems(req: Request, res: Response) {
    try {
        const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .eq('available', true)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        res.json({ items: data });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function createMenuItem(req: Request, res: Response) {
    try {
        const { data, error } = await supabase.from('menu_items').insert(req.body).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function updateMenuItem(req: Request, res: Response) {
    try {
        const { data, error } = await supabase.from('menu_items').update(req.body).eq('id', req.params.id).select().single();
        if (error) throw error;
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function deleteMenuItem(req: Request, res: Response) {
    try {
        const { error } = await supabase.from('menu_items').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
