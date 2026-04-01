import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePageReveal } from '../hooks/useReveal';
import { getBlogPosts } from '../api';

export const MOCK_BLOGS = [
    {
        id: '1',
        slug: 'the-art-of-indian-spices',
        title: 'The Art of Indian Spices: A Culinary Journey',
        excerpt: `Discover the rich history and health benefits of the core spices used in every authentic Indian kitchen.`,
        content: `Indian cuisine is globally renowned for its vibrant flavors, a direct result of its masterful use of spices. But these spices offer more than just taste; they are a cornerstone of Ayurvedic medicine.\n\nTake Turmeric, for instance. Known as the "golden spice," it contains curcumin, a powerful anti-inflammatory compound. Then there's Cumin, which aids digestion and adds an earthy warmth to dishes.\n\nIn our kitchen at Spice Garden, we source our spices whole and grind them fresh daily. This ensures that the essential oils—where the flavor and health benefits reside—are preserved. Next time you enjoy our signature curries, see if you can identify the subtle notes of cardamom, cloves, and cinnamon.`,
        category: 'Culinary Wisdom',
        author: 'Chef Sharma',
        published_at: '2023-11-15T10:00:00Z',
        featured_image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: '2',
        slug: 'indo-chinese-fusion',
        title: 'Indo-Chinese Cuisine: A Marriage of Flavors',
        excerpt: `How the Chinese community in Kolkata created a beloved culinary tradition that took India by storm.`,
        content: `Indo-Chinese food is a distinct cuisine that originated in Kolkata, where a small Chinese community adapted their traditional recipes to suit Indian palates. The result? A fiery, garlicky, and deeply savory flavor profile that is completely unique.\n\nDishes like Gobi Manchurian and Hakka Noodles are staples that blend Chinese cooking techniques—like stir-frying in a wok—with Indian spices such as garam masala and copious amounts of green chilies.\n\nAt Spice Garden, we honor this tradition. Our Indo-Chinese dishes use dark soy sauce, vinegar, and our house-made chili garlic paste to achieve that perfect umami balance. It's comfort food at its finest.`,
        category: 'Food History',
        author: 'Anita Desai',
        published_at: '2023-12-02T14:30:00Z',
        featured_image_url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: '3',
        slug: 'perfect-biryani-secrets',
        title: 'Secrets to the Perfect Dum Biryani',
        excerpt: `It's not just about the recipe, it's about the technique. Learn how patience and precision create the ultimate Dum Biryani.`,
        content: `Making a great Dum Biryani is an exercise in patience. "Dum" refers to the slow-cooking process where the vessel is sealed tightly with dough, allowing the meat and rice to cook in their own steam.\n\nFirst, the basmati rice must be aged and soaked properly to achieve separate, elongated grains. Second, the meat marinade needs time to tenderize the protein using papaya or yogurt. Finally, the layering process is crucial: alternating aromatic rice, marinated meat, saffron milk, and caramelized onions (birista).\n\nCooking it on a low flame ensures the flavors meld perfectly without burning the bottom layer. It's a labor of love that you can taste in every bite at Spice Garden.`,
        category: 'Chef Secrets',
        author: 'Chef Sharma',
        published_at: '2024-01-20T09:15:00Z',
        featured_image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
];

export default function Blog() {
    const [posts, setPosts] = useState<any[]>([]);
    usePageReveal();

    useEffect(() => {
    useEffect(() => {
        getBlogPosts().then(r => {
            const apiPosts = r.data.posts || [];
            setPosts(apiPosts.length > 0 ? apiPosts : MOCK_BLOGS);
        }).catch(() => { 
            setPosts(MOCK_BLOGS);
        });
    }, []);
    }, []);

    return (
        <div className="page-enter" style={{ paddingTop: 120, minHeight: '100vh' }}>
            <div className="container">
                <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
                    <p className="section-eyebrow">STORIES & KNOWLEDGE</p>
                    <h1>Blog</h1>
                    <p style={{ maxWidth: 500, margin: '12px auto 0' }}>Spice stories, Ayurvedic wisdom, and garden insights</p>
                </div>

                <div className="blog-grid">
                    {posts.map((post, i) => (
                        <Link key={post.id} to={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="blog-card" style={{ transitionDelay: `${i * .08}s` }}>
                                {post.featured_image_url && <img src={post.featured_image_url} alt={post.title} />}
                                <div className="blog-card-body">
                                    <p className="category">{post.category}</p>
                                    <h3>{post.title}</h3>
                                    <p style={{ marginTop: 8 }}>{post.excerpt}</p>
                                    <p style={{ fontFamily: 'DM Sans', fontSize: '.75rem', color: 'var(--muted)', marginTop: 12 }}>
                                        {post.author} · {post.published_at ? new Date(post.published_at).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {posts.length === 0 && (
                    <div className="blog-grid">
                        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 380 }} />)}
                    </div>
                )}
            </div>
        </div>
    );
}
