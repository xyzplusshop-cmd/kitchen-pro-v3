const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAndCreateGuestUser() {
    console.log('🔍 Checking for guest user...');

    try {
        // Check if guest user exists
        let user = await prisma.user.findUnique({
            where: { email: 'guest@kitchenpro.com' }
        });

        if (user) {
            console.log('✅ Guest user already exists:');
            console.log(`   ID: ${user.id}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Name: ${user.name}`);
        } else {
            console.log('⚠️  Guest user NOT found. Creating...');

            // Create guest user
            const hashedPassword = await bcrypt.hash('guest123', 10);

            user = await prisma.user.create({
                data: {
                    email: 'guest@kitchenpro.com',
                    password: hashedPassword,
                    name: 'Usuario Invitado'
                }
            });

            console.log('✅ Guest user created successfully:');
            console.log(`   ID: ${user.id}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Password: guest123`);
        }

        // Show all users
        const allUsers = await prisma.user.findMany();
        console.log(`\n📊 Total users in database: ${allUsers.length}`);
        allUsers.forEach(u => {
            console.log(`   - ${u.email} (${u.name})`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkAndCreateGuestUser();
