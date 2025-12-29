import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface Material {
    id: string;
    name: string;
    thickness: number;
    type: 'BOARD' | 'EDGE' | 'HARDWARE';
}

interface VisualEdgeSelectorProps {
    piece: any;
    edgeMaterials: Material[];
    onUpdateEdge: (edgeId: string, materialId: string | null) => void;
    boardMaterialName?: string;
}

export const VisualEdgeSelector: React.FC<VisualEdgeSelectorProps> = ({
    piece,
    edgeMaterials,
    onUpdateEdge,
    boardMaterialName = "Melamina"
}) => {
    const [activeEdge, setActiveEdge] = useState<string | null>(null);

    const getEdgeStyle = (materialId: string | null) => {
        if (!materialId) return "border-slate-200 border-dashed border-2";

        const material = edgeMaterials.find(m => m.id === materialId);
        if (!material) return "border-slate-200 border-dashed border-2";

        if (material.thickness >= 1) {
            return "border-orange-500 border-[5px]";
        }
        return "border-blue-500 border-[3px]";
    };

    const getEdgeLabel = (materialId: string | null) => {
        if (!materialId) return "Sin Canto";
        const material = edgeMaterials.find(m => m.id === materialId);
        return material ? material.name : "Sin Canto";
    };

    const edges = [
        { id: 'edgeL1Id', label: 'Largo Sup (L1)', position: 'top' },
        { id: 'edgeL2Id', label: 'Largo Inf (L2)', position: 'bottom' },
        { id: 'edgeA1Id', label: 'Ancho Izq (A1)', position: 'left' },
        { id: 'edgeA2Id', label: 'Ancho Der (A2)', position: 'right' }
    ];

    return (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">
                Configurador Visual de Cantos
            </h4>

            <div className="relative w-64 h-48 mx-auto bg-white rounded-lg shadow-sm border border-slate-100 flex items-center justify-center overflow-visible">
                {/* Board Surface */}
                <div className="text-center p-4">
                    <p className="text-[10px] font-black text-slate-300 uppercase italic leading-tight">Superficie</p>
                    <p className="text-sm font-bold text-slate-400">{boardMaterialName}</p>
                    <p className="text-[9px] font-mono text-slate-300 mt-1">{piece.finalHeight} x {piece.finalWidth} mm</p>
                </div>

                {/* Top Edge (L1) */}
                <button
                    onClick={() => setActiveEdge(activeEdge === 'edgeL1Id' ? null : 'edgeL1Id')}
                    className={`absolute -top-1 left-2 right-2 h-4 transition-all hover:scale-x-105 z-10 rounded-full flex items-center justify-center group ${getEdgeStyle(piece.edgeL1Id)}`}
                >
                    <span className="absolute -top-6 bg-slate-800 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        {getEdgeLabel(piece.edgeL1Id)}
                    </span>
                </button>

                {/* Bottom Edge (L2) */}
                <button
                    onClick={() => setActiveEdge(activeEdge === 'edgeL2Id' ? null : 'edgeL2Id')}
                    className={`absolute -bottom-1 left-2 right-2 h-4 transition-all hover:scale-x-105 z-10 rounded-full flex items-center justify-center group ${getEdgeStyle(piece.edgeL2Id)}`}
                >
                    <span className="absolute -bottom-6 bg-slate-800 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        {getEdgeLabel(piece.edgeL2Id)}
                    </span>
                </button>

                {/* Left Edge (A1) */}
                <button
                    onClick={() => setActiveEdge(activeEdge === 'edgeA1Id' ? null : 'edgeA1Id')}
                    className={`absolute top-2 bottom-2 -left-1 w-4 transition-all hover:scale-y-105 z-10 rounded-full flex items-center justify-center group ${getEdgeStyle(piece.edgeA1Id)}`}
                >
                    <span className="absolute -left-20 bg-slate-800 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        {getEdgeLabel(piece.edgeA1Id)}
                    </span>
                </button>

                {/* Right Edge (A2) */}
                <button
                    onClick={() => setActiveEdge(activeEdge === 'edgeA2Id' ? null : 'edgeA2Id')}
                    className={`absolute top-2 bottom-2 -right-1 w-4 transition-all hover:scale-y-105 z-10 rounded-full flex items-center justify-center group ${getEdgeStyle(piece.edgeA2Id)}`}
                >
                    <span className="absolute -right-20 bg-slate-800 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        {getEdgeLabel(piece.edgeA2Id)}
                    </span>
                </button>

                {/* Selection Dropdown */}
                {activeEdge && (
                    <div className="absolute inset-x-0 bottom-full mb-4 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-2 min-w-[200px] animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="flex justify-between items-center mb-2 px-2">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase italic">
                                {edges.find(e => e.id === activeEdge)?.label}
                            </h5>
                            <button onClick={() => setActiveEdge(null)} className="text-slate-400 hover:text-red-500">
                                <X size={14} />
                            </button>
                        </div>
                        <div className="max-h-40 overflow-auto space-y-1 custom-scrollbar">
                            <button
                                onClick={() => { onUpdateEdge(activeEdge, null); setActiveEdge(null); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition flex justify-between items-center ${!piece[activeEdge] ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                Sin Canto
                                {!piece[activeEdge] && <Check size={12} />}
                            </button>
                            {edgeMaterials.map(mat => (
                                <button
                                    key={mat.id}
                                    onClick={() => { onUpdateEdge(activeEdge, mat.id); setActiveEdge(null); }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition flex justify-between items-center ${piece[activeEdge] === mat.id ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <span className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${mat.thickness >= 1 ? 'bg-orange-500' : 'bg-blue-500'}`} />
                                        {mat.name} ({mat.thickness}mm)
                                    </span>
                                    {piece[activeEdge] === mat.id && <Check size={12} />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-blue-500 rounded-full" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Canto Delgado</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-orange-500 rounded-full" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Canto Grueso</span>
                </div>
            </div>
        </div>
    );
};
