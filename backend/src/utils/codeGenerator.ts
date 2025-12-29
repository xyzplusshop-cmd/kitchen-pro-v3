/**
 * Utility for generating unique, human-readable codes for the Kitchen Pro system.
 */

// Dictionary of abbreviations for piece types
export const PIECE_TYPE_ABBR: Record<string, string> = {
    'Lateral Izquierdo': 'LAT',
    'Lateral Derecho': 'LAT',
    'Lateral': 'LAT',
    'Piso': 'PIS',
    'Techo': 'TEC',
    'Estante': 'EST',
    'Fondo': 'FON',
    'Amarre': 'AMA',
    'Puerta': 'PTR',
    'Frontal': 'FRN',
    'Zócalo': 'ZOC',
    'Encimera': 'ENC',
    'Costado': 'CST',
    'Tapa': 'TAP',
    'Base': 'BAS',
    'Cajón': 'CAJ',
    'Frente Cajón': 'FRC',
    'Lateral Cajón': 'LTC',
    'Trasera Cajón': 'TRC',
    'Fondo Cajón': 'FNC'
};

/**
 * Normalizes a piece name to an abbreviation.
 */
export const getPieceAbbr = (name: string): string => {
    // Try exact match first
    if (PIECE_TYPE_ABBR[name]) return PIECE_TYPE_ABBR[name];

    // Fallback: check if the name contains any of the keys
    for (const key in PIECE_TYPE_ABBR) {
        if (name.toLowerCase().includes(key.toLowerCase())) {
            return PIECE_TYPE_ABBR[key];
        }
    }

    // Default fallback
    return 'PZA';
};

/**
 * Generates a Module Code: MOD-{ZONE}-{SEQ}
 * Unique per project context.
 */
export const generateModuleCode = (zone: string, sequence: number): string => {
    const zoneCode = zone.substring(0, 3).toUpperCase();
    const seq = String(sequence).padStart(3, '0');
    return `MOD-${zoneCode}-${seq}`;
};

/**
 * Generates a Piece Code: PZA-{MOD_SKU}-{ABBR}-{SEQ}
 */
export const generatePieceCode = (modCode: string, name: string, sequence: number): string => {
    const abbr = getPieceAbbr(name);
    const seq = String(sequence).padStart(2, '0');
    // Using cleaned modCode (remove MOD- prefix for shorter piece codes)
    const cleanMod = modCode.replace('MOD-', '');
    return `PZA-${cleanMod}-${abbr}-${seq}`;
};

/**
 * Generates an Inventory Code: HRD-{CAT}-{SEQ} or SKU-HER-{ID}
 */
export const generateInventoryCode = (category: string, id: string): string => {
    const cat = category.substring(0, 3).toUpperCase();
    return `SKU-${cat}-${id.substring(0, 4).toUpperCase()}`;
};
