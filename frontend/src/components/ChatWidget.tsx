import { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from '../api';

const SUGGESTED = [
    "What's in season now?",
    "Tell me about turmeric",
    "Help me plan my visit",
    "Suggest a spice-based recipe",
];

let sessionId = Math.random().toString(36).slice(2);

interface Message { role: 'user' | 'ai'; content: string; }

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
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
            setMessages([...newMsgs, { role: 'ai', content: "Sorry, I'm having trouble connecting right now. Please check that the backend server is running." }]);
        }
        setLoading(false);
    };

    return (
        <>
            {open && (
                <div className="chat-panel">
                    <div className="chat-panel-header">
                        <h4>🌿 Spice Garden AI</h4>
                        <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                    </div>
                    <div className="chat-messages">
                        {messages.length === 0 && (
                            <div>
                                <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: 12 }}>Ask me anything about Spice Garden:</p>
                                {SUGGESTED.map(s => (
                                    <button key={s} onClick={() => send(s)} style={{ display: 'block', background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.2)', color: 'var(--gold)', borderRadius: 20, padding: '8px 14px', marginBottom: 8, cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '.85rem', width: '100%', textAlign: 'left' }}>{s}</button>
                                ))}
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <div key={i} className={`chat-msg ${m.role}`}>{m.content}</div>
                        ))}
                        {loading && <div className="chat-msg ai">● ● ●</div>}
                        <div ref={endRef} />
                    </div>
                    <div className="chat-input-row">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && send()}
                            placeholder="Ask about spices, visits..."
                        />
                        <button onClick={() => send()}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D1A0F" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                        </button>
                    </div>
                </div>
            )}
            <button className="chat-fab" onClick={() => setOpen(!open)}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0D1A0F" strokeWidth="2.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            </button>
        </>
    );
}
