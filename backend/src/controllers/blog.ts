import { Request, Response } from 'express';
import { supabase } from '../db';

export const getPublishedPosts = async (req: Request, res: Response) => {
    const { category, limit } = req.query;

    let query = supabase.from('blog_posts').select('*').eq('published', true).order('published_at', { ascending: false });

    if (category) {
        query = query.eq('category', category);
    }
    if (limit) {
        query = query.limit(parseInt(limit as string, 10));
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });

    res.json({ success: true, posts: data });
};

export const getPostBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;

    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) return res.status(404).json({ success: false, error: 'Post not found', code: 404 });

    res.json({ success: true, post: data });
};

export const createPost = async (req: Request, res: Response) => {
    const { title, slug, excerpt, content, featured_image_url, category, author, published } = req.body;

    const { data, error } = await supabase
        .from('blog_posts')
        .insert([{
            title, slug, excerpt, content, featured_image_url, category, author, published,
            published_at: published ? new Date().toISOString() : null
        }])
        .select()
        .single();

    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });

    res.status(201).json({ success: true, post: data });
};

export const updatePost = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    if (updates.published && updates.published_at === undefined) {
        updates.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });

    res.json({ success: true, post: data });
};

export const deletePost = async (req: Request, res: Response) => {
    const { id } = req.params;

    const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

    if (error) return res.status(500).json({ success: false, error: error.message, code: 500 });

    res.json({ success: true });
};
