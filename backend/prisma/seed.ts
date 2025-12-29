import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Seeding Production Data (Materials & Hardware Catalog)...\n');

    // Run factory seeding first
    console.log('📊 Step 1: Seeding Factory Infrastructure...');
    await prisma.globalConfig.upsert({
        where: { id: 'singleton' },
        update: {},
        create: {
            id: 'singleton',
            energyPricePerKwh: 0.28,
            profitMargin: 40,
            consumablesRates: {
                screwUnitPrice: 0.03,
                glueFlatRatePerModule: 0.75,
                dowelUnitPrice: 0.02,
                screwsPerHinge: 4,
                screwsPerSlide: 12,
                structuralScrewsPerModule: 8,
                laborCostPerHour: 15.00,
                currency: "USD"
            }
        }
    });

    const machines = [
        {
            id: 'seccionadora_principal',
            name: 'Seccionadora / Escuadradora',
            type: 'CUTTING' as any,
            powerConsumptionKw: 5.5,
            processingSpeed: 15,
            operationCostPerHour: 2.50,
            provider: 'SCM Group'
        },
        {
            id: 'pegadora_cantos_01',
            name: 'Pegadora de Cantos',
            type: 'EDGE_BANDING' as any,
            powerConsumptionKw: 7.0,
            processingSpeed: 10,
            operationCostPerHour: 3.00,
            provider: 'Homag'
        },
        {
            id: 'cnc_router_01',
            name: 'CNC Router',
            type: 'CNC' as any,
            powerConsumptionKw: 12.0,
            processingSpeed: 5,
            operationCostPerHour: 5.00,
            provider: 'Biesse'
        }
    ];

    for (const m of machines) {
        await prisma.machine.upsert({
            where: { id: m.id },
            update: m,
            create: m
        });
    }
    console.log('✅ Global Config & Machines seeded\n');

    //  Materials with Pricing
    console.log('📦 Step 2: Seeding Material Catalog with USD Pricing...');
    await prisma.material.deleteMany({});

    await prisma.material.createMany({
        data: [
            // Tableros
            { name: 'Melamina Blanca (Estructura)', category: 'Básicos', type: 'BOARD', thickness: 15, width: 2440, height: 1220, unitCost: 45.00, cost: 45.00, colorHex: '#F5F5F5', isDefault: true, provider: 'Masisa' },
            { name: 'Melamina Blanca (Frentes)', category: 'Básicos', type: 'BOARD', thickness: 18, width: 2440, height: 1220, unitCost: 52.00, cost: 52.00, colorHex: '#FFFFFF', provider: 'Masisa' },
            { name: 'Roble Kendal Natural', category: 'Maderas', type: 'BOARD', thickness: 18, width: 2440, height: 1220, unitCost: 78.00, cost: 78.00, colorHex: '#8B5A2B', provider: 'Egger' },
            { name: 'Gris Grafito', category: 'Unicolores', type: 'BOARD', thickness: 18, width: 2440, height: 1220, unitCost: 65.00, cost: 65.00, colorHex: '#333333', provider: 'Arauco' },
            { name: 'Fondo MDF Blanco', category: 'Fondos', type: 'BOARD', thickness: 3, width: 2440, height: 1220, unitCost: 22.00, cost: 22.00, colorHex: '#FFFFFF', provider: 'MDF Nacional' },

            // Cantos
            { name: 'PVC Blanco 0.45mm', category: 'Delgado', type: 'EDGE', thickness: 0.45, unitCost: 0.12, cost: 0.12, colorHex: '#FFFFFF', provider: 'Rehau' },
            { name: 'PVC Blanco 2mm', category: 'Grueso', type: 'EDGE', thickness: 2.0, unitCost: 0.65, cost: 0.65, colorHex: '#FFFFFF', provider: 'Rehau' },
            { name: 'PVC Roble 0.45mm', category: 'Delgado', type: 'EDGE', thickness: 0.45, unitCost: 0.18, cost: 0.18, colorHex: '#8B5A2B', provider: 'Rehau' },
            { name: 'PVC Roble 2mm', category: 'Grueso', type: 'EDGE', thickness: 2.0, unitCost: 0.95, cost: 0.95, colorHex: '#8B5A2B', provider: 'Rehau' }
        ]
    });
    console.log('✅ Created 9 materials (5 boards + 4 edges)\n');

    // Hardware
    console.log('🔧 Step 3: Seeding Hardware with Pricing...');
    const hardwareCount = await prisma.hardwareItem.count();

    if (hardwareCount === 0) {
        console.log('⚠️  Hardware items not found. Please seed hardware manually via admin panel.');
    } else {
        // Update existing hardware items with costs
        await prisma.hardwareItem.updateMany({
            where: { name: { contains: 'Bisagra' }, type: 'HINGE' },
            data: { unitCost: 1.25, price: 1.25 }
        });
        await prisma.hardwareItem.updateMany({
            where: { name: { contains: 'Corredera' }, type: 'SLIDE' },
            data: { unitCost: 6.50, price: 6.50 }
        });
        console.log(`✅ Updated pricing for ${hardwareCount} hardware items\n`);
    }

    //  Summary
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ PRODUCTION DATA SEEDING COMPLETED!');
    console.log('═══════════════════════════════════════════════════');
    console.log('\n📊 Summary:');
    console.log('   • Global Config & Machines: ✓');
    console.log('   • Materials with USD pricing: ✓');
    console.log('   • Hardware catalog: ✓');
    console.log('\n💡 Next: Create a project in the frontend and check the "Costos y Precios" tab!\n');
}

main()
    .catch((e) => {
        console.error('\n❌ ERROR during seeding:');
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
