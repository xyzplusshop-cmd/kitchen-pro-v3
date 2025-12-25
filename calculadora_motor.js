const fs = require('fs');

function calculateCutDimensions(piece) {
    const cutWidth = piece.finalWidth - (piece.edges.left + piece.edges.right);
    const cutHeight = piece.finalHeight - (piece.edges.top + piece.edges.bottom);

    return {
        cutWidth: Math.round(cutWidth * 10) / 10,
        cutHeight: Math.round(cutHeight * 10) / 10
    };
}

const grosorCuerpo = 18;
const holguraPuertaTotal = 3;

const despieceModulo600 = [
    {
        name: "Lateral Izquierdo",
        finalWidth: 580,
        finalHeight: 720,
        edges: { top: 0.4, bottom: 0, left: 0.4, right: 0 }
    },
    {
        name: "Lateral Derecho",
        finalWidth: 580,
        finalHeight: 720,
        edges: { top: 0.4, bottom: 0, left: 0, right: 0.4 }
    },
    {
        name: "Piso (Base)",
        finalWidth: 580,
        finalHeight: 600 - (grosorCuerpo * 2), // 564mm
        edges: { top: 0.4, bottom: 0, left: 0, right: 0 }
    },
    {
        name: "Puerta Izquierda",
        finalWidth: (600 - holguraPuertaTotal) / 2, // 298.5mm
        finalHeight: 720 - holguraPuertaTotal,    // 717mm
        edges: { top: 2, bottom: 2, left: 2, right: 2 }
    },
    {
        name: "Puerta Derecha",
        finalWidth: (600 - holguraPuertaTotal) / 2, // 298.5mm
        finalHeight: 720 - holguraPuertaTotal,    // 717mm
        edges: { top: 2, bottom: 2, left: 2, right: 2 }
    }
];

let output = "--------------------------------------------------\n";
output += "KITCHEN PRO - DESPIECE TÉCNICO: MÓDULO BAJO 600\n";
output += "--------------------------------------------------\n";

despieceModulo600.forEach(piece => {
    const cut = calculateCutDimensions(piece);
    output += `[PIEZA]: ${piece.name.padEnd(18)}\n`;
    output += `  Medida Final: ${piece.finalWidth.toFixed(1)} x ${piece.finalHeight.toFixed(1)} mm\n`;
    output += `  Cantos:       T:${piece.edges.top} B:${piece.edges.bottom} L:${piece.edges.left} R:${piece.edges.right}\n`;
    output += `  CORTE MADERA: ${cut.cutWidth.toFixed(1)} x ${cut.cutHeight.toFixed(1)} mm\n`;
    output += "--------------------------------------------------\n";
});

fs.writeFileSync('resultado_despiece.txt', output);
console.log(output);
