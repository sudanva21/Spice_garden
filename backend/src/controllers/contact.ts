import { Request, Response } from 'express';
import { supabase } from '../db';
import { sendContactReceipt } from '../services/email';

export const submitContact = async (req: Request, res: Response) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: 'Missing required fields', code: 400 });
    }

    const { data, error } = await supabase
        .from('contacts')
        .insert([{ name, email, subject, message }])
        .select()
        .single();

    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });

    // Email receipt
    sendContactReceipt(email, name).catch(console.error);

    res.status(201).json({ success: true, contactId: data.id });
};
