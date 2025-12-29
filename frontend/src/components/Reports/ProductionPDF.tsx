import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { calculateCutDimensions, calculateProjectBOM } from '../../utils/cutlistCalculations';

// Styles for the PDF
const styles = StyleSheet.create({
    page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
    header: { marginBottom: 30, borderBottom: 2, borderBottomColor: '#3182ce', paddingBottom: 15 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#1a365d' },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    metaText: { fontSize: 10, color: '#4a5568', fontWeight: 'bold' },

    section: { marginTop: 25 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', backgroundColor: '#ebf8ff', padding: 8, marginBottom: 12, color: '#2c5282', borderRadius: 4, textTransform: 'uppercase' },

    // BOM Styles
    bomRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    bomBox: { flex: 1, padding: 12, border: 1, borderColor: '#e2e8f0', borderRadius: 6, backgroundColor: '#f7fafc' },
    bomLabel: { fontSize: 8, color: '#718096', marginBottom: 4, textTransform: 'uppercase' },
    bomValue: { fontSize: 12, fontWeight: 'black', color: '#2d3748' },

    // Table Styles
    table: { width: '100%', marginBottom: 20 },
    tableHeader: { flexDirection: 'row', backgroundColor: '#2d3748', color: '#ffffff', minHeight: 25, alignItems: 'center', borderRadius: 4 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#edf2f7', minHeight: 30, alignItems: 'center' },
    cell: { fontSize: 9, padding: 4, flex: 1, textAlign: 'center' },
    cellWide: { fontSize: 9, padding: 4, flex: 2, textAlign: 'left' },
    cellCanto: { fontSize: 8, padding: 4, flex: 1.5, textAlign: 'center', color: '#718096', fontStyle: 'italic' },
    cellHero: { fontSize: 12, padding: 4, flex: 1, fontWeight: 'bold', backgroundColor: '#fef3c7', textAlign: 'center', color: '#b45309' },

    footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, textAlign: 'center', color: '#a0aec0', borderTop: 1, borderTopColor: '#e2e8f0', paddingTop: 10 }
});

interface ProductionPDFProps {
    project: any;
    materials: any[];
}

export const ProductionDocument = ({ project, materials }: ProductionPDFProps) => {
    const bom = calculateProjectBOM(project.modules || [], materials);

    // Group pieces by material and thickness
    const allPieces: any[] = [];
    (project.modules || []).forEach((m: any) => {
        const pieces = m.customPieces || [];
        pieces.forEach((p: any) => {
            allPieces.push({ ...p, moduleName: m.name || m.type });
        });
    });

    const groupedPieces: Record<string, any[]> = {};
    allPieces.forEach(p => {
        const key = p.material || "Desconocido";
        if (!groupedPieces[key]) groupedPieces[key] = [];
        groupedPieces[key].push(p);
    });

    const getCantosString = (p: any) => {
        const getT = (id?: string) => {
            const m = materials.find(mat => mat.id === id);
            return m ? m.thickness : '0';
        };
        return `${getT(p.edgeL1Id)} | ${getT(p.edgeL2Id)} | ${getT(p.edgeA1Id)} | ${getT(p.edgeA2Id)}`;
    };

    return (
        <Document title={`Produccion_${project.projectName}`}>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>{project.projectName || 'Proyecto Sin Nombre'}</Text>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaText}>CLIENTE: {project.clientName || 'N/A'}</Text>
                        <Text style={styles.metaText}>FECHA: {new Date().toLocaleDateString()}</Text>
                    </View>
                </View>

                {/* BOM Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Resumen de Materiales (BOM)</Text>
                    <View style={{ flexDirection: 'column', gap: 10 }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5 }}>TABLEROS (Calculado por m²)</Text>
                        <View style={styles.bomRow}>
                            {bom.boards.map((b, i) => (
                                <View key={i} style={styles.bomBox}>
                                    <Text style={styles.bomLabel}>{b.material}</Text>
                                    <Text style={styles.bomValue}>{b.area} m²</Text>
                                </View>
                            ))}
                        </View>

                        <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5, marginTop: 10 }}>CANTOS (Metros Lineales Reales)</Text>
                        <View style={styles.bomRow}>
                            {bom.edges.map((e, i) => (
                                <View key={i} style={styles.bomBox}>
                                    <Text style={styles.bomLabel}>{e.material}</Text>
                                    <Text style={styles.bomValue}>{e.length} ml</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Cutlist Sections */}
                {Object.keys(groupedPieces).map((matName) => (
                    <View key={matName} style={styles.section} break={allPieces.length > 15 && Object.keys(groupedPieces).indexOf(matName) > 0}>
                        <Text style={styles.sectionTitle}>Lista de Corte: {matName}</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.cell, { flex: 0.5 }]}>Cant</Text>
                                <Text style={styles.cellWide}>Pieza / Módulo</Text>
                                <Text style={styles.cell}>Medida Final</Text>
                                <Text style={styles.cellCanto}>Cantos(L1/L2/A1/A2)</Text>
                                <Text style={[styles.cellHero, { color: '#ffffff', backgroundColor: '#e53e3e' }]}>MEDIDA CORTE</Text>
                            </View>

                            {groupedPieces[matName].map((p, idx) => {
                                const cut = calculateCutDimensions(p, materials);
                                return (
                                    <View key={idx} style={styles.tableRow}>
                                        <Text style={[styles.cell, { flex: 0.5 }]}>{p.quantity}</Text>
                                        <Text style={styles.cellWide}>{p.name} ({p.moduleName})</Text>
                                        <Text style={styles.cell}>{p.finalHeight} x {p.finalWidth}</Text>
                                        <Text style={styles.cellCanto}>{getCantosString(p)}</Text>
                                        <Text style={styles.cellHero}>{cut.cutHeight} x {cut.cutWidth}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                ))}

                <Text style={styles.footer}>
                    XYZ Plus - Software de Gestión de Carpintería Industrial | Página 1 de 1
                </Text>
            </Page>
        </Document>
    );
};

export const ProductionPDFExport = ({ project, materials }: ProductionPDFProps) => {
    return (
        <div className="flex items-center gap-2">
            <PDFDownloadLink
                document={<ProductionDocument project={project} materials={materials} />}
                fileName={`Produccion_${project.projectName}.pdf`}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-black text-sm transition shadow-xl shadow-red-100 flex items-center gap-2"
            >
                {({ loading }) => (
                    loading ? 'Preparando PDF...' : 'DESCARGAR REPORTE PDF'
                )}
            </PDFDownloadLink>
        </div>
    );
};
