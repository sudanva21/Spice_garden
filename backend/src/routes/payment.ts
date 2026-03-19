import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
// Use require for packages without proper TS declarations
const Razorpay = require('razorpay');
const { jsPDF } = require('jspdf');

const router = Router();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

function generateTicketEmail(booking: any, domain: string) {
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
        <p style="margin: 5px 0; color: #666; font-size: 15px;"><strong>Date &amp; Time:</strong> ${formatedDate}</p>
        <p style="margin: 5px 0 30px 0; color: #666; font-size: 15px;"><strong>Venue:</strong> ${booking.event_venue}</p>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Attendee Details</h3>
          <p style="margin: 5px 0; color: #555;">Name: ${booking.attendee_name}</p>
          <p style="margin: 5px 0; color: #555;">Seats Booked: ${booking.seats}</p>
          <p style="margin: 5px 0; color: #555;">Total Paid: ₹${booking.total_amount}</p>
        </div>

        <p style="text-align: center; margin-bottom: 30px;">
          <a href="${domain}/booking/${booking.id}" style="display: inline-block; background-color: #d4a843; color: #000; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 6px;">Download Your Ticket</a>
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

function generateTicketPDF(booking: any): string {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(13, 26, 15);
  doc.rect(0, 0, 210, 55, 'F');

  doc.setTextColor(212, 168, 67);
  doc.setFontSize(26);
  doc.text('SPICE GARDEN', 105, 22, { align: 'center' });
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL EVENT ENTRY PASS', 105, 33, { align: 'center' });

  // Divider line
  doc.setDrawColor(212, 168, 67);
  doc.setLineWidth(0.5);
  doc.line(30, 42, 180, 42);

  doc.setFontSize(9);
  doc.setTextColor(212, 168, 67);
  doc.text(`Booking ID: ${booking.id}`, 105, 50, { align: 'center' });

  // Event Title
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(24);
  doc.text(booking.event_title || 'Event', 20, 75);

  // Event details
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);

  const dateStr = new Date(booking.event_date).toLocaleString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  doc.text(`Date & Time:  ${dateStr}`, 20, 92);
  doc.text(`Venue:  ${booking.event_venue || 'Spice Garden'}`, 20, 102);

  // Attendee box
  doc.setDrawColor(212, 168, 67);
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(20, 115, 170, 55, 4, 4, 'FD');

  doc.setTextColor(13, 26, 15);
  doc.setFontSize(14);
  doc.text('Attendee Details', 28, 130);

  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(`Name:  ${booking.attendee_name}`, 28, 142);
  doc.text(`Email:  ${booking.attendee_email}`, 28, 152);
  doc.text(`Phone:  ${booking.attendee_phone || 'N/A'}`, 28, 162);

  // Ticket summary box
  doc.setFillColor(13, 26, 15);
  doc.roundedRect(20, 180, 170, 35, 4, 4, 'F');

  doc.setTextColor(212, 168, 67);
  doc.setFontSize(13);
  doc.text(`Seats: ${booking.seats}`, 30, 196);
  doc.text(`Amount Paid:  Rs. ${booking.total_amount}`, 100, 196);

  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`Payment Ref: ${booking.razorpay_payment_id || 'N/A'}`, 30, 208);

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(170, 170, 170);
  doc.text('This is a computer-generated ticket. Please present at the venue entrance.', 105, 240, { align: 'center' });
  doc.text('© Spice Garden Resort', 105, 248, { align: 'center' });

  // Return as base64
  return doc.output('datauristring').split(',')[1];
}

// GET /api/ticket/:bookingId.pdf
router.get('/ticket/:bookingId.pdf', async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { data: booking, error: fetchErr } = await supabaseAdmin
      .from('event_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchErr || !booking) {
      return res.status(404).send('Ticket not found');
    }

    const pdfBase64 = generateTicketPDF(booking);
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Spice_Garden_Ticket_${booking.id.slice(0, 8)}.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('Download Ticket Error:', error);
    res.status(500).send('Error generating ticket');
  }
});

// POST /api/create-order
router.post('/create-order', async (req: Request, res: Response) => {
  try {
    const { eventId, seats, attendeeName, attendeeEmail, attendeePhone } = req.body;

    // 1. Fetch event
    const { data: event, error: eventErr } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('status', 'active')
      .single();

    if (eventErr || !event) {
      return res.status(400).json({ success: false, error: 'Event not found or inactive' });
    }

    // 2. Validate capacity
    if ((event.capacity - event.booked_seats) < seats) {
      return res.status(400).json({ success: false, error: 'Not enough seats available' });
    }

    // 3. Amount in paise
    const amount = seats * event.price_per_seat * 100;

    // 4. Create Razorpay order
    const rzpKeyId = process.env.RAZORPAY_KEY_ID;
    const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!rzpKeyId || !rzpKeySecret) {
      // Razorpay not configured — create booking directly for testing
      console.log('[DEV] Razorpay keys not set. Creating test booking without payment.');

      const bookingId = crypto.randomUUID();
      const { error: insertErr } = await supabaseAdmin
        .from('event_bookings')
        .insert({
          id: bookingId,
          event_id: event.id,
          event_title: event.title,
          event_date: event.date,
          event_venue: event.venue,
          attendee_name: attendeeName,
          attendee_email: attendeeEmail,
          attendee_phone: attendeePhone,
          seats,
          total_amount: amount / 100,
          razorpay_order_id: 'test_' + crypto.randomUUID(),
          payment_status: 'pending'
        });

      if (insertErr) throw insertErr;

      return res.status(200).json({
        success: true,
        data: {
          orderId: 'test_order_' + Date.now(),
          bookingId: bookingId,
          amount,
          keyId: 'rzp_test_placeholder',
          testMode: true
        }
      });
    }

    // Production flow with Razorpay
    const razorpay = new Razorpay({ key_id: rzpKeyId, key_secret: rzpKeySecret });
    const receipt = crypto.randomUUID();
    const order = await razorpay.orders.create({ amount, currency: 'INR', receipt });

    // 5. Insert pending booking
    const bookingId = crypto.randomUUID();
    const { error: insertErr } = await supabaseAdmin
      .from('event_bookings')
      .insert({
        id: bookingId,
        event_id: event.id,
        event_title: event.title,
        event_date: event.date,
        event_venue: event.venue,
        attendee_name: attendeeName,
        attendee_email: attendeeEmail,
        attendee_phone: attendeePhone,
        seats,
        total_amount: amount / 100,
        razorpay_order_id: order.id,
        payment_status: 'pending'
      });

    if (insertErr) throw insertErr;

    return res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        bookingId: bookingId,
        amount,
        keyId: rzpKeyId
      }
    });
  } catch (error: any) {
    console.error('Create Order Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/verify-payment
router.post('/verify-payment', async (req: Request, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = req.body;

    const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET;

    // If no key secret (test mode), skip verification
    if (!rzpKeySecret) {
      console.log('[DEV] Razorpay key not set. Skipping signature verification.');
    } else {
      // Verify Razorpay Signature
      const signature = crypto
        .createHmac('sha256', rzpKeySecret)
        .update(razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');

      if (signature !== razorpaySignature) {
        return res.status(400).json({ success: false, error: 'Invalid payment signature' });
      }
    }

    // 2. Fetch booking
    const { data: booking, error: fetchErr } = await supabaseAdmin
      .from('event_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchErr || !booking) throw new Error('Booking not found');
    if (booking.payment_status !== 'pending') {
      return res.status(409).json({ success: false, error: 'Booking is not pending' });
    }

    // 3. Update booking to paid
    const { error: updateErr } = await supabaseAdmin
      .from('event_bookings')
      .update({ payment_status: 'paid', razorpay_payment_id: razorpayPaymentId || 'test_payment' })
      .eq('id', bookingId);

    if (updateErr) throw updateErr;

    // 4. Increment booked seats
    const { error: rpcErr } = await supabaseAdmin.rpc('increment_booked_seats', {
      p_event_id: booking.event_id,
      p_amount: booking.seats
    });

    if (rpcErr) {
      console.error('RPC increment error:', rpcErr);
      // Non-fatal — continue with email
    }

    // 5. Send email via Resend (if configured)
    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    if (resendKey && fromEmail) {
      try {
        const resend = new Resend(resendKey);
        const domain = process.env.VITE_SITE_URL || 'http://localhost:5173';
        const bookingWithPayment = { ...booking, razorpay_payment_id: razorpayPaymentId || 'test' };
        const emailHtml = generateTicketEmail(bookingWithPayment, domain);
        
        // Generate PDF ticket
        const pdfBase64 = generateTicketPDF(bookingWithPayment);
        const pdfBuffer = Buffer.from(pdfBase64, 'base64');

        await resend.emails.send({
          from: fromEmail,
          to: booking.attendee_email,
          subject: `Your Ticket for ${booking.event_title} — Spice Garden`,
          html: emailHtml,
          attachments: [
            {
              filename: `Spice_Garden_Ticket_${booking.id.slice(0, 8)}.pdf`,
              content: pdfBuffer
            }
          ]
        });
        console.log(`✅ Ticket email + PDF sent to ${booking.attendee_email}`);
      } catch (emailErr: any) {
        console.error('Email send error (non-fatal):', emailErr.message);
      }
    } else {
      console.log('[DEV] Resend keys not configured. Skipping email.');
    }

    return res.status(200).json({ success: true, data: { bookingId } });
  } catch (error: any) {
    console.error('Verify Payment Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
