import { usePageReveal } from '../hooks/useReveal';

export default function About() {
    usePageReveal();

    return (
        <div className="page-enter" style={{ paddingTop: 72 }}>
            {/* Hero Banner */}
            <div style={{ position: 'relative', height: 460, overflow: 'hidden' }}>
                <img src="https://spicegarden.info/wp-content/uploads/2025/09/unnamed-2025-09-02T111529.241.webp" alt="Spice Garden Gokak" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(13,26,15,0.88) 40%, rgba(13,26,15,0.3))' }} />
                <div className="about-hero-content">
                    <p className="section-eyebrow" style={{ animation: 'fadeInUp .6s var(--ease) .2s both' }}>OUR STORY</p>
                    <h1 style={{ animation: 'fadeInUp .6s var(--ease) .4s both' }}>About Spice Garden</h1>
                </div>
            </div>

            {/* Main Content */}
            <section className="section">
                <div className="container about-main-grid">
                    <div className="reveal-left">
                        <h2 style={{ marginBottom: 24 }}>Welcome to Spice Garden</h2>
                        <p style={{ lineHeight: 1.9, marginBottom: 20 }}>
                            Welcome to Spice Garden, a vibrant and aromatic destination where nature, flavors, and beauty
                            come together in perfect harmony. Nestled in a serene and lush environment, Spice Garden is
                            designed to offer visitors an immersive experience that celebrates the richness of nature and
                            the charm of spices.
                        </p>
                        <p style={{ lineHeight: 1.9, marginBottom: 20 }}>
                            Whether you are a family seeking a peaceful outing, a nature enthusiast, or someone passionate
                            about plants and greenery, Spice Garden provides a refreshing escape from the daily hustle.
                        </p>
                        <p style={{ lineHeight: 1.9 }}>
                            We take pride in curating a diverse and thoughtfully designed environment that showcases a wide
                            variety of plants, herbs, and spices. Visitors can explore beautifully landscaped pathways,
                            vibrant flowerbeds, and thematic sections dedicated to various aromatic and medicinal plants.
                        </p>
                    </div>
                    <div className="reveal-right">
                        <div className="glass" style={{ marginBottom: 24 }}>
                            <h3 style={{ color: 'var(--gold)', marginBottom: 12 }}>🌱 Our Mission</h3>
                            <p>
                                To create a green sanctuary that promotes environmental awareness, wellness, and education
                                while providing an enjoyable and tranquil experience. We aim to foster a deeper connection
                                between people and nature, inspiring an appreciation for biodiversity and sustainable practices.
                            </p>
                        </div>
                        <div className="glass" style={{ marginBottom: 24 }}>
                            <h3 style={{ color: 'var(--gold)', marginBottom: 12 }}>🌍 Community & Sustainability</h3>
                            <p>
                                Spice Garden is committed to eco-friendly practices and environmental stewardship. We employ
                                sustainable gardening methods, conserve water, and focus on planting native and spice-rich
                                species to support local biodiversity.
                            </p>
                        </div>
                        <div className="glass">
                            <h3 style={{ color: 'var(--gold)', marginBottom: 12 }}>💎 Our Values</h3>
                            <p>
                                Integrity, sustainability, and community engagement are our guiding principles. We operate
                                with transparency and dedication to maintaining a safe and welcoming environment for all visitors.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="section" style={{ background: 'var(--surface)' }}>
                <div className="container">
                    <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
                        <p className="section-eyebrow">WHY CHOOSE US</p>
                        <h2>The Spice Garden Difference</h2>
                    </div>
                    <div className="about-features-grid">
                        {[
                            { icon: '🌿', title: 'Natural Beauty', desc: 'Lush spice plantations with a fragrant ambiance' },
                            { icon: '📚', title: 'Educational Value', desc: 'Learn cultivation, uses, and history of spices' },
                            { icon: '👪', title: 'Family-Friendly', desc: 'Quality time together in nature for all ages' },
                            { icon: '📸', title: 'Photography', desc: 'Stunning natural landscapes to capture' },
                        ].map((item, i) => (
                            <div key={item.title} className="glass reveal" style={{ textAlign: 'center', transitionDelay: `${i * .1}s` }}>
                                <div style={{ fontSize: '2rem', marginBottom: 12 }}>{item.icon}</div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>{item.title}</h3>
                                <p style={{ fontSize: '.9rem' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* The Experience */}
            <section className="section">
                <div className="container" style={{ maxWidth: 780 }}>
                    <div className="reveal" style={{ textAlign: 'center', marginBottom: 40 }}>
                        <p className="section-eyebrow">THE EXPERIENCE</p>
                        <h2>Join the Spice Garden Experience</h2>
                    </div>
                    <div className="reveal">
                        <p style={{ lineHeight: 2, marginBottom: 20, textAlign: 'center' }}>
                            Whether you are visiting for relaxation, education, or exploration, Spice Garden invites you
                            to immerse yourself in a world of natural beauty, aroma, and tranquility. Discover vibrant
                            landscapes, enjoy serene surroundings, and gain knowledge about the fascinating world of spices.
                        </p>
                        <p style={{ lineHeight: 2, textAlign: 'center' }}>
                            At Spice Garden, we don't just offer a garden — we provide an enriching experience that nourishes
                            the mind, body, and soul while fostering a lasting connection with nature.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
