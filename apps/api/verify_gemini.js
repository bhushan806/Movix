const axios = require('axios');

async function test() {
    try {
        console.log('Testing Gemini API at http://localhost:5000/api/assistant/ask-ai...');
        const response = await axios.post('http://localhost:5000/api/assistant/ask-ai', {
            message: "Hello, are you there?",
            role: "Driver"
        });

        console.log('Status:', response.status);
        console.log('Success! Response:', JSON.stringify(response.data, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) {
            console.error('Response data:', e.response.data);
        }
    }
}

test();
