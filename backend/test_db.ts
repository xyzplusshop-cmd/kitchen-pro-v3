import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
    try {
        console.log('Testing DB connection...');
        await prisma.$connect();
        console.log('Connection successful!');
        const hardwareCount = await prisma.hardwareItem.count();
        console.log('Hardware items count:', hardwareCount);
    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
