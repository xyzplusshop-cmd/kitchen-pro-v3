/**
 * DXF Generator for CNC Machining
 * 
 * Converts MachiningOperation arrays into DXF files compatible with
 * CAM software (VCarve, Fusion 360, AutoCAD, etc.)
 * 
 * Layer organization is CRITICAL - CAM software uses layer names
 * to automatically assign tools and depths.
 */

import DxfWriter from 'dxf-writer';
import type { MachiningOperation } from './machiningEngine';

// ============================================
// LAYER CONFIGURATION
// ============================================

/**
 * DXF Layer definitions with AutoCAD color codes
 * 
 * CAM software reads these layer names to determine:
 * - Which tool to use
 * - What depth to cut
 * - What operation type (drill, pocket, route)
 */
const LAYERS = {
    OUTLINE: {
        name: 'OUTLINE',
        color: 7,           // White
        description: 'Piece perimeter (final cut)'
    },
    DRILL_2MM: {
        name: 'GUIDE_2MM',
        color: 4,           // Cyan
        description: 'Pilot holes for screws'
    },
    DRILL_5MM: {
        name: 'DRILL_5MM',
        color: 1,           // Red
        description: 'System 32 and Minifix inserts'
    },
    DRILL_8MM: {
        name: 'DRILL_8MM',
        color: 2,           // Yellow
        description: 'Minifix dowel holes'
    },
    DRILL_35MM: {
        name: 'DRILL_35MM',
        color: 3,           // Green
        description: 'Hinge cups'
    },
    POCKET_15MM: {
        name: 'POCKET_15MM',
        color: 5,           // Blue
        description: 'Minifix cam cavities'
    },
    POCKET_20MM: {
        name: 'POCKET_20MM',
        color: 6,           // Magenta
        description: 'Large cam locks'
    },
    GROOVE: {
        name: 'GROOVE',
        color: 8,           // Dark gray
        description: 'Linear grooves/channels'
    }
};

/**
 * Maps operation diameter to layer name
 */
function getLayerForOperation(operation: MachiningOperation): { name: string; color: number } {
    // Pilot holes
    if (operation.type === 'PILOT_HOLE' || operation.diameter <= 2) {
        return LAYERS.DRILL_2MM;
    }

    // Pockets
    if (operation.type === 'POCKET') {
        if (operation.diameter <= 15) {
            return LAYERS.POCKET_15MM;
        }
        return LAYERS.POCKET_20MM;
    }

    // Grooves
    if (operation.type === 'GROOVE') {
        return LAYERS.GROOVE;
    }

    // Drills - by diameter
    if (operation.diameter <= 5) {
        return LAYERS.DRILL_5MM;
    } else if (operation.diameter <= 8) {
        return LAYERS.DRILL_8MM;
    } else if (operation.diameter <= 35) {
        return LAYERS.DRILL_35MM;
    }

    // Default
    return LAYERS.DRILL_5MM;
}

// ============================================
// DXF GENERATION
// ============================================

export interface PieceDXFOptions {
    pieceId: string;
    pieceName: string;
    width: number;          // Cut width (mm)
    height: number;         // Cut height (mm)
    thickness: number;      // Material thickness (mm)
    material?: string;      // Material name
    operations: MachiningOperation[];
}

/**
 * Generates DXF content for a single piece
 * 
 * @returns DXF file content as string
 */
export function generatePieceDXF(options: PieceDXFOptions): string {
    const { width, height, operations, pieceName } = options;

    // Initialize DXF writer
    const dxf = new DxfWriter();

    // ===== STEP 1: DEFINE ALL LAYERS =====
    Object.values(LAYERS).forEach(layer => {
        dxf.addLayer(layer.name, layer.color, 'CONTINUOUS');
    });

    // ===== STEP 2: DRAW OUTLINE (Perimeter) =====
    // This is the final cut shape of the piece
    dxf.setActiveLayer(LAYERS.OUTLINE.name);

    // Draw rectangle starting from origin (0,0)
    dxf.drawPolyline([
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: width, y: height },
        { x: 0, y: height }
    ], true); // true = closed polyline

    // Add piece identification text
    dxf.drawText(
        10,
        height + 5,
        10, // text height
        0,  // rotation
        pieceName
    );

    // ===== STEP 3: DRAW MACHINING OPERATIONS =====
    operations.forEach((op) => {
        const layer = getLayerForOperation(op);
        dxf.setActiveLayer(layer.name);

        const radius = op.diameter / 2;

        if (op.type === 'DRILL' || op.type === 'POCKET' || op.type === 'PILOT_HOLE') {
            // Draw circle at operation coordinates
            dxf.drawCircle(op.x, op.y, radius);

            // Add center mark (small cross)
            const markSize = 1;
            dxf.drawLine(op.x - markSize, op.y, op.x + markSize, op.y);
            dxf.drawLine(op.x, op.y - markSize, op.x, op.y + markSize);

        } else if (op.type === 'GROOVE') {
            // For grooves, draw a rectangle representing the channel
            // (Assuming groove has a length property - extend as needed)
            const grooveLength = 50; // Default, should come from operation
            dxf.drawRect(op.x - radius, op.y - grooveLength / 2, op.diameter, grooveLength);
        }
    });

    // ===== STEP 4: ADD METADATA =====
    // Add comment block with piece info
    dxf.setActiveLayer(LAYERS.OUTLINE.name);
    const infoX = width + 20;
    let infoY = height;

    const info = [
        `Piece: ${pieceName}`,
        `Dimensions: ${width} × ${height} × ${options.thickness}mm`,
        `Material: ${options.material || 'N/A'}`,
        `Operations: ${operations.length}`,
        `Generated: ${new Date().toISOString()}`,
        ``,
        `Layer Guide:`,
        `- OUTLINE: Final piece cut`,
        `- DRILL_5MM: System 32, inserts`,
        `- DRILL_35MM: Hinge cups`,
        `- POCKET_15MM: Cam locks`
    ];

    info.forEach((line, index) => {
        dxf.drawText(infoX, infoY - (index * 6), 4, 0, line);
    });

    // ===== STEP 5: GENERATE STRING =====
    return dxf.toDxfString();
}

/**
 * Triggers browser download of DXF file
 */
export function downloadDXF(dxfContent: string, filename: string): void {
    // Create blob
    const blob = new Blob([dxfContent], { type: 'application/dxf' });

    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename.endsWith('.dxf') ? filename : `${filename}.dxf`);
    link.style.visibility = 'hidden';

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
}

/**
 * Generates safe filename for DXF
 * 
 * Format: [Material]_[PieceName]_[ID].dxf
 * Example: Melamina18_Puerta_PZA001.dxf
 */
export function generateDXFFilename(
    pieceName: string,
    pieceId: string,
    material?: string,
    thickness?: number
): string {
    const sanitize = (str: string) => str
        .replace(/[^a-z0-9]+/gi, '_')
        .replace(/^_|_$/g, '')
        .toLowerCase();

    const parts: string[] = [];

    if (material && thickness) {
        const matName = sanitize(material);
        parts.push(`${matName}${thickness}`);
    }

    parts.push(sanitize(pieceName));
    parts.push(pieceId.replace(/[^a-z0-9]/gi, ''));

    return parts.join('_') + '.dxf';
}

/**
 * Main export function - combines generation and download
 */
export function exportPieceToDXF(options: PieceDXFOptions): void {
    // Generate DXF content
    const dxfContent = generatePieceDXF(options);

    // Generate filename
    const filename = generateDXFFilename(
        options.pieceName,
        options.pieceId,
        options.material,
        options.thickness
    );

    // Trigger download
    downloadDXF(dxfContent, filename);

    console.log(`✅ DXF exported: ${filename} (${options.operations.length} operations)`);
}

/**
 * Batch export - generates multiple DXF files (future enhancement)
 */
export function exportAllPiecesToDXF(pieces: PieceDXFOptions[]): void {
    pieces.forEach(piece => {
        exportPieceToDXF(piece);
    });

    console.log(`✅ Batch export complete: ${pieces.length} DXF files`);
}

/**
 * Preview DXF content (for debugging)
 */
export function previewDXF(options: PieceDXFOptions): string {
    return generatePieceDXF(options);
}
