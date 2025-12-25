import React, { useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { ArrowLeft, Layers, Palette, Ruler, Info, Calculator } from 'lucide-react';

export const Step5MaterialsEdges = () => {
    const {
        materialColor, boardThickness,
        edgeRuleDoors, edgeRuleVisible, edgeRuleInternal,
        plinthLength, countertopLength,
        setMaterialData, setEdgeRules, setExtraCosts,
        nextStep, prevStep
    } = useProjectStore();

    const [localColor, setLocalColor] = useState(materialColor);
    const [localThickness, setLocalThickness] = useState(boardThickness);

    const [localEdgeDoors, setLocalEdgeDoors] = useState(edgeRuleDoors);
    const [localEdgeVisible, setLocalEdgeVisible] = useState(edgeRuleVisible);
    const [localEdgeInternal, setLocalEdgeInternal] = useState(edgeRuleInternal);

    const [localPlinth, setLocalPlinth] = useState(plinthLength);
    const [localCountertop, setLocalCountertop] = useState(countertopLength);

    const materialOptions = [
        'Blanco Frost', 'Gris Grafito', 'Roble Americano', 'Nogal Terracota', 'Antracita'
    ];

    const edgeOptions = [
        'Ninguno', 'PVC 0.4mm', 'PVC 2mm', 'Melamínico'
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMaterialData({ materialColor: localColor, boardThickness: localThickness as 15 | 18 });
        setEdgeRules({
            edgeRuleDoors: localEdgeDoors,
            edgeRuleVisible: localEdgeVisible,
            edgeRuleInternal: localEdgeInternal
        });
        setExtraCosts({
            plinthLength: Number(localPlinth),
            countertopLength: Number(localCountertop)
        });
        nextStep();
    };

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

                {/* 1. Selección de Material */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                            <Palette size={18} className="text-blue-500" />
                            Melamina Principal
                        </label>
                        <select
                            className="w-full p-4 rounded-xl border bg-slate-50 font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition"
                            value={localColor}
                            onChange={(e) => setLocalColor(e.target.value)}
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
                                <button
                                    key={th}
                                    type="button"
                                    onClick={() => setLocalThickness(th as 15 | 18)}
                                    className={`flex-1 py-4 rounded-xl border-2 font-bold transition ${localThickness === th
                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                            : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                                        }`}
                                >
                                    {th} mm
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <hr className="border-slate-100" />

                {/* 2. Matriz de Cantos (Lógica Anti-Repetición) */}
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-600 p-2 rounded-lg text-white">
                            <Ruler size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Matriz de Cantos Inteligente</h3>
                            <p className="text-xs text-slate-500">Define una regla y el sistema la aplica a todas las piezas.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">A. Puertas y Frentes</label>
                            <select
                                className="w-full p-3 rounded-lg border bg-white font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={localEdgeDoors}
                                onChange={(e) => setLocalEdgeDoors(e.target.value)}
                            >
                                {edgeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">B. Estructura Visible</label>
                            <select
                                className="w-full p-3 rounded-lg border bg-white font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={localEdgeVisible}
                                onChange={(e) => setLocalEdgeVisible(e.target.value)}
                            >
                                {edgeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">C. Estructura Interna</label>
                            <select
                                className="w-full p-3 rounded-lg border bg-white font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={localEdgeInternal}
                                onChange={(e) => setLocalEdgeInternal(e.target.value)}
                            >
                                {edgeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400">
                        <Info size={12} />
                        El sistema aplicará "Estructura Visible" a los frontales de laterales y piezas expuestas.
                    </div>
                </div>

                {/* 3. Costos Adicionales */}
                <div className="space-y-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Calculator size={20} className="text-slate-400" />
                        Costos y Accesorios Finales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600">Metros lineales de Zócalo (10cm alto)</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    className="grow p-3 rounded-lg border bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                    value={localPlinth}
                                    onChange={(e) => setLocalPlinth(Number(e.target.value))}
                                />
                                <span className="text-slate-400 font-bold">ml</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600">Metros lineales de Encimera (Meseta)</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    className="grow p-3 rounded-lg border bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                    value={localCountertop}
                                    onChange={(e) => setLocalCountertop(Number(e.target.value))}
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
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-2xl shadow-blue-100 flex items-center gap-3"
                    >
                        CALCULAR PROYECTO
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-white/50">
                            6
                        </div>
                    </button>
                </div>

            </form>
        </div>
    );
};
