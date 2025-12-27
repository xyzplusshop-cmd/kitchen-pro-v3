import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173', 'https://kitchen-pro-v3.netlify.app', 'https://kitchen-pro-v3.vercel.app', 'http://localhost:3000'],
    credentials: true
}));

// Log de peticiones para depuración en Railway
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Verificación de conexión a la Base de Datos al arrancar
async function checkDatabaseConnection() {
    console.log('📡 [DATABASE] Intentando conectar a PostgreSQL...');
    try {
        await prisma.$connect();
        console.log('✅ [DATABASE] Conexión exitosa con PostgreSQL en Railway');

        // Seed automático de herrajes si está vacío
        const hardwareCount = await prisma.hardwareItem.count();
        if (hardwareCount === 0) {
            console.log('🌱 [SEED] Poblando catálogo de herrajes base...');
            await (prisma.hardwareItem as any).createMany({
                data: [
                    {
                        name: 'Bisagra Recta (Full Overlay)',
                        category: 'BISAGRA',
                        compatibility: ['FULL_OVERLAY'],
                        discountRules: { gap: 3 },
                        price: 1500, // Pesos
                        brand: 'Genérico'
                    },
                    {
                        name: 'Bisagra Acodada (Half Overlay)',
                        category: 'BISAGRA',
                        compatibility: ['HALF_OVERLAY'],
                        discountRules: { gap: 3 },
                        price: 1600,
                        brand: 'Genérico'
                    },
                    {
                        name: 'Bisagra Superacodada (Inset)',
                        category: 'BISAGRA',
                        compatibility: ['INSET'],
                        discountRules: { gap: 3 },
                        price: 1750,
                        brand: 'Genérico'
                    },
                    {
                        name: 'Corredera Telescópica Standard',
                        category: 'CORREDERA',
                        compatibility: ['STANDARD'],
                        discountRules: { side_clearance: 13, depth_clearance: 10 },
                        price: 3500,
                        brand: 'Genérico'
                    }
                ]
            });
        }
    } catch (e: any) {
        console.error('❌ [DATABASE] Error de conexión:', e.message);
    }
}
checkDatabaseConnection();

const JWT_SECRET = process.env.JWT_SECRET || 'kitchen-pro-secret-key-2025';

// Middleware de Protección
const protect = async (req: any, res: any, next: any) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ success: false, error: 'No autorizado' });

        const decoded: any = jwt.verify(token, JWT_SECRET);
        req.user = await prisma.user.findUnique({ where: { id: decoded.id } });
        next();
    } catch (error) {
        res.status(401).json({ success: false, error: 'Sesión inválida' });
    }
};

// === AUTH ENDPOINTS ===

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name, role: 'USER' }
        });

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });

        res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error: any) {
        res.status(400).json({ success: false, error: 'El email ya existe o datos inválidos' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });

        res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/auth/me', protect, (req: any, res) => {
    res.json({ success: true, user: req.user });
});

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
});

// === HARDWARE CRUD ENDPOINTS ===
app.get('/api/hardware', async (req, res) => {
    try {
        const items = await prisma.hardwareItem.findMany({
            orderBy: { name: 'asc' }
        });
        res.json({ success: true, items });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/hardware', protect, async (req: any, res) => {
    try {
        const item = await prisma.hardwareItem.create({
            data: req.body
        });
        res.json({ success: true, item });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/hardware/:id', protect, async (req: any, res) => {
    try {
        const item = await prisma.hardwareItem.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json({ success: true, item });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/hardware/:id', protect, async (req: any, res) => {
    try {
        await prisma.hardwareItem.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/hardware/import', protect, async (req: any, res) => {
    try {
        const { items } = req.body;
        const created = await prisma.hardwareItem.createMany({
            data: items,
            skipDuplicates: true
        });
        res.json({ success: true, count: created.count });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// === DRAWER SYSTEMS CRUD ENDPOINTS ===
app.get('/api/drawer-systems', async (req, res) => {
    try {
        const items = await prisma.drawerSystem.findMany({
            orderBy: { name: 'asc' }
        });
        res.json({ success: true, items });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/drawer-systems', protect, async (req: any, res) => {
    try {
        const item = await prisma.drawerSystem.create({
            data: req.body
        });
        res.json({ success: true, item });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/drawer-systems/:id', protect, async (req: any, res) => {
    try {
        const item = await prisma.drawerSystem.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json({ success: true, item });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/drawer-systems/:id', protect, async (req: any, res) => {
    try {
        await prisma.drawerSystem.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/drawer-systems/import', protect, async (req: any, res) => {
    try {
        const { items } = req.body;
        const created = await prisma.drawerSystem.createMany({
            data: items,
            skipDuplicates: true
        });
        res.json({ success: true, count: created.count });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// === MATERIALS CRUD ENDPOINTS ===
app.get('/api/materials', async (req, res) => {
    try {
        const items = await prisma.material.findMany({
            orderBy: { name: 'asc' }
        });
        res.json({ success: true, items });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/materials', protect, async (req: any, res) => {
    try {
        const item = await prisma.material.create({
            data: req.body
        });
        res.json({ success: true, item });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/materials/:id', protect, async (req: any, res) => {
    try {
        const item = await prisma.material.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json({ success: true, item });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/materials/:id', protect, async (req: any, res) => {
    try {
        await prisma.material.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/materials/import', protect, async (req: any, res) => {
    try {
        const { items } = req.body;
        const created = await prisma.material.createMany({
            data: items,
            skipDuplicates: true
        });
        res.json({ success: true, count: created.count });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// === MODULE TEMPLATES CRUD ENDPOINTS ===
app.get('/api/module-templates', async (req, res) => {
    try {
        const { zona } = req.query;
        const filters: any = {};

        if (zona) filters.zona = zona;

        const items = await prisma.moduleTemplate.findMany({
            where: filters,
            orderBy: { nombre: 'asc' }
        });
        res.json({ success: true, items });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/module-templates', protect, async (req: any, res) => {
    try {
        const item = await prisma.moduleTemplate.create({
            data: req.body
        });
        res.json({ success: true, item });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/module-templates/:id', protect, async (req: any, res) => {
    try {
        const item = await prisma.moduleTemplate.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json({ success: true, item });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/module-templates/:id', protect, async (req: any, res) => {
    try {
        await prisma.moduleTemplate.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/module-templates/import', protect, async (req: any, res) => {
    try {
        const { items } = req.body;
        const created = await prisma.moduleTemplate.createMany({
            data: items,
            skipDuplicates: true
        });
        res.json({ success: true, count: created.count });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// === LEG SYSTEMS CRUD ENDPOINTS ===
app.get('/api/leg-systems', async (req, res) => {
    try {
        const items = await prisma.legSystem.findMany({
            orderBy: { name: 'asc' }
        });
        res.json({ success: true, items });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/leg-systems', protect, async (req: any, res) => {
    try {
        const item = await prisma.legSystem.create({
            data: req.body
        });
        res.json({ success: true, item });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/leg-systems/:id', protect, async (req: any, res) => {
    try {
        const item = await prisma.legSystem.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json({ success: true, item });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/leg-systems/:id', protect, async (req: any, res) => {
    try {
        await prisma.legSystem.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/leg-systems/import', protect, async (req: any, res) => {
    try {
        const { items } = req.body;
        const created = await prisma.legSystem.createMany({
            data: items,
            skipDuplicates: true
        });
        res.json({ success: true, count: created.count });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

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
    config: {
        baseHeight: number;
        plinthHeight: number;
        wallHeight: number;
        baseDepth: number;
        wallDepth: number;
        doorInstallationType: 'FULL_OVERLAY' | 'INSET';
        doorGap: number;
        drawerInstallationType: 'EXTERNAL' | 'INSET';
        plinthLength?: number;
        countertopLength?: number;
    };
}

const getEdgeThickness = (rule: string): number => {
    if (rule.includes('2mm')) return 2;
    if (rule.includes('0.4mm')) return 0.4;
    return 0;
};

// === MOTOR DE GENERACIÓN DE PIEZAS ===
const generateModulePieces = (module: any, thickness: number, rules: EdgeRules, config: ProjectData['config'], hardwareMap: Map<string, any>) => {
    let pieces: any[] = [];
    const { type, width, category, templateId, customPieces } = module;

    // RULE 0: If customPieces exists (Stage 3), it OVERRIDES everything
    if (customPieces && (customPieces as any[]).length > 0) {
        return customPieces as any[];
    }

    const hBase = config.baseHeight;
    const hWall = config.wallHeight;
    const hTower = 2100;
    const dBase = config.baseDepth;
    const dWall = config.wallDepth;
    const doorInstallationType = config.doorInstallationType;
    const isInset = doorInstallationType === 'INSET';

    const hinge = hardwareMap.get(module.hingeId || '');
    const slider = hardwareMap.get(module.sliderId || '');
    const drawerSystem = hardwareMap.get(module.drawerSystemId || ''); // New metadata

    let doorGap = hinge?.discountRules?.gap ?? config.doorGap ?? 3;

    const tDoors = getEdgeThickness(rules.doors);
    const tVisible = getEdgeThickness(rules.visible);
    const tInternal = getEdgeThickness(rules.internal);

    // BASE MODULE LOGIC
    if (category === 'BASE') {
        const intWidth = width - (2 * thickness);

        // Lateral Izquierdo (1)
        pieces.push({
            name: 'Lateral Izquierdo Base',
            finalWidth: dBase,
            finalHeight: hBase,
            edges: { top: tInternal, bottom: tInternal, left: tVisible, right: tInternal },
            quantity: 1,
            category: 'BASE'
        });

        // Lateral Derecho (1)
        pieces.push({
            name: 'Lateral Derecho Base',
            finalWidth: dBase,
            finalHeight: hBase,
            edges: { top: tInternal, bottom: tInternal, left: tVisible, right: tInternal },
            quantity: 1,
            category: 'BASE'
        });

        pieces.push({
            name: 'Piso Base',
            finalWidth: intWidth,
            finalHeight: dBase,
            edges: { top: tVisible, bottom: tInternal, left: tInternal, right: tInternal },
            quantity: 1,
            category: 'BASE'
        });

        pieces.push({
            name: 'Amarre',
            finalWidth: intWidth,
            finalHeight: 100,
            edges: { top: tInternal, bottom: tInternal, left: tInternal, right: tInternal },
            quantity: 2,
            category: 'BASE'
        });

        // LEGS (Patas) Injection - Stage 2/3 requirement
        const legAssignment = calculateLegs({ moduleWidth: width, moduleZone: 'BASE' });
        if (legAssignment) {
            pieces.push({
                name: 'Pata (Hardware)',
                finalWidth: 0,
                finalHeight: 0,
                edges: { top: 0, bottom: 0, left: 0, right: 0 },
                quantity: legAssignment.quantity,
                category: 'HARDWARE',
                material: 'ABS/Metal',
                description: legAssignment.reason
            });
        }

        // DOORS
        if (module.doorCount > 0) {
            let doorWidth;
            if (isInset) {
                doorWidth = intWidth - doorGap;
                if (module.doorCount > 1) {
                    doorWidth = (doorWidth / module.doorCount) - (doorGap / 2);
                }
            } else {
                doorWidth = (width / module.doorCount) - doorGap;
            }

            pieces.push({
                name: 'Puerta Base',
                finalWidth: Math.round(doorWidth * 10) / 10,
                finalHeight: isInset ? hBase - (2 * doorGap) : hBase - 5,
                edges: { top: tDoors, bottom: tDoors, left: tDoors, right: tDoors },
                quantity: module.doorCount,
                category: 'BASE'
            });
        }

        // DRAWERS (Enhanced Stage 2 logic)
        if (module.drawerCount > 0) {
            const drawerPieces = calculateDrawerPieces({
                moduleWidth: width,
                moduleDepth: dBase,
                moduleHeight: hBase,
                drawerCount: module.drawerCount,
                drawerSystem: drawerSystem || {
                    isMetal: false,
                    slideClearance: 13,
                    bottomConstruction: 'RANURADO',
                    backendClearance: 10
                },
                materialThickness: thickness
            });
            pieces.push(...drawerPieces);
        }
    }

    // WALL MODULE LOGIC
    if (category === 'WALL') {
        const intWidth = width - (2 * thickness);
        pieces.push({
            name: 'Lateral Izquierdo Aéreo',
            finalWidth: dWall,
            finalHeight: hWall,
            edges: { top: tInternal, bottom: tInternal, left: tVisible, right: tInternal },
            quantity: 1,
            category: 'WALL'
        });
        pieces.push({
            name: 'Lateral Derecho Aéreo',
            finalWidth: dWall,
            finalHeight: hWall,
            edges: { top: tInternal, bottom: tInternal, left: tVisible, right: tInternal },
            quantity: 1,
            category: 'WALL'
        });
        pieces.push({
            name: 'Techo/Piso Aéreo',
            finalWidth: intWidth,
            finalHeight: dWall,
            edges: { top: tVisible, bottom: tInternal, left: tInternal, right: tInternal },
            quantity: 2,
            category: 'WALL'
        });

        if (module.doorCount > 0) {
            let doorWidth;
            if (isInset) {
                doorWidth = intWidth - doorGap;
                if (module.doorCount > 1) {
                    doorWidth = (doorWidth / module.doorCount) - (doorGap / 2);
                }
            } else {
                doorWidth = (width / module.doorCount) - doorGap;
            }

            pieces.push({
                name: 'Puerta Aérea',
                finalWidth: Math.round(doorWidth * 10) / 10,
                finalHeight: isInset ? hWall - (2 * doorGap) : hWall - 5,
                edges: { top: tDoors, bottom: tDoors, left: tDoors, right: tDoors },
                quantity: module.doorCount,
                category: 'WALL'
            });
        }
    }

    // TOWER MODULE LOGIC
    if (category === 'TOWER') {
        pieces.push({
            name: 'Lateral Izquierdo Torre',
            finalWidth: dBase,
            finalHeight: hTower,
            edges: { top: tInternal, bottom: tInternal, left: tVisible, right: tInternal },
            quantity: 1,
            category: 'TOWER'
        });
        pieces.push({
            name: 'Lateral Derecho Torre',
            finalWidth: dBase,
            finalHeight: hTower,
            edges: { top: tInternal, bottom: tInternal, left: tVisible, right: tInternal },
            quantity: 1,
            category: 'TOWER'
        });
        pieces.push({
            name: 'Techo/Piso Torre',
            finalWidth: width - (2 * thickness),
            finalHeight: dBase,
            edges: { top: tVisible, bottom: tInternal, left: tInternal, right: tInternal },
            quantity: 2,
            category: 'TOWER'
        });
        pieces.push({
            name: 'Estantería Torre',
            finalWidth: width - (2 * thickness) - 2,
            finalHeight: dBase - 20,
            edges: { top: tVisible, bottom: tInternal, left: tInternal, right: tInternal },
            quantity: 3,
            category: 'TOWER'
        });
    }

    return pieces;
};

// Mock functions for calculation logic
const calculateLegs = (params: any) => ({ quantity: 4, reason: 'Carga estándar' });
const calculateDrawerPieces = (params: any) => [];

// === ENDPOINTS ACTUALIZADOS ===

app.get('/', (req, res) => {
    res.send('Kitchen Pro API V3.1 - Online');
});

app.get('/health', async (req, res) => {
    let dbStatus = 'Checking...';
    try {
        await prisma.$queryRaw`SELECT 1`;
        dbStatus = 'Connected ✅';
    } catch (e: any) {
        dbStatus = `Error: ${e.message} ❌`;
    }

    res.json({
        status: 'Online',
        version: '3.1.2',
        database: dbStatus,
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

app.post('/api/generate-pieces', async (req, res) => {
    try {
        const { module: mod, config, boardThickness, edgeRules } = req.body;

        // Fetch hardware for calculations
        const hardwareIds = [mod.hingeId, mod.sliderId, (mod as any).drawerSystemId].filter(id => !!id);
        const hardwareItems = await prisma.hardwareItem.findMany({
            where: { id: { in: hardwareIds as string[] } }
        });
        const drawerSystems = await prisma.drawerSystem.findMany({
            where: { id: { in: hardwareIds as string[] } }
        });

        const hardwareMap = new Map<string, any>();
        hardwareItems.forEach(item => hardwareMap.set(item.id, item));
        drawerSystems.forEach(item => hardwareMap.set(item.id, item));

        const pieces = generateModulePieces(mod, boardThickness, edgeRules, config, hardwareMap);
        res.json({ success: true, pieces });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/calculate-project', async (req, res) => {
    try {
        // EXTRACCIÓN SEGURA Y DECLARACIÓN (Top Level)
        // Aseguramos que config existe, si no, usamos objeto vacío
        const safeConfig = req.body.config || {};

        // Declaramos explícitamente las variables problemáticas con valores por defecto
        const plinthLength = Number(safeConfig.plinthLength) || 0;
        const countertopLength = Number(safeConfig.countertopLength) || 0;

        console.log('🔍 Debug Variables (Calculate Project):', {
            plinthLength,
            countertopLength,
            hasConfig: !!req.body.config,
            configKeys: req.body.config ? Object.keys(req.body.config) : []
        });

        const project = req.body as ProjectData;
        const allPieces: any[] = [];
        let totalHardwareCost = 0;

        // 1. Recopilar herrajes únicos usados
        const hingeIds = [...new Set(project.modules.map(m => m.hingeId).filter(id => !!id))];
        const sliderIds = [...new Set(project.modules.map(m => m.sliderId).filter(id => !!id))];
        const drawerSystemIds = [...new Set(project.modules.map(m => (m as any).drawerSystemId).filter(id => !!id))];

        const [hardwareItems, drawerSystems] = await Promise.all([
            prisma.hardwareItem.findMany({
                where: { id: { in: [...hingeIds as string[], ...sliderIds as string[]] } }
            }),
            prisma.drawerSystem.findMany({
                where: { id: { in: drawerSystemIds as string[] } }
            })
        ]);

        const hardwareMap = new Map<string, any>();
        hardwareItems.forEach((item: any) => hardwareMap.set(item.id, item));
        drawerSystems.forEach((item: any) => hardwareMap.set(item.id, item)); // Mezclamos en el mismo mapa para simplicidad

        // 2. Generar piezas usando el mapa de herrajes
        project.modules.forEach(mod => {
            // Costo de herrajes por módulo
            const modHinge = hardwareMap.get(mod.hingeId || '');
            const modSlider = hardwareMap.get(mod.sliderId || '');
            const modDrawerSystem = hardwareMap.get((mod as any).drawerSystemId || '');

            if (mod.doorCount > 0 && modHinge) {
                // Asumimos 2 bisagras por puerta
                totalHardwareCost += modHinge.price * (mod.doorCount * 2);
            }
            if (mod.drawerCount > 0) {
                if (modDrawerSystem) {
                    totalHardwareCost += modDrawerSystem.price * mod.drawerCount;
                } else if (modSlider) {
                    // Fallback a corredera estándar si no hay sistema de cajón definido
                    totalHardwareCost += modSlider.price * mod.drawerCount;
                }
            }

            const modPieces = generateModulePieces(mod, project.boardThickness, project.edgeRules, project.config, hardwareMap);

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


        // Variables already declared at top of function
        res.json({
            success: true,
            pieces: allPieces,
            summary: {
                totalPieces: allPieces.reduce((acc, p) => acc + p.quantity, 0),
                estimatedBoards: Math.ceil(allPieces.length / 12),
                hardwareCost: totalHardwareCost,
                plinthLength: Number(safeConfig.plinthLength) || 0,  // NUCLEAR FIX: Inline access
                countertopLength: Number(safeConfig.countertopLength) || 0,  // NUCLEAR FIX: Inline access
                totalEstimatedPrice: totalHardwareCost + 50000
            }
        });
    } catch (error: any) {
        console.error('❌ Calculation Error:', error);
        res.status(400).json({
            success: false,
            error: `Error en el cálculo: ${error.message}`,
            details: error.stack
        });
    }
});


app.post('/api/projects', async (req: any, res) => {
    console.log('------- [POST /api/projects] NEW REQUEST -------');
    try {
        const { projectName, linearLength, modules, clientName, config, thumbnail } = req.body;

        // Detailed Payload Logging for Debugging
        console.log('Body Keys:', Object.keys(req.body));
        console.log('Project Name:', projectName);
        console.log('Modules Count:', modules?.length);

        // Required Field Validation
        if (!projectName || linearLength === undefined || !Array.isArray(modules)) {
            console.error('❌ VALIDATION FAILED: Missing basic fields');
            return res.status(400).json({
                success: false,
                error: 'Datos incompletos. Se requiere projectName (string), linearLength (number) y modules (array).'
            });
        }

        // Auth Logic
        let finalUserId;
        const token = req.cookies.token;
        if (token) {
            try {
                const decoded: any = jwt.verify(token, JWT_SECRET);
                finalUserId = decoded.id;
            } catch (e) {
                console.warn('[AUTH] Token inválido');
            }
        }

        if (!finalUserId) {
            const guest = await prisma.user.findFirst({ where: { email: 'guest@kitchenpro.com' } });
            if (!guest) {
                console.error('❌ ERROR: Guest user not found in DB');
                throw new Error('Usuario Guest no encontrado');
            }
            finalUserId = guest.id;
        }

        // Prisma Create with normalized fields
        const project = await prisma.project.create({
            data: {
                name: String(projectName),
                clientName: clientName ? String(clientName) : null,
                linearLength: Number(linearLength),
                userId: finalUserId,
                openingSystem: String(req.body.openingSystem || 'HANDLE'),
                thumbnail: thumbnail || null,
                config: config || {},
                modules: {
                    create: modules.map((m: any, idx: number) => {
                        // Validate each module has a type
                        if (!m.type) {
                            console.error(`❌ Module at index ${idx} is missing "type"`);
                            throw new Error(`Módulo en posición ${idx} no tiene "type" definido`);
                        }

                        return {
                            type: String(m.type),
                            category: String(m.category || 'BASE'),
                            width: Number(m.width || 0),
                            isFixed: Boolean(m.isFixed),
                            doorCount: Number(m.doorCount || 0),
                            drawerCount: Number(m.drawerCount || 0),
                            hingeType: String(m.hingeType || 'Estándar'),
                            sliderType: String(m.sliderType || 'Estándar'),
                            hingeId: m.hingeId ? String(m.hingeId) : null,
                            sliderId: m.sliderId ? String(m.sliderId) : null,
                            drawerSystemId: m.drawerSystemId ? String(m.drawerSystemId) : null,
                            templateId: m.templateId ? String(m.templateId) : null,
                            legSystemId: m.legSystemId ? String(m.legSystemId) : null,
                            openingSystem: m.openingSystem ? String(m.openingSystem) : null,
                            customPieces: m.customPieces || null,
                            calculationRules: m.calculationRules || null,
                            height: Number(m.height || 720),
                            depth: Number(m.depth || 560)
                        };
                    })
                }
            },
            include: { modules: true }
        });

        console.log('✅ PROJECT SAVED SUCCESS:', project.id);
        res.json({
            success: true,
            id: project.id,
            message: token ? 'Proyecto guardado en tu cuenta' : 'Proyecto guardado como Invitado'
        });

    } catch (error: any) {
        console.error('❌ SERVER ERROR SAVING PROJECT:', error);

        const isValidationError = error.name === 'PrismaClientValidationError' ||
            error.message.includes('validation') ||
            error.message.includes('Módulo en posición');

        if (isValidationError) {
            return res.status(400).json({
                success: false,
                error: 'Error de validación: ' + error.message,
                details: error.message
            });
        }

        res.status(500).json({ success: false, error: 'Internal Server Error: ' + error.message });
    }
});

app.get('/api/projects', protect, async (req: any, res) => {
    try {
        const projects = await prisma.project.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            include: { modules: true }
        });
        res.json({ success: true, projects });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/projects/:id', protect, async (req: any, res) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: req.params.id, userId: req.user.id },
            include: { modules: true }
        });
        if (!project) return res.status(404).json({ success: false, error: 'Proyecto no encontrado' });
        res.json({ success: true, project });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/projects/:id', protect, async (req: any, res) => {
    try {
        // Primero borrar módulos asociados para evitar error de FK
        await prisma.module.deleteMany({ where: { projectId: req.params.id } });
        await prisma.project.delete({
            where: { id: req.params.id, userId: req.user.id }
        });
        res.json({ success: true, message: 'Proyecto eliminado' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 [SERVER] Kitchen Pro API corriendo en el puerto ${PORT}`);
    console.log(`🔧 [ENV] NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});
