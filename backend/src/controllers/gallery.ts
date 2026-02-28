import { Request, Response } from 'express';
import { supabase } from '../db';

export const getGallery = async (req: Request, res: Response) => {
    const { category } = req.query;

    let query = supabase.from('gallery_images').select('*').eq('active', true).order('sort_order', { ascending: true });

    if (category && category !== 'All') {
        query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });

    res.json({ success: true, images: data });
};

export const uploadImage = async (req: Request, res: Response) => {
    // Assuming the client uploads to Supabase Storage directly and passes the public URL to this endpoint
    // Or handle multipart/form-data here (simplified for this scope to accept URL)
    const { image_url, caption, category, sort_order } = req.body;

    const { data, error } = await supabase
        .from('gallery_images')
        .insert([{ image_url, caption, category, sort_order }])
        .select()
        .single();

    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });
    res.status(201).json({ success: true, image: data });
};

export const deleteImage = async (req: Request, res: Response) => {
    const { id } = req.params;

    // Real app should also delete from Supabase storage using the storage API here
    const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id);

    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });
    res.json({ success: true });
};
