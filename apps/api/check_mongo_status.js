const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb://127.0.0.1:27017/?directConnection=true";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const adminDb = client.db('admin');
        const status = await adminDb.command({ replSetGetStatus: 1 });

        console.log("--------------------------------");
        console.log("Set Name:", status.set);
        console.log("My State:", status.myState); // 1 = PRIMARY
        console.log("Members:", status.members.map(m => ({ name: m.name, stateStr: m.stateStr })));
        console.log("--------------------------------");

    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await client.close();
    }
}

main();
