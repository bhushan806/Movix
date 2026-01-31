const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock env if needed, or rely on dotenv
require('dotenv').config();

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "mongodb+srv://trucknet_admin:trucknet12345@movix.k9kjrbh.mongodb.net/trucknet?retryWrites=true&w=majority&appName=movix",
        },
    },
});

async function debugRegister() {
    console.log('--- Starting Debug Register ---');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);

    try {
        // 1. Test DB Connection
        console.log('1. Testing DB Connection...');
        const count = await prisma.user.count();
        console.log('   DB Connected. User count:', count);

        // 2. Prepare Data
        const data = {
            email: `debug_${Date.now()}@test.com`,
            phone: `999${Date.now().toString().slice(-7)}`,
            password: 'password123',
            name: 'Debug User',
            role: 'DRIVER'
        };
        console.log('2. Preparing to register:', data.email);

        // 3. Check Existing
        console.log('3. Checking existing user...');
        const existing = await prisma.user.findFirst({
            where: { OR: [{ email: data.email }, { phone: data.phone }] }
        });
        if (existing) console.log('   User already exists (unexpected for unique email)');
        else console.log('   User does not exist.');

        // 4. Hash Password
        console.log('4. Hashing password...');
        const hashedPassword = await bcrypt.hash(data.password, 10);
        console.log('   Password hashed.');

        // 5. Create User
        console.log('5. Creating User...');
        const user = await prisma.user.create({
            data: {
                ...data,
                password: hashedPassword
            }
        });
        console.log('   User created:', user.id);

        // 6. Create Profile
        console.log('6. Creating Driver Profile...');
        try {
            const profile = await prisma.driverProfile.create({
                data: {
                    userId: user.id,
                    licenseNumber: `DBG-${Date.now()}`,
                    experienceYears: 1,
                    rating: 5.0,
                    totalTrips: 0
                }
            });
            console.log('   Profile created:', profile.id);
        } catch (err) {
            console.error('   Profile creation failed:', err);
        }

        // 7. Generate Tokens
        console.log('7. Generating Tokens...');
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
        console.log('   Token generated:', token.substring(0, 20) + '...');

        console.log('--- Debug Register SUCCESS ---');

    } catch (error) {
        console.error('--- Debug Register FAILED ---');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

debugRegister();
