/**
 * DXF Generation Test - Tower Door Validation
 * 
 * Generates a DXF file for a TOWER door piece to validate the export functionality
 */

import { calculatePieceMachining } from './machiningEngine';
import { generatePieceDXF } from './dxfGenerator';

// Simulate a TOWER door piece from "Cocina Completa Premium"
const towerDoorPiece = {
    id: 'TOWER-DOOR-001',
    name: 'Puerta Torre Izquierda',
    type: 'DOOR' as const,
    width: 596,      // Cut width (final 600mm - 4mm edges)
    height: 2096,    // Cut height (final 2100mm - 4mm edges)
    thickness: 18,
    hardware: {
        hinges: {
            count: 4,  // 4 hinges for 2100mm tall door
            side: 'LEFT' as const
        }
    }
};

console.log('🔧 Generating machining operations for TOWER door...\n');

// Calculate machining operations
const machining = calculatePieceMachining(towerDoorPiece);

console.log(`✅ Generated ${machining.totalOperations} operations:\n`);
machining.operations.forEach((op, index) => {
    console.log(`${index + 1}. ${op.description}`);
    console.log(`   Type: ${op.type} | Diameter: ${op.diameter}mm | Depth: ${op.z_depth}mm`);
    console.log(`   Position: X=${op.x}mm, Y=${op.y}mm | Face: ${op.face} | Layer: ${op.toolId}\n`);
});

console.log('\n📐 Generating DXF file...\n');

// Generate DXF content
const dxfContent = generatePieceDXF({
    pieceId: towerDoorPiece.id,
    pieceName: towerDoorPiece.name,
    width: towerDoorPiece.width,
    height: towerDoorPiece.height,
    thickness: towerDoorPiece.thickness,
    material: 'Melamina Blanco Frost 18mm',
    operations: machining.operations
});

console.log('═══════════════════════════════════════════════════════════');
console.log('DXF RAW CONTENT (for validation):');
console.log('═══════════════════════════════════════════════════════════\n');

console.log(dxfContent);

console.log('\n═══════════════════════════════════════════════════════════');
console.log('✅ DXF generation complete!');
console.log('═══════════════════════════════════════════════════════════\n');

// Validation summary
console.log('🔍 VALIDATION CHECKLIST:\n');
console.log('[ ] 1. LAYERS: Check for DRILL_35MM layer');
console.log('[ ] 2. CIRCLES: Should show 4 circles (hinge cups)');
console.log('[ ] 3. COORDINATES: Hinge positions at Y=[100, ~700, ~1400, 1996]mm');
console.log('[ ] 4. OUTLINE: Rectangle 596 × 2096 mm');
console.log('[ ] 5. PILOT HOLES: 8 small holes (2mm diameter) around hinges');
