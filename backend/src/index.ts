import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

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
    const { type, width } = module;
    const HEIGHT_BASE = 720; // Altura estándar sin zócalo
    const DEPTH_BASE = 560;

    const tDoors = getEdgeThickness(rules.doors);
    const tVisible = getEdgeThickness(rules.visible);
    const tInternal = getEdgeThickness(rules.internal);

    if (type === 'BASE' || type === 'SINK_BASE' || type === 'DRAWER') {
        // Laterales (2)
        pieces.push({
            name: 'Lateral',
            finalWidth: DEPTH_BASE,
            finalHeight: HEIGHT_BASE,
            edges: { top: tInternal, bottom: tInternal, left: tVisible, right: tInternal },
            quantity: 2
        });

        // Piso (1)
        pieces.push({
            name: 'Piso',
            finalWidth: width - (2 * thickness),
            finalHeight: DEPTH_BASE,
            edges: { top: tVisible, bottom: tInternal, left: tInternal, right: tInternal },
            quantity: 1
        });

        // Amarres / Listones (2)
        pieces.push({
            name: 'Amarre',
            finalWidth: width - (2 * thickness),
            finalHeight: 100,
            edges: { top: tInternal, bottom: tInternal, left: tInternal, right: tInternal },
            quantity: 2
        });

        // Puertas (si aplica)
        if (module.doorCount > 0) {
            const doorWidth = (width / module.doorCount) - 1.5; // Holgura de 3mm total
            pieces.push({
                name: 'Puerta',
                finalWidth: doorWidth,
                finalHeight: HEIGHT_BASE - 4, // Holgura superior
                edges: { top: tDoors, bottom: tDoors, left: tDoors, right: tDoors },
                quantity: module.doorCount
            });
        }

        // Gavetas (si aplica) - Simplificado para MVP
        if (module.drawerCount > 0) {
            const frontHeight = (HEIGHT_BASE / module.drawerCount) - 3;
            pieces.push({
                name: 'Frente Gaveta',
                finalWidth: width - 3,
                finalHeight: frontHeight,
                edges: { top: tDoors, bottom: tDoors, left: tDoors, right: tDoors },
                quantity: module.drawerCount
            });
        }
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

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
