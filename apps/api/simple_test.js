const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "mongodb://127.0.0.1:27017/trucknet?directConnection=true",
        },
    },
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    console.log('Testing simple create...');
    try {
        const email = `test_${Date.now()}@example.com`;
        console.log('Creating user with email:', email);

        const user = await prisma.user.create({
            data: {
                email: email,
                phone: `123${Date.now()}`,
                password: 'password',
                name: 'Simple Test',
                role: 'CUSTOMER'
            }
        });
        console.log('User created:', user.id);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
