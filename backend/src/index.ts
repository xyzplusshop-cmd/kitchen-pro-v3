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
import moduleTemplatesRouter from './routes/moduleTemplates';
import { generateModuleCode, generatePieceCode } from './utils/codeGenerator';

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
// DEPRECATED: These endpoints are now handled by routes/moduleTemplates.ts
// with smart calculation engine. Commented out to prevent conflicts.
/*
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
*/

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

// === EDGE BANDS CRUD ENDPOINTS (Mapped to Material type: EDGE) ===
app.get('/api/edge-bands', async (req, res) => {
    try {
        const items = await prisma.material.findMany({
            where: { type: 'EDGE' },
            orderBy: { name: 'asc' }
        });
        res.json({ success: true, items });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/edge-bands', protect, async (req: any, res) => {
    try {
        const item = await prisma.material.create({
            data: { ...req.body, type: 'EDGE' }
        });
        res.json({ success: true, item });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/edge-bands/:id', protect, async (req: any, res) => {
    try {
        const item = await prisma.material.update({
            where: { id: req.params.id, type: 'EDGE' },
            data: req.body
        });
        res.json({ success: true, item });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/edge-bands/:id', protect, async (req: any, res) => {
    try {
        await prisma.material.delete({
            where: { id: req.params.id, type: 'EDGE' }
        });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// === TOOLS CRUD ENDPOINTS ===
app.get('/api/tools', async (req, res) => {
    try {
        const items = await prisma.tool.findMany({
            orderBy: { name: 'asc' }
        });
        res.json({ success: true, items });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/tools', protect, async (req: any, res) => {
    try {
        const item = await prisma.tool.create({
            data: req.body
        });
        res.json({ success: true, item });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/tools/:id', protect, async (req: any, res) => {
    try {
        const item = await prisma.tool.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json({ success: true, item });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/tools/:id', protect, async (req: any, res) => {
    try {
        await prisma.tool.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// === ACCESSORIES CRUD ENDPOINTS ===
app.get('/api/accessories', async (req, res) => {
    try {
        const items = await prisma.accessory.findMany({
            orderBy: { name: 'asc' }
        });
        res.json({ success: true, items });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/accessories', protect, async (req: any, res) => {
    try {
        const item = await prisma.accessory.create({
            data: req.body
        });
        res.json({ success: true, item });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/accessories/:id', protect, async (req: any, res) => {
    try {
        const item = await prisma.accessory.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json({ success: true, item });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/accessories/:id', protect, async (req: any, res) => {
    try {
        await prisma.accessory.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// === MACHINES ENDPOINTS ===
app.get('/api/machines', async (req, res) => {
    try {
        const items = await prisma.machine.findMany();
        res.json({ success: true, items });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/machines/:id', protect, async (req: any, res) => {
    try {
        const item = await prisma.machine.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json({ success: true, item });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// === GLOBAL CONFIG ENDPOINTS ===
app.get('/api/global-config', async (req, res) => {
    try {
        const config = await prisma.globalConfig.findUnique({
            where: { id: 'singleton' }
        });
        res.json({ success: true, config });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/global-config', protect, async (req: any, res) => {
    try {
        const config = await prisma.globalConfig.upsert({
            where: { id: 'singleton' },
            update: req.body,
            create: { id: 'singleton', ...req.body }
        });
        res.json({ success: true, config });
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
    boardThickness: number; // Legacy/Fallback
    carcassThickness: number;
    frontsThickness: number;
    edgeRules: EdgeRules;
    modules: any[];
    config: {
        baseHeight: number;
        plinthHeight: number;
        wallHeight: number;
        baseDepth: number;
        wallDepth: number;
        towerHeight: number;
        doorInstallationType: 'FULL_OVERLAY' | 'INSET';
        doorGap: number;
        drawerInstallationType: 'EXTERNAL' | 'INSET';
        backMountingType: 'NAILED' | 'GROOVED' | 'INSET';
        grooveDepth: number;
        rearGap: number;
        plinthLength?: number;
        countertopLength?: number;
        carcassThickness?: number;
        frontsThickness?: number;
    };
}

const getEdgeThickness = (rule: string): number => {
    if (rule.includes('2mm')) return 2;
    if (rule.includes('0.4mm')) return 0.4;
    return 0;
};

// === STRETCHERS SYSTEM HELPERS ===
const generateStretcher = (
    position: 'Superior' | 'Inferior' | 'Frontal' | 'Trasero',
    module: any,
    thickness: number,
    category: string,
    moduleHeight: number,
    mountingConfig?: { backMountingType: string, grooveDepth: number, rearGap: number, backThickness: number }
) => {
    const stretcherWidth = 100; // Standard width in mm (can be made configurable)

    // Calculate length (always internal width)
    const stretcherLength = module.width - (2 * thickness);

    // Calculate depth (finalHeight of the stretcher piece)
    // If it's a top/bottom/front stretcher, it's horizontal. Its "height" in the cutting list is actually its depth in the module.
    let finalDepth = stretcherWidth;

    // If we have mounting config, we might need to adjust depth for horizontal stretchers
    if (mountingConfig && (position === 'Superior' || position === 'Inferior')) {
        const extDepth = module.depth || 560;
        finalDepth = mountingConfig.backMountingType === 'GROOVED'
            ? extDepth - mountingConfig.rearGap - mountingConfig.backThickness
            : extDepth - mountingConfig.backThickness;

        // Wait, stretchers are usually NOT same depth as the floor. 
        // But some designs use full-depth stretchers. 
        // Standard "Amarre" is 100mm wide. 
        // If it's NOT a full floor, we keep 100mm.
        // Let's stick to 100mm unless it's the Piso/Techo.
    }

    const isVertical = position === 'Trasero';

    return {
        name: `Amarre ${position} ${category}`,
        finalWidth: stretcherLength,
        finalHeight: stretcherWidth,
        edges: { top: 0, bottom: 0, left: 0, right: 0 },
        quantity: 1,
        category: category,
        isStretcher: true,
        orientation: isVertical ? 'VERTICAL' : 'HORIZONTAL'
    };
};

const generateBackPanel = (
    module: any,
    thickness: number,
    category: string,
    moduleHeight: number,
    moduleDepth: number,
    mountingConfig: { backMountingType: string, grooveDepth: number, rearGap: number, backThickness: number }
) => {
    const intWidth = module.width - (2 * thickness);
    const intHeight = moduleHeight - thickness; // Default logic

    let finalWidth = intWidth;
    let finalHeight = intHeight;

    if (mountingConfig.backMountingType === 'GROOVED') {
        // Width = InternalWidth + (2 * grooveDepth) - 2mm (Holgura)
        finalWidth = intWidth + (2 * mountingConfig.grooveDepth) - 2;
        // Height = InternalHeight + (2 * grooveDepth) - 2mm
        finalHeight = intHeight + (2 * mountingConfig.grooveDepth) - 2;
    } else if (mountingConfig.backMountingType === 'INSET') {
        // INSET: InternalWidth - 1mm
        finalWidth = intWidth - 1;
        // Height: Depende de si es BASE (piso) o WALL (piso+techo)
        const totalIntHeight = category === 'WALL' || category === 'TOWER'
            ? moduleHeight - (2 * thickness)
            : moduleHeight - thickness;
        finalHeight = totalIntHeight - 1;
    } else {
        // NAILED: ExternalWidth - 2mm
        finalWidth = module.width - 2;
        finalHeight = moduleHeight - 2;
    }

    return {
        name: `Fondo ${category}`,
        finalWidth: Math.round(finalWidth * 10) / 10,
        finalHeight: Math.round(finalHeight * 10) / 10,
        edges: { top: 0, bottom: 0, left: 0, right: 0 },
        quantity: 1,
        category: category,
        isBackPanel: true
    };
};

// === MOTOR DE GENERACIÓN DE PIEZAS ===
const generateModulePieces = (module: any, carcassThickness: number, frontsThickness: number, rules: EdgeRules, config: ProjectData['config'], hardwareMap: Map<string, any>) => {
    let pieces: any[] = [];
    const { type, width, category, templateId, customPieces } = module;

    // RULE 0: If customPieces exists (Stage 3), it OVERRIDES everything
    if (customPieces && (customPieces as any[]).length > 0) {
        return customPieces as any[];
    }

    // Use module-specific overrides if present, otherwise use global config defaults
    const hBase = module.height ?? config.baseHeight;
    const hWall = module.height ?? config.wallHeight;
    const hTower = module.height ?? config.towerHeight ?? 2100;
    const dBase = module.depth ?? config.baseDepth;
    const dWall = module.depth ?? config.wallDepth;
    const doorInstallationType = config.doorInstallationType;
    const isInset = doorInstallationType === 'INSET';

    const hinge = hardwareMap.get(module.hingeId || '');
    const slider = hardwareMap.get(module.sliderId || '');
    const drawerSystem = hardwareMap.get(module.drawerSystemId || ''); // New metadata

    let doorGap = hinge?.discountRules?.gap ?? config.doorGap ?? 3;

    const tDoors = getEdgeThickness(rules.doors);
    const tVisible = getEdgeThickness(rules.visible);
    const tInternal = getEdgeThickness(rules.internal);

    // Back Mounting Config Extraction
    const mountingConfig = {
        backMountingType: module.backMountingType || config.backMountingType || 'INSET',
        grooveDepth: module.grooveDepth ?? config.grooveDepth ?? 9,
        rearGap: module.rearGap ?? config.rearGap ?? 18,
        backThickness: 3 // Standard default
    };

    // BASE MODULE LOGIC
    if (category === 'BASE') {
        const intWidth = width - (2 * carcassThickness);
        let internalDepth = dBase;

        if (mountingConfig.backMountingType === 'GROOVED') {
            internalDepth = dBase - mountingConfig.rearGap - mountingConfig.backThickness;
        } else if (mountingConfig.backMountingType === 'NAILED') {
            internalDepth = dBase - mountingConfig.backThickness;
        }
        // INSET: internalDepth = dBase (TotalDepth)

        // Lateral Izquierdo (1)
        pieces.push({
            name: 'Lateral Izquierdo Base',
            finalWidth: dBase,
            finalHeight: hBase,
            edges: { top: tInternal, bottom: tInternal, left: tVisible, right: tInternal },
            quantity: 1,
            category: 'BASE',
            thickness: carcassThickness
        });

        // Lateral Derecho (1)
        pieces.push({
            name: 'Lateral Derecho Base',
            finalWidth: dBase,
            finalHeight: hBase,
            edges: { top: tInternal, bottom: tInternal, left: tVisible, right: tInternal },
            quantity: 1,
            category: 'BASE',
            thickness: carcassThickness
        });

        pieces.push({
            name: 'Piso Base',
            finalWidth: intWidth,
            finalHeight: internalDepth,
            edges: { top: tVisible, bottom: tInternal, left: tInternal, right: tInternal },
            quantity: 1,
            category: 'BASE',
            thickness: carcassThickness
        });

        pieces.push({
            name: 'Amarre',
            finalWidth: intWidth,
            finalHeight: 100, // Standard width
            edges: { top: tInternal, bottom: tInternal, left: tInternal, right: tInternal },
            quantity: 2,
            category: 'BASE',
            thickness: carcassThickness
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
                description: legAssignment.reason,
                thickness: 0
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
                category: 'BASE',
                thickness: frontsThickness
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
                materialThickness: carcassThickness
            });
            pieces.push(...drawerPieces.map(p => ({ ...p, thickness: p.name.includes('Frente Vista') ? frontsThickness : carcassThickness })));
        }
    }

    // WALL MODULE LOGIC
    if (category === 'WALL') {
        const intWidth = width - (2 * carcassThickness);
        let internalDepth = dWall;

        if (mountingConfig.backMountingType === 'GROOVED') {
            internalDepth = dWall - mountingConfig.rearGap - mountingConfig.backThickness;
        } else if (mountingConfig.backMountingType === 'NAILED') {
            internalDepth = dWall - mountingConfig.backThickness;
        }
        // INSET: internalDepth = dWall (TotalDepth)

        pieces.push({
            name: 'Lateral Izquierdo Aéreo',
            finalWidth: dWall,
            finalHeight: hWall,
            edges: { top: tInternal, bottom: tInternal, left: tVisible, right: tInternal },
            quantity: 1,
            category: 'WALL',
            thickness: carcassThickness
        });
        pieces.push({
            name: 'Lateral Derecho Aéreo',
            finalWidth: dWall,
            finalHeight: hWall,
            edges: { top: tInternal, bottom: tInternal, left: tVisible, right: tInternal },
            quantity: 1,
            category: 'WALL',
            thickness: carcassThickness
        });
        pieces.push({
            name: 'Techo/Piso Aéreo',
            finalWidth: intWidth,
            finalHeight: internalDepth,
            edges: { top: tVisible, bottom: tInternal, left: tInternal, right: tInternal },
            quantity: 2,
            category: 'WALL',
            thickness: carcassThickness
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
                category: 'WALL',
                thickness: frontsThickness
            });
        }
    }

    // TOWER MODULE LOGIC
    if (category === 'TOWER') {
        let internalDepth = dBase;

        if (mountingConfig.backMountingType === 'GROOVED') {
            internalDepth = dBase - mountingConfig.rearGap - mountingConfig.backThickness;
        } else if (mountingConfig.backMountingType === 'NAILED') {
            internalDepth = dBase - mountingConfig.backThickness;
        }
        // INSET: internalDepth = dBase (TotalDepth)

        pieces.push({
            name: 'Lateral Izquierdo Torre',
            finalWidth: dBase,
            finalHeight: hTower,
            edges: { top: tInternal, bottom: tInternal, left: tVisible, right: tInternal },
            quantity: 1,
            category: 'TOWER',
            thickness: carcassThickness
        });
        pieces.push({
            name: 'Lateral Derecho Torre',
            finalWidth: dBase,
            finalHeight: hTower,
            edges: { top: tInternal, bottom: tInternal, left: tVisible, right: tInternal },
            quantity: 1,
            category: 'TOWER',
            thickness: carcassThickness
        });
        pieces.push({
            name: 'Techo/Piso Torre',
            finalWidth: width - (2 * carcassThickness),
            finalHeight: internalDepth,
            edges: { top: tVisible, bottom: tInternal, left: tInternal, right: tInternal },
            quantity: 2,
            category: 'TOWER',
            thickness: carcassThickness
        });
        const frontGap = 20; // Standard gap
        const shelfDepth = (mountingConfig.backMountingType === 'INSET'
            ? dBase - mountingConfig.backThickness
            : internalDepth) - frontGap;

        pieces.push({
            name: 'Estantería Torre',
            finalWidth: width - (2 * carcassThickness) - 2,
            finalHeight: Math.round(shelfDepth * 10) / 10,
            edges: { top: tVisible, bottom: tInternal, left: tInternal, right: tInternal },
            quantity: 3,
            category: 'TOWER',
            thickness: carcassThickness
        });
    }

    // === UNIVERSAL STRETCHERS SYSTEM ===
    // Applies to ALL module types (BASE, WALL, TOWER)
    const currentHeight = category === 'BASE' ? hBase : (category === 'WALL' ? hWall : hTower);
    const currentDepth = category === 'WALL' ? dWall : dBase;

    if (module.hasTopStretcher) {
        pieces.push({
            ...generateStretcher('Superior', module, carcassThickness, category, currentHeight, mountingConfig),
            thickness: carcassThickness
        });
    }

    if (module.hasBottomStretcher) {
        pieces.push({
            ...generateStretcher('Inferior', module, carcassThickness, category, currentHeight, mountingConfig),
            thickness: carcassThickness
        });
    }

    if (module.hasFrontStretcher) {
        pieces.push({
            ...generateStretcher('Frontal', module, carcassThickness, category, currentHeight, mountingConfig),
            thickness: carcassThickness
        });
    }

    // BACK PANEL - Conditional based on hasBackPanel flag
    // Default to true if not specified (backward compatibility)
    const shouldHaveBackPanel = module.hasBackPanel !== false;

    if (shouldHaveBackPanel) {
        pieces.push({
            ...generateBackPanel(module, carcassThickness, category, currentHeight, currentDepth, mountingConfig),
            thickness: mountingConfig.backThickness
        });
    }

    return pieces;
};

// Mock functions for calculation logic
const calculateLegs = (params: any) => ({ quantity: 4, reason: 'Carga estándar' });
const calculateDrawerPieces = (params: any): any[] => [];

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

// === MODULE TEMPLATES ROUTES ===
app.use('/api', moduleTemplatesRouter);

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

        const carcassThickness = boardThickness || 15;
        const frontsThickness = 18; // Default for generate-pieces endpoint
        const pieces = generateModulePieces(mod, carcassThickness, frontsThickness, edgeRules, config, hardwareMap);
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
        const carcassThickness = project.carcassThickness || project.boardThickness || project.config.carcassThickness || 15;
        const frontsThickness = project.frontsThickness || project.config.frontsThickness || 18;

        project.modules.forEach((mod, modIdx) => {
            const modCode = generateModuleCode(mod.category || 'BASE', modIdx + 1);

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

            console.log(`🔨 Calculando Módulo:`, { category: mod.category, width: mod.width, type: mod.type, code: modCode });
            const modPieces = generateModulePieces(mod, carcassThickness, frontsThickness, project.edgeRules, project.config, hardwareMap);

            // Calcular medidas de corte para cada pieza generada
            const calculated = modPieces.map((p, pIdx) => {
                const pieceCode = generatePieceCode(modCode, p.name, pIdx + 1);

                // Skip calculation for hardware or non-cutting items
                if (p.category === 'HARDWARE' || (p.finalWidth === 0 && p.finalHeight === 0)) {
                    return {
                        ...p,
                        cutWidth: 0,
                        cutHeight: 0,
                        moduleType: mod.type,
                        moduleCode: modCode,
                        codigo: pieceCode
                    };
                }

                try {
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
                        moduleType: mod.type,
                        moduleCode: modCode,
                        codigo: pieceCode
                    };
                } catch (e: any) {
                    console.error(`❌ Error en pieza "${p.name}" del módulo ${mod.category}:`, e.message);
                    throw new Error(`${e.message} (Módulo: ${mod.category}, Ancho: ${mod.width}mm)`);
                }
            });

            allPieces.push(...calculated);
        });


        // Variables already declared at top of function
        res.json({
            success: true,
            pieces: allPieces,
            summary: {
                totalPieces: allPieces.filter(p => p.category !== 'HARDWARE').reduce((acc, p) => acc + p.quantity, 0),
                estimatedBoards: Math.ceil(allPieces.filter(p => p.category !== 'HARDWARE').length / 12),
                hardwareCost: totalHardwareCost,
                plinthLength: Number(safeConfig.plinthLength) || 0,
                countertopLength: Number(safeConfig.countertopLength) || 0,
                totalEstimatedPrice: totalHardwareCost + 50000,
                carcassThickness,
                frontsThickness
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


// --- UPDATE PROJECT ---
app.put('/api/projects/:id', async (req: any, res) => {
    const { id } = req.params;
    console.log(`------- [PUT /api/projects/${id}] UPDATE REQUEST -------`);
    try {
        const { projectName, linearLength, modules, clientName, config, thumbnail } = req.body;

        // Auth Logic (same as POST)
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
            finalUserId = guest?.id;
        }

        // 1. Verify ownership/existence
        const existing = await prisma.project.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ success: false, error: 'Proyecto no encontrado' });
        if (existing.userId !== finalUserId) return res.status(403).json({ success: false, error: 'No tienes permiso para editar este proyecto' });

        // A. Prepare all module data with codes and pieces before the transaction
        const modulesToSync = await Promise.all(modules.map(async (m: any, idx: number) => {
            const modCode = generateModuleCode(m.category || 'BASE', idx + 1);

            const hingeId = m.hingeId || null;
            const sliderId = m.sliderId || null;
            const drawerSystemId = (m as any).drawerSystemId || null;

            const hardwareIds = [hingeId, sliderId, drawerSystemId].filter(id => !!id);
            const [hardwareItems, drawerSystems] = await Promise.all([
                prisma.hardwareItem.findMany({ where: { id: { in: hardwareIds as string[] } } }),
                prisma.drawerSystem.findMany({ where: { id: { in: hardwareIds as string[] } } })
            ]);

            const hMap = new Map<string, any>();
            hardwareItems.forEach(item => hMap.set(item.id, item));
            drawerSystems.forEach(item => hMap.set(item.id, item));

            const pConfig = config || {};
            const cThickness = Number(req.body.carcassThickness || pConfig.carcassThickness || 15);
            const fThickness = Number(req.body.frontsThickness || pConfig.frontsThickness || 18);
            const eRules = req.body.edgeRules || {};

            const generatedPieces = generateModulePieces(m, cThickness, fThickness, eRules, pConfig, hMap);
            const finalPieces = (m.customPieces && Array.isArray(m.customPieces) && m.customPieces.length > 0)
                ? m.customPieces
                : generatedPieces;

            return {
                type: String(m.type),
                category: String(m.category || 'BASE'),
                width: Number(m.width || 0),
                isFixed: Boolean(m.isFixed),
                doorCount: Number(m.doorCount || 0),
                drawerCount: Number(m.drawerCount || 0),
                hingeType: String(m.hingeType || 'Estándar'),
                sliderType: String(m.sliderType || 'Estándar'),
                hingeId,
                sliderId,
                drawerSystemId,
                templateId: m.templateId ? String(m.templateId) : null,
                legSystemId: m.legSystemId ? String(m.legSystemId) : null,
                openingSystem: m.openingSystem ? String(m.openingSystem) : null,
                customPieces: m.customPieces || null,
                calculationRules: m.calculationRules || null,
                height: Number(m.height || 720),
                depth: Number(m.depth || 560),
                backMountingType: m.backMountingType || null,
                grooveDepth: m.grooveDepth !== undefined ? Number(m.grooveDepth) : null,
                rearGap: m.rearGap !== undefined ? Number(m.rearGap) : null,
                codigo: modCode,
                pieces: {
                    create: finalPieces.map((p: any, pIdx: number) => ({
                        name: p.name,
                        finalWidth: Number(p.finalWidth),
                        finalHeight: Number(p.finalHeight),
                        quantity: Number(p.quantity || 1),
                        material: p.material || null,
                        edgeL1Id: p.edgeL1Id || null,
                        edgeL2Id: p.edgeL2Id || null,
                        edgeA1Id: p.edgeA1Id || null,
                        edgeA2Id: p.edgeA2Id || null,
                        cutWidth: 0,
                        cutHeight: 0,
                        codigo: generatePieceCode(modCode, p.name, pIdx + 1)
                    }))
                }
            };
        }));

        // 2. Atomic Update (Transaction)
        const updatedProject = await prisma.$transaction(async (tx) => {
            // A. Remove existing pieces and modules first (Cascading logic)
            await tx.piece.deleteMany({ where: { module: { projectId: id } } });
            await tx.module.deleteMany({ where: { projectId: id } });

            // B. Update Project Base Data
            return await tx.project.update({
                where: { id },
                data: {
                    name: String(projectName),
                    clientName: clientName ? String(clientName) : null,
                    linearLength: Number(linearLength),
                    thumbnail: thumbnail || null,
                    config: config || {},
                    backMountingType: config.backMountingType || 'NAILED',
                    grooveDepth: Number(config.grooveDepth || 9),
                    rearGap: Number(config.rearGap || 18),
                    modules: {
                        create: modulesToSync
                    }
                },
                include: { modules: { include: { pieces: true } } }
            });
        });

        console.log('✅ PROJECT UPDATED SUCCESS:', updatedProject.id);
        res.json({
            success: true,
            id: updatedProject.id,
            message: 'Proyecto actualizado correctamente'
        });

    } catch (error: any) {
        console.error('❌ SERVER ERROR UPDATING PROJECT:', error);
        res.status(500).json({ success: false, error: error.message });
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

        // A. Prepare all module data with codes and pieces outside Prisma create
        const modulesToCreate = await Promise.all(modules.map(async (m: any, idx: number) => {
            const modCode = generateModuleCode(m.category || 'BASE', idx + 1);

            const hingeId = m.hingeId || null;
            const sliderId = m.sliderId || null;
            const drawerSystemId = (m as any).drawerSystemId || null;

            const hardwareIds = [hingeId, sliderId, drawerSystemId].filter(id => !!id);
            const [hardwareItems, drawerSystems] = await Promise.all([
                prisma.hardwareItem.findMany({ where: { id: { in: hardwareIds as string[] } } }),
                prisma.drawerSystem.findMany({ where: { id: { in: hardwareIds as string[] } } })
            ]);

            const hMap = new Map<string, any>();
            hardwareItems.forEach(item => hMap.set(item.id, item));
            drawerSystems.forEach(item => hMap.set(item.id, item));

            const pConfig = config || {};
            const cThickness = Number(req.body.carcassThickness || pConfig.carcassThickness || 15);
            const fThickness = Number(req.body.frontsThickness || pConfig.frontsThickness || 18);
            const eRules = req.body.edgeRules || {};

            const generatedPieces = generateModulePieces(m, cThickness, fThickness, eRules, pConfig, hMap);
            const finalPieces = (m.customPieces && Array.isArray(m.customPieces) && m.customPieces.length > 0)
                ? m.customPieces
                : generatedPieces;

            return {
                type: String(m.type),
                category: String(m.category || 'BASE'),
                width: Number(m.width || 0),
                isFixed: Boolean(m.isFixed),
                doorCount: Number(m.doorCount || 0),
                drawerCount: Number(m.drawerCount || 0),
                hingeType: String(m.hingeType || 'Estándar'),
                sliderType: String(m.sliderType || 'Estándar'),
                hingeId,
                sliderId,
                drawerSystemId,
                templateId: m.templateId ? String(m.templateId) : null,
                legSystemId: m.legSystemId ? String(m.legSystemId) : null,
                openingSystem: m.openingSystem ? String(m.openingSystem) : null,
                customPieces: m.customPieces || null,
                calculationRules: m.calculationRules || null,
                height: Number(m.height || 720),
                depth: Number(m.depth || 560),
                backMountingType: m.backMountingType || null,
                grooveDepth: m.grooveDepth !== undefined ? Number(m.grooveDepth) : null,
                rearGap: m.rearGap !== undefined ? Number(m.rearGap) : null,
                codigo: modCode,
                pieces: {
                    create: finalPieces.map((p: any, pIdx: number) => ({
                        name: p.name,
                        finalWidth: Number(p.finalWidth),
                        finalHeight: Number(p.finalHeight),
                        quantity: Number(p.quantity || 1),
                        material: p.material || null,
                        edgeL1Id: p.edgeL1Id || null,
                        edgeL2Id: p.edgeL2Id || null,
                        edgeA1Id: p.edgeA1Id || null,
                        edgeA2Id: p.edgeA2Id || null,
                        cutWidth: 0,
                        cutHeight: 0,
                        codigo: generatePieceCode(modCode, p.name, pIdx + 1)
                    }))
                }
            };
        }));

        const project = await prisma.project.create({
            data: {
                name: String(projectName),
                clientName: clientName ? String(clientName) : null,
                linearLength: Number(linearLength),
                userId: finalUserId,
                openingSystem: String(req.body.openingSystem || 'HANDLE'),
                thumbnail: thumbnail || null,
                config: config || {},
                backMountingType: config.backMountingType || 'NAILED',
                grooveDepth: Number(config.grooveDepth || 9),
                rearGap: Number(config.rearGap || 18),
                modules: {
                    create: modulesToCreate
                }
            },
            include: { modules: { include: { pieces: true } } }
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
        const projectId = req.params.id;

        // 1. Find all modules for this project
        const modules = await prisma.module.findMany({
            where: { projectId: projectId }
        });

        const moduleIds = modules.map(m => m.id);

        // 2. Delete all pieces associated with these modules
        if (moduleIds.length > 0) {
            await prisma.piece.deleteMany({
                where: { moduleId: { in: moduleIds } }
            });
        }

        // 3. Delete modules
        await prisma.module.deleteMany({
            where: { projectId: projectId }
        });

        // 4. Delete the project itself
        await prisma.project.delete({
            where: { id: projectId, userId: req.user.id }
        });

        res.json({ success: true, message: 'Proyecto y dependencias eliminados correctamente' });
    } catch (error: any) {
        console.error('❌ Error deleting project:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 [SERVER] Kitchen Pro API corriendo en el puerto ${PORT}`);
    console.log(`🔧 [ENV] NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});
