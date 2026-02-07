import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();


let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

const initializeGemini = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
        genAI = new GoogleGenerativeAI(apiKey);
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
};

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export const callGrokAPI = async (messages: ChatMessage[]) => {
    // Priority 1: Groq (Fastest Free Cloud)
    // Get key from https://console.groq.com/keys
    if (process.env.GROQ_API_KEY) {
        try {
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: "llama-3.3-70b-versatile", // Valid Free Model
                messages: messages
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.choices[0].message.content;
        } catch (error: any) {
            console.error("Groq API Error:", error.response?.data || error.message);
            // Fallthrough to next provider
        }
    }

    // Priority 2: Ollama (Local Free)
    // Install from https://ollama.com/ and run "ollama run llama3"
    const ollamaHost = process.env.OLLAMA_HOST;
    if (ollamaHost) {
        try {
            const response = await axios.post(`${ollamaHost}/api/chat`, {
                model: "llama3",
                messages: messages,
                stream: false
            });
            return response.data.message.content;
        } catch (error: any) {
            // console.warn("Ollama config present but unavailable:", error.message);
        }
    }

    // Priority 3: HuggingFace (Public API - Zero Config Fallback)
    try {
        const userMessage = messages.find(m => m.role === 'user')?.content || "";
        const systemMessage = messages.find(m => m.role === 'system')?.content || "";
        const prompt = `${systemMessage}\n\nUser: ${userMessage}\nAssistant:`; // HF models often need raw prompting

        const response = await axios.post(
            'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
            { inputs: prompt },
            { headers: { 'Content-Type': 'application/json' } }
        );
        // HF returns [{ generated_text: "..." }]
        if (Array.isArray(response.data) && response.data.length > 0) {
            let text = response.data[0].generated_text;
            // Clean up prompt from response if echoed
            if (text.startsWith(prompt)) text = text.substring(prompt.length);
            return text.trim();
        }
    } catch (error: any) {
        // console.error("HuggingFace Fallback Failed:", error.message);
    }


    // Priority 3: Gemini (Backup if Key exists)
    if (process.env.GEMINI_API_KEY) {
        if (!genAI) initializeGemini();
        if (model) {
            try {
                const userMessage = messages.find(m => m.role === 'user')?.content || "";
                const systemMessage = messages.find(m => m.role === 'system')?.content || "";

                const result = await model.generateContent(`${systemMessage}\n\nUser: ${userMessage}`);
                const response = await result.response;
                return response.text();
            } catch (err: any) {
                console.error("Gemini Error:", err.message);
            }
        }
    }

    throw new Error("No AI provider available. Please set GROQ_API_KEY (Cloud) or run Ollama (Local).");
};
