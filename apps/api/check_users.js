const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany();
        console.log('Connected to DB. User count:', users.length);
        console.log('Users:', users.map(u => ({ email: u.email, role: u.role, id: u.id })));
    } catch (e) {
        console.error('DB Connection Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
