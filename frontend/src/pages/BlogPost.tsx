import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogPost } from '../api';

export default function BlogPost() {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<any>(null);

    useEffect(() => {
        if (slug) getBlogPost(slug).then(r => setPost(r.data.post)).catch(() => { });
    }, [slug]);

    if (!post) return <div className="loading" style={{ paddingTop: 120 }}>Loading...</div>;

    return (
        <div style={{ paddingTop: 120 }}>
            <div className="container" style={{ maxWidth: 760 }}>
                <p style={{ fontFamily: 'Cinzel', fontSize: '.75rem', letterSpacing: '3px', color: 'var(--gold)', marginBottom: 8 }}>{post.category?.toUpperCase()}</p>
                <h1 style={{ marginBottom: 24 }}>{post.title}</h1>
                <p style={{ color: 'var(--muted)', fontFamily: 'DM Sans', fontSize: '.85rem', marginBottom: 40 }}>By {post.author} · {new Date(post.published_at).toLocaleDateString()}</p>
                {post.featured_image_url && <img src={post.featured_image_url} alt={post.title} style={{ width: '100%', height: 360, objectFit: 'cover', marginBottom: 40 }} />}
                <div style={{ lineHeight: 1.9 }}>
                    {post.content?.split('\n').map((p: string, i: number) => <p key={i} style={{ marginBottom: 16 }}>{p}</p>)}
                </div>
                <Link to="/blog" style={{ display: 'inline-block', marginTop: 40, color: 'var(--gold)', fontFamily: 'DM Sans' }}>← Back to Blog</Link>
            </div>
        </div>
    );
}
