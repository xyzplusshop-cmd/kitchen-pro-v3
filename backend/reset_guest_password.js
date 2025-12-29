const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetGuestPassword() {
    console.log('🔄 Resetting guest user password...\n');

    try {
        const email = 'guest@kitchenpro.com';
        const newPassword = 'kitchen2024';

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user
        const user = await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });

        console.log('✅ Password reset successfully!\n');
        console.log('═══════════════════════════════════');
        console.log('📧 Email:    guest@kitchenpro.com');
        console.log('🔑 Password: kitchen2024');
        console.log('═══════════════════════════════════\n');
        console.log('Please try logging in again with these credentials.');

    } catch (error) {
        console.error('❌ Error resetting password:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

resetGuestPassword();
