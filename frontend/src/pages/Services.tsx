import { Link } from 'react-router-dom';
import { usePageReveal } from '../hooks/useReveal';

const SERVICES = [
    {
        icon: '🌿',
        title: 'Nature Walks',
        description: 'Guided botanical trails through our extensive collection of rare spices, herbs, and medicinal plants. Our expert guides walk you through the cultivation process and the fascinating stories behind each plant.',
        features: ['90-minute guided tour', 'Expert botanist guide', 'All age groups welcome', 'Accessible pathways']
    },
    {
        icon: '📸',
        title: 'Photography Zone',
        description: 'Curated photography spots including the golden hour cardamom corridor, water lily pond, bamboo grove, and macro gardens. Perfect for both professionals and hobbyists.',
        features: ['Dedicated photo spots', 'Golden hour access', 'Macro garden area', 'Tripod-friendly zones']
    },
    {
        icon: '🧘',
        title: 'Yoga & Meditation',
        description: 'Morning yoga and pranayama sessions on our open-air pavilion, surrounded by aromatic cardamom and lemongrass plants. Breathe in nature, breathe out stress.',
        features: ['6 AM sunrise sessions', 'Certified instructors', 'Mat & props provided', 'All skill levels']
    },
    {
        icon: '🎓',
        title: 'Educational Tours',
        description: 'Interactive learning sessions for school groups and families. Students explore spice cultivation, Ayurvedic science, and sustainable agriculture through hands-on activities.',
        features: ['School group packages', 'Interactive worksheets', 'Lab demonstrations', 'Certificate of participation']
    },
    {
        icon: '🍵',
        title: 'Spice Tasting',
        description: 'Guided tasting sessions where you explore the flavor profiles of fresh vs. dried spices. Learn how different processing methods affect taste, aroma, and medicinal properties.',
        features: ['12 spice varieties', 'Fresh vs dried comparison', 'Flavor pairing tips', 'Take-home samples']
    },
    {
        icon: '🌱',
        title: 'Wellness Retreats',
        description: 'Half-day and full-day wellness programs combining Ayurvedic principles, herbal teas, garden meditation, and spice-based wellness practices.',
        features: ['Ayurvedic consultation', 'Herbal tea ceremony', 'Garden meditation', 'Wellness toolkit']
    }
];

export default function Services() {
    usePageReveal();

    return (
        <div className="page-enter" style={{ paddingTop: 120, minHeight: '100vh' }}>
            <div className="container">
                <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
                    <p className="section-eyebrow">EXPERIENCES</p>
                    <h1>Our Services</h1>
                    <p style={{ maxWidth: 520, margin: '16px auto 0' }}>
                        Immersive experiences designed to connect you with the fascinating world of spices
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 28 }}>
                    {SERVICES.map((s, i) => (
                        <div key={s.title} className="glass reveal" style={{ transitionDelay: `${i * .08}s` }}>
                            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '2rem', flexShrink: 0 }}>{s.icon}</span>
                                <div>
                                    <h3 style={{ marginBottom: 10 }}>{s.title}</h3>
                                    <p style={{ marginBottom: 16, fontSize: '.95rem' }}>{s.description}</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {s.features.map(f => (
                                            <span key={f} style={{
                                                fontFamily: 'DM Sans', fontSize: '.75rem', padding: '4px 14px',
                                                background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.12)',
                                                borderRadius: 20, color: 'var(--gold)'
                                            }}>{f}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="reveal" style={{ textAlign: 'center', marginTop: 60 }}>
                    <div className="glass" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: 40 }}>
                        <h3 style={{ marginBottom: 12 }}>Ready to Experience Spice Garden?</h3>
                        <p style={{ marginBottom: 24 }}>Admission is free. Book your spot online to secure your preferred time slot.</p>
                        <Link to="/book" className="btn btn-gold">Book Free Ticket →</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
