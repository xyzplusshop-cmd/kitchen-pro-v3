import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

// Styles for professional quote PDF (A4 format)
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottom: '3pt solid #1E40AF',
    },
    logo: {
        width: 120,
        height: 50,
    },
    quoteInfo: {
        textAlign: 'right',
    },
    quoteTitle: {
        fontSize: 24,
        color: '#1E40AF',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    quoteNumber: {
        fontSize: 11,
        color: '#64748B',
        marginBottom: 2,
    },
    clientSection: {
        marginBottom: 25,
        padding: 15,
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 8,
    },
    clientName: {
        fontSize: 14,
        color: '#0F172A',
        fontWeight: 'bold',
    },
    table: {
        marginTop: 20,
        marginBottom: 25,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1E40AF',
        color: '#FFFFFF',
        padding: 10,
        fontWeight: 'bold',
        fontSize: 9,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '1pt solid #E2E8F0',
        padding: 10,
        fontSize: 9,
    },
    tableRowAlt: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        borderBottom: '1pt solid #E2E8F0',
        padding: 10,
        fontSize: 9,
    },
    col1: { width: '8%' },
    col2: { width: '40%' },
    col3: { width: '22%' },
    col4: { width: '10%', textAlign: 'center' },
    col5: { width: '20%', textAlign: 'right' },
    financialSection: {
        marginTop: 20,
        marginLeft: 'auto',
        width: '50%',
    },
    financialRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 8,
        fontSize: 11,
    },
    financialTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#16A34A',
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
        marginTop: 5,
    },
    termsSection: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#FEF3C7',
        borderLeft: '4pt solid #F59E0B',
    },
    termsList: {
        marginTop: 8,
        fontSize: 9,
        lineHeight: 1.5,
    },
    signature: {
        marginTop: 40,
        paddingTop: 20,
        borderTop: '1pt solid #94A3B8',
        width: '40%',
        textAlign: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: '#94A3B8',
    },
});

export interface QuoteModule {
    id: string;
    name: string;
    description: string;
    category: string;
    quantity: number;
    unitPrice?: number;
}

export interface Quote {
    quoteNumber: string;
    date: string;
    clientName: string;
    modules: QuoteModule[];
    subtotal: number;
    discount: number;
    discountType: '$' | '%';
    taxRate: number;
    taxAmount: number;
    total: number;
    validityDays: number;
    paymentTerms: string;
    showPricePerModule: boolean;
}

// Format currency
const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Quote Header Component
const QuoteHeader: React.FC<{ quote: Quote }> = ({ quote }) => (
    <View style={styles.header}>
        <View>
            {/* Logo placeholder - can be replaced with actual logo */}
            <View style={{ width: 120, height: 50, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1E40AF' }}>LOGO</Text>
            </View>
        </View>
        <View style={styles.quoteInfo}>
            <Text style={styles.quoteTitle}>COTIZACIÓN</Text>
            <Text style={styles.quoteNumber}>Nro: {quote.quoteNumber}</Text>
            <Text style={styles.quoteNumber}>Fecha: {quote.date}</Text>
        </View>
    </View>
);

// Client Info Component
const ClientInfo: React.FC<{ quote: Quote }> = ({ quote }) => (
    <View style={styles.clientSection}>
        <Text style={styles.sectionTitle}>PREPARADO PARA:</Text>
        <Text style={styles.clientName}>{quote.clientName}</Text>
    </View>
);

// Modules Table Component
const ModulesTable: React.FC<{ modules: QuoteModule[]; showPrice: boolean }> = ({ modules, showPrice }) => (
    <View style={styles.table}>
        <Text style={styles.sectionTitle}>ALCANCE DEL PROYECTO</Text>

        {/* Table Header */}
        <View style={styles.tableHeader}>
            <Text style={styles.col1}>#</Text>
            <Text style={styles.col2}>Módulo</Text>
            <Text style={styles.col3}>Dimensiones</Text>
            <Text style={styles.col4}>Cant.</Text>
            {showPrice && <Text style={styles.col5}>Precio Unit.</Text>}
        </View>

        {/* Table Rows */}
        {modules.map((module, idx) => (
            <View key={module.id} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={styles.col1}>{idx + 1}</Text>
                <Text style={styles.col2}>{module.name}</Text>
                <Text style={styles.col3}>{module.description}</Text>
                <Text style={styles.col4}>{module.quantity}</Text>
                {showPrice && module.unitPrice && (
                    <Text style={styles.col5}>{formatCurrency(module.unitPrice)}</Text>
                )}
            </View>
        ))}
    </View>
);

// Financial Summary Component
const FinancialSummary: React.FC<{ quote: Quote }> = ({ quote }) => (
    <View style={styles.financialSection}>
        <View style={styles.financialRow}>
            <Text>Subtotal:</Text>
            <Text>{formatCurrency(quote.subtotal)}</Text>
        </View>

        {quote.discount > 0 && (
            <View style={styles.financialRow}>
                <Text>Descuento ({quote.discountType === '%' ? `${quote.discount}%` : 'Fijo'}):</Text>
                <Text style={{ color: '#DC2626' }}>
                    -{formatCurrency(quote.discountType === '$' ? quote.discount : quote.subtotal * (quote.discount / 100))}
                </Text>
            </View>
        )}

        <View style={styles.financialRow}>
            <Text>Impuesto ({quote.taxRate}%):</Text>
            <Text>+{formatCurrency(quote.taxAmount)}</Text>
        </View>

        <View style={styles.financialTotal}>
            <Text>TOTAL A PAGAR:</Text>
            <Text>{formatCurrency(quote.total)}</Text>
        </View>
    </View>
);

// Terms and Conditions Component
const TermsAndConditions: React.FC<{ quote: Quote }> = ({ quote }) => (
    <View style={styles.termsSection}>
        <Text style={styles.sectionTitle}>TÉRMINOS Y CONDICIONES</Text>
        <View style={styles.termsList}>
            <Text>• Validez de la oferta: {quote.validityDays} días</Text>
            <Text>• Forma de pago: {quote.paymentTerms}</Text>
            <Text>• Garantía: 12 meses contra defectos de fabricación</Text>
            <Text>• Instalación NO incluida (cotizar por separado)</Text>
            <Text>• Los precios pueden variar según cambios en el diseño</Text>
        </View>
    </View>
);

// Signature Section
const SignatureSection: React.FC = () => (
    <View style={styles.signature}>
        <Text>_________________________</Text>
        <Text style={{ marginTop: 5, fontSize: 9 }}>Firma de Aceptación</Text>
    </View>
);

// Footer
const QuoteFooter: React.FC = () => (
    <View style={styles.footer}>
        <Text>Este documento es una cotización y no constituye un contrato hasta su aceptación formal.</Text>
    </View>
);

// Main Quote Document
export const generateQuoteDocument = (quote: Quote) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <QuoteHeader quote={quote} />
                <ClientInfo quote={quote} />
                <ModulesTable modules={quote.modules} showPrice={quote.showPricePerModule} />
                <FinancialSummary quote={quote} />
                <TermsAndConditions quote={quote} />
                <SignatureSection />
                <QuoteFooter />
            </Page>
        </Document>
    );
};
