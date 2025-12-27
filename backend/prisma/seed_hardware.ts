import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding hardware items...');

    const hardwareItems = [
        {
            name: 'Bisagra Recta (Full Overlay)',
            category: 'BISAGRA',
            compatibility: ['FULL_OVERLAY', 'STANDARD'],
            discountRules: { gap: 4 },
            brand: 'Standard Pro'
        },
        {
            name: 'Bisagra Acodada (Half Overlay)',
            category: 'BISAGRA',
            compatibility: ['HALF_OVERLAY'],
            discountRules: { gap: 4 },
            brand: 'Standard Pro'
        },
        {
            name: 'Bisagra Superacodada (Inset)',
            category: 'BISAGRA',
            compatibility: ['INSET'],
            discountRules: { gap: 4 },
            brand: 'Standard Pro'
        },
        {
            name: 'Corredera Telescopica 45mm',
            category: 'CORREDERA',
            compatibility: ['STANDARD', 'EXTERNAL'],
            discountRules: { side_clearance: 12.7, depth_clearance: 10 },
            brand: 'SmoothSlide'
        },
        {
            name: 'Corredera Undermount Soft-Close',
            category: 'CORREDERA',
            compatibility: ['STANDARD', 'INSET'],
            discountRules: { side_clearance: 7, depth_clearance: 5 },
            brand: 'SmoothSlide'
        }
    ];

    for (const item of hardwareItems) {
        const existing = await prisma.hardwareItem.findFirst({
            where: { name: item.name }
        });

        if (!existing) {
            await prisma.hardwareItem.create({
                data: item
            });
            console.log(`Created hardware item: ${item.name}`);
        } else {
            console.log(`Hardware item already exists: ${item.name}`);
        }
    }

    console.log('Seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
