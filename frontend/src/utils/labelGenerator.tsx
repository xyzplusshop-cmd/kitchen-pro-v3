import React from 'react';
import { Document, Page, View, Text, Svg, Line, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts for better rendering
Font.register({
    family: 'Roboto',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
});

// Export interface for use in other modules
export interface LabelPiece {
    id: string;
    moduleCode: string;
    name: string;
    cutWidth: number;
    cutHeight: number;
    materialName: string;
    thickness: number;
    edges: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
    grain?: boolean;
}

// Styles for 100x60mm thermal label (283.46 x 170.08 points)
const styles = StyleSheet.create({
    page: {
        width: 283.46,
        height: 170.08,
        padding: 8,
        fontFamily: 'Helvetica',
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
        borderBottom: '2pt solid black',
        paddingBottom: 4,
    },
    moduleId: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    pieceName: {
        fontSize: 10,
        marginTop: 2,
    },
    qrPlaceholder: {
        width: 40,
        height: 40,
        border: '1pt solid black',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 6,
    },
    visualMap: {
        alignItems: 'center',
        marginVertical: 8,
    },
    footer: {
        marginTop: 'auto',
        paddingTop: 6,
        borderTop: '1pt solid black',
    },
    dimensions: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    material: {
        fontSize: 9,
        textAlign: 'center',
        marginTop: 2,
    },
    grainArrow: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 4,
    },
});

// Edge thickness to stroke style mapping
function getEdgeStrokeStyle(thickness: number): { width: number; dashArray?: string } {
    if (thickness >= 1.5) {
        return { width: 4 }; // Thick solid (doors/fronts)
    } else if (thickness > 0) {
        return { width: 1 }; // Thin solid (structure)
    } else {
        return { width: 1, dashArray: '5,3' }; // Dashed (no edge)
    }
}

// Visual edge representation component
const EdgeVisualizer: React.FC<{ edges: LabelPiece['edges']; grain?: boolean }> = ({ edges, grain }) => {
    const topStroke = getEdgeStrokeStyle(edges.top);
    const bottomStroke = getEdgeStrokeStyle(edges.bottom);
    const leftStroke = getEdgeStrokeStyle(edges.left);
    const rightStroke = getEdgeStrokeStyle(edges.right);

    const rectWidth = 140;
    const rectHeight = 60;
    const startX = 10;
    const startY = 5;

    return (
        <View style={{ alignItems: 'center' }}>
            <Svg width="160" height="70">
                {/* Top edge */}
                <Line
                    x1={startX}
                    y1={startY}
                    x2={startX + rectWidth}
                    y2={startY}
                    stroke="black"
                    strokeWidth={topStroke.width}
                    strokeDasharray={topStroke.dashArray}
                />
                {/* Right edge */}
                <Line
                    x1={startX + rectWidth}
                    y1={startY}
                    x2={startX + rectWidth}
                    y2={startY + rectHeight}
                    stroke="black"
                    strokeWidth={rightStroke.width}
                    strokeDasharray={rightStroke.dashArray}
                />
                {/* Bottom edge */}
                <Line
                    x1={startX + rectWidth}
                    y1={startY + rectHeight}
                    x2={startX}
                    y2={startY + rectHeight}
                    stroke="black"
                    strokeWidth={bottomStroke.width}
                    strokeDasharray={bottomStroke.dashArray}
                />
                {/* Left edge */}
                <Line
                    x1={startX}
                    y1={startY + rectHeight}
                    x2={startX}
                    y2={startY}
                    stroke="black"
                    strokeWidth={leftStroke.width}
                    strokeDasharray={leftStroke.dashArray}
                />
            </Svg>
            {grain && <Text style={styles.grainArrow}>⬆️</Text>}
        </View>
    );
};

// Single label component
const Label: React.FC<{ piece: LabelPiece }> = ({ piece }) => {
    return (
        <Page size={[283.46, 170.08]} style={styles.page}>
            {/* Header Zone */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.moduleId}>{piece.moduleCode}</Text>
                    <Text style={styles.pieceName}>{piece.name}</Text>
                </View>
                <View style={styles.qrPlaceholder}>
                    <Text>QR</Text>
                    <Text>{piece.id.slice(0, 8)}</Text>
                </View>
            </View>

            {/* Visual Map Zone */}
            <View style={styles.visualMap}>
                <EdgeVisualizer edges={piece.edges} grain={piece.grain} />
            </View>

            {/* Footer Zone */}
            <View style={styles.footer}>
                <Text style={styles.dimensions}>
                    {piece.cutWidth} × {piece.cutHeight} mm
                </Text>
                <Text style={styles.material}>{piece.materialName}</Text>
            </View>
        </Page>
    );
};

// Group and sort pieces by material and thickness
function groupPieces(pieces: LabelPiece[]): LabelPiece[] {
    return [...pieces].sort((a, b) => {
        // First by material name
        if (a.materialName !== b.materialName) {
            return a.materialName.localeCompare(b.materialName);
        }
        // Then by thickness
        return a.thickness - b.thickness;
    });
}

// Main PDF document generator
export const generateLabelsDocument = (pieces: LabelPiece[]) => {
    const sortedPieces = groupPieces(pieces);

    return (
        <Document>
            {sortedPieces.map((piece, idx) => (
                <Label key={idx} piece={piece} />
            ))}
        </Document>
    );
};
