import { Request, Response } from 'express';
import { supabase } from '../db';
import { sendNewsletterWelcome } from '../services/email';

export const subscribe = async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required', code: 400 });
    }

    // Check if exists
    const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('id, active')
        .eq('email', email)
        .single();

    if (existing) {
        if (!existing.active) {
            // Reactivate
            await supabase.from('newsletter_subscribers').update({ active: true }).eq('email', email);
            return res.json({ success: true, message: 'Re-subscribed successfully' });
        }
        return res.status(400).json({ success: false, error: 'Already subscribed', code: 400 });
    }

    const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);

    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });

    sendNewsletterWelcome(email).catch(console.error);

    res.status(201).json({ success: true });
};

export const unsubscribe = async (req: Request, res: Response) => {
    const { email } = req.params;

    const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ active: false })
        .eq('email', email);

    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });
    res.json({ success: true });
};
