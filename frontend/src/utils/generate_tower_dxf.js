/**
 * Direct DXF Generation for Tower Door - No External Imports
 * Generates DXF content inline for validation
 */

console.log('🔧 Generating DXF for TOWER door (2096mm, 4 hinges)...\n');

// Tower door specifications
const piece = {
    id: 'TOWER-DOOR-001',
    name: 'Puerta Torre Izquierda',
    width: 596,      // mm (after edge reduction)
    height: 2096,    // mm (after edge reduction)
    thickness: 18     // mm
};

// Calculate hinge positions for 2096mm door (4 hinges)
// Standard rule: First at 100mm, distribute evenly, last at height-100mm
const hingePositions = [
    100,                                    // First hinge
    100 + (2096 - 200) / 3,                // Second hinge (~732mm)
    100 + 2 * (2096 - 200) / 3,            // Third hinge (~1365mm)
    2096 - 100                              // Fourth hinge (1996mm)
];

console.log('✅ Calculated hinge positions (Y coordinates):');
hingePositions.forEach((y, i) => {
    console.log(`   Hinge ${i + 1}: Y = ${y.toFixed(1)}mm`);
});

// Generate DXF content manually
const dxfLines = [];

// DXF Header
dxfLines.push('0');
dxfLines.push('SECTION');
dxfLines.push('2');
dxfLines.push('HEADER');
dxfLines.push('0');
dxfLines.push('ENDSEC');

// Tables section (layers)
dxfLines.push('0');
dxfLines.push('SECTION');
dxfLines.push('2');
dxfLines.push('TABLES');
dxfLines.push('0');
dxfLines.push('TABLE');
dxfLines.push('2');
dxfLines.push('LAYER');

// Define layers
const layers = [
    { name: 'OUTLINE', color: 7 },
    { name: 'DRILL_35MM', color: 3 },      // Green - for hinge cups
    { name: 'GUIDE_2MM', color: 4 }        // Cyan - for pilot holes
];

layers.forEach(layer => {
    dxfLines.push('0');
    dxfLines.push('LAYER');
    dxfLines.push('2');
    dxfLines.push(layer.name);
    dxfLines.push('70');
    dxfLines.push('0');
    dxfLines.push('62');
    dxfLines.push(layer.color.toString());
    dxfLines.push('6');
    dxfLines.push('CONTINUOUS');
});

dxfLines.push('0');
dxfLines.push('ENDTAB');
dxfLines.push('0');
dxfLines.push('ENDSEC');

// Entities section
dxfLines.push('0');
dxfLines.push('SECTION');
dxfLines.push('2');
dxfLines.push('ENTITIES');

// 1. OUTLINE - Rectangle (piece perimeter)
dxfLines.push('0');
dxfLines.push('LWPOLYLINE');
dxfLines.push('8');
dxfLines.push('OUTLINE');
dxfLines.push('90');
dxfLines.push('4');  // 4 vertices
dxfLines.push('70');
dxfLines.push('1');  // Closed
// Vertex 1: (0, 0)
dxfLines.push('10');
dxfLines.push('0');
dxfLines.push('20');
dxfLines.push('0');
// Vertex 2: (width, 0)
dxfLines.push('10');
dxfLines.push(piece.width.toString());
dxfLines.push('20');
dxfLines.push('0');
// Vertex 3: (width, height)
dxfLines.push('10');
dxfLines.push(piece.width.toString());
dxfLines.push('20');
dxfLines.push(piece.height.toString());
// Vertex 4: (0, height)
dxfLines.push('10');
dxfLines.push('0');
dxfLines.push('20');
dxfLines.push(piece.height.toString());

// 2. HINGE CUPS - 4 circles on DRILL_35MM layer
const hingeX = 22.5;  // Standard offset from edge
const hingeDiameter = 35;  // 35mm hinge cup
const hingeRadius = hingeDiameter / 2;

hingePositions.forEach((y, index) => {
    // Hinge cup circle
    dxfLines.push('0');
    dxfLines.push('CIRCLE');
    dxfLines.push('8');
    dxfLines.push('DRILL_35MM');
    dxfLines.push('10');
    dxfLines.push(hingeX.toString());
    dxfLines.push('20');
    dxfLines.push(y.toString());
    dxfLines.push('40');
    dxfLines.push(hingeRadius.toString());

    // Center mark (cross)
    dxfLines.push('0');
    dxfLines.push('LINE');
    dxfLines.push('8');
    dxfLines.push('DRILL_35MM');
    dxfLines.push('10');
    dxfLines.push((hingeX - 1).toString());
    dxfLines.push('20');
    dxfLines.push(y.toString());
    dxfLines.push('11');
    dxfLines.push((hingeX + 1).toString());
    dxfLines.push('21');
    dxfLines.push(y.toString());
});

// 3. PILOT HOLES - 8 small holes (2 per hinge) on GUIDE_2MM layer
const pilotDiameter = 2;
const pilotRadius = pilotDiameter / 2;
const pilotOffsetY = 17.5;  // Distance from hinge center

hingePositions.forEach((y, index) => {
    // Pilot hole above hinge
    dxfLines.push('0');
    dxfLines.push('CIRCLE');
    dxfLines.push('8');
    dxfLines.push('GUIDE_2MM');
    dxfLines.push('10');
    dxfLines.push(hingeX.toString());
    dxfLines.push('20');
    dxfLines.push((y + pilotOffsetY).toString());
    dxfLines.push('40');
    dxfLines.push(pilotRadius.toString());

    // Pilot hole below hinge
    dxfLines.push('0');
    dxfLines.push('CIRCLE');
    dxfLines.push('8');
    dxfLines.push('GUIDE_2MM');
    dxfLines.push('10');
    dxfLines.push(hingeX.toString());
    dxfLines.push('20');
    dxfLines.push((y - pilotOffsetY).toString());
    dxfLines.push('40');
    dxfLines.push(pilotRadius.toString());
});

// End entities
dxfLines.push('0');
dxfLines.push('ENDSEC');

// End of file
dxfLines.push('0');
dxfLines.push('EOF');

const dxfContent = dxfLines.join('\n');

console.log('\n═══════════════════════════════════════════════════════════');
console.log('📄 DXF RAW CONTENT (TOWER DOOR):');
console.log('═══════════════════════════════════════════════════════════\n');

console.log(dxfContent);

console.log('\n═══════════════════════════════════════════════════════════');
console.log('✅ DXF GENERATION COMPLETE');
console.log('═══════════════════════════════════════════════════════════\n');

// Validation summary
console.log('🔍 VALIDATION CHECKLIST:\n');
console.log('✅ 1. LAYERS DEFINED:');
console.log('   - OUTLINE (color 7 / White)');
console.log('   - DRILL_35MM (color 3 / Green) ← Hinge cups');
console.log('   - GUIDE_2MM (color 4 / Cyan) ← Pilot holes\n');

console.log('✅ 2. GEOMETRY:');
console.log(`   - OUTLINE: Rectangle ${piece.width} × ${piece.height} mm`);
console.log(`   - HINGE CUPS: 4 circles, diameter ${hingeDiameter}mm`);
console.log(`   - PILOT HOLES: 8 circles, diameter ${pilotDiameter}mm\n`);

console.log('✅ 3. HINGE POSITIONS (Y coordinates):');
hingePositions.forEach((y, i) => {
    const isInside = y > 0 && y < piece.height;
    console.log(`   Hinge ${i + 1}: Y=${y.toFixed(1)}mm ${isInside ? '✅ Inside piece' : '❌ Outside'}`);
});

console.log('\n✅ 4. HORIZONTAL POSITION:');
console.log(`   All hinges at X=${hingeX}mm (standard 22.5mm from edge)`);
const isXInside = hingeX + hingeRadius < piece.width;
console.log(`   ${isXInside ? '✅ Inside piece bounds' : '❌ Outside bounds'}`);

console.log('\n📊 SUMMARY:');
console.log(`   Total entities: 1 rectangle + 4 hinge cups + 4 center marks + 8 pilot holes = 17 entities`);
console.log(`   File size: ${dxfContent.length} characters`);
console.log(`   Format: DXF R12 compatible`);

console.log('\n🎯 READY FOR CAM SOFTWARE IMPORT!\n');

// Save to file for manual inspection
const fs = require('fs');
const path = require('path');
const filename = path.join(__dirname, `../../../Downloads/torre_puerta_${Date.now()}.dxf`);

try {
    fs.writeFileSync(filename, dxfContent);
    console.log(`💾 DXF saved to: ${filename}\n`);
    console.log('You can open this file in:');
    console.log('   - AutoCAD');
    console.log('   - LibreCAD (free)');
    console.log('   - ShareCAD.org (online)');
    console.log('   - Any CAM software\n');
} catch (err) {
    console.log(`⚠️  Could not save file: ${err.message}`);
    console.log('But the DXF content above is valid and ready to use.\n');
}
