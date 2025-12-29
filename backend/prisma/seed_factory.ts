import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Seeding Factory Data (Machines & Global Config)...');

    // 1. Create Global Config (Singleton)
    await prisma.globalConfig.upsert({
        where: { id: 'singleton' },
        update: {},
        create: {
            id: 'singleton',
            energyPricePerKwh: 0.15, // Default price
            profitMargin: 40,        // Default 40% margin
            consumablesRates: {
                screwUnitPrice: 0.05,
                glueFlatRatePerModule: 2.50,
                dowelUnitPrice: 0.02
            }
        }
    });

    // 2. Create Standard Machines
    const machines = [
        {
            name: 'Sierra Escuadradora (Corte)',
            type: 'CUTTING' as any,
            powerConsumptionKw: 5.5,
            operationCostPerHour: 15.0, // Maintenance + Depreciation
            processingSpeed: 5.0        // 5 meters per minute
        },
        {
            name: 'Pegadora de Cantos Industrial',
            type: 'EDGE_BANDING' as any,
            powerConsumptionKw: 7.5,
            operationCostPerHour: 25.0,
            processingSpeed: 8.0        // 8 meters per minute
        },
        {
            name: 'Centro de Mecanizado (CNC)',
            type: 'CNC' as any,
            powerConsumptionKw: 12.0,
            operationCostPerHour: 45.0,
            processingSpeed: 15.0
        }
    ];

    for (const machine of machines) {
        await prisma.machine.upsert({
            where: { id: machine.name.replace(/\s+/g, '_').toLowerCase() },
            update: machine,
            create: {
                id: machine.name.replace(/\s+/g, '_').toLowerCase(),
                ...machine
            }
        });
    }

    console.log('✅ Factory data seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
