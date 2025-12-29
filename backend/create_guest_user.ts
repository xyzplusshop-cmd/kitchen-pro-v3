import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createGuestUser() {
    console.log('🔧 Creating guest user...');

    try {
        // Check if guest user already exists
        const existingGuest = await prisma.user.findUnique({
            where: { email: 'guest@kitchenpro.com' }
        });

        if (existingGuest) {
            console.log('✅ Guest user already exists:', existingGuest.email);
            return;
        }

        // Create guest user
        const hashedPassword = await bcrypt.hash('guestpass', 10);

        const guestUser = await prisma.user.create({
            data: {
                email: 'guest@kitchenpro.com',
                password: hashedPassword,
                name: 'Usuario Invitado',
                role: 'USER'
            }
        });

        console.log('✅ Guest user created successfully!');
        console.log('Email:', guestUser.email);
        console.log('Password: guestpass');
        console.log('Name:', guestUser.name);
        console.log('ID:', guestUser.id);

    } catch (error) {
        console.error('❌ Error creating guest user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createGuestUser();
