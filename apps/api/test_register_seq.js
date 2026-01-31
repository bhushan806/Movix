const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    try {
        const email = 'test3@example.com';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Manual sequential creation to match the new service logic
        const user = await prisma.user.create({
            data: {
                email,
                phone: '0987654321',
                password: hashedPassword,
                name: 'Test User 2',
                role: 'DRIVER'
            }
        });
        console.log('User created:', user.id);

        const profile = await prisma.driverProfile.create({
            data: {
                userId: user.id,
                licenseNumber: 'TEST-LICENSE-2',
                experienceYears: 2,
                rating: 5.0,
                totalTrips: 0
            }
        });
        console.log('Profile created:', profile.id);

    } catch (e) {
        console.error('Registration Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
