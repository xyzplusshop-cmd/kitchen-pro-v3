import React, { useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { ArrowLeft, Flame, Waves } from 'lucide-react';

export const Step2_5Appliances = () => {
    const {
        hasStove, stoveWidth, hasSink, sinkWidth, stoveHoodMode, hoodWidth,
        setApplianceData, nextStep, prevStep
    } = useProjectStore();

    const [localHasStove, setLocalHasStove] = useState(hasStove);
    const [localStoveWidth, setLocalStoveWidth] = useState(stoveWidth);
    const [localStoveHoodMode, setLocalStoveHoodMode] = useState(stoveHoodMode);
    const [localHoodWidth, setLocalHoodWidth] = useState(hoodWidth);
    const [localHasSink, setLocalHasSink] = useState(hasSink);
    const [localSinkWidth, setLocalSinkWidth] = useState(sinkWidth);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setApplianceData({
            hasStove: localHasStove,
            stoveWidth: localStoveWidth as 600 | 750,
            hasSink: localHasSink,
            sinkWidth: Number(localSinkWidth),
            stoveHoodMode: localStoveHoodMode,
            hoodWidth: Number(localHoodWidth)
        });
        nextStep();
    };

    return (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
                <button onClick={prevStep} className="p-2 hover:bg-slate-100 rounded-lg transition">
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <h2 className="text-2xl font-bold text-slate-800">Paso 2.5: Electrodomésticos</h2>
            </div>
            <p className="text-slate-500 mb-8 ml-10">Define los equipos que reservarán espacio en tu pared.</p>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Estufa */}
                <div className={`p-6 rounded-xl border-2 transition-all ${localHasStove ? 'border-orange-200 bg-orange-50' : 'border-slate-100 bg-white'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${localHasStove ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                <Flame size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Estufa / Cocina</h3>
                                <p className="text-xs text-slate-500">Espacio de hueco fijo en zona baja</p>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            className="w-6 h-6 rounded-md accent-orange-500"
                            checked={localHasStove}
                            onChange={(e) => setLocalHasStove(e.target.checked)}
                        />
                    </div>

                    {localHasStove && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                            {/* Selector de Ancho de Estufa */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-600">Ancho de la Estufa</label>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLocalStoveWidth(600);
                                            if (localStoveHoodMode === 'GAP') setLocalHoodWidth(600);
                                        }}
                                        className={`flex-1 py-3 rounded-lg font-bold border-2 transition ${localStoveWidth === 600 ? 'border-orange-500 bg-orange-500 text-white' : 'border-orange-200 text-orange-600 bg-white'}`}
                                    >
                                        60 cm (600mm)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLocalStoveWidth(750);
                                            if (localStoveHoodMode === 'GAP') setLocalHoodWidth(750);
                                        }}
                                        className={`flex-1 py-3 rounded-lg font-bold border-2 transition ${localStoveWidth === 750 ? 'border-orange-500 bg-orange-500 text-white' : 'border-orange-200 text-orange-600 bg-white'}`}
                                    >
                                        75 cm (750mm)
                                    </button>
                                </div>
                            </div>

                            {/* Selector de Configuración Aérea (Campana) */}
                            <div className="space-y-3 bg-white p-4 rounded-xl border border-orange-100">
                                <label className="text-sm font-black text-orange-800 uppercase tracking-tight">Zona Aérea Superior (Campana)</label>
                                <div className="grid grid-cols-1 gap-2">
                                    <label className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${localStoveHoodMode === 'GAP' ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-orange-200'}`}>
                                        <input
                                            type="radio" name="hoodMode" className="mt-1 accent-orange-500"
                                            checked={localStoveHoodMode === 'GAP'}
                                            onChange={() => {
                                                setLocalStoveHoodMode('GAP');
                                                setLocalHoodWidth(localStoveWidth);
                                            }}
                                        />
                                        <div>
                                            <p className="font-bold text-sm text-slate-800">Opción A: Hueco Simétrico (Default)</p>
                                            <p className="text-[10px] text-slate-500">Resta arriba el mismo ancho de la estufa ({localStoveWidth}mm).</p>
                                        </div>
                                    </label>

                                    <label className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${localStoveHoodMode === 'CUSTOM_GAP' ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-orange-200'}`}>
                                        <input
                                            type="radio" name="hoodMode" className="mt-1 accent-orange-500"
                                            checked={localStoveHoodMode === 'CUSTOM_GAP'}
                                            onChange={() => setLocalStoveHoodMode('CUSTOM_GAP')}
                                        />
                                        <div className="flex-1">
                                            <p className="font-bold text-sm text-slate-800">Opción B: Hueco Personalizado</p>
                                            <p className="text-[10px] text-slate-500 mb-2">Para campanas decorativas más anchas.</p>
                                            {localStoveHoodMode === 'CUSTOM_GAP' && (
                                                <div className="flex items-center gap-2 animate-in zoom-in-95 duration-200">
                                                    <input
                                                        type="number"
                                                        placeholder="Ancho (mm)"
                                                        className="w-full px-3 py-1 border rounded bg-white font-bold text-sm focus:ring-2 focus:ring-orange-200 outline-none"
                                                        value={localHoodWidth}
                                                        onChange={(e) => setLocalHoodWidth(Number(e.target.value))}
                                                    />
                                                    <span className="text-xs font-bold text-slate-400">mm</span>
                                                </div>
                                            )}
                                        </div>
                                    </label>

                                    <label className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${localStoveHoodMode === 'BUILT_IN_MODULE' ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-orange-200'}`}>
                                        <input
                                            type="radio" name="hoodMode" className="mt-1 accent-orange-500"
                                            checked={localStoveHoodMode === 'BUILT_IN_MODULE'}
                                            onChange={() => setLocalStoveHoodMode('BUILT_IN_MODULE')}
                                        />
                                        <div>
                                            <p className="font-bold text-sm text-slate-800">Opción C: Campana Empotrada (Mueble)</p>
                                            <p className="text-[10px] text-slate-500">Inserta automáticamente un "Mueble Campana" arriba.</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Lavaplatos */}
                <div className={`p-6 rounded-xl border-2 transition-all ${localHasSink ? 'border-blue-200 bg-blue-50' : 'border-slate-100 bg-white'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${localHasSink ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                <Waves size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Lavaplatos / Fregadero</h3>
                                <p className="text-xs text-slate-500">Espacio de hueco fijo</p>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            className="w-6 h-6 rounded-md accent-blue-500"
                            checked={localHasSink}
                            onChange={(e) => setLocalHasSink(e.target.checked)}
                        />
                    </div>

                    {localHasSink && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <label className="text-sm font-semibold text-slate-600">Ancho del Lavaplatos (mm)</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                    value={localSinkWidth}
                                    onChange={(e) => setLocalSinkWidth(Number(e.target.value))}
                                    min="400"
                                    max="1200"
                                />
                                <span className="text-slate-400 font-bold">mm</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-slate-900 transition shadow-xl"
                    >
                        Confirmar y Ver Catálogo
                    </button>
                </div>
            </form>
        </div>
    );
};
