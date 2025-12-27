import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUser() {
    try {
        const email = 'andersoncdiaz@gmail.com';
        const password = 'qwerty12';
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: 'Anderson Diaz',
                role: 'USER'
            }
        });

        console.log('✅ Usuario creado exitosamente:');
        console.log('Email:', user.email);
        console.log('ID:', user.id);
        console.log('Rol:', user.role);
    } catch (error: any) {
        if (error.code === 'P2002') {
            console.log('⚠️  El usuario ya existe en la base de datos');
        } else {
            console.error('❌ Error al crear usuario:', error.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

createUser();
