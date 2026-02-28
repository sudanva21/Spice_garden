
export default function StickyContact() {
    const phone = '09741800400';
    const whatsapp = '9741800400';

    return (
        <div style={{
            position: 'fixed', bottom: 24, left: 24, zIndex: 999,
            display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start'
        }}>
            {/* WhatsApp */}
            <a
                href={`https://wa.me/91${whatsapp}?text=Hi%20Spice%20Garden!%20I%20would%20like%20to%20make%20a%20reservation.`}
                target="_blank" rel="noopener noreferrer"
                style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(37,211,102,0.4)', transition: 'transform .3s ease',
                    textDecoration: 'none', fontSize: '1.6rem'
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                title="Chat on WhatsApp"
            >💬</a>

            {/* Call Now */}
            <a
                href={`tel:+91${phone}`}
                style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(212,168,67,0.4)', transition: 'transform .3s ease',
                    textDecoration: 'none', fontSize: '1.4rem', color: '#0D1A0F'
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                title="Call Now"
            >📞</a>
        </div>
    );
}
