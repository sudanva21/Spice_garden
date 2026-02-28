import { Request, Response } from 'express';
import { supabase } from '../db';

export const getAllSpices = async (req: Request, res: Response) => {
    const { data, error } = await supabase.from('spices').select('*').order('name');
    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });
    res.json({ success: true, spices: data });
};

export const getSpiceBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const { data, error } = await supabase.from('spices').select('*').eq('slug', slug).single();

    if (error) return res.status(404).json({ success: false, error: 'Spice not found', code: 404 });
    res.json({ success: true, spice: data });
};

export const createSpice = async (req: Request, res: Response) => {
    const newSpice = req.body;
    const { data, error } = await supabase.from('spices').insert([newSpice]).select().single();

    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });
    res.status(201).json({ success: true, spice: data });
};

export const updateSpice = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase.from('spices').update(updates).eq('id', id).select().single();
    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });
    res.json({ success: true, spice: data });
};
