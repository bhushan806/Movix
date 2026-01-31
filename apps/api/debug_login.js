const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('--- Debug Login ---');
    const email = 'admin@trucknet.com';
    const password = 'admin123';

    try {
        console.log(`1. Searching for user: ${email}`);
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.log('❌ User NOT FOUND by Prisma');
            // Try findFirst to see if it's a unique constraint issue
            const userFirst = await prisma.user.findFirst({ where: { email } });
            if (userFirst) {
                console.log('⚠️ User FOUND by findFirst (Unique constraint issue?)');
            }
            return;
        }

        console.log('✅ User FOUND by Prisma:', user.id);
        console.log('   Role:', user.role);
        console.log('   Stored Hash:', user.password.substring(0, 10) + '...');

        console.log('2. Verifying Password...');
        const isValid = await bcrypt.compare(password, user.password);

        if (isValid) {
            console.log('✅ Password MATCHES');
        } else {
            console.log('❌ Password does NOT match');
            // Test hash generation
            const newHash = await bcrypt.hash(password, 10);
            console.log('   Test Hash:', newHash.substring(0, 10) + '...');
        }

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
