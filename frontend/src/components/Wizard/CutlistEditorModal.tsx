import React, { useState, useEffect } from 'react';
import { X, Save, Layers, AlertTriangle, CheckCircle2, Copy, Link2 } from 'lucide-react';
import axios from 'axios';
import { useProjectStore } from '../../store/useProjectStore';

interface CutlistEditorModalProps {
    moduleId: string;
    onClose: () => void;
}

// Define paired pieces (symmetry logic)
const PAIRED_PIECES: Record<string, string> = {
    'Lateral Izquierdo Base': 'Lateral Derecho Base',
    'Lateral Derecho Base': 'Lateral Izquierdo Base',
    'Lateral Izquierdo Aéreo': 'Lateral Derecho Aéreo',
    'Lateral Derecho Aéreo': 'Lateral Izquierdo Aéreo',
    'Lateral Izquierdo Torre': 'Lateral Derecho Torre',
    'Lateral Derecho Torre': 'Lateral Izquierdo Torre',
    'Lateral Izquierdo Cajón': 'Lateral Derecho Cajón',
    'Lateral Derecho Cajón': 'Lateral Izquierdo Cajón',
    'Techo/Piso Aéreo': 'Techo/Piso Aéreo', // Same piece, appears twice
    'Techo/Piso Torre': 'Techo/Piso Torre',
    'Manguete Frontal': 'Manguete Trasero',
    'Manguete Trasero': 'Manguete Frontal',
    'Manguete Superior': 'Manguete Inferior',
    'Manguete Inferior': 'Manguete Superior'
};

export const CutlistEditorModal: React.FC<CutlistEditorModalProps> = ({ moduleId, onClose }) => {
    const {
        modules,
        baseHeight, plinthHeight, wallHeight, baseDepth, wallDepth,
        doorInstallationType, doorGap, drawerInstallationType,
        boardThickness, edgeRuleDoors, edgeRuleVisible, edgeRuleInternal,
        updateModuleCustomPieces, replicateCustomPieces
    } = useProjectStore();

    const module = modules.find(m => m.id === moduleId);
    const [pieces, setPieces] = useState<any[]>(module?.customPieces || []);
    const [isLoading, setIsLoading] = useState(!module?.customPieces);
    const [changedPieceNames, setChangedPieceNames] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [symmetryModalOpen, setSymmetryModalOpen] = useState(false);
    const [pendingSave, setPendingSave] = useState<{ replicate: boolean } | null>(null);
    const [pairedPiecesToUpdate, setPairedPiecesToUpdate] = useState<Array<{ original: string, paired: string }>>([]);

    useEffect(() => {
        if (!module?.customPieces) {
            fetchStandardPieces();
        }
    }, []);

    const fetchStandardPieces = async () => {
        if (!module) return;
        setIsLoading(true);
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
            const res = await axios.post(`${apiBaseUrl}/api/generate-pieces`, {
                module,
                boardThickness,
                edgeRules: {
                    doors: edgeRuleDoors,
                    visible: edgeRuleVisible,
                    internal: edgeRuleInternal
                },
                config: {
                    baseHeight,
                    plinthHeight,
                    wallHeight,
                    baseDepth,
                    wallDepth,
                    doorInstallationType,
                    doorGap,
                    drawerInstallationType
                }
            });
            if (res.data.success) {
                setPieces(res.data.pieces);
            }
        } catch (error) {
            console.error('Error generating benchmark pieces:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePieceChange = (index: number, field: string, value: any) => {
        const newPieces = [...pieces];
        newPieces[index] = { ...newPieces[index], [field]: value };
        setPieces(newPieces);

        const pieceName = newPieces[index].name;
        if (!changedPieceNames.includes(pieceName)) {
            setChangedPieceNames([...changedPieceNames, pieceName]);
        }
    };

    const checkForPairedPieces = () => {
        const pairsToUpdate: Array<{ original: string, paired: string }> = [];

        changedPieceNames.forEach(changedName => {
            const pairedName = PAIRED_PIECES[changedName];
            if (pairedName) {
                // Check if the paired piece exists in the module
                const pairedPieceExists = pieces.some(p => p.name === pairedName);
                if (pairedPieceExists) {
                    pairsToUpdate.push({ original: changedName, paired: pairedName });
                }
            }
        });

        return pairsToUpdate;
    };

    const applySymmetryUpdates = () => {
        const updatedPieces = [...pieces];
        const updatedChangedNames = [...changedPieceNames];

        pairedPiecesToUpdate.forEach(({ original, paired }) => {
            const originalPiece = updatedPieces.find(p => p.name === original);
            const pairedPieceIndex = updatedPieces.findIndex(p => p.name === paired);

            if (originalPiece && pairedPieceIndex !== -1) {
                // Copy dimensions from original to paired
                updatedPieces[pairedPieceIndex] = {
                    ...updatedPieces[pairedPieceIndex],
                    finalWidth: originalPiece.finalWidth,
                    finalHeight: originalPiece.finalHeight,
                    quantity: originalPiece.quantity,
                    edges: originalPiece.edges // Also copy edge configuration for consistency
                };

                // Mark the paired piece as changed
                if (!updatedChangedNames.includes(paired)) {
                    updatedChangedNames.push(paired);
                }
            }
        });

        return { updatedPieces, updatedChangedNames };
    };

    const handleSave = async (replicate: boolean) => {
        // Check for paired pieces
        const pairsFound = checkForPairedPieces();

        if (pairsFound.length > 0) {
            // Show symmetry modal
            setPairedPiecesToUpdate(pairsFound);
            setPendingSave({ replicate });
            setSymmetryModalOpen(true);
        } else {
            // No pairs, save directly
            executeSaveWithPieces(pieces, changedPieceNames, replicate);
        }
    };

    const executeSaveWithPieces = async (piecesToSave: any[], changedNames: string[], replicate: boolean) => {
        setIsSaving(true);
        updateModuleCustomPieces(moduleId, piecesToSave);

        if (replicate && changedNames.length > 0) {
            await replicateCustomPieces(moduleId, changedNames);
        }

        setTimeout(() => {
            setIsSaving(false);
            onClose();
        }, 500);
    };

    const handleSymmetryConfirm = (applyToAll: boolean) => {
        let finalPieces = pieces;
        let finalChangedNames = changedPieceNames;

        if (applyToAll) {
            // Apply symmetry updates and get the updated arrays
            const result = applySymmetryUpdates();
            finalPieces = result.updatedPieces;
            finalChangedNames = result.updatedChangedNames;

            // Update UI state to show the changes
            setPieces(finalPieces);
            setChangedPieceNames(finalChangedNames);
        }

        setSymmetryModalOpen(false);

        // Execute the pending save with the correct pieces array
        if (pendingSave) {
            executeSaveWithPieces(finalPieces, finalChangedNames, pendingSave.replicate);
        }
    };

    if (!module) return null;

    return (
        <>
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                                <Layers size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight italic">Editor de Despiece (Cutlist)</h2>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    {module.type} <span className="text-slate-300">|</span> ID: {module.id.slice(0, 8)}
                                    {module.templateId && <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md ml-2">Plantilla Activa</span>}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition text-slate-400">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto p-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-slate-500 font-bold animate-pulse">Calculando despiece técnico...</p>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-800 text-white">
                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Pieza</th>
                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Largo (mm)</th>
                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Ancho (mm)</th>
                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Cant.</th>
                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Material / Observación</th>
                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 italic">
                                        {pieces.map((piece, idx) => {
                                            const isChanged = changedPieceNames.includes(piece.name);
                                            const hasPair = PAIRED_PIECES[piece.name] !== undefined;
                                            return (
                                                <tr key={idx} className={`hover:bg-slate-50 transition-colors ${isChanged ? 'bg-orange-50/30' : ''}`}>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-slate-700">{piece.name}</span>
                                                            {hasPair && <Link2 size={12} className="text-blue-500" title="Tiene pieza par" />}
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 font-medium">{piece.category}</p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            value={piece.finalHeight}
                                                            onChange={(e) => handlePieceChange(idx, 'finalHeight', parseFloat(e.target.value))}
                                                            className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            value={piece.finalWidth}
                                                            onChange={(e) => handlePieceChange(idx, 'finalWidth', parseFloat(e.target.value))}
                                                            className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            value={piece.quantity}
                                                            onChange={(e) => handlePieceChange(idx, 'quantity', parseInt(e.target.value))}
                                                            className="w-16 px-2 py-1 bg-white border border-slate-200 rounded text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="text"
                                                            value={piece.material || ''}
                                                            placeholder="Material (ej: MDF 18mm)"
                                                            onChange={(e) => handlePieceChange(idx, 'material', e.target.value)}
                                                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {isChanged ? (
                                                            <span className="flex items-center gap-1 text-[9px] font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded uppercase">
                                                                <AlertTriangle size={10} /> Editado
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 text-[9px] font-black text-green-600 bg-green-100 px-2 py-0.5 rounded uppercase">
                                                                <CheckCircle2 size={10} /> Auto
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                            <AlertTriangle size={16} className="text-orange-500" />
                            <span>Los cambios aquí realizados sobrescriben el cálculo automático para este módulo.</span>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                                onClick={() => handleSave(false)}
                                disabled={isSaving}
                                className="flex-1 md:flex-none px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-slate-100 transition flex items-center justify-center gap-2"
                            >
                                <Save size={16} />
                                Guardar Solo Este
                            </button>
                            <button
                                onClick={() => handleSave(true)}
                                disabled={isSaving || changedPieceNames.length === 0}
                                className="flex-1 md:flex-none px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-blue-600 transition shadow-xl shadow-slate-200 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Copy size={16} />
                                Guardar y Replicar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Symmetry Confirmation Modal */}
            {symmetryModalOpen && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-blue-600 rounded-2xl text-white">
                                <Link2 size={24} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800">Piezas Simétricas Detectadas</h3>
                        </div>

                        <div className="space-y-4 mb-8">
                            <p className="text-slate-600 font-medium">
                                Estás editando piezas que tienen un par lógico. ¿Deseas aplicar las mismas medidas a las piezas simétricas para mantener la consistencia?
                            </p>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-2">Pares Encontrados:</p>
                                {pairedPiecesToUpdate.map((pair, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-blue-700 font-medium mb-1">
                                        <span className="flex-1">{pair.original}</span>
                                        <span className="text-blue-400">↔</span>
                                        <span className="flex-1">{pair.paired}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleSymmetryConfirm(false)}
                                className="flex-1 px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-slate-100 transition"
                            >
                                Solo la Editada
                            </button>
                            <button
                                onClick={() => handleSymmetryConfirm(true)}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-blue-700 transition shadow-xl shadow-blue-200"
                            >
                                Aplicar a Ambas
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
