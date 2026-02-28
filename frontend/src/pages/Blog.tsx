import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePageReveal } from '../hooks/useReveal';
import { getBlogPosts } from '../api';

export default function Blog() {
    const [posts, setPosts] = useState<any[]>([]);
    usePageReveal();

    useEffect(() => {
        getBlogPosts().then(r => setPosts(r.data.posts || [])).catch(() => { });
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
