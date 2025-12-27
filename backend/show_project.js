const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showProjectDetails() {
    try {
        const project = await prisma.project.findFirst({
            where: { id: '2741cce4-e8f5-4867-a7b8-361ed2d28d2e' },
            include: { modules: true, user: true }
        });

        if (!project) {
            console.log('Proyecto no encontrado');
            return;
        }

        console.log('========================================');
        console.log('PROYECTO GUARDADO - VERIFICACION COMPLETA');
        console.log('========================================\n');

        console.log('INFORMACION BASICA:');
        console.log('  ID:', project.id);
        console.log('  Nombre:', project.name);
        console.log('  Cliente:', project.clientName || 'N/A');
        console.log('  Usuario:', project.user.name, '(' + project.user.email + ')');
        console.log('  Longitud:', project.linearLength, 'mm');
        console.log('  Fecha creacion:', project.createdAt.toLocaleString());
        console.log('  Total de modulos:', project.modules.length);

        console.log('\n\nCONFIGURACION COMPLETA (JSON):');
        console.log(JSON.stringify(project.config, null, 2));

        console.log('\n\nMODULOS GUARDADOS:');
        project.modules.forEach((mod, i) => {
            console.log(`\n[${i + 1}] ${mod.type} - ${mod.width}mm (${mod.category})`);
            console.log(`    Altura: ${mod.height}mm, Profundidad: ${mod.depth}mm`);
            console.log(`    Puertas: ${mod.doorCount}, Cajones: ${mod.drawerCount}`);
            console.log(`    Bisagra ID: ${mod.hingeId || 'NO ASIGNADA'}`);
            console.log(`    Corredera ID: ${mod.sliderId || 'NO ASIGNADA'}`);
            console.log(`    Tipo Bisagra: ${mod.hingeType}`);
            console.log(`    Tipo Corredera: ${mod.sliderType}`);
        });

        console.log('\n\n========================================');
        console.log('MVP V4.1 - PERSISTENCIA COMPLETADA');
        console.log('========================================');

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

showProjectDetails();
