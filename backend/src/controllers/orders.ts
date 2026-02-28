import { Request, Response } from 'express';
import { supabase } from '../db';

export async function createOrder(req: Request, res: Response) {
    try {
        const { customer_name, customer_phone, customer_address, items, total, payment_method, user_id } = req.body;

        if (!customer_name || !customer_phone || !customer_address || !items?.length || !total) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase.from('orders').insert({
            customer_name, customer_phone, customer_address,
            items, total, payment_method: payment_method || 'cod',
            user_id,
            payment_status: payment_method === 'cod' ? 'pending' : 'pending',
            order_status: 'pending'
        }).select().single();

        if (error) throw error;
        res.status(201).json({ success: true, orderId: data?.id });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function getOrders(req: Request, res: Response) {
    try {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json({ orders: data });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function updateOrderStatus(req: Request, res: Response) {
    try {
        const { order_status, payment_status, delivery_proof } = req.body;
        const updates: any = {};
        if (order_status) updates.order_status = order_status;
        if (payment_status) updates.payment_status = payment_status;
        if (delivery_proof !== undefined) updates.delivery_proof = delivery_proof;

        const { data, error } = await supabase.from('orders').update(updates).eq('id', req.params.id).select().single();
        if (error) throw error;
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function deleteOrder(req: Request, res: Response) {
    try {
        const { error } = await supabase.from('orders').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
