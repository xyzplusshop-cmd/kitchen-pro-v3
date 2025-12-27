/**
 * Hardware Calculator
 * Handles automatic assignment of legs and hinges based on module dimensions
 */

interface LegAssignmentConfig {
    moduleWidth: number;
    moduleZone: string;
}

interface HingeAssignmentConfig {
    doorHeight: number;
    doorCount: number;
}

interface LegAssignment {
    quantity: number;
    reason: string;
}

interface HingeAssignment {
    quantityPerDoor: number;
    totalQuantity: number;
    reason: string;
}

/**
 * Calculate number of legs needed for a module
 * Rules:
 * - BASE modules only (wall and tower modules don't use legs)
 * - Width > 800mm: 6 legs (3 pairs)
 * - Width <= 800mm: 4 legs (2 pairs)
 */
export function calculateLegs(config: LegAssignmentConfig): LegAssignment | null {
    const { moduleWidth, moduleZone } = config;

    // Only assign legs to BASE modules
    if (moduleZone !== 'BASE') {
        return null;
    }

    if (moduleWidth > 800) {
        return {
            quantity: 6,
            reason: 'Módulo ancho (>800mm) requiere 6 patas (3 pares) para estabilidad'
        };
    } else {
        return {
            quantity: 4,
            reason: 'Módulo estándar (≤800mm) requiere 4 patas (2 pares)'
        };
    }
}

/**
 * Calculate number of hinges needed per door
 * Rules based on door height:
 * - <= 500mm: 2 hinges
 * - 501-1200mm: 3 hinges
 * - > 1200mm: 4 hinges
 */
export function calculateHinges(config: HingeAssignmentConfig): HingeAssignment {
    const { doorHeight, doorCount } = config;

    let quantityPerDoor: number;
    let reason: string;

    if (doorHeight <= 500) {
        quantityPerDoor = 2;
        reason = 'Puerta baja (≤500mm)';
    } else if (doorHeight <= 1200) {
        quantityPerDoor = 3;
        reason = 'Puerta estándar (501-1200mm)';
    } else {
        quantityPerDoor = 4;
        reason = 'Puerta alta (>1200mm)';
    }

    return {
        quantityPerDoor,
        totalQuantity: quantityPerDoor * doorCount,
        reason
    };
}

/**
 * Generate a summary of hardware assignments for a module
 */
export function generateHardwareSummary(
    legAssignment: LegAssignment | null,
    hingeAssignment: HingeAssignment | null
): string[] {
    const summary: string[] = [];

    if (legAssignment) {
        summary.push(`${legAssignment.quantity} patas - ${legAssignment.reason}`);
    }

    if (hingeAssignment) {
        summary.push(
            `${hingeAssignment.totalQuantity} bisagras (${hingeAssignment.quantityPerDoor} por puerta) - ${hingeAssignment.reason}`
        );
    }

    return summary;
}
