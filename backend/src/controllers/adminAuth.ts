import { Request, Response } from 'express';
import { supabase } from '../db';

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        res.status(200).json({ success: true, token: 'simulate_admin_jwt', role: 'admin' });
    } else {
        res.status(401).json({ success: false, error: 'Invalid admin credentials', code: 401 });
    }
};

export const logout = async (req: Request, res: Response) => {
    const { error } = await supabase.auth.signOut();
    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });
    res.json({ success: true });
};

export const getMe = async (req: Request, res: Response) => {
    res.json({ success: true, user: (req as any).user });
};
