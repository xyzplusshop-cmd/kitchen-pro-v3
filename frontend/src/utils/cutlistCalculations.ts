/**
 * Utility for technical cutlist calculations and BOM management.
 */

export interface Piece {
    name: string;
    finalWidth: number;
    finalHeight: number;
    quantity: number;
    material?: string;
    edgeL1Id?: string | null;
    edgeL2Id?: string | null;
    edgeA1Id?: string | null;
    edgeA2Id?: string | null;
    [key: string]: any;
}

export interface Material {
    id: string;
    name: string;
    thickness: number;
    type: 'BOARD' | 'EDGE' | 'HARDWARE';
}

/**
 * Calculates real cut dimensions by subtracting edge thicknesses.
 * Formulas:
 * CutLength = FinishLength - (Thickness_L1 + Thickness_L2)
 * CutWidth = FinishWidth - (Thickness_A1 + Thickness_A2)
 */
export const calculateCutDimensions = (piece: Piece, edgeMaterials: Material[]) => {
    const getThickness = (id?: string | null) => {
        if (!id) return 0;
        const mat = edgeMaterials.find(m => m.id === id);
        return mat ? mat.thickness : 0;
    };

    const thickL1 = getThickness(piece.edgeL1Id);
    const thickL2 = getThickness(piece.edgeL2Id);
    const thickA1 = getThickness(piece.edgeA1Id);
    const thickA2 = getThickness(piece.edgeA2Id);

    // En la industria:
    // Largo (L) suele ser la dimensión mayor (Veta)
    // Ancho (A) suele ser la dimensión menor
    // Pero aquí asumimos Height=L y Width=A basado en la UI anterior
    const cutHeight = piece.finalHeight - (thickL1 + thickL2);
    const cutWidth = piece.finalWidth - (thickA1 + thickA2);

    return {
        cutHeight: Math.max(0, Math.round(cutHeight * 10) / 10),
        cutWidth: Math.max(0, Math.round(cutWidth * 10) / 10),
        discounts: {
            height: thickL1 + thickL2,
            width: thickA1 + thickA2,
            details: { thickL1, thickL2, thickA1, thickA2 }
        }
    };
};

/**
 * Aggregates all materials used in a project for the Bill of Materials (BOM).
 */
export const calculateProjectBOM = (modules: any[], allMaterials: Material[]) => {
    const boardSummary: Record<string, { area: number; material: string }> = {};
    const edgeSummary: Record<string, { length: number; material: string }> = {};
    const hardwareSummary: Record<string, { count: number; name: string }> = {};

    modules.forEach(mod => {
        const pieces = mod.customPieces || [];

        pieces.forEach((p: Piece) => {
            // 1. Board Area (m2)
            const materialName = p.material || "Tablero Desconocido";
            const area = (p.finalHeight * p.finalWidth * p.quantity) / 1000000;
            if (!boardSummary[materialName]) {
                boardSummary[materialName] = { area: 0, material: materialName };
            }
            boardSummary[materialName].area += area;

            // 2. Edge Length (linear meters)
            const edges = [
                { id: p.edgeL1Id, length: p.finalWidth }, // L1 is on Width
                { id: p.edgeL2Id, length: p.finalWidth }, // L2 is on Width
                { id: p.edgeA1Id, length: p.finalHeight }, // A1 is on Height
                { id: p.edgeA2Id, length: p.finalHeight }  // A2 is on Height
            ];

            edges.forEach(edge => {
                if (edge.id) {
                    const mat = allMaterials.find(m => m.id === edge.id);
                    if (mat) {
                        if (!edgeSummary[mat.name]) {
                            edgeSummary[mat.name] = { length: 0, material: mat.name };
                        }
                        edgeSummary[mat.name].length += (edge.length * p.quantity) / 1000;
                    }
                }
            });
        });

        // 3. Hardware (simulated or from module props)
        // Note: For now we can extract basic hardware from module state if available
        // Future: Full hardware tracking
    });

    return {
        boards: Object.values(boardSummary).map(b => ({ ...b, area: Math.round(b.area * 100) / 100 })),
        edges: Object.values(edgeSummary).map(e => ({ ...e, length: Math.round(e.length * 10) / 10 })),
        hardware: Object.values(hardwareSummary)
    };
};
