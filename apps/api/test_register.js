const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    try {
        const email = 'test@example.com';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                phone: '1234567890',
                password: hashedPassword,
                name: 'Test User',
                role: 'DRIVER',
                driverProfile: {
                    create: {
                        licenseNumber: 'TEST-LICENSE',
                        experienceYears: 2
                    }
                }
            },
            include: {
                driverProfile: true
            }
        });
        console.log('User created successfully:', user);
    } catch (e) {
        console.error('Registration Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
