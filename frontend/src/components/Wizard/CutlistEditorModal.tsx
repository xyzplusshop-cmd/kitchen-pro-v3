import React, { useState, useEffect } from 'react';
import { X, Save, Layers, AlertTriangle, CheckCircle2, Copy, Link2, Maximize2 } from 'lucide-react';
import axios from 'axios';
import { useProjectStore } from '../../store/useProjectStore';
import { VisualEdgeSelector } from './VisualEdgeSelector';
import { calculateCutDimensions } from '../../utils/cutlistCalculations';

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
        updateModuleCustomPieces, replicateCustomPieces, updateModuleWidthCascade, toggleModuleFixed
    } = useProjectStore();

    const module = modules.find(m => m.id === moduleId);
    const [pieces, setPieces] = useState<any[]>(module?.customPieces || []);
    const [isLoading, setIsLoading] = useState(!module?.customPieces);
    const [changedPieceNames, setChangedPieceNames] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [symmetryModalOpen, setSymmetryModalOpen] = useState(false);
    const [pendingSave, setPendingSave] = useState<{ replicate: boolean } | null>(null);
    const [pairedPiecesToUpdate, setPairedPiecesToUpdate] = useState<Array<{ original: string, paired: string }>>([]);
    const [edgeMaterials, setEdgeMaterials] = useState<any[]>([]);
    const [activeEdgeSelectorIdx, setActiveEdgeSelectorIdx] = useState<number | null>(null);
    const [showCutDimensions, setShowCutDimensions] = useState(false);

    // Smart Resizer State
    const getDefaultHeight = () => {
        if (!module) return 720;
        if (module.category === 'TOWER') return 2100;
        if (module.category === 'WALL') return wallHeight || 720;
        return baseHeight || 720;
    };

    const getDefaultDepth = () => {
        if (!module) return 560;
        if (module.category === 'WALL') return wallDepth || 320;
        return baseDepth || 560;
    };

    const [totalWidth, setTotalWidth] = useState<number>(module?.width || 600);
    const [totalHeight, setTotalHeight] = useState<number>(getDefaultHeight());
    const [totalDepth, setTotalDepth] = useState<number>(getDefaultDepth());
    const [isResizing, setIsResizing] = useState(false);
    const [resizeMessage, setResizeMessage] = useState<string>('');

    // Helper Functions for Width Cascade
    const isStructuralPiece = (name: string) => {
        return name.toLowerCase().includes('piso') || name.toLowerCase().includes('techo');
    };

    const isDependentPiece = (name: string) => {
        const nameLower = name.toLowerCase();
        const dependents = ['fondo', 'amarre', 'estante', 'estantería'];
        return dependents.some(dep => nameLower.includes(dep));
    };

    const isOppositeStructural = (editedName: string, pieceName: string) => {
        const editedLower = editedName.toLowerCase();
        const pieceLower = pieceName.toLowerCase();

        if (editedLower.includes('piso') && pieceLower.includes('techo')) return true;
        if (editedLower.includes('techo') && pieceLower.includes('piso')) return true;
        return false;
    };

    useEffect(() => {
        if (!module?.customPieces) {
            fetchStandardPieces();
        }
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
            const res = await axios.get(`${apiBaseUrl}/api/materials`);
            if (res.data.success) {
                setEdgeMaterials(res.data.items.filter((m: any) => m.type === 'EDGE'));
            }
        } catch (error) {
            console.error('Error fetching materials:', error);
        }
    };

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
                const newPieces = res.data.pieces;
                setPieces(newPieces);

                // Update resizer totals from real pieces
                const lateral = newPieces.find((p: any) => p.name.toLowerCase().includes('lateral'));
                if (lateral) {
                    setTotalHeight(lateral.finalHeight);
                    setTotalDepth(lateral.finalWidth);
                }
                setTotalWidth(module?.width || totalWidth);
            }
        } catch (error) {
            console.error('Error generating benchmark pieces:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // ========== SMART RESIZER ENGINE ==========
    const handleSmartResize = (dimension: 'width' | 'height' | 'depth', newValue: number) => {
        if (!newValue || newValue < 100) {
            alert('Dimensión inválida. Mínimo: 100mm');
            return;
        }

        setIsResizing(true);
        setResizeMessage('');

        const updatedPieces = [...pieces];
        let piecesUpdated = 0;

        if (dimension === 'width') {
            // ===== WIDTH LOGIC: MIXED THICKNESS =====

            // 1. Find laterals and read their actual thicknesses
            const leftLateral = updatedPieces.find(p =>
                p.name.toLowerCase().includes('lateral izquierdo') ||
                p.name.toLowerCase().includes('lateral') && p.name.toLowerCase().includes('izq')
            );
            const rightLateral = updatedPieces.find(p =>
                p.name.toLowerCase().includes('lateral derecho') ||
                p.name.toLowerCase().includes('lateral') && p.name.toLowerCase().includes('der')
            );


            // 2. Get REAL thicknesses using smart detection (HOTFIX)
            const getRealThickness = (piece: any): number => {
                // Priority 1: Explicit thickness property
                if (piece.thickness) return piece.thickness;
                if (piece.z) return piece.z;

                // Priority 2: Parse from material string (e.g., "MDF 18mm" -> 18)
                if (piece.material) {
                    const match = piece.material.match(/(\d+)(?:mm)?/i);
                    if (match && match[1]) {
                        const parsed = parseInt(match[1]);
                        // Sanity check: thickness should be between 10-25mm
                        if (parsed >= 10 && parsed <= 25) {
                            return parsed;
                        }
                    }
                }

                // Priority 3: Fallback to project global (SAFE DEFAULT)
                return boardThickness || 18;
            };

            const leftThickness = leftLateral
                ? getRealThickness(leftLateral)
                : boardThickness || 18;
            const rightThickness = rightLateral
                ? getRealThickness(rightLateral)
                : boardThickness || 18;

            // 3. Calculate current total width from pieces (robust reference)
            const floor = updatedPieces.find(p => p.name.toLowerCase().includes('piso'));
            const newInternalWidth = newValue - leftThickness - rightThickness;
            const currentInternalWidth = floor ? floor.finalWidth : (totalWidth - leftThickness - rightThickness);
            const currentTotalWidth = currentInternalWidth + leftThickness + rightThickness;

            console.log('🔧 Width Resize:', {
                newTotal: newValue,
                currentTotal: currentTotalWidth,
                leftThickness,
                rightThickness,
                newInternalWidth
            });

            // 4. Update pieces
            updatedPieces.forEach(piece => {
                const nameLower = piece.name.toLowerCase();

                // Horizontals (Piso, Techo, Amarres, Estantes, Fondo)
                if (nameLower.includes('piso') || nameLower.includes('techo') ||
                    nameLower.includes('amarre') || nameLower.includes('estante') ||
                    nameLower.includes('fondo')) {
                    piece.finalWidth = newInternalWidth;
                    piecesUpdated++;
                }

                // Fronts (Puertas, Cajones) - maintain existing gaps
                if (nameLower.includes('puerta') || nameLower.includes('cajón') ||
                    nameLower.includes('cajon') || nameLower.includes('frente')) {
                    const oldGap = currentTotalWidth - piece.finalWidth;
                    piece.finalWidth = newValue - oldGap;
                    piecesUpdated++;
                }
            });

            setTotalWidth(newValue);

        } else if (dimension === 'height') {
            // ===== HEIGHT LOGIC: DELTA FROM REFERENCE =====
            const lateral = pieces.find(p => p.name.toLowerCase().includes('lateral'));
            const currentHeight = lateral ? lateral.finalHeight : totalHeight;
            const delta = newValue - currentHeight;

            console.log('📏 Height Resize:', { old: currentHeight, new: newValue, delta });

            if (delta === 0) {
                setIsResizing(false);
                return;
            }

            updatedPieces.forEach(piece => {
                const nameLower = piece.name.toLowerCase();

                // Verticals (Laterales, Divisiones)
                if (nameLower.includes('lateral') || nameLower.includes('división') ||
                    nameLower.includes('division')) {
                    piece.finalHeight += delta;
                    piecesUpdated++;
                }

                // Fondo
                if (nameLower.includes('fondo')) {
                    piece.finalHeight += delta;
                    piecesUpdated++;
                }

                // Fronts (Puertas)
                if (nameLower.includes('puerta') || nameLower.includes('frente')) {
                    piece.finalHeight += delta;
                    piecesUpdated++;
                }
            });

            setTotalHeight(newValue);

        } else if (dimension === 'depth') {
            // ===== DEPTH LOGIC: DELTA FROM REFERENCE =====
            const lateral = pieces.find(p => p.name.toLowerCase().includes('lateral'));
            const currentDepth = lateral ? lateral.finalWidth : totalDepth;
            const delta = newValue - currentDepth;

            console.log('📐 Depth Resize:', { old: currentDepth, new: newValue, delta });

            if (delta === 0) {
                setIsResizing(false);
                return;
            }

            updatedPieces.forEach(piece => {
                const nameLower = piece.name.toLowerCase();

                // Laterales
                if (nameLower.includes('lateral')) {
                    piece.finalWidth += delta;
                    piecesUpdated++;
                }

                // Horizontals (Piso, Techo, Estantes)
                if (nameLower.includes('piso') || nameLower.includes('techo') ||
                    nameLower.includes('estante')) {
                    piece.finalHeight += delta;
                    piecesUpdated++;
                }
            });

            setTotalDepth(newValue);
        }

        // Update state
        setPieces(updatedPieces);
        setIsResizing(false);
        setResizeMessage(`✅ Mueble redimensionado. ${piecesUpdated} piezas actualizadas.`);

        // Clear message after 3 seconds
        setTimeout(() => setResizeMessage(''), 3000);
    };

    const handlePieceChange = (index: number, field: string, value: any) => {
        const piece = pieces[index];
        const newPieces = [...pieces];

        // WIDTH CASCADE LOGIC - If editing width of structural piece
        if (field === 'finalWidth' && isStructuralPiece(piece.name)) {
            const newWidth = value;

            //  Update the structural piece itself
            newPieces[index] = { ...newPieces[index], finalWidth: newWidth };

            // 2. Update all dependent pieces (Fondo, Amarres, Estantes)
            newPieces.forEach((p, idx) => {
                if (idx !== index) {
                    if (isDependentPiece(p.name)) {
                        // Dependent pieces: width = module width - (2 × thickness)
                        newPieces[idx] = {
                            ...newPieces[idx],
                            finalWidth: newWidth - (2 * boardThickness)
                        };

                        // Mark as changed
                        if (!changedPieceNames.includes(p.name)) {
                            setChangedPieceNames(prev => [...prev, p.name]);
                        }
                    }

                    // 3. Update opposite structural piece (Techo if editing Piso)
                    if (isOppositeStructural(piece.name, p.name)) {
                        newPieces[idx] = { ...newPieces[idx], finalWidth: newWidth };

                        // Mark as changed
                        if (!changedPieceNames.includes(p.name)) {
                            setChangedPieceNames(prev => [...prev, p.name]);
                        }
                    }
                }
            });

            setPieces(newPieces);

            // Mark the original piece as changed
            const pieceName = newPieces[index].name;
            if (!changedPieceNames.includes(pieceName)) {
                setChangedPieceNames([...changedPieceNames, pieceName]);
            }

            console.log('🔗 Width Cascade Triggered:', {
                structural: piece.name,
                newWidth,
                dependentsUpdated: newPieces.filter((p, idx) => idx !== index && isDependentPiece(p.name)).length
            });
        } else {
            // Normal field update (non-structural or non-width)
            newPieces[index] = { ...newPieces[index], [field]: value };
            setPieces(newPieces);

            const pieceName = newPieces[index].name;
            if (!changedPieceNames.includes(pieceName)) {
                setChangedPieceNames([...changedPieceNames, pieceName]);
            }
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
                // Copy dimensions and edges from original to paired
                updatedPieces[pairedPieceIndex] = {
                    ...updatedPieces[pairedPieceIndex],
                    finalWidth: originalPiece.finalWidth,
                    finalHeight: originalPiece.finalHeight,
                    quantity: originalPiece.quantity,
                    edges: originalPiece.edges, // Keep legacy field for compatibility
                    edgeL1Id: originalPiece.edgeL1Id,
                    edgeL2Id: originalPiece.edgeL2Id,
                    edgeA1Id: originalPiece.edgeA1Id,
                    edgeA2Id: originalPiece.edgeA2Id
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
        if (!module) return;

        setIsSaving(true);

        // ========== DIMENSION SYNC & AUTO-LOCK LOGIC ==========

        // 1. Detect dimension changes (tolerance: 1mm)
        const widthChanged = Math.abs(totalWidth - module.width) > 1;
        const heightChanged = module.height ? Math.abs(totalHeight - module.height) > 1 : false;
        const depthChanged = module.depth ? Math.abs(totalDepth - module.depth) > 1 : false;

        // 2. Check if any structural piece width was manually changed (old logic)
        const structuralPieceChanged = piecesToSave.some(p =>
            isStructuralPiece(p.name) && changedNames.includes(p.name)
        );

        // 3. Determine which update strategy to use
        if (widthChanged || heightChanged || depthChanged) {
            // === SMART RESIZER PATH: Dimension container changed ===

            console.log('🎯 Smart Resizer Sync:', {
                widthChanged,
                heightChanged,
                depthChanged,
                oldWidth: module.width,
                newWidth: totalWidth,
                willLock: true
            });

            // Use width cascade for width updates (it handles space recalculation)
            if (widthChanged) {
                updateModuleWidthCascade(moduleId, totalWidth, piecesToSave);

                // Now lock the module so auto-layout respects this width
                setTimeout(() => {
                    toggleModuleFixed(moduleId);
                }, 100);
            } else {
                // Just update pieces if only height/depth changed
                updateModuleCustomPieces(moduleId, piecesToSave);
            }

            // TODO: When height/depth properties exist in module, update them here
            // For now they're only in pieces, but logging for future enhancement
            if (heightChanged) console.log(`📏 Height would update to: ${totalHeight}mm`);
            if (depthChanged) console.log(`📐 Depth would update to: ${totalDepth}mm`);

        } else if (structuralPieceChanged) {
            // === MANUAL EDIT PATH: Structural piece width edited directly in table ===
            const structuralPiece = piecesToSave.find(p => isStructuralPiece(p.name));
            if (structuralPiece) {
                const newModuleWidth = structuralPiece.finalWidth;
                updateModuleWidthCascade(moduleId, newModuleWidth, piecesToSave);

                console.log('✅ Manual Width Update:', {
                    moduleId,
                    oldWidth: module.width,
                    newWidth: newModuleWidth
                });
            }
        } else {
            // === NO DIMENSION CHANGE: Just update custom pieces ===
            updateModuleCustomPieces(moduleId, piecesToSave);
        }

        // 4. Replicate changes if requested
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
                        <div className="flex items-center gap-6">
                            {/* Cut Dimensions Switch */}
                            <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-2xl border border-slate-200 shadow-sm">
                                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${!showCutDimensions ? 'text-blue-600' : 'text-slate-400'}`}>Medida Final</span>
                                <button
                                    onClick={() => setShowCutDimensions(!showCutDimensions)}
                                    className={`relative w-12 h-6 rounded-full transition-colors flex items-center px-1 ${showCutDimensions ? 'bg-orange-500' : 'bg-slate-300'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${showCutDimensions ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${showCutDimensions ? 'text-orange-600' : 'text-slate-400'}`}>Medida Corte</span>
                            </div>

                            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition text-slate-400">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* ========== SMART RESIZER CONTROL BAR ========== */}
                    <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
                        <div className="flex items-center gap-2 mb-3">
                            <Maximize2 size={18} className="text-orange-600" />
                            <h3 className="text-sm font-black text-orange-800 uppercase tracking-wider">Control Maestro 3D</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Width Control */}
                            <div className="bg-white p-3 rounded-xl border-2 border-orange-200 shadow-sm">
                                <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
                                    Ancho Total
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={totalWidth}
                                        onChange={(e) => setTotalWidth(Number(e.target.value))}
                                        className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg text-lg font-black text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
                                        min="100"
                                    />
                                    <span className="text-xs font-bold text-slate-400">mm</span>
                                </div>
                                <button
                                    onClick={() => handleSmartResize('width', totalWidth)}
                                    disabled={isResizing}
                                    className="w-full mt-2 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-black uppercase hover:bg-orange-700 transition disabled:opacity-50"
                                >
                                    Aplicar
                                </button>
                            </div>

                            {/* Height Control */}
                            <div className="bg-white p-3 rounded-xl border-2 border-blue-200 shadow-sm">
                                <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
                                    Alto Total
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={totalHeight}
                                        onChange={(e) => setTotalHeight(Number(e.target.value))}
                                        className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg text-lg font-black text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                        min="100"
                                    />
                                    <span className="text-xs font-bold text-slate-400">mm</span>
                                </div>
                                <button
                                    onClick={() => handleSmartResize('height', totalHeight)}
                                    disabled={isResizing}
                                    className="w-full mt-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-black uppercase hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    Aplicar
                                </button>
                            </div>

                            {/* Depth Control */}
                            <div className="bg-white p-3 rounded-xl border-2 border-green-200 shadow-sm">
                                <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
                                    Profundidad
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={totalDepth}
                                        onChange={(e) => setTotalDepth(Number(e.target.value))}
                                        className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg text-lg font-black text-slate-900 focus:ring-2 focus:ring-green-500 outline-none"
                                        min="100"
                                    />
                                    <span className="text-xs font-bold text-slate-400">mm</span>
                                </div>
                                <button
                                    onClick={() => handleSmartResize('depth', totalDepth)}
                                    disabled={isResizing}
                                    className="w-full mt-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-black uppercase hover:bg-green-700 transition disabled:opacity-50"
                                >
                                    Aplicar
                                </button>
                            </div>
                        </div>

                        {/* Feedback Message */}
                        {resizeMessage && (
                            <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded-lg">
                                <p className="text-xs font-bold text-green-800 text-center">{resizeMessage}</p>
                            </div>
                        )}
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
                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-center">Cantos</th>
                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 italic">
                                        {pieces.map((piece, idx) => {
                                            const isChanged = changedPieceNames.includes(piece.name);
                                            const hasPair = PAIRED_PIECES[piece.name] !== undefined;

                                            // Real-time Cut Calculation
                                            const cutData = calculateCutDimensions(piece, edgeMaterials);

                                            return (
                                                <tr key={idx} className={`hover:bg-slate-50 transition-colors ${isChanged ? 'bg-orange-50/30' : ''}`}>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-slate-700">{piece.name}</span>
                                                            {hasPair && <Link2 size={12} className="text-blue-500" />}
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 font-medium">{piece.category}</p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {showCutDimensions ? (
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-black text-orange-600">{cutData.cutHeight} mm</span>
                                                                    {cutData.discounts.height > 0 && (
                                                                        <span className="text-[9px] bg-orange-100 text-orange-700 px-1 rounded">
                                                                            -{cutData.discounts.details.thickL1} / -{cutData.discounts.details.thickL2}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Final: {piece.finalHeight}</span>
                                                            </div>
                                                        ) : (
                                                            <input
                                                                type="number"
                                                                value={piece.finalHeight}
                                                                onChange={(e) => handlePieceChange(idx, 'finalHeight', parseFloat(e.target.value))}
                                                                className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                                            />
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {showCutDimensions ? (
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-black text-orange-600">{cutData.cutWidth} mm</span>
                                                                    {cutData.discounts.width > 0 && (
                                                                        <span className="text-[9px] bg-orange-100 text-orange-700 px-1 rounded">
                                                                            -{cutData.discounts.details.thickA1} / -{cutData.discounts.details.thickA2}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Final: {piece.finalWidth}</span>
                                                            </div>
                                                        ) : (
                                                            <input
                                                                type="number"
                                                                value={piece.finalWidth}
                                                                onChange={(e) => handlePieceChange(idx, 'finalWidth', parseFloat(e.target.value))}
                                                                className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                                            />
                                                        )}
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
                                                    <td className="px-4 py-3 text-center relative">
                                                        <button
                                                            onClick={() => setActiveEdgeSelectorIdx(activeEdgeSelectorIdx === idx ? null : idx)}
                                                            className={`p-2 rounded-xl border transition-all ${activeEdgeSelectorIdx === idx ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-500'}`}
                                                            title="Configurar Cantos Visualmente"
                                                        >
                                                            <div className="flex gap-0.5 items-center">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${piece.edgeL1Id || piece.edgeL2Id || piece.edgeA1Id || piece.edgeA2Id ? 'bg-orange-500' : 'bg-slate-300'}`} />
                                                                <Layers size={16} />
                                                            </div>
                                                        </button>

                                                        {activeEdgeSelectorIdx === idx && (
                                                            <div className="absolute right-full top-0 mr-4 z-[120] w-[300px] animate-in slide-in-from-right-4 duration-300">
                                                                <VisualEdgeSelector
                                                                    piece={piece}
                                                                    edgeMaterials={edgeMaterials}
                                                                    onUpdateEdge={(edgeId, matId) => handlePieceChange(idx, edgeId, matId)}
                                                                    boardMaterialName={piece.material || "Tablero"}
                                                                />
                                                            </div>
                                                        )}
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
