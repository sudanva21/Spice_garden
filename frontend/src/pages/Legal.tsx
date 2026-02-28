export default function Legal({ type }: { type: 'terms' | 'privacy' | 'disclaimer' }) {
    const content = {
        terms: {
            title: 'Terms & Conditions',
            body: [
                'Welcome to Spice Garden. By visiting our website or garden, you agree to these terms.',
                'Booking & Cancellations: Free tickets may be cancelled up to 48 hours before the visit date. Group bookings of 10+ require 7-day advance notice.',
                'Photography: Photography for personal use is permitted in all areas. Commercial photography and drone usage require prior written approval.',
                'Conduct: Visitors must not damage, remove, or tamper with any plants, signs, or garden installations. Children must be supervised at all times.',
                'Liability: Spice Garden is not responsible for personal injury or loss of personal property during garden visits. Please wear appropriate footwear for walking trails.',
                'Intellectual Property: All content on this website — including text, images, and botanical descriptions — is the intellectual property of Spice Garden.',
                'Changes: We reserve the right to update these terms at any time. Continued use of this website constitutes acceptance of the revised terms.',
            ]
        },
        privacy: {
            title: 'Privacy Policy',
            body: [
                'Spice Garden ("we", "us") is committed to protecting your personal information.',
                'What We Collect: When you book a ticket or subscribe to our newsletter, we collect your name, email address, phone number, and visit preference information.',
                'How We Use It: We use your data to confirm bookings, send newsletters (if subscribed), and improve our services. We do not sell or trade your personal data.',
                'Email Marketing: You may unsubscribe from our newsletter at any time by clicking the unsubscribe link in any email, or by emailing us directly.',
                'Cookies: We use functional cookies to remember your preferences. No advertising trackers are used on this website.',
                'Data Retention: Booking data is retained for 2 years for operational purposes. Newsletter subscription data is retained until you unsubscribe.',
                'Your Rights: You have the right to access, correct, or delete your personal data at any time by contacting us.',
                'Contact: For privacy questions, please use the Contact page on this website.',
            ]
        },
        disclaimer: {
            title: 'Adsense & Sponsorship Disclaimer',
            body: [
                'This website may display Google AdSense advertisements. Spice Garden is a participant in the Google AdSense program.',
                'Ad Disclosure: Advertisements displayed on this website are served by Google and may be targeted based on content and visitor interests.',
                'No Direct Endorsement: The display of ads on this site does not constitute an endorsement of any advertised product or service by Spice Garden.',
                'Affiliate Links: Certain links on this website may be affiliate links. If you click through and make a purchase, we may earn a small commission at no extra cost to you.',
                'Sponsored Content: Any sponsored or partnered content on this website is clearly marked as such.',
                'Google Analytics: We use Google Analytics to understand site traffic patterns. This tool may set cookies on your device.',
                'Contact: For questions about our advertising or sponsorship practices, please use the Contact page.',
            ]
        }
    }[type];

    return (
        <div style={{ paddingTop: 120, minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: 760 }}>
                <p style={{ fontFamily: 'Cinzel', fontSize: '.75rem', letterSpacing: '3px', color: 'var(--gold)', marginBottom: 8 }}>LEGAL</p>
                <h1 style={{ marginBottom: 48 }}>{content.title}</h1>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {content.body.map((para, i) => (
                        <div key={i} className="glass" style={{ padding: 20 }}>
                            <p style={{ lineHeight: 1.8 }}>{para}</p>
                        </div>
                    ))}
                </div>
                <p style={{ marginTop: 48, color: 'var(--muted)', fontFamily: 'DM Sans', fontSize: '.85rem' }}>Last updated: February 2026 · Spice Garden, Indira Park, Hyderabad</p>
            </div>
        </div>
    );
}
