import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { ArrowLeft, Layers, Palette, Ruler, Info, Calculator } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

interface Material {
    id: string;
    name: string;
    type: 'BOARD' | 'EDGE' | 'HARDWARE';
    thickness: number;
    category: string;
}

export const Step5MaterialsEdges = () => {
    const {
        materialColor, boardThickness,
        edgeMaterialDoors, edgeMaterialStructure,
        plinthLength, countertopLength,
        setMaterialData, setEdgeMaterials, setExtraCosts,
        nextStep, prevStep
    } = useProjectStore();

    const [localColor, setLocalColor] = useState(materialColor);
    const [localThickness, setLocalThickness] = useState(boardThickness);
    const [localEdgeDoors, setLocalEdgeDoors] = useState<string | null>(edgeMaterialDoors);
    const [localEdgeStructure, setLocalEdgeStructure] = useState<string | null>(edgeMaterialStructure);
    const [localPlinth, setLocalPlinth] = useState(plinthLength);
    const [localCountertop, setLocalCountertop] = useState(countertopLength);
    const [edgeMaterials, setEdgeMaterialsState] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEdgeMaterials = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/materials`);
                if (res.data.success) {
                    const edges = res.data.items.filter((m: Material) => m.type === 'EDGE');
                    setEdgeMaterialsState(edges);

                    if (!edgeMaterialDoors && edges.length > 0) {
                        const defaultEdge = edges.find((m: Material) => m.name.toLowerCase().includes('2mm')) || edges[0];
                        setLocalEdgeDoors(defaultEdge.id);
                    }

                    if (!edgeMaterialStructure && edges.length > 0) {
                        const defaultStructure = edges.find((m: Material) => m.name.toLowerCase().includes('0.4mm')) || edges[0];
                        setLocalEdgeStructure(defaultStructure.id);
                    }
                }
            } catch (error) {
                console.error('Error fetching edge materials:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEdgeMaterials();
    }, []);

    useEffect(() => {
        setLocalColor(materialColor);
        setLocalThickness(boardThickness);
        setLocalEdgeDoors(edgeMaterialDoors);
        setLocalEdgeStructure(edgeMaterialStructure);
        setLocalPlinth(plinthLength);
        setLocalCountertop(countertopLength);
    }, [materialColor, boardThickness, edgeMaterialDoors, edgeMaterialStructure, plinthLength, countertopLength]);

    const materialOptions = ['Blanco Frost', 'Gris Grafito', 'Roble Americano', 'Nogal Terracota', 'Antracita'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!localEdgeDoors || !localEdgeStructure) {
            alert('⚠️ Por favor selecciona los materiales de canto antes de continuar.');
            return;
        }

        setMaterialData({ materialColor: localColor, boardThickness: localThickness as 15 | 18 });
        setEdgeMaterials({ edgeMaterialDoors: localEdgeDoors, edgeMaterialStructure: localEdgeStructure });
        setExtraCosts({ plinthLength: Number(localPlinth), countertopLength: Number(localCountertop) });
        nextStep();
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-center py-20">
                    <div className="text-slate-400 font-bold">Cargando materiales...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
                <button onClick={prevStep} className="p-2 hover:bg-slate-100 rounded-lg transition">
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <h2 className="text-2xl font-bold text-slate-800">Paso 5: Materiales y Cantos</h2>
            </div>
            <p className="text-slate-500 mb-8 ml-10">Configura la estética y el acabado técnico de la cocina.</p>

            <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                            <Palette size={18} className="text-blue-500" />
                            Melamina Principal
                        </label>
                        <select
                            className="w-full p-4 rounded-xl border bg-slate-50 font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition"
                            value={localColor}
                            onChange={(e) => {
                                setLocalColor(e.target.value);
                                setMaterialData({ materialColor: e.target.value, boardThickness: localThickness as 15 | 18 });
                            }}
                        >
                            {materialOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                            <Layers size={18} className="text-blue-500" />
                            Grosor del Tablero
                        </label>
                        <div className="flex gap-4">
                            {[15, 18].map(th => (
                                <button key={th} type="button"
                                    onClick={() => {
                                        setLocalThickness(th as 15 | 18);
                                        setMaterialData({ materialColor: localColor, boardThickness: th as 15 | 18 });
                                    }}
                                    className={`flex-1 py-4 rounded-xl border-2 font-bold transition ${localThickness === th ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}
                                >
                                    {th} mm
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <hr className="border-slate-100" />

                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-600 p-2 rounded-lg text-white">
                            <Ruler size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Configuración de Cantos (Data-Driven)</h3>
                            <p className="text-xs text-slate-500">Selecciona los materiales de canto desde la base de datos.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                🔲 FRENTES (Puertas y Cajones)
                            </label>
                            <select
                                className="w-full p-3 rounded-lg border bg-white font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={localEdgeDoors || ''}
                                onChange={(e) => {
                                    setLocalEdgeDoors(e.target.value);
                                    setEdgeMaterials({ edgeMaterialDoors: e.target.value, edgeMaterialStructure: localEdgeStructure });
                                }}
                            >
                                <option value="" disabled>Selecciona material...</option>
                                {edgeMaterials.map(mat => (
                                    <option key={mat.id} value={mat.id}>{mat.name} ({mat.thickness}mm)</option>
                                ))}
                            </select>
                            {localEdgeDoors && (
                                <div className="text-xs text-slate-500 mt-1">
                                    ✅ Grosor: <strong>{edgeMaterials.find(m => m.id === localEdgeDoors)?.thickness}mm</strong>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                🏗️ ESTRUCTURA (Visibles)
                            </label>
                            <select
                                className="w-full p-3 rounded-lg border bg-white font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={localEdgeStructure || ''}
                                onChange={(e) => {
                                    setLocalEdgeStructure(e.target.value);
                                    setEdgeMaterials({ edgeMaterialDoors: localEdgeDoors, edgeMaterialStructure: e.target.value });
                                }}
                            >
                                <option value="" disabled>Selecciona material...</option>
                                {edgeMaterials.map(mat => (
                                    <option key={mat.id} value={mat.id}>{mat.name} ({mat.thickness}mm)</option>
                                ))}
                                <option value="none">Ninguno (Sin canto)</option>
                            </select>
                            {localEdgeStructure && localEdgeStructure !== 'none' && (
                                <div className="text-xs text-slate-500 mt-1">
                                    ✅ Grosor: <strong>{edgeMaterials.find(m => m.id === localEdgeStructure)?.thickness}mm</strong>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400">
                        <Info size={12} />
                        Los grosores de canto se calculan dinámicamente desde la base de datos.
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Calculator size={20} className="text-slate-400" />
                        Costos y Accesorios Finales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600">Metros lineales de Zócalo (10cm alto)</label>
                            <div className="flex items-center gap-3">
                                <input type="number" className="grow p-3 rounded-lg border bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                    value={localPlinth}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setLocalPlinth(val);
                                        setExtraCosts({ plinthLength: val, countertopLength: localCountertop });
                                    }}
                                />
                                <span className="text-slate-400 font-bold">ml</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600">Metros lineales de Encimera (Meseta)</label>
                            <div className="flex items-center gap-3">
                                <input type="number" className="grow p-3 rounded-lg border bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                    value={localCountertop}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setLocalCountertop(val);
                                        setExtraCosts({ plinthLength: localPlinth, countertopLength: val });
                                    }}
                                />
                                <span className="text-slate-400 font-bold">ml</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 flex justify-between items-center border-t">
                    <button type="button" onClick={prevStep} className="text-slate-500 font-bold hover:text-slate-800 transition">
                        Volver a Configuración
                    </button>
                    <button type="submit"
                        className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-2xl shadow-blue-100 flex items-center gap-3"
                    >
                        CALCULAR PROYECTO
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-white/50">6</div>
                    </button>
                </div>
            </form>
        </div>
    );
};
