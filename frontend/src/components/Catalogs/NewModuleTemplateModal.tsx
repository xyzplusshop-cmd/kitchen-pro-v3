import React, { useState, useEffect } from 'react';
import { X, Save, Package, AlertTriangle, CheckCircle2, Ruler } from 'lucide-react';
import axios from 'axios';

interface NewModuleTemplateModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const NewModuleTemplateModal: React.FC<NewModuleTemplateModalProps> = ({ onClose, onSuccess }) => {
    // Identification
    const [modelo, setModelo] = useState('');
    const [nombre, setNombre] = useState('');
    const [zona, setZona] = useState<'BASE' | 'WALL' | 'TOWER'>('BASE');
    const [descripcion, setDescripcion] = useState('');

    // External Dimensions (Master Inputs)
    const [externalWidth, setExternalWidth] = useState<number>(600);
    const [externalHeight, setExternalHeight] = useState<number>(720);
    const [externalDepth, setExternalDepth] = useState<number>(560);

    // Reference thickness (hardcoded for catalog)
    const referenceThickness = 18;

    // Structural Configuration
    const [hasTecho, setHasTecho] = useState(true);
    const [hasBackPanel, setHasBackPanel] = useState(true);
    const [hasTopStretcher, setHasTopStretcher] = useState(false);
    const [hasBottomStretcher, setHasBottomStretcher] = useState(false);
    const [hasFrontStretcher, setHasFrontStretcher] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [showConflictWarning, setShowConflictWarning] = useState(false);
    const [conflictMessage, setConflictMessage] = useState('');

    // Soft Logic - Check for conflicts
    useEffect(() => {
        if (hasTecho && (hasTopStretcher || hasFrontStretcher)) {
            setConflictMessage('⚠️ Techo activo: Los amarres superior/frontal son redundantes');
            setShowConflictWarning(true);
        } else if (hasBackPanel && hasBottomStretcher) {
            setConflictMessage('⚠️ Fondo activo: El amarre trasero inferior es redundante');
            setShowConflictWarning(true);
        } else {
            setShowConflictWarning(false);
            setConflictMessage('');
        }
    }, [hasTecho, hasBackPanel, hasTopStretcher, hasBottomStretcher, hasFrontStretcher]);

    // Handle Techo change - soft disable conflicting stretchers
    const handleTechoChange = (value: boolean) => {
        setHasTecho(value);
        if (value) {
            // Soft suggestion: disable conflicting stretchers
            setHasTopStretcher(false);
            setHasFrontStretcher(false);
        }
    };

    // Handle Back Panel change - soft disable rear stretchers
    const handleBackPanelChange = (value: boolean) => {
        setHasBackPanel(value);
        if (value) {
            setHasBottomStretcher(false);
        }
    };

    // Calculate summary
    const calculateSummary = () => {
        const internalWidth = externalWidth - (2 * referenceThickness);
        let pieceCount = 4; // Piso, Techo, 2 Laterales (always)

        if (hasBackPanel) pieceCount++;
        if (hasTopStretcher) pieceCount++;
        if (hasBottomStretcher) pieceCount++;
        if (hasFrontStretcher) pieceCount++;

        return {
            internalWidth,
            pieceCount,
            hasStructure: hasTecho || hasBackPanel,
            hasStretchers: hasTopStretcher || hasBottomStretcher || hasFrontStretcher
        };
    };

    const summary = calculateSummary();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!modelo || !nombre) {
            alert('Por favor completa Modelo y Nombre');
            return;
        }

        setIsSaving(true);

        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

            const payload = {
                modelo,
                nombre,
                zona,
                descripcion: descripcion || undefined,
                externalWidth,
                externalHeight,
                externalDepth,
                referenceThickness,
                hasTopStretcher,
                hasBottomStretcher,
                hasFrontStretcher,
                hasBackPanel
            };

            console.log('📤 Creating Module Template:', payload);

            const response = await axios.post(`${apiBaseUrl}/api/module-templates`, payload);

            if (response.data.success) {
                console.log('✅ Template Created:', response.data.template);
                console.log('📊 Summary:', response.data.summary);

                // Success feedback
                alert(`✅ Plantilla "${nombre}" creada exitosamente!\n\nPiezas generadas: ${response.data.summary.totalPieces}`);

                onSuccess(); // Refresh parent list
                onClose();
            }
        } catch (error: any) {
            console.error('❌ Error creating template:', error);
            alert(`Error al crear plantilla: ${error.response?.data?.error || error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                                <Package size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                                    Nueva Plantilla de Módulo
                                </h2>
                                <p className="text-xs text-slate-500 font-bold">
                                    Smart Wizard - Cálculo Automático de Piezas
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-lg transition"
                        >
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Identification Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-700 uppercase tracking-wide">
                                    Identificación
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">
                                            Código de Modelo *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ej: MB-600"
                                            value={modelo}
                                            onChange={(e) => setModelo(e.target.value)}
                                            className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">
                                            Categoría *
                                        </label>
                                        <select
                                            value={zona}
                                            onChange={(e) => setZona(e.target.value as any)}
                                            className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                        >
                                            <option value="BASE">Mueble Base</option>
                                            <option value="WALL">Mueble Aéreo</option>
                                            <option value="TOWER">Torre</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">
                                        Nombre Descriptivo *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Mueble Base 600mm"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">
                                        Descripción (Opcional)
                                    </label>
                                    <textarea
                                        placeholder="Detalles adicionales..."
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm"
                                    />
                                </div>
                            </div>

                            {/* External Dimensions Section */}
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border-2 border-orange-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <Ruler className="text-orange-600" size={20} />
                                    <h3 className="text-sm font-black text-orange-900 uppercase tracking-wide">
                                        Dimensiones Externas (Outer)
                                    </h3>
                                </div>
                                <p className="text-[10px] text-orange-700 mb-3 font-medium">
                                    El sistema calculará automáticamente las piezas internas usando grosor de referencia: {referenceThickness}mm
                                </p>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-black text-orange-800 uppercase mb-1">
                                            Ancho Total (mm)
                                        </label>
                                        <input
                                            type="number"
                                            value={externalWidth}
                                            onChange={(e) => setExternalWidth(Number(e.target.value))}
                                            className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-black text-orange-900 bg-white"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-orange-800 uppercase mb-1">
                                            Alto Total (mm)
                                        </label>
                                        <input
                                            type="number"
                                            value={externalHeight}
                                            onChange={(e) => setExternalHeight(Number(e.target.value))}
                                            className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-black text-orange-900 bg-white"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-orange-800 uppercase mb-1">
                                            Profundidad (mm)
                                        </label>
                                        <input
                                            type="number"
                                            value={externalDepth}
                                            onChange={(e) => setExternalDepth(Number(e.target.value))}
                                            className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-black text-orange-900 bg-white"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Structural Configuration */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-700 uppercase tracking-wide">
                                    Configuración Estructural
                                </h3>

                                {/* Conflict Warning */}
                                {showConflictWarning && (
                                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 flex items-start gap-2">
                                        <AlertTriangle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs font-bold text-yellow-800">
                                            {conflictMessage}
                                        </p>
                                    </div>
                                )}

                                {/* Primary Structure */}
                                <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200 space-y-3">
                                    <p className="text-[10px] font-black text-slate-500 uppercase mb-2">
                                        Estructura Principal
                                    </p>

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={hasTecho}
                                            onChange={(e) => handleTechoChange(e.target.checked)}
                                            className="w-5 h-5 rounded border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-bold text-slate-700">
                                            Techo/Piso Superior
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={hasBackPanel}
                                            onChange={(e) => handleBackPanelChange(e.target.checked)}
                                            className="w-5 h-5 rounded border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-bold text-slate-700">
                                            Fondo (Back Panel)
                                        </span>
                                    </label>
                                </div>

                                {/* Auxiliary Structure (Stretchers) */}
                                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 space-y-3">
                                    <p className="text-[10px] font-black text-blue-700 uppercase mb-2">
                                        Estructura Auxiliar (Sin Paneles)
                                    </p>

                                    <label className={`flex items-center gap-3 cursor-pointer ${hasTecho ? 'opacity-50' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={hasTopStretcher}
                                            onChange={(e) => setHasTopStretcher(e.target.checked)}
                                            className="w-5 h-5 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-bold text-blue-900">
                                            Amarre Trasero Superior
                                        </span>
                                        {hasTecho && <span className="text-xs text-orange-600">(Techo activo)</span>}
                                    </label>

                                    <label className={`flex items-center gap-3 cursor-pointer ${hasBackPanel ? 'opacity-50' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={hasBottomStretcher}
                                            onChange={(e) => setHasBottomStretcher(e.target.checked)}
                                            className="w-5 h-5 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-bold text-blue-900">
                                            Amarre Trasero Inferior
                                        </span>
                                        {hasBackPanel && <span className="text-xs text-orange-600">(Fondo activo)</span>}
                                    </label>

                                    <label className={`flex items-center gap-3 cursor-pointer ${hasTecho ? 'opacity-50' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={hasFrontStretcher}
                                            onChange={(e) => setHasFrontStretcher(e.target.checked)}
                                            className="w-5 h-5 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-bold text-blue-900">
                                            Amarre Frontal
                                        </span>
                                        {hasTecho && <span className="text-xs text-orange-600">(Techo activo)</span>}
                                    </label>
                                </div>
                            </div>

                            {/* Real-time Summary */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 size={16} className="text-green-600" />
                                    <h3 className="text-xs font-black text-green-800 uppercase">
                                        Resumen de Generación
                                    </h3>
                                </div>
                                <div className="space-y-1 text-xs font-bold text-green-700">
                                    <p>📏 Ancho interno calculado: <span className="text-green-900">{summary.internalWidth}mm</span></p>
                                    <p>🔧 Grosor de referencia: <span className="text-green-900">{referenceThickness}mm</span></p>
                                    <p>📦 Piezas a generar: <span className="text-green-900">{summary.pieceCount}</span></p>
                                    <p>
                                        {summary.hasStructure && !summary.hasStretchers && '✅ Módulo con estructura completa'}
                                        {!summary.hasStructure && summary.hasStretchers && '⚡ Módulo económico con amarres'}
                                        {summary.hasStructure && summary.hasStretchers && '⚠️ Combinación mixta (verifique redundancias)'}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-slate-100 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-sm uppercase tracking-wider hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            Crear Plantilla
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};
