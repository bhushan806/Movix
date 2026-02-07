import dotenv from 'dotenv';
import { callGrokAPI } from './services/aiService';


dotenv.config();

async function testGrok() {
    console.log('Testing Grok API...');
    console.log('API Key present:', !!process.env.GROK_API_KEY);

    try {
        const messages = [
            { role: 'system' as const, content: 'You are a test assistant.' },
            { role: 'user' as const, content: 'Say hello!' }
        ];

        console.log('Sending request...');
        const response = await callGrokAPI(messages);
        console.log('Response received:', response);
    } catch (error: any) {
        console.error('Test failed:', error.message);
    }
}

testGrok();
