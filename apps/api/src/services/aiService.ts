// ── AI Provider Service ──
// SECURITY: No API keys are hardcoded. All keys come from environment variables.
// Provider priority: Groq (Cloud) → Ollama (Local) → HuggingFace (Free Fallback)
// Gemini has been removed from the provider chain.

import axios from 'axios';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';
dotenv.config();

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export const callGrokAPI = async (messages: ChatMessage[]) => {
    // Priority 1: Groq (Fastest Cloud Provider)
    if (process.env.GROQ_API_KEY) {
        try {
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: "llama-3.3-70b-versatile",
                messages: messages
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000,
            });
            return response.data.choices[0].message.content;
        } catch (error: any) {
            // SECURITY: Never log the API key; only log sanitized error info
            const status = error.response?.status;
            const msg = error.response?.data?.error?.message || error.message;
            logger.error('Groq API error', { status, message: msg });
            // Fallthrough to next provider
        }
    }

    // Priority 2: Ollama (Local Free)
    const ollamaHost = process.env.OLLAMA_HOST;
    if (ollamaHost) {
        try {
            const response = await axios.post(`${ollamaHost}/api/chat`, {
                model: "llama3",
                messages: messages,
                stream: false
            }, { timeout: 15000 });
            return response.data.message.content;
        } catch {
            // Ollama not available, fallthrough
        }
    }

    // Priority 3: HuggingFace (Public API - Zero Config Fallback)
    try {
        const userMessage = messages.find(m => m.role === 'user')?.content || "";
        const systemMessage = messages.find(m => m.role === 'system')?.content || "";
        const prompt = `${systemMessage}\n\nUser: ${userMessage}\nAssistant:`;

        const response = await axios.post(
            'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
            { inputs: prompt },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 15000,
            }
        );

        if (Array.isArray(response.data) && response.data.length > 0) {
            let text = response.data[0].generated_text;
            if (text.startsWith(prompt)) text = text.substring(prompt.length);
            return text.trim();
        }
    } catch {
        // HuggingFace fallback failed
    }

    throw new Error("No AI provider available. Please set GROQ_API_KEY (Cloud) or run Ollama (Local).");
};
