import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

function generateTicketEmail(booking: any) {
  const formatedDate = new Date(booking.event_date).toLocaleString('en-IN', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: 'numeric', hour12: true
  });

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fcfcfc;">
      <div style="background-color: #0d1a0f; color: #d4a843; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 400; letter-spacing: 2px;">SPICE GARDEN RESORT</h1>
        <p style="margin: 10px 0 0 0; color: #fff; font-size: 14px;">Event Ticket Confirmation</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 40px 30px; border-left: 1px solid #eee; border-right: 1px solid #eee;">
        <h2 style="margin: 0 0 20px 0; color: #333;">${booking.event_title}</h2>
        <p style="margin: 5px 0; color: #666; font-size: 15px;"><strong>Date & Time:</strong> ${formatedDate}</p>
        <p style="margin: 5px 0 30px 0; color: #666; font-size: 15px;"><strong>Venue:</strong> ${booking.event_venue}</p>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Attendee Details</h3>
          <p style="margin: 5px 0; color: #555;">Name: ${booking.attendee_name}</p>
          <p style="margin: 5px 0; color: #555;">Seats Booked: ${booking.seats}</p>
          <p style="margin: 5px 0; color: #555;">Total Paid: ₹${booking.total_amount}</p>
        </div>

        <p style="text-align: center; margin-bottom: 30px;">
          <a href="https://yourdomain.com/booking/${booking.id}" style="display: inline-block; background-color: #d4a843; color: #000; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 6px;">Download Your Ticket</a>
        </p>

        <p style="text-align: center; color: #888; font-size: 13px; font-family: monospace;">
          Booking ID: ${booking.id}<br>
          Payment ID: ${booking.razorpay_payment_id}
        </p>
      </div>

      <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; color: #666; font-size: 13px;">
        <p style="margin: 0;">Official entry pass — please present this at the venue entrance.</p>
        <p style="margin: 10px 0 0 0;">© Spice Garden Resort</p>
      </div>
    </div>
  `;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = req.body;
    
    // 1. Verify Razorpay Signature
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
      .update(razorpayOrderId + '|' + razorpayPaymentId)
      .digest('hex');

    if (signature !== razorpaySignature) {
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    // 2. Fetch booking
    const { data: booking, error: fetchErr } = await supabaseAdmin
      .from('event_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchErr || !booking) throw new Error('Booking not found');
    if (booking.payment_status !== 'pending') return res.status(409).json({ success: false, error: 'Booking is not pending' });

    // 3. Update booking status to paid
    const { error: updateErr } = await supabaseAdmin
      .from('event_bookings')
      .update({ payment_status: 'paid', razorpay_payment_id: razorpayPaymentId })
      .eq('id', bookingId);

    if (updateErr) throw updateErr;

    // 4. Increment booked seats safely via RPC
    const { error: rpcErr } = await supabaseAdmin.rpc('increment_booked_seats', {
      p_event_id: booking.event_id,
      p_amount: booking.seats
    });

    if (rpcErr) {
      console.error('RPC increment error:', rpcErr);
      // Non-fatal — continue with email
    }

    // 5. Send Email via Resend
    const resend = new Resend(process.env.RESEND_API_KEY as string);
    const domain = process.env.VITE_SITE_URL || 'http://localhost:5173'; // fallback for dev
    const emailHtml = generateTicketEmail({ ...booking, razorpay_payment_id: razorpayPaymentId }).replace('https://yourdomain.com', domain);

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL as string,
      to: booking.attendee_email,
      subject: `Your Ticket for ${booking.event_title} — Booking #${booking.id}`,
      html: emailHtml
    });

    // 6. Return success
    return res.status(200).json({ success: true, data: { bookingId } });
  } catch (error: any) {
    console.error('Verify Payment Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
