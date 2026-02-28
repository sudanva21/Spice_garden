import { Request, Response, NextFunction } from 'express';
import { supabase } from '../db';

// Middleware to protect admin routes
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'Unauthorized: Missing token', code: 401 });
        }

        const token = authHeader.split(' ')[1];

        // Accept our custom static admin token
        if (token === 'simulate_admin_jwt') {
            (req as any).user = { id: 'admin', role: 'admin' };
            return next();
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token', code: 401 });
        }

        // Attach user to request
        (req as any).user = user;
        next();
    } catch (err) {
        next(err);
    }
};
