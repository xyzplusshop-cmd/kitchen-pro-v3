import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware de CORS manual reforzado para evitar el bloqueo de red en producción - Versión Blindada V2
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Responder inmediatamente a las peticiones de pre-flight (OPTIONS)
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

app.use(express.json());

// Log de peticiones para depuración en Railway
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// === TIPOS Y CONTEXTO ===
interface Edges {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

interface Piece {
    name: string;
    finalWidth: number;
    finalHeight: number;
    edges: Edges;
}

const calculateCutDimensions = (piece: Piece) => {
    const cutWidth = piece.finalWidth - (piece.edges.left + piece.edges.right);
    const cutHeight = piece.finalHeight - (piece.edges.top + piece.edges.bottom);

    if (cutWidth <= 0 || cutHeight <= 0) {
        throw new Error(`Dimensiones inválidas para ${piece.name}`);
    }

    return {
        cutWidth: Math.round(cutWidth * 10) / 10,
        cutHeight: Math.round(cutHeight * 10) / 10
    };
};

// === TIPOS Y CONTEXTO ===
interface EdgeRules {
    doors: string;
    visible: string;
    internal: string;
}

interface ProjectData {
    projectName: string;
    linearLength: number;
    boardThickness: number;
    edgeRules: EdgeRules;
    modules: any[];
}

const getEdgeThickness = (rule: string): number => {
    if (rule.includes('2mm')) return 2;
    if (rule.includes('0.4mm')) return 0.4;
    return 0;
};

// === MOTOR DE GENERACIÓN DE PIEZAS ===
const generateModulePieces = (module: any, thickness: number, rules: EdgeRules) => {
    const pieces: any[] = [];
    const { type, width, category } = module;
    const HEIGHT_BASE = 720;
    const DEPTH_BASE = 560;
    const DEPTH_WALL = 320;
    const HEIGHT_TOWER = 2100; // Altura estándar para torres

    const tDoors = getEdgeThickness(rules.doors);
    const tVisible = getEdgeThickness(rules.visible);
    const tInternal = getEdgeThickness(rules.internal);

    // Lógica para BAJOS (BASE)
    if (category === 'BASE') {
        // Laterales (2)
        pieces.push({
            name: 'Lateral Base',
            finalWidth: DEPTH_BASE,
            finalHeight: HEIGHT_BASE,
            edges: { top: tInternal, bottom: tInternal, left: tVisible, right: tInternal },
            quantity: 2,
            category: 'BASE'
        });

        // Piso (1)
        pieces.push({
            name: 'Piso Base',
            finalWidth: width - (2 * thickness),
            finalHeight: DEPTH_BASE,
            edges: { top: tVisible, bottom: tInternal, left: tInternal, right: tInternal },
            quantity: 1,
            category: 'BASE'
        });

        // Amarres (2)
        pieces.push({
            name: 'Amarre',
            finalWidth: width - (2 * thickness),
            finalHeight: 100,
            edges: { top: tInternal, bottom: tInternal, left: tInternal, right: tInternal },
            quantity: 2,
            category: 'BASE'
        });

        // Puertas / Frentes
        if (module.doorCount > 0) {
            const doorWidth = (width / module.doorCount) - 3;
            pieces.push({
                name: 'Puerta Base',
                finalWidth: doorWidth,
                finalHeight: HEIGHT_BASE - 5,
                edges: { top: tDoors, bottom: tDoors, left: tDoors, right: tDoors },
                quantity: module.doorCount,
                category: 'BASE'
            });
        }
    }

    // Lógica para AÉREOS (WALL)
    if (category === 'WALL') {
        pieces.push({
            name: 'Lateral Aéreo',
            finalWidth: DEPTH_WALL,
            finalHeight: HEIGHT_BASE, // Misma altura que base para este modelo
            edges: { top: tInternal, bottom: tInternal, left: tVisible, right: tInternal },
            quantity: 2,
            category: 'WALL'
        });
        pieces.push({
            name: 'Techo/Piso Aéreo',
            finalWidth: width - (2 * thickness),
            finalHeight: DEPTH_WALL,
            edges: { top: tVisible, bottom: tInternal, left: tInternal, right: tInternal },
            quantity: 2,
            category: 'WALL'
        });
        if (module.doorCount > 0) {
            pieces.push({
                name: 'Puerta Aérea',
                finalWidth: (width / module.doorCount) - 3,
                finalHeight: HEIGHT_BASE - 5,
                edges: { top: tDoors, bottom: tDoors, left: tDoors, right: tDoors },
                quantity: module.doorCount,
                category: 'WALL'
            });
        }
    }

    // Lógica para TORRES (TOWER)
    if (category === 'TOWER') {
        pieces.push({
            name: 'Lateral Torre',
            finalWidth: DEPTH_BASE,
            finalHeight: HEIGHT_TOWER,
            edges: { top: tInternal, bottom: tInternal, left: tVisible, right: tInternal },
            quantity: 2,
            category: 'TOWER'
        });
        pieces.push({
            name: 'Techo/Piso Torre',
            finalWidth: width - (2 * thickness),
            finalHeight: DEPTH_BASE,
            edges: { top: tVisible, bottom: tInternal, left: tInternal, right: tInternal },
            quantity: 2,
            category: 'TOWER'
        });
        pieces.push({
            name: 'Estantería Torre',
            finalWidth: width - (2 * thickness) - 2,
            finalHeight: DEPTH_BASE - 20,
            edges: { top: tVisible, bottom: tInternal, left: tInternal, right: tInternal },
            quantity: 3,
            category: 'TOWER'
        });
    }

    return pieces;
};

// === ENDPOINTS ACTUALIZADOS ===

app.get('/', (req, res) => {
    res.send('Kitchen Pro API V3.1 - Online');
});

app.post('/api/calculate-project', (req, res) => {
    try {
        const project = req.body as ProjectData;
        const allPieces: any[] = [];

        project.modules.forEach(mod => {
            const modPieces = generateModulePieces(mod, project.boardThickness, project.edgeRules);

            // Calcular medidas de corte para cada pieza generada
            const calculated = modPieces.map(p => {
                const cut = calculateCutDimensions({
                    name: p.name,
                    finalWidth: p.finalWidth,
                    finalHeight: p.finalHeight,
                    edges: p.edges
                });
                return {
                    ...p,
                    cutWidth: cut.cutWidth,
                    cutHeight: cut.cutHeight,
                    moduleType: mod.type
                };
            });

            allPieces.push(...calculated);
        });

        res.json({
            success: true,
            pieces: allPieces,
            summary: {
                totalPieces: allPieces.reduce((acc, p) => acc + p.quantity, 0),
                estimatedBoards: Math.ceil(allPieces.length / 12) // Mock simple para MVP
            }
        });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.post('/api/projects', async (req, res) => {
    try {
        const { projectName, clientName, linearLength, modules } = req.body;

        // Buscar o crear usuario por defecto para el MVP
        let user = await prisma.user.findFirst();
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: 'demo@kitchenpro.com',
                    password: 'demo',
                    name: 'Usuario Demo'
                }
            });
        }

        const project = await prisma.project.create({
            data: {
                name: projectName,
                clientName: clientName,
                linearLength: Number(linearLength),
                userId: user.id,
                modules: {
                    create: modules.map((m: any) => ({
                        type: m.type,
                        category: m.category || 'BASE',
                        width: Number(m.width),
                        isFixed: !!m.isFixed,
                        doorCount: Number(m.doorCount || 0),
                        drawerCount: Number(m.drawerCount || 0),
                        hingeType: m.hingeType || 'Estándar',
                        sliderType: m.sliderType || 'Estándar',
                        height: 720,
                        depth: 560
                    }))
                }
            },
            include: {
                modules: true
            }
        });

        res.json({
            success: true,
            id: project.id,
            message: 'Proyecto guardado exitosamente en Railway'
        });
    } catch (error: any) {
        console.error('SERVER ERROR SAVING PROJECT:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
