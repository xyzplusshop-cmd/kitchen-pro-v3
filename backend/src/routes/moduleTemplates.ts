import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// === CALCULATION ENGINE ===

/**
 * Calculates internal piece dimensions from external measurements
 * @param externalWidth - Total external width in mm
 * @param externalHeight - Total external height in mm
 * @param externalDepth - Total external depth in mm
 * @param referenceThickness - Board thickness for calculations (15mm or 18mm)
 */
const calculatePieceDimensions = (
    externalWidth: number,
    externalHeight: number,
    externalDepth: number,
    referenceThickness: number
) => {
    // Internal width calculation (critical formula)
    const internalWidth = externalWidth - (2 * referenceThickness);

    return {
        // Horizontal pieces (Piso, Techo, Estantes)
        horizontalWidth: internalWidth,
        horizontalDepth: externalDepth,

        // Laterales (Sides)
        lateralHeight: externalHeight,
        lateralDepth: externalDepth,

        // Fondo (Back Panel)
        fondoWidth: internalWidth,
        fondoHeight: externalHeight - referenceThickness, // Typically doesn't reach top

        // Amarres (Stretchers)
        amarreWidth: internalWidth,
        amarreRearLength: 100,  // Standard for rear stretchers
        amarreFrontLength: 50   // Standard for front/top stretchers
    };
};

/**
 * Generates piece templates with formulas for parametric recalculation
 */
const generatePieceTemplates = (
    zona: string,
    externalWidth: number,
    externalHeight: number,
    externalDepth: number,
    referenceThickness: number,
    options: {
        hasTopStretcher?: boolean;
        hasBottomStretcher?: boolean;
        hasFrontStretcher?: boolean;
        hasBackPanel?: boolean;
    }
) => {
    const dims = calculatePieceDimensions(externalWidth, externalHeight, externalDepth, referenceThickness);
    const pieces: any[] = [];

    // === PRIMARY STRUCTURAL PIECES ===

    // Piso (Floor)
    pieces.push({
        name: `Piso ${zona}`,
        formula: 'externalWidth - (2 * thickness)',
        finalWidth: dims.horizontalWidth,
        finalHeight: dims.horizontalDepth,
        edges: { top: 0, bottom: 0, left: 0, right: 0 },
        quantity: 1,
        category: zona,
        isPrimary: true,
        isStructural: true
    });

    // Techo (Ceiling/Top)
    pieces.push({
        name: `Techo ${zona}`,
        formula: 'externalWidth - (2 * thickness)',
        finalWidth: dims.horizontalWidth,
        finalHeight: dims.horizontalDepth,
        edges: { top: 0, bottom: 0, left: 0, right: 0 },
        quantity: 1,
        category: zona,
        isPrimary: true,
        isStructural: true
    });

    // Lateral Izquierdo (Left Side)
    pieces.push({
        name: `Lateral Izquierdo ${zona}`,
        formula: 'externalHeight',
        finalWidth: dims.lateralDepth,
        finalHeight: dims.lateralHeight,
        edges: { top: 0, bottom: 0, left: 0, right: 0 },
        quantity: 1,
        category: zona,
        isPrimary: true
    });

    // Lateral Derecho (Right Side) - Symmetric to left
    pieces.push({
        name: `Lateral Derecho ${zona}`,
        formula: 'externalHeight',
        finalWidth: dims.lateralDepth,
        finalHeight: dims.lateralHeight,
        edges: { top: 0, bottom: 0, left: 0, right: 0 },
        quantity: 1,
        category: zona,
        isPrimary: true,
        symmetrySource: `Lateral Izquierdo ${zona}`
    });

    // === CONDITIONAL PIECES ===

    // Fondo (Back Panel) - Conditional
    if (options.hasBackPanel !== false) { // Default true
        pieces.push({
            name: `Fondo ${zona}`,
            formula: 'externalWidth - (2 * thickness)',
            finalWidth: dims.fondoWidth,
            finalHeight: dims.fondoHeight,
            edges: { top: 0, bottom: 0, left: 0, right: 0 },
            quantity: 1,
            category: zona,
            isDependentOnWidth: true
        });
    }

    // === STRETCHERS (AMARRES) ===

    // Amarre Trasero Superior (Rear Top Stretcher)
    if (options.hasTopStretcher) {
        pieces.push({
            name: `Amarre Trasero Superior ${zona}`,
            formula: 'externalWidth - (2 * thickness)',
            finalWidth: dims.amarreWidth,
            finalHeight: dims.amarreRearLength, // 100mm standard
            edges: { top: 0, bottom: 0, left: 0, right: 0 },
            quantity: 1,
            category: zona,
            isStretcher: true,
            orientation: 'VERTICAL', // ⚠️ CRITICAL: De canto para atornillar a pared
            isDependentOnWidth: true
        });
    }

    // Amarre Trasero Inferior (Rear Bottom Stretcher)
    if (options.hasBottomStretcher) {
        pieces.push({
            name: `Amarre Trasero Inferior ${zona}`,
            formula: 'externalWidth - (2 * thickness)',
            finalWidth: dims.amarreWidth,
            finalHeight: dims.amarreRearLength, // 100mm standard
            edges: { top: 0, bottom: 0, left: 0, right: 0 },
            quantity: 1,
            category: zona,
            isStretcher: true,
            orientation: 'VERTICAL', // ⚠️ CRITICAL: De canto
            isDependentOnWidth: true
        });
    }

    // Amarre Frontal (Front Stretcher)
    if (options.hasFrontStretcher) {
        pieces.push({
            name: `Amarre Frontal ${zona}`,
            formula: 'externalWidth - (2 * thickness)',
            finalWidth: dims.amarreWidth,
            finalHeight: dims.amarreFrontLength, // 50mm standard
            edges: { top: 0, bottom: 0, left: 0, right: 0 },
            quantity: 1,
            category: zona,
            isStretcher: true,
            orientation: 'HORIZONTAL', // Plano
            isDependentOnWidth: true
        });
    }

    return pieces;
};

// === API ENDPOINTS ===

/**
 * POST /api/module-templates
 * Creates a new module template with auto-calculated pieces
 */
router.post('/module-templates', async (req, res) => {
    try {
        const {
            modelo,
            nombre,
            zona,
            tipoApertura,
            externalWidth,
            externalHeight,
            externalDepth,
            referenceThickness = 18,
            hasTopStretcher = false,
            hasBottomStretcher = false,
            hasFrontStretcher = false,
            hasBackPanel = true,
            descripcion,
            thumbnail
        } = req.body;

        // Validation
        if (!modelo || !nombre || !zona) {
            return res.status(400).json({
                success: false,
                error: 'Faltan campos requeridos: modelo, nombre, zona'
            });
        }

        if (!externalWidth || !externalHeight || !externalDepth) {
            return res.status(400).json({
                success: false,
                error: 'Faltan dimensiones externas: externalWidth, externalHeight, externalDepth'
            });
        }

        // Generate piece templates with formulas
        const pieceTemplates = generatePieceTemplates(
            zona,
            Number(externalWidth),
            Number(externalHeight),
            Number(externalDepth),
            Number(referenceThickness),
            {
                hasTopStretcher,
                hasBottomStretcher,
                hasFrontStretcher,
                hasBackPanel
            }
        );

        // For backward compatibility, also save to 'piezas' field
        const piezas = pieceTemplates;

        // Create template in database
        const template = await prisma.moduleTemplate.create({
            data: {
                modelo: String(modelo),
                nombre: String(nombre),
                zona: String(zona),
                tipoApertura: tipoApertura ? String(tipoApertura) : null,
                externalWidth: Number(externalWidth),
                externalHeight: Number(externalHeight),
                externalDepth: Number(externalDepth),
                referenceThickness: Number(referenceThickness),
                piezas,
                pieceTemplates,
                hasTopStretcher: Boolean(hasTopStretcher),
                hasBottomStretcher: Boolean(hasBottomStretcher),
                hasFrontStretcher: Boolean(hasFrontStretcher),
                hasBackPanel: hasBackPanel !== false, // Default true
                descripcion: descripcion ? String(descripcion) : null,
                thumbnail: thumbnail ? String(thumbnail) : null
            }
        });

        console.log('✅ Module Template Created:', {
            id: template.id,
            modelo: template.modelo,
            nombre: template.nombre,
            piecesCount: pieceTemplates.length,
            externalDims: { externalWidth, externalHeight, externalDepth },
            referenceThickness
        });

        res.json({
            success: true,
            template,
            calculatedPieces: pieceTemplates,
            summary: {
                totalPieces: pieceTemplates.length,
                structuralPieces: pieceTemplates.filter(p => p.isPrimary).length,
                stretchers: pieceTemplates.filter(p => p.isStretcher).length,
                hasBackPanel: hasBackPanel !== false
            }
        });

    } catch (error: any) {
        console.error('❌ Error creating template:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.stack
        });
    }
});

/**
 * GET /api/module-templates
 * List all module templates
 */
router.get('/module-templates', async (req, res) => {
    try {
        const templates = await prisma.moduleTemplate.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            templates,
            count: templates.length
        });
    } catch (error: any) {
        console.error('❌ Error fetching templates:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/module-templates/:id
 * Get a specific template
 */
router.get('/module-templates/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const template = await prisma.moduleTemplate.findUnique({
            where: { id }
        });

        if (!template) {
            return res.status(404).json({
                success: false,
                error: 'Template not found'
            });
        }

        res.json({
            success: true,
            template
        });
    } catch (error: any) {
        console.error('❌ Error fetching template:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
