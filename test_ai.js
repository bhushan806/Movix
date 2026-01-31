const axios = require('axios');

async function testAI() {
    try {
        console.log("Testing Smart Matching...");
        const matchRes = await axios.post('http://localhost:5000/api/assistant/chat', {
            message: "Find loads for me"
        });
        console.log("Smart Matching Response:", JSON.stringify(matchRes.data, null, 2));

        console.log("\nTesting Dynamic Pricing...");
        const priceRes = await axios.post('http://localhost:5000/api/assistant/chat', {
            message: "Price check for Mumbai"
        });
        console.log("Dynamic Pricing Response:", JSON.stringify(priceRes.data, null, 2));

    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

testAI();
