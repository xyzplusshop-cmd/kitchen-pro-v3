import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const materials = await prisma.material.findMany();
    console.log('--- Current Materials in DB ---');
    console.table(materials.map(m => ({
        id: m.id,
        name: m.name,
        type: m.type,
        thickness: m.thickness,
        isDefault: m.isDefault
    })));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
