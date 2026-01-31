const axios = require('axios');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyC2vk6nWUrgBA1n1hSXT1eSiFc9-dCYaqM";

async function listModels() {
    try {
        console.log("Listing models...");
        const response = await axios.get(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
        );
        console.log("Models:", response.data.models.map(m => m.name));
    } catch (error) {
        console.error("Error listing models:", error.message);
    }
}

async function testGeminiFlash() {
    try {
        console.log("\nTesting Gemini 2.0 Flash...");
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: "Hello"
                    }]
                }]
            },
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log("Success with Flash!");
        console.log("Reply:", response.data.candidates?.[0]?.content?.parts?.[0]?.text);
    } catch (error) {
        console.error("Error with Flash:", error.message);
        if (error.response) console.error(JSON.stringify(error.response.data, null, 2));
    }
}

async function run() {
    await listModels();
    await testGeminiFlash();
}

run();
