const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb://127.0.0.1:27017/?directConnection=true"; // Direct connection to admin
    const client = new MongoClient(uri);

    try {
        console.log("Connecting to MongoDB...");
        await client.connect();
        console.log("Connected successfully.");

        const adminDb = client.db('admin');

        // Check current status
        try {
            const status = await adminDb.command({ replSetGetStatus: 1 });
            console.log("Current Status:", status.myState); // 1 = PRIMARY, 2 = SECONDARY, etc.
            if (status.myState === 1) {
                console.log("Replica Set is already PRIMARY. All good.");
                return;
            }
        } catch (e) {
            console.log("Could not get status (expected if not initialized):", e.message);
        }

        // Initiate
        console.log("Attempting to initiate Replica Set...");
        try {
            const config = {
                _id: "rs0",
                members: [{ _id: 0, host: "127.0.0.1:27017" }]
            };
            const result = await adminDb.command({ replSetInitiate: config });
            console.log("Replica Set Initiated:", result);
        } catch (e) {
            console.log("Initiation failed (might be already initialized):", e.message);

            // If already initialized but broken, maybe try reconfig?
            // But usually initiate is enough for a fresh start.
        }

    } catch (e) {
        console.error("Connection Error:", e);
    } finally {
        await client.close();
    }
}

main();
