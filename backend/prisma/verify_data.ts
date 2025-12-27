import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyData() {
    console.log('=== 🔍 VERIFICACIÓN DE INTEGRIDAD DE LA BASE DE DATOS ===\n');

    // 1. Usuario Guest
    console.log('📋 Usuario Guest:');
    const guestUser = await prisma.user.findFirst({
        where: { email: 'guest@kitchenpro.com' }
    });
    if (guestUser) {
        console.log(`✅ ID: ${guestUser.id}`);
        console.log(`   Email: ${guestUser.email}`);
        console.log(`   Nombre: ${guestUser.name}`);
        console.log(`   Role: ${guestUser.role}\n`);
    } else {
        console.log('❌ Usuario Guest NO encontrado\n');
    }

    // 2. Todos los proyectos
    console.log('📦 Proyectos Guardados:');
    const projects = await prisma.project.findMany({
        include: {
            modules: true,
            user: true
        },
        orderBy: { createdAt: 'desc' }
    });

    if (projects.length === 0) {
        console.log('⚠️  No hay proyectos guardados aún.\n');
    } else {
        console.log(`Total de proyectos: ${projects.length}\n`);

        projects.forEach((project, index) => {
            console.log(`--- Proyecto ${index + 1} ---`);
            console.log(`ID: ${project.id}`);
            console.log(`Nombre: ${project.name}`);
            console.log(`Cliente: ${project.clientName || 'N/A'}`);
            console.log(`Usuario: ${project.user.name} (${project.user.email})`);
            console.log(`Longitud: ${project.linearLength}mm`);
            console.log(`Módulos: ${project.modules.length}`);
            console.log(`Configuración: ${project.config ? 'Presente ✅' : 'Ausente ❌'}`);
            console.log(`Creado: ${project.createdAt.toLocaleString()}\n`);
        });

        // 3. Último proyecto con detalles de costo
        console.log('💰 Análisis del Último Proyecto:');
        const lastProject = projects[0];
        console.log(`Proyecto: "${lastProject.name}"`);

        if (lastProject.config && typeof lastProject.config === 'object') {
            const config = lastProject.config as any;
            console.log('\n📊 Configuración Guardada:');
            console.log(`   - Grosor Tablero: ${config?.boardThickness || 'N/A'}mm`);
            console.log(`   - Altura Base: ${config?.baseHeight || 'N/A'}mm`);
            console.log(`   - Profundidad Base: ${config?.baseDepth || 'N/A'}mm`);
            console.log(`   - Tipo Instalación Puerta: ${config?.doorInstallationType || 'N/A'}`);
            console.log(`   - Cantos Puertas: ${config?.edgeRuleDoors || 'N/A'}`);
        }

        console.log('\n🔩 Módulos con Herrajes:');
        lastProject.modules.forEach((mod, i) => {
            console.log(`   Módulo ${i + 1}: ${mod.type} (${mod.width}mm)`);
            if (mod.hingeId) console.log(`      └─ Bisagra ID: ${mod.hingeId}`);
            if (mod.sliderId) console.log(`      └─ Corredera ID: ${mod.sliderId}`);
        });

        // Nota: hardwareCost y totalPrice no están en el modelo Project actual
        console.log('\n⚠️  Nota: Los campos hardwareCost y totalPrice se calculan dinámicamente');
        console.log('   en el endpoint /api/calculate-project, no se guardan en la BD.');
        console.log('   Para ver estos valores, consulta el summary del cálculo en el frontend.\n');
    }

    await prisma.$disconnect();
}

verifyData()
    .catch((error) => {
        console.error('❌ Error en la verificación:', error);
        prisma.$disconnect();
        process.exit(1);
    });
