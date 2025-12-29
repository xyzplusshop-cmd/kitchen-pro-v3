/**
 * Export Formats Utility
 * 
 * Provides functions to export project data in various formats
 * compatible with external tools (CSV for cut optimizers, etc.)
 */

import { calculateCutDimensions } from './cutlistCalculations';

export interface CutlistPiece {
    name: string;
    id?: string;
    codigo?: string;
    finalWidth: number;
    finalHeight: number;
    quantity: number;
    edgeL1Id?: string | null;
    edgeL2Id?: string | null;
    edgeA1Id?: string | null;
    edgeA2Id?: string | null;
    materialId?: string;
    thickness?: number;
}

export interface Material {
    id: string;
    name: string;
    thickness: number;
    type?: string;
}

/**
 * Sanitizes text for CSV export by removing commas and quotes
 */
function sanitizeCSVText(text: string): string {
    if (!text) return '';
    return text
        .replace(/,/g, ' ')  // Remove commas
        .replace(/"/g, '')   // Remove quotes
        .replace(/\n/g, ' ') // Remove newlines
        .trim();
}

/**
 * Generates a CSV string for cut optimizer software
 * 
 * Format compatible with:
 * - Cutlist Optimizer
 * - Corteza
 * - MaxCut
 * - OptiCut
 * 
 * @param pieces Array of pieces from the cutlist
 * @param materials Array of available materials
 * @param projectName Name of the project (for filename)
 * @returns CSV string ready for download
 */
export function generateCutlistCSV(
    pieces: CutlistPiece[],
    materials: Material[],
    projectName: string = 'Proyecto'
): string {
    // CSV Headers (Standard format for optimizers)
    const headers = [
        'Length',           // Cut length in mm
        'Width',            // Cut width in mm
        'Qty',              // Quantity (always 1, piece by piece)
        'Label',            // Piece identifier
        'Material',         // Material name
        'Enabled',          // Always true
        'Grain'             // true if material has grain/direction
    ];

    const rows: string[][] = [headers];

    // Process each piece
    pieces.forEach((piece, index) => {
        // Calculate cut dimensions (subtracting edge thicknesses)
        const cutDims = calculateCutDimensions(piece, materials);

        // Skip invalid pieces
        if (cutDims.cutWidth <= 0 || cutDims.cutHeight <= 0) {
            console.warn(`Skipping invalid piece: ${piece.name}`, cutDims);
            return;
        }

        // Find material info
        const material = materials.find(m => m.id === piece.materialId);
        const materialName = material
            ? `${sanitizeCSVText(material.name)} ${material.thickness}mm`
            : 'Material Desconocido';

        // Generate piece label
        const pieceId = piece.codigo || piece.id || `PZA-${String(index + 1).padStart(3, '0')}`;
        const label = sanitizeCSVText(`${piece.name} - ${pieceId}`);

        // Check if material has grain (wood-like materials)
        const hasGrain = material?.name.toLowerCase().includes('roble')
            || material?.name.toLowerCase().includes('madera')
            || material?.name.toLowerCase().includes('nogal')
            || material?.type === 'WOOD';

        // Export piece (repeat for quantity if needed)
        for (let i = 0; i < (piece.quantity || 1); i++) {
            const row = [
                cutDims.cutHeight.toFixed(1),      // Length (mm)
                cutDims.cutWidth.toFixed(1),       // Width (mm)
                '1',                                // Qty (always 1 per row)
                label,                              // Label
                materialName,                       // Material
                'true',                             // Enabled
                hasGrain ? 'true' : 'false'        // Grain
            ];
            rows.push(row);
        }
    });

    // Convert to CSV string
    const csvContent = rows
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

    return csvContent;
}

/**
 * Triggers browser download of CSV file
 * 
 * @param csvContent The CSV string content
 * @param filename Desired filename (without extension)
 */
export function downloadCSV(csvContent: string, filename: string = 'cutlist'): void {
    // Create blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
}

/**
 * Main export function - generates and downloads cutlist CSV
 * 
 * @param pieces Cutlist pieces
 * @param materials Available materials
 * @param projectName Project name for filename
 */
export function exportCutlistToCSV(
    pieces: CutlistPiece[],
    materials: Material[],
    projectName: string = 'Proyecto'
): void {
    // Generate CSV content
    const csvContent = generateCutlistCSV(pieces, materials, projectName);

    // Create safe filename
    const safeProjectName = projectName
        .replace(/[^a-z0-9]+/gi, '_')
        .toLowerCase();

    const filename = `${safeProjectName}_corte`;

    // Trigger download
    downloadCSV(csvContent, filename);

    console.log(`✅ CSV exported: ${filename}.csv (${pieces.length} pieces)`);
}

/**
 * Preview CSV content (for debugging)
 */
export function previewCSV(
    pieces: CutlistPiece[],
    materials: Material[]
): string {
    return generateCutlistCSV(pieces, materials);
}
