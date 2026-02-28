import { Request, Response } from 'express';
import { supabase } from '../db';
import twilio from 'twilio';

// In-memory store for OTPs (in a real production app, use Redis or Postgres)
const otpStore = new Map<string, { otp: string, expires: number }>();

// In a real app, this would use Twilio or AWS SNS to send an SMS
// For this simulation, we'll just return a success message and allow any OTP "123456"

export const requestOtp = async (req: Request, res: Response) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        // Generate a real 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + 5 * 60 * 1000; // 5 mins
        otpStore.set(phone, { otp, expires });

        // If Twilio credentials exist, send real SMS. Otherwise, log it (fallback for dev without keys).
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
            const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            await client.messages.create({
                body: `Your Spice Garden login OTP is ${otp}. Valid for 5 minutes.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '').substring(0, 10)}` // Assuming India prefix
            });
            res.status(200).json({ message: 'OTP sent via SMS successfully' });
        } else {
            console.log(`[DEV MODE] OTP for ${phone} is ${otp}`);
            res.status(200).json({ message: 'OTP generated (Check server console for OTP since Twilio keys are missing)' });
        }

    } catch (error: any) {
        console.error('Error requesting OTP:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { phone, otp, name, email } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ error: 'Phone and OTP are required' });
        }

        // Real OTP check
        const stored = otpStore.get(phone);
        if (!stored) {
            return res.status(400).json({ error: 'OTP expired or not requested' });
        }
        if (stored.otp !== otp || Date.now() > stored.expires) {
            return res.status(401).json({ error: 'Invalid or expired OTP' });
        }

        // Clear OTP after successful use
        otpStore.delete(phone);

        // Upsert the user based on phone number
        let { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('phone', phone)
            .single();

        if (!user) {
            // User doesn't exist, create them
            const newUser = {
                phone,
                name: name || 'Guest User',
                email: email || null
            };

            const { data: createdUser, error: createError } = await supabase
                .from('users')
                .insert(newUser)
                .select()
                .single();

            if (createError) throw createError;
            user = createdUser;
        } else {
            // If name/email were provided and they already exist, we could update them
            if (name || email) {
                const { data: updatedUser, error: updateError } = await supabase
                    .from('users')
                    .update({
                        name: name || user.name,
                        email: email || user.email
                    })
                    .eq('phone', phone)
                    .select()
                    .single();

                if (updateError) throw updateError;
                user = updatedUser;
            }
        }

        // In a real app we would generate a JWT here. 
        // We will simulate it by returning the user object which the frontend can use as a "token" or session state.
        res.status(200).json({
            message: 'Login successful',
            user,
            token: `simulated_jwt_for_${user.id}`
        });

    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        // Fetch user
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (userError) throw userError;

        // Fetch user orders
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        // Fetch event bookings
        const { data: eventBookings, error: eventsError } = await supabase
            .from('event_bookings')
            .select('*, events(title, event_date, image_url)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        res.status(200).json({
            ...user,
            orders: orders || [],
            eventBookings: eventBookings || []
        });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const adminLogin = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    // In production, these should be in the DB or secure env vars.
    // Defaulting to admin / admin123 for the requested strict login flow.
    const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        res.status(200).json({ success: true, token: 'simulate_admin_jwt', role: 'admin' });
    } else {
        res.status(401).json({ success: false, error: 'Invalid admin credentials' });
    }
};
