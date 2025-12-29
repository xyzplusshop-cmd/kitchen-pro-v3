/**
 * CNC Machining Engine
 * 
 * Calculates precise X/Y/Z coordinates for drilling, pocketing, and routing operations
 * based on piece geometry, hardware, and connection types.
 * 
 * This is the mathematical brain that tells the CNC where to drill each hole
 * with sub-millimeter precision.
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export type OperationType =
    | 'DRILL'           // Standard drill hole (through or blind)
    | 'POCKET'          // Excavated area (e.g., cam lock cavity)
    | 'GROOVE'          // Linear channel
    | 'PILOT_HOLE'      // Small guide hole for screws
    | 'ROUTE';          // Edge routing/profiling

export type MachineFace =
    | 'FRONT'           // Face A (visible side)
    | 'BACK'            // Face B (hidden side)
    | 'EDGE_L1'         // Long edge 1 (height)
    | 'EDGE_L2'         // Long edge 2 (height)
    | 'EDGE_A1'         // Short edge 1 (width)
    | 'EDGE_A2';        // Short edge 2 (width)

export interface MachiningOperation {
    id: string;                 // Unique operation ID
    type: OperationType;
    x: number;                  // X coordinate from origin (bottom-left corner)
    y: number;                  // Y coordinate from origin
    z_depth: number;            // Drilling depth in mm
    diameter: number;           // Hole/tool diameter in mm
    face: MachineFace;          // Which face to machine
    description?: string;       // Human-readable description
    toolId?: string;            // CNC tool identifier
    isCountersunk?: boolean;    // Countersink for screw heads
    isThrough?: boolean;        // Through-hole (full thickness)
}

export interface PieceMachining {
    pieceId: string;
    pieceName: string;
    operations: MachiningOperation[];
    totalOperations: number;
    estimatedMachiningTime?: number; // In seconds
}

// ============================================
// INDUSTRIAL STANDARDS & CONSTANTS
// ============================================

const STANDARDS = {
    // Minifix/Cam Lock System (IKEA-style)
    MINIFIX: {
        CAM_DIAMETER: 15,           // Cam lock cavity diameter
        CAM_DEPTH: 12.5,            // Cam depth
        CAM_OFFSET: 34,             // Distance from edge (Häfele standard)
        BOLT_DIAMETER: 8,           // Dowel/bolt hole diameter
        BOLT_DEPTH: 50,             // Bolt hole depth
        INSERT_DIAMETER: 5,         // Insert screw hole
        INSERT_DEPTH: 10,           // Insert depth
    },

    // Hinge System (European concealed hinges)
    HINGE: {
        CUP_DIAMETER: 35,           // Hinge cup diameter (standard)
        CUP_DEPTH: 13,              // Cup drilling depth
        CENTER_OFFSET: 22.5,        // Distance from door edge to cup center
        SCREW_DIAMETER: 2,          // Pilot hole for mounting screws
        SCREW_DEPTH: 10,
        SCREW_SPACING: 48,          // Distance between mounting screws

        // Hinge positioning rules (heights from bottom)
        POSITIONS: {
            TWO_HINGES: [100, -100],              // Small doors (≤1200mm)
            THREE_HINGES: [100, 'CENTER', -100],  // Medium doors (≤1800mm)
            FOUR_HINGES: [100, 600, -600, -100],  // Tall doors (≤2100mm)
            FIVE_HINGES: [100, 500, 'CENTER', -500, -100] // Extra-tall (>2100mm)
        }
    },

    // System 32 (European modular system)
    SYSTEM32: {
        HOLE_DIAMETER: 5,           // Standard shelf/slide hole
        HOLE_DEPTH: 10,
        GRID_SPACING: 32,           // Vertical spacing between holes
        FIRST_HOLE_OFFSET: 37,      // Distance from front edge
        EDGE_CLEARANCE: 50,         // Min distance from top/bottom edge
    },

    // Drawer Slides
    SLIDE: {
        HOLE_DIAMETER: 5,
        SCREW_DIAMETER: 4,
        FRONT_OFFSET: 37,           // First hole from front
        REAR_OFFSET: 32,            // Last hole from back
    },

    // General
    EDGE_SAFETY_MARGIN: 15,         // Min distance from any edge
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generates unique operation ID
 */
let operationCounter = 0;
function generateOperationId(prefix: string = 'OP'): string {
    return `${prefix}-${Date.now()}-${++operationCounter}`;
}

/**
 * Calculates hinge positions based on door height
 */
function calculateHingePositions(doorHeight: number): number[] {
    if (doorHeight <= 1200) {
        return [100, doorHeight - 100]; // 2 hinges
    } else if (doorHeight <= 1800) {
        return [100, doorHeight / 2, doorHeight - 100]; // 3 hinges
    } else if (doorHeight <= 2100) {
        return [100, 600, doorHeight - 600, doorHeight - 100]; // 4 hinges
    } else {
        return [100, 500, doorHeight / 2, doorHeight - 500, doorHeight - 100]; // 5 hinges
    }
}

// ============================================
// MACHINING LOGIC - MINIFIX SYSTEM
// ============================================

/**
 * Generate Minifix operations for horizontal piece (shelf/top)
 * Creates cam cavity on face and dowel hole on edge
 */
export function getMinifixHorizontalOperations(
    pieceWidth: number,
    pieceHeight: number,
    pieceThickness: number,
    connectionSide: 'LEFT' | 'RIGHT',
    yPosition: number // Height where connection occurs
): MachiningOperation[] {
    const ops: MachiningOperation[] = [];
    const offset = STANDARDS.MINIFIX.CAM_OFFSET;

    // Cam lock cavity (on top face)
    ops.push({
        id: generateOperationId('CAM'),
        type: 'POCKET',
        x: connectionSide === 'LEFT' ? offset : pieceWidth - offset,
        y: yPosition,
        z_depth: STANDARDS.MINIFIX.CAM_DEPTH,
        diameter: STANDARDS.MINIFIX.CAM_DIAMETER,
        face: 'FRONT',
        description: `Minifix Cam Cavity (${connectionSide})`,
        toolId: 'FORSTNER_15MM'
    });

    // Dowel/bolt hole (on edge)
    ops.push({
        id: generateOperationId('BOLT'),
        type: 'DRILL',
        x: yPosition,
        y: pieceThickness / 2,
        z_depth: STANDARDS.MINIFIX.BOLT_DEPTH,
        diameter: STANDARDS.MINIFIX.BOLT_DIAMETER,
        face: connectionSide === 'LEFT' ? 'EDGE_A1' : 'EDGE_A2',
        description: `Minifix Bolt Hole (${connectionSide})`,
        toolId: 'DRILL_8MM'
    });

    return ops;
}

/**
 * Generate Minifix operations for vertical piece (side panel)
 * Creates insert hole for the connecting bolt
 */
export function getMinifixVerticalOperations(
    pieceWidth: number,
    pieceHeight: number,
    shelfHeight: number, // Y position where shelf connects
    connectionDepth: number // How deep into the panel
): MachiningOperation[] {
    const ops: MachiningOperation[] = [];

    ops.push({
        id: generateOperationId('INSERT'),
        type: 'DRILL',
        x: connectionDepth,
        y: shelfHeight,
        z_depth: STANDARDS.MINIFIX.INSERT_DEPTH,
        diameter: STANDARDS.MINIFIX.INSERT_DIAMETER,
        face: 'FRONT',
        description: `Minifix Insert @ Y=${shelfHeight}mm`,
        toolId: 'DRILL_5MM'
    });

    return ops;
}

// ============================================
// MACHINING LOGIC - HINGE SYSTEM
// ============================================

/**
 * Generate hinge cup operations for door
 */
export function getHingeOperations(
    doorWidth: number,
    doorHeight: number,
    doorThickness: number,
    hingeSide: 'LEFT' | 'RIGHT' = 'LEFT',
    includePilotHoles: boolean = true
): MachiningOperation[] {
    const ops: MachiningOperation[] = [];
    const positions = calculateHingePositions(doorHeight);
    const xOffset = STANDARDS.HINGE.CENTER_OFFSET;

    positions.forEach((yPos, index) => {
        // Hinge cup (35mm)
        ops.push({
            id: generateOperationId('HINGE'),
            type: 'DRILL',
            x: hingeSide === 'LEFT' ? xOffset : doorWidth - xOffset,
            y: yPos,
            z_depth: STANDARDS.HINGE.CUP_DEPTH,
            diameter: STANDARDS.HINGE.CUP_DIAMETER,
            face: 'BACK', // Hinges always on back face
            description: `Hinge Cup #${index + 1}`,
            toolId: 'FORSTNER_35MM'
        });

        // Pilot holes for mounting screws (optional)
        if (includePilotHoles) {
            const screwY1 = yPos - (STANDARDS.HINGE.SCREW_SPACING / 2);
            const screwY2 = yPos + (STANDARDS.HINGE.SCREW_SPACING / 2);

            [screwY1, screwY2].forEach((screwY, screwIndex) => {
                ops.push({
                    id: generateOperationId('PILOT'),
                    type: 'PILOT_HOLE',
                    x: hingeSide === 'LEFT' ? xOffset : doorWidth - xOffset,
                    y: screwY,
                    z_depth: STANDARDS.HINGE.SCREW_DEPTH,
                    diameter: STANDARDS.HINGE.SCREW_DIAMETER,
                    face: 'BACK',
                    description: `Hinge Screw Pilot #${index + 1}.${screwIndex + 1}`,
                    toolId: 'DRILL_2MM'
                });
            });
        }
    });

    return ops;
}

// ============================================
// MACHINING LOGIC - SYSTEM 32
// ============================================

/**
 * Generate System 32 hole pattern for adjustable shelves or drawer slides
 */
export function getSystem32Operations(
    panelWidth: number,
    panelHeight: number,
    xOffset: number = STANDARDS.SYSTEM32.FIRST_HOLE_OFFSET,
    startY: number = STANDARDS.SYSTEM32.EDGE_CLEARANCE,
    endY?: number
): MachiningOperation[] {
    const ops: MachiningOperation[] = [];
    const spacing = STANDARDS.SYSTEM32.GRID_SPACING;
    const finalY = endY || (panelHeight - STANDARDS.SYSTEM32.EDGE_CLEARANCE);

    let currentY = startY;
    let holeIndex = 0;

    while (currentY <= finalY) {
        ops.push({
            id: generateOperationId('SYS32'),
            type: 'DRILL',
            x: xOffset,
            y: currentY,
            z_depth: STANDARDS.SYSTEM32.HOLE_DEPTH,
            diameter: STANDARDS.SYSTEM32.HOLE_DIAMETER,
            face: 'FRONT',
            description: `System 32 Hole #${++holeIndex}`,
            toolId: 'DRILL_5MM'
        });

        currentY += spacing;
    }

    return ops;
}

/**
 * Generate drawer slide mounting holes
 */
export function getDrawerSlideOperations(
    panelHeight: number,
    drawerCenterY: number, // Y position of drawer center
    slideLength: number = 500
): MachiningOperation[] {
    const ops: MachiningOperation[] = [];
    const frontOffset = STANDARDS.SLIDE.FRONT_OFFSET;

    // Front mounting hole
    ops.push({
        id: generateOperationId('SLIDE_F'),
        type: 'DRILL',
        x: frontOffset,
        y: drawerCenterY,
        z_depth: 10,
        diameter: STANDARDS.SLIDE.HOLE_DIAMETER,
        face: 'FRONT',
        description: `Slide Front Mount`,
        toolId: 'DRILL_5MM'
    });

    // Rear mounting hole
    ops.push({
        id: generateOperationId('SLIDE_R'),
        type: 'DRILL',
        x: frontOffset + slideLength - STANDARDS.SLIDE.REAR_OFFSET,
        y: drawerCenterY,
        z_depth: 10,
        diameter: STANDARDS.SLIDE.HOLE_DIAMETER,
        face: 'FRONT',
        description: `Slide Rear Mount`,
        toolId: 'DRILL_5MM'
    });

    return ops;
}

// ============================================
// MASTER FUNCTION - PIECE PROCESSING
// ============================================

/**
 * Main function: Calculate all machining operations for a piece
 * 
 * This is the "brain" that analyzes a piece and determines what the CNC must do
 */
export function calculatePieceMachining(
    piece: {
        id: string;
        name: string;
        type: 'SIDE' | 'SHELF' | 'TOP' | 'BOTTOM' | 'DOOR' | 'DRAWER_FRONT' | 'BACK';
        width: number;
        height: number;
        thickness: number;
        connectionType?: 'MINIFIX' | 'SCREW' | 'DOWEL';
        hardware?: {
            hinges?: { count: number; side?: 'LEFT' | 'RIGHT' };
            slides?: { count: number; yPositions?: number[] };
        };
        connections?: {
            shelves?: { yPositions: number[] };
            sides?: { left?: boolean; right?: boolean };
        };
    }
): PieceMachining {
    const operations: MachiningOperation[] = [];

    // ===== DOOR: Hinge Operations =====
    if (piece.type === 'DOOR' && piece.hardware?.hinges) {
        const hingeOps = getHingeOperations(
            piece.width,
            piece.height,
            piece.thickness,
            piece.hardware.hinges.side || 'LEFT',
            true // Include pilot holes
        );
        operations.push(...hingeOps);
    }

    // ===== SIDE PANEL: Minifix Inserts for Shelves =====
    if (piece.type === 'SIDE' && piece.connections?.shelves) {
        piece.connections.shelves.yPositions.forEach((shelfY) => {
            const inserts = getMinifixVerticalOperations(
                piece.width,
                piece.height,
                shelfY,
                34 // Standard depth
            );
            operations.push(...inserts);
        });

        // System 32 holes for adjustability
        const sys32 = getSystem32Operations(piece.width, piece.height);
        operations.push(...sys32);
    }

    // ===== SHELF/TOP: Minifix Cam Locks =====
    if ((piece.type === 'SHELF' || piece.type === 'TOP') && piece.connectionType === 'MINIFIX') {
        if (piece.connections?.sides?.left) {
            const leftOps = getMinifixHorizontalOperations(
                piece.width,
                piece.height,
                piece.thickness,
                'LEFT',
                piece.height / 2 // Assuming centered connection
            );
            operations.push(...leftOps);
        }

        if (piece.connections?.sides?.right) {
            const rightOps = getMinifixHorizontalOperations(
                piece.width,
                piece.height,
                piece.thickness,
                'RIGHT',
                piece.height / 2
            );
            operations.push(...rightOps);
        }
    }

    // ===== DRAWER SLIDES =====
    if (piece.hardware?.slides && piece.hardware.slides.yPositions) {
        piece.hardware.slides.yPositions.forEach((drawerY) => {
            const slideOps = getDrawerSlideOperations(piece.height, drawerY);
            operations.push(...slideOps);
        });
    }

    return {
        pieceId: piece.id,
        pieceName: piece.name,
        operations,
        totalOperations: operations.length,
        estimatedMachiningTime: operations.length * 3 // Rough estimate: 3 sec/operation
    };
}

// ============================================
// EXPORT UTILITIES
// ============================================

/**
 * Export machining data as structured JSON for external processing
 */
export function exportMachiningJSON(pieceMachining: PieceMachining): string {
    return JSON.stringify(pieceMachining, null, 2);
}

/**
 * Validate that coordinates are within piece boundaries
 */
export function validateOperations(
    operations: MachiningOperation[],
    pieceWidth: number,
    pieceHeight: number
): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    operations.forEach(op => {
        if (op.face === 'FRONT' || op.face === 'BACK') {
            if (op.x < 0 || op.x > pieceWidth) {
                errors.push(`${op.id}: X coordinate ${op.x} out of bounds (0-${pieceWidth})`);
            }
            if (op.y < 0 || op.y > pieceHeight) {
                errors.push(`${op.id}: Y coordinate ${op.y} out of bounds (0-${pieceHeight})`);
            }
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
}
