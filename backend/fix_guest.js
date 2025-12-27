const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkGuestUser() {
    try {
        const guest = await prisma.user.findFirst({
            where: { email: 'guest@kitchenpro.com' }
        });

        if (!guest) {
            console.log('❌ Usuario Guest NO encontrado en la BD');
            console.log('Creando usuario Guest...');

            const newGuest = await prisma.user.create({
                data: {
                    email: 'guest@kitchenpro.com',
                    password: await bcrypt.hash('guest123', 10),
                    name: 'Guest User',
                    role: 'USER'
                }
            });
            console.log('✅ Usuario Guest creado con ID:', newGuest.id);
        } else {
            console.log('✅ Usuario Guest encontrado');
            console.log('   ID:', guest.id);
            console.log('   Email:', guest.email);
            console.log('   Nombre:', guest.name);

            // Verificar password
            const isValidPassword = await bcrypt.compare('guest123', guest.password);
            console.log('   Password valido:', isValidPassword ? 'SI ✅' : 'NO ❌');

            if (!isValidPassword) {
                console.log('\n⚠️  PASSWORD INCORRECTO - Actualizando...');
                await prisma.user.update({
                    where: { id: guest.id },
                    data: {
                        password: await bcrypt.hash('guest123', 10)
                    }
                });
                console.log('✅ Password actualizado correctamente');
            }
        }
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkGuestUser();
