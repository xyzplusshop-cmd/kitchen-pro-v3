const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function quickCheck() {
    try {
        const projectCount = await prisma.project.count();
        console.log('Total proyectos:', projectCount);

        const projects = await prisma.project.findMany({
            include: { modules: true },
            orderBy: { createdAt: 'desc' }
        });

        if (projects.length > 0) {
            console.log('\n=== ULTIMO PROYECTO ===');
            const p = projects[0];
            console.log('Nombre:', p.name);
            console.log('ID:', p.id);
            console.log('Modulos:', p.modules.length);
            console.log('\nCONFIG JSON:');
            console.log(JSON.stringify(p.config, null, 2));
            console.log('\nMODULOS CON HERRAJES:');
            p.modules.forEach((m, i) => {
                console.log(`${i + 1}. ${m.type} - hingeId: ${m.hingeId || 'NULL'}, sliderId: ${m.sliderId || 'NULL'}`);
            });
        }
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

quickCheck();
