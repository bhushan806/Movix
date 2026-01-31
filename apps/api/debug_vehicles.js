const { PrismaClient } = require('@prisma/client');
const mongoose = require('mongoose');

const prisma = new PrismaClient();
const DATABASE_URL = "mongodb://127.0.0.1:27017/trucknet?directConnection=true";

// Define Mongoose Schema for reading (minimal)
const vehicleSchema = new mongoose.Schema({
    number: String,
    status: String
}, { timestamps: true });
const Vehicle = mongoose.model('Vehicle', vehicleSchema);

async function main() {
    console.log('--- Debug Vehicles ---');

    try {
        await mongoose.connect(DATABASE_URL);
        console.log('Mongoose connected.');

        // List collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n--- MongoDB Collections ---');
        collections.forEach(c => console.log(` - ${c.name}`));
        console.log('---------------------------\n');

        // 1. Check Users
        console.log('\n1. Checking Users (Prisma)...');
        const users = await prisma.user.findMany();
        console.log(`Found ${users.length} users.`);

        const ownerUser = users.find(u => u.email === 'pbhushanpatil8@gmail.com');
        if (ownerUser) {
            console.log(`Target Owner User Found: ${ownerUser.id}`);
        } else {
            console.log('Target Owner User NOT FOUND');
        }

        // 2. Check Owner Profiles (Mongoose & Prisma)
        console.log('\n2. Checking OwnerProfiles...');
        // Mongoose check
        const ownerCollection = mongoose.connection.db.collection('ownerprofiles');
        const mongooseOwners = await ownerCollection.find({}).toArray();
        console.log(`[Mongoose] Found ${mongooseOwners.length} owner profiles in 'ownerprofiles'.`);
        mongooseOwners.forEach(o => console.log(`   - UserID: ${o.userId} ID: ${o._id}`));

        // Prisma check
        console.log('[Prisma] Querying ownerProfile...');
        const owners = await prisma.ownerProfile.findMany();
        console.log(`[Prisma] Found ${owners.length} owner profiles.`);
        owners.forEach(o => console.log(`   - Owner for UserID: ${o.userId} ID: ${o.id}`));

        // 3. Check Vehicles (Mongoose & Prisma)
        console.log('\n3. Checking Vehicles...');
        // Mongoose check
        const vehicleCollection = mongoose.connection.db.collection('vehicles');
        const mongooseVehicles = await vehicleCollection.find({}).toArray();
        console.log(`[Mongoose] Found ${mongooseVehicles.length} vehicles in 'vehicles'.`);
        mongooseVehicles.forEach(v => console.log(`   - ${v.number} (${v.status}) ID: ${v._id}`));

        // Prisma check
        console.log('[Prisma] Querying vehicle...');
        const prismaVehicles = await prisma.vehicle.findMany();
        console.log(`[Prisma] Found ${prismaVehicles.length} vehicles.`);
        prismaVehicles.forEach(v => console.log(`   - ${v.number} (${v.status}) ID: ${v.id}`));

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await prisma.$disconnect();
        await mongoose.disconnect();
    }
}

main();
