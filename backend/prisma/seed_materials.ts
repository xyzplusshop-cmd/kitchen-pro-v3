import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding materials...');

    const materials = [
        {
            name: 'Melamina Blanca 15mm',
            type: 'BOARD' as const,
            category: 'Melamina 15mm',
            thickness: 15,
            colorHex: '#FFFFFF',
            isDefault: true,
            codigo: 'MAT-15-BLA',
            cost: 45000, // Ejemplo de costo por placa
        },
        {
            name: 'Melamina Blanca 18mm',
            type: 'BOARD' as const,
            category: 'Melamina 18mm',
            thickness: 18,
            colorHex: '#FFFFFF',
            isDefault: false,
            codigo: 'MAT-18-BLA',
            cost: 52000,
        },
        {
            name: 'PVC Blanco 0.45mm',
            type: 'EDGE' as const,
            category: 'PVC 0.45mm',
            thickness: 0.45,
            colorHex: '#FFFFFF',
            isDefault: true,
            codigo: 'EDG-045-BLA',
            cost: 500, // Costo por metro
        },
        {
            name: 'PVC Blanco 2mm',
            type: 'EDGE' as const,
            category: 'PVC 2mm',
            thickness: 2,
            colorHex: '#FFFFFF',
            isDefault: false,
            codigo: 'EDG-2-BLA',
            cost: 1200,
        }
    ];

    for (const mat of materials) {
        await prisma.material.upsert({
            where: { codigo: mat.codigo },
            update: mat,
            create: mat,
        });
    }

    console.log('✅ Materials seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
