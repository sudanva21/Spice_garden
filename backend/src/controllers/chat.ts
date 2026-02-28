import { Request, Response } from 'express';
import { supabase } from '../db';
import { getAiCompletion } from '../services/ai';
import { v4 as uuidv4 } from 'uuid';

export const processMessage = async (req: Request, res: Response) => {
    let { sessionId, message, history } = req.body;

    if (!sessionId) {
        sessionId = uuidv4();
    }

    if (!message) {
        return res.status(400).json({ success: false, error: 'Message is required', code: 400 });
    }

    const formattedHistory: { role: 'user' | 'assistant', content: string }[] = Array.isArray(history) ? history.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
    })) : [];

    const aiMessages: { role: 'user' | 'assistant', content: string }[] = [...formattedHistory, { role: 'user', content: message }];

    try {
        const aiResponse = await getAiCompletion(aiMessages);
        const newContext = [...aiMessages, { role: 'assistant', content: aiResponse }];

        // Save to DB
        await supabase.from('chat_sessions').upsert({
            session_id: sessionId,
            messages: newContext,
            updated_at: new Date().toISOString()
        }, { onConflict: 'session_id' });

        res.json({ success: true, sessionId, reply: aiResponse });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message || 'AI processing failed', code: 500 });
    }
};
