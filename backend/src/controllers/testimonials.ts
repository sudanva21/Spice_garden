import { Request, Response } from 'express';
import { supabase } from '../db';

export const getApprovedTestimonials = async (req: Request, res: Response) => {
    const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });
    res.json({ success: true, testimonials: data });
};

export const submitTestimonial = async (req: Request, res: Response) => {
    const { visitor_name, city, rating, review, visit_date } = req.body;

    if (!visitor_name || !review) {
        return res.status(400).json({ success: false, error: 'Name and review are required', code: 400 });
    }

    const { data, error } = await supabase
        .from('testimonials')
        .insert([{ visitor_name, city, rating, review, visit_date, approved: false }])
        .select()
        .single();

    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });
    res.status(201).json({ success: true, message: 'Testimonial submitted for review', testimonialId: data.id });
};

export const updateTestimonialAuth = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { approved } = req.body;

    const { data, error } = await supabase
        .from('testimonials')
        .update({ approved })
        .eq('id', id)
        .select()
        .single();

    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });
    res.json({ success: true, testimonial: data });
};
