import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'missing_key');

const SYSTEM_PROMPT = "You are the Spice Garden AI assistant for Spice Garden at Gokak, Karnataka. Help visitors with spice knowledge, Ayurvedic uses, visit planning, spice-based recipes, botanical facts, and restaurant information. Be warm, educational, and engaging. Keep responses concise and friendly. If asked about location, we are situated in Jadhav Farm, Gokak.";

export const getAiCompletion = async (messages: { role: 'user' | 'assistant', content: string }[]) => {
    if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'missing_key') {
        return "Hello! I am the Spice Garden AI Assistant. (Google AI Studio API Key is missing).";
    }

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: SYSTEM_PROMPT
        });

        // Convert messages to Gemini format
        const history = messages.slice(0, -1).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        const lastMessage = messages[messages.length - 1].content;

        const chat = model.startChat({
            history: history,
        });

        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("AI Error:", error);
        throw new Error('Failed to communicate with AI service');
    }
};
