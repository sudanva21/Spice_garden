import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { eventId, seats, attendeeName, attendeeEmail, attendeePhone } = req.body;

    // 1. Fetch event
    const { data: event, error: eventErr } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('status', 'active')
      .single();

    if (eventErr || !event) throw new Error('Event not found or inactive');

    // 2. Validate capacity
    if ((event.capacity - event.booked_seats) < seats) {
      return res.status(400).json({ success: false, error: 'Not enough seats available' });
    }

    // 3. Amount for Razorpay (in paise)
    const amount = seats * event.price_per_seat * 100;
    
    // 4. Create Razorpay order
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });

    const receipt = crypto.randomUUID();
    const order = await razorpay.orders.create({ amount, currency: 'INR', receipt });

    // 5. Insert pending booking
    const { data: booking, error: insertErr } = await supabaseAdmin
      .from('event_bookings')
      .insert({
        event_id: event.id,
        event_title: event.title,
        event_date: event.date,
        event_venue: event.venue,
        attendee_name: attendeeName,
        attendee_email: attendeeEmail,
        attendee_phone: attendeePhone,
        seats,
        total_amount: amount / 100, // back to INR for DB
        razorpay_order_id: order.id,
        payment_status: 'pending'
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    // 6. Return response
    return res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        bookingId: booking.id,
        amount,
        keyId: process.env.RAZORPAY_KEY_ID,
      }
    });
  } catch (error: any) {
    console.error('Create Order Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
