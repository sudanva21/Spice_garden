import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'missing_key');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'spicegarden@gmail.com';
const FROM_EMAIL = 'no-reply@spicegarden.info'; // Must be a verified domain on Resend

export const sendBookingConfirmation = async (email: string, name: string, date: string, type: string, size: number) => {
  return resend.emails.send({
    from: `Spice Garden <${FROM_EMAIL}>`,
    to: [email],
    subject: 'Your Spice Garden Visit is Confirmed!',
    html: `
      <h2>Hello ${name},</h2>
      <p>Your visit to the Spice Garden at Indira Park is confirmed!</p>
      <ul>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Tour Type:</strong> ${type}</li>
        <li><strong>Group Size:</strong> ${size}</li>
      </ul>
      <h3>What to Bring:</h3>
      <ul>
        <li>Comfortable walking shoes</li>
        <li>Water bottle</li>
        <li>Hat and sunglasses</li>
      </ul>
      <p>We look forward to seeing you!<br/>- The Spice Garden Team</p>
    `
  });
};

export const sendAdminBookingAlert = async (bookingDetails: string) => {
  return resend.emails.send({
    from: `Spice Garden Alerts <${FROM_EMAIL}>`,
    to: [ADMIN_EMAIL],
    subject: 'New Booking Alert',
    text: `A new booking has been made:\n\n${bookingDetails}\n\nLogin to the admin dashboard to view details.`
  });
};

export const sendContactReceipt = async (email: string, name: string) => {
  return resend.emails.send({
    from: `Spice Garden Support <${FROM_EMAIL}>`,
    to: [email],
    subject: 'We received your message',
    text: `Hi ${name},\n\nWe received your message and our team will get back to you within 24 hours.\n\nBest,\nSpice Garden`
  });
};

export const sendNewsletterWelcome = async (email: string) => {
  return resend.emails.send({
    from: `Spice Garden News <${FROM_EMAIL}>`,
    to: [email],
    subject: 'Welcome to the Spice Garden Newsletter',
    html: `
      <h3>Welcome!</h3>
      <p>You're now subscribed to the Spice Garden newsletter.</p>
      <p><strong>Spice of the Month:</strong> Cardamom is known as the Queen of Spices and has been traded for over 4,000 years.</p>
      <p>Stay tuned for our upcoming events!</p>
    `
  });
};
