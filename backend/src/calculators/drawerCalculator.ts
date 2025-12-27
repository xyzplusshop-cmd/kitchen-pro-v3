/**
 * Drawer Calculator
 * Handles calculation logic for both Metal (Tandembox) and Melamina drawer systems
 */

interface DrawerConfig {
    moduleWidth: number;
    moduleDepth: number;
    moduleHeight: number;
    drawerCount: number;
    drawerSystem: {
        isMetal: boolean;
        slideClearance: number;
        bottomConstruction: string; // 'RANURADO' or 'CLAVADO'
        backendClearance: number;
    };
    materialThickness: number;
}

interface DrawerPiece {
    name: string;
    finalWidth: number;
    finalHeight: number;
    edges: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
    quantity: number;
    category: string;
}

export function calculateDrawerPieces(config: DrawerConfig): DrawerPiece[] {
    const pieces: DrawerPiece[] = [];
    const {
        moduleWidth,
        moduleDepth,
        moduleHeight,
        drawerCount,
        drawerSystem,
        materialThickness
    } = config;

    // Calculate drawer internal dimensions
    const drawerWidth = moduleWidth - (2 * drawerSystem.slideClearance);
    const drawerDepth = moduleDepth - drawerSystem.backendClearance;
    const drawerHeight = moduleHeight / drawerCount;

    if (drawerSystem.isMetal) {
        // METAL DRAWER (Tandembox) - Only 2 pieces

        // 1. Bottom piece
        pieces.push({
            name: 'Piso Cajón (Metal System)',
            finalWidth: Math.round(drawerWidth * 10) / 10,
            finalHeight: Math.round(drawerDepth * 10) / 10,
            edges: { top: 0, bottom: 0, left: 0, right: 0 }, // No edges on bottom
            quantity: drawerCount,
            category: 'DRAWER_METAL'
        });

        // 2. Back piece (trasera)
        pieces.push({
            name: 'Trasera Cajón (Metal System)',
            finalWidth: Math.round(drawerWidth * 10) / 10,
            finalHeight: Math.round((drawerHeight * 0.6) * 10) / 10, // Typically 60% of drawer height
            edges: { top: materialThickness, bottom: 0, left: materialThickness, right: materialThickness },
            quantity: drawerCount,
            category: 'DRAWER_METAL'
        });

    } else {
        // MELAMINA DRAWER - 6 pieces

        const internalHeight = drawerHeight - materialThickness; // Account for bottom thickness

        // 1. Lateral Izquierdo
        pieces.push({
            name: 'Lateral Izquierdo Cajón',
            finalWidth: Math.round(drawerDepth * 10) / 10,
            finalHeight: Math.round(internalHeight * 10) / 10,
            edges: { top: materialThickness, bottom: 0, left: 0, right: materialThickness },
            quantity: drawerCount,
            category: 'DRAWER_MELAMINA'
        });

        // 2. Lateral Derecho
        pieces.push({
            name: 'Lateral Derecho Cajón',
            finalWidth: Math.round(drawerDepth * 10) / 10,
            finalHeight: Math.round(internalHeight * 10) / 10,
            edges: { top: materialThickness, bottom: 0, left: 0, right: materialThickness },
            quantity: drawerCount,
            category: 'DRAWER_MELAMINA'
        });

        // 3. Front internal piece (Frente Interno)
        pieces.push({
            name: 'Frente Interno Cajón',
            finalWidth: Math.round((drawerWidth - (2 * materialThickness)) * 10) / 10,
            finalHeight: Math.round(internalHeight * 10) / 10,
            edges: { top: materialThickness, bottom: 0, left: 0, right: 0 },
            quantity: drawerCount,
            category: 'DRAWER_MELAMINA'
        });

        // 4. Back internal piece (Trasera Interna)
        pieces.push({
            name: 'Trasera Interna Cajón',
            finalWidth: Math.round((drawerWidth - (2 * materialThickness)) * 10) / 10,
            finalHeight: Math.round((internalHeight * 0.7) * 10) / 10, // Typically 70% of drawer height
            edges: { top: materialThickness, bottom: 0, left: 0, right: 0 },
            quantity: drawerCount,
            category: 'DRAWER_MELAMINA'
        });

        // 5. Bottom piece (Fondo)
        const bottomWidth = drawerWidth - (2 * materialThickness);
        const bottomDepth = drawerDepth - (2 * materialThickness);

        if (drawerSystem.bottomConstruction === 'RANURADO') {
            // Grooved bottom - slightly smaller to fit in grooves
            pieces.push({
                name: 'Fondo Cajón (Ranurado)',
                finalWidth: Math.round((bottomWidth - 4) * 10) / 10, // -4mm for groove
                finalHeight: Math.round((bottomDepth - 4) * 10) / 10,
                edges: { top: 0, bottom: 0, left: 0, right: 0 },
                quantity: drawerCount,
                category: 'DRAWER_MELAMINA'
            });
        } else {
            // Nailed bottom - full size
            pieces.push({
                name: 'Fondo Cajón (Clavado)',
                finalWidth: Math.round(bottomWidth * 10) / 10,
                finalHeight: Math.round(bottomDepth * 10) / 10,
                edges: { top: 0, bottom: 0, left: 0, right: 0 },
                quantity: drawerCount,
                category: 'DRAWER_MELAMINA'
            });
        }

        // 6. External drawer front (Frente Vista)
        // This is calculated separately as it's the visible front face
        pieces.push({
            name: 'Frente Vista Cajón',
            finalWidth: Math.round(moduleWidth * 10) / 10, // Full module width
            finalHeight: Math.round(drawerHeight * 10) / 10,
            edges: { top: materialThickness, bottom: materialThickness, left: materialThickness, right: materialThickness },
            quantity: drawerCount,
            category: 'DRAWER_MELAMINA'
        });
    }

    return pieces;
}

export function getDrawerSystemType(isMetal: boolean): string {
    return isMetal ? 'METAL (Tandembox)' : 'MELAMINA (Tradicional)';
}
