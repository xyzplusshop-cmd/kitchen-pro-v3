import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const user = await prisma.user.findFirst();
    console.log('FIRST_USER_ID:', user?.id);
}
main().catch(err => console.error(err)).finally(() => prisma.$disconnect());
