import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../api';

const SUGGESTED = [
    "Plan my visit to Spice Garden",
    "Tell me about the health benefits of turmeric",
    "What spices are currently in season?",
    "Suggest a spice-based recipe for immunity",
    "What Ayurvedic teas can I make at home?",
    "How are black pepper vines grown?",
];

let sessionId = Math.random().toString(36).slice(2);

interface Message { role: 'user' | 'ai'; content: string; }

export default function AskAI() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const send = async (text?: string) => {
        const msg = (text || input).trim();
        if (!msg) return;
        setInput('');
        const newMsgs: Message[] = [...messages, { role: 'user', content: msg }];
        setMessages(newMsgs);
        setLoading(true);
        try {
            const history = newMsgs.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }));
            const res = await sendChatMessage(sessionId, msg, history);
            setMessages([...newMsgs, { role: 'ai', content: res.data.reply }]);
        } catch {
            setMessages([...newMsgs, { role: 'ai', content: "I'm having trouble connecting to the AI right now. Please ensure the backend server is running and your Anthropic API key is configured." }]);
        }
        setLoading(false);
    };

    const exportChat = () => {
        const text = messages.map(m => `${m.role === 'user' ? 'You' : 'Spice Garden AI'}: ${m.content}`).join('\n\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'spice-garden-chat.txt'; a.click();
    };

    return (
        <div style={{ paddingTop: 70, height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ background: 'var(--surface)', borderBottom: '1px solid rgba(212,168,67,0.1)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontFamily: 'Cormorant Garamond', color: 'var(--gold)', margin: 0 }}>🌿 Spice Garden AI</h2>
                    <p style={{ margin: 0, fontSize: '.85rem', color: 'var(--muted)', fontFamily: 'DM Sans' }}>Ask about spices, visits, Ayurveda, and more</p>
                </div>
                {messages.length > 0 && (
                    <button onClick={exportChat} className="btn btn-outline" style={{ fontSize: '13px', padding: '8px 18px' }}>Export Chat ↓</button>
                )}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 800, width: '100%', margin: '0 auto' }}>
                {messages.length === 0 && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 16 }}>🌿</div>
                        <h2 style={{ marginBottom: 8 }}>Ask the Spice Garden AI</h2>
                        <p style={{ color: 'var(--muted)', maxWidth: 500, marginBottom: 40 }}>I can help you with spice knowledge, Ayurvedic wisdom, visit planning, recipes, and everything botanical.</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 600 }}>
                            {SUGGESTED.map(s => (
                                <button key={s} onClick={() => send(s)} style={{ background: 'var(--surface)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 10, padding: '12px 16px', color: 'var(--text)', textAlign: 'left', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '.85rem', transition: 'all .2s' }}>{s}</button>
                            ))}
                        </div>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{ maxWidth: '75%', padding: '14px 18px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: m.role === 'user' ? 'var(--gold)' : 'var(--surface2)', color: m.role === 'user' ? '#0D1A0F' : 'var(--text)', fontFamily: 'Lora', fontSize: '.95rem', lineHeight: 1.7 }}>{m.content}</div>
                    </div>
                ))}
                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{ padding: '14px 18px', borderRadius: '16px 16px 16px 4px', background: 'var(--surface2)', color: 'var(--muted)', fontFamily: 'DM Sans' }}>● ● ●</div>
                    </div>
                )}
                <div ref={endRef} />
            </div>

            {/* Input */}
            <div style={{ background: 'var(--surface)', borderTop: '1px solid rgba(212,168,67,0.1)', padding: '16px 24px' }}>
                <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', gap: 12 }}>
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                        placeholder="Ask about spices, Ayurveda, visit planning..."
                        style={{ flex: 1, background: 'var(--bg)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 28, padding: '14px 20px', color: 'var(--text)', fontFamily: 'Lora', fontSize: '.95rem', outline: 'none' }}
                    />
                    <button onClick={() => send()} className="btn btn-gold" disabled={!input.trim() || loading}>Send</button>
                </div>
            </div>
        </div>
    );
}
