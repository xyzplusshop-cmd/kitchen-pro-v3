const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyData() {
    console.log('=== VERIFICACION DE INTEGRIDAD DE LA BASE DE DATOS ===\n');

    // 1. Usuario Guest
    console.log('Usuario Guest:');
    const guestUser = await prisma.user.findFirst({
        where: { email: 'guest@kitchenpro.com' }
    });
    if (guestUser) {
        console.log(`ID: ${guestUser.id}`);
        console.log(`Email: ${guestUser.email}`);
        console.log(`Nombre: ${guestUser.name}\n`);
    } else {
        console.log('Usuario Guest NO encontrado\n');
    }

    // 2. Todos los proyectos
    console.log('Proyectos Guardados:');
    const projects = await prisma.project.findMany({
        include: {
            modules: true,
            user: true
        },
        orderBy: { createdAt: 'desc' }
    });

    if (projects.length === 0) {
        console.log('No hay proyectos guardados aun.\n');
    } else {
        console.log(`Total de proyectos: ${projects.length}\n`);

        projects.forEach((project, index) => {
            console.log(`--- Proyecto ${index + 1} ---`);
            console.log(`ID: ${project.id}`);
            console.log(`Nombre: ${project.name}`);
            console.log(`Cliente: ${project.clientName || 'N/A'}`);
            console.log(`Usuario: ${project.user.name}`);
            console.log(`Longitud: ${project.linearLength}mm`);
            console.log(`Modulos: ${project.modules.length}`);
            console.log(`Creado: ${project.createdAt.toLocaleString()}\n`);
        });

        // 3. Último proyecto con detalles
        console.log('Analisis del Ultimo Proyecto:');
        const lastProject = projects[0];
        console.log(`Proyecto: "${lastProject.name}"\n`);

        if (lastProject.config && typeof lastProject.config === 'object') {
            console.log('Configuracion Guardada (JSON):');
            console.log(JSON.stringify(lastProject.config, null, 2));
            console.log('');
        }

        console.log('Modulos con Herrajes:');
        lastProject.modules.forEach((mod, i) => {
            console.log(`  Modulo ${i + 1}: ${mod.type} (${mod.width}mm)`);
            console.log(`    Puertas: ${mod.doorCount}, Cajones: ${mod.drawerCount}`);
            if (mod.hingeId) console.log(`    >>> Bisagra ID: ${mod.hingeId}`);
            if (mod.sliderId) console.log(`    >>> Corredera ID: ${mod.sliderId}`);
        });
    }

    await prisma.$disconnect();
}

verifyData()
    .catch((error) => {
        console.error('Error en la verificacion:', error);
        prisma.$disconnect();
        process.exit(1);
    });
