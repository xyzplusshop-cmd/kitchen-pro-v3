/**
 * KITCHEN PRO - MOTOR MATEMÁTICO (V3.1)
 * Etapa 1: Validación del Script Cerebro
 */

interface Edges {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface Piece {
  name: string;
  finalWidth: number;
  finalHeight: number;
  edges: Edges;
}

/**
 * Función Crítica: Calcula la medida de corte real.
 * Resta el grosor de los tapacantos de los lados correspondientes.
 */
function calculateCutDimensions(piece: Piece) {
  const cutWidth = piece.finalWidth - (piece.edges.left + piece.edges.right);
  const cutHeight = piece.finalHeight - (piece.edges.top + piece.edges.bottom);

  if (cutWidth <= 0 || cutHeight <= 0) {
    throw new Error(`[ERROR] Pieza "${piece.name}" inválida: Los cantos exceden el tamaño de la madera.`);
  }

  return {
    cutWidth: Math.round(cutWidth * 10) / 10, // Precisión de 0.1mm
    cutHeight: Math.round(cutHeight * 10) / 10
  };
}

// === PRUEBA DE FUEGO (EJEMPLO DE TALLER) ===

const pruebaModuloBajo = {
  name: "Puerta Bajo 600",
  finalWidth: 597,   // Medida final con holguras
  finalHeight: 717,
  edges: {
    top: 2,          // Canto grueso frontal
    bottom: 2,
    left: 2,
    right: 2
  }
};

try {
  console.log("-------------------------------------------");
  console.log("KITCHEN PRO - TEST DE VALIDACIÓN MATEMÁTICA");
  console.log("-------------------------------------------");
  console.log(`Entrada: ${pruebaModuloBajo.name}`);
  console.log(`Medida Final deseada: ${pruebaModuloBajo.finalWidth} x ${pruebaModuloBajo.finalHeight} mm`);
  console.log(`Cantos aplicados: Sup ${pruebaModuloBajo.edges.top}mm, Inf ${pruebaModuloBajo.edges.bottom}mm, Lat ${pruebaModuloBajo.edges.left}mm/${pruebaModuloBajo.edges.right}mm`);
  
  const resultado = calculateCutDimensions(pruebaModuloBajo);
  
  console.log("\n>>> RESULTADO DE CORTE (Madera bruta):");
  console.log(`ANCHO DE CORTE: ${resultado.cutWidth} mm`);
  console.log(`ALTO DE CORTE: ${resultado.cutHeight} mm`);
  console.log("-------------------------------------------");
  
  // Verificación lógica simple
  if (resultado.cutWidth === 593 && resultado.cutHeight === 713) {
    console.log("CORRECTO: El cálculo coincide con la lógica de taller (597 - 2 - 2 = 593).");
  } else {
    console.log("ADVERTENCIA: Revisa si los descuentos aplicados son los esperados.");
  }
} catch (error) {
  console.error(error.message);
}
