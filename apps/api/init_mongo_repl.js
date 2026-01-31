const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb://127.0.0.1:27017";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const adminDb = client.db('admin');
        try {
            const status = await adminDb.command({ replSetInitiate: { _id: "rs0", members: [{ _id: 0, host: "127.0.0.1:27017" }] } });
            console.log("Replica Set Initiated:", status);
        } catch (e) {
            if (e.codeName === 'AlreadyInitialized') {
                console.log("Replica Set already initialized");
            } else {
                throw e;
            }
        }
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.close();
    }
}

main();
