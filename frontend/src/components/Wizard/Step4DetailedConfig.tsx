import { useEffect, useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { ArrowLeft, Check, ChevronRight, Settings2, Box, Info, Cpu } from 'lucide-react';

export const Step4DetailedConfig = () => {
    const {
        modules, updateModule, nextStep, prevStep,
        doorInstallationType, hardwareCatalog, fetchHardware
    } = useProjectStore();

    useEffect(() => {
        if (hardwareCatalog.length === 0) {
            fetchHardware();
        }
    }, []);
    const [selectedModuleId, setSelectedModuleId] = useState(modules[0]?.id || '');

    const selectedModule = modules.find(m => m.id === selectedModuleId);
    const moduleIndex = modules.findIndex(m => m.id === selectedModuleId);

    // Filtrado Inteligente de Herrajes
    const filteredHinges = hardwareCatalog.filter(h =>
        h.category === 'BISAGRA' && h.compatibility.includes(doorInstallationType)
    );

    const filteredSliders = hardwareCatalog.filter(s =>
        s.category === 'CORREDERA'
    ); // Aquí se podría filtrar por "INSET_DRAWER" si el cajón fuera interno

    if (modules.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                <p className="text-slate-500">No hay módulos para configurar. Regresa al catálogo.</p>
                <button onClick={prevStep} className="mt-4 text-blue-600 font-bold">Volver al Paso 3</button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Lista Lateral de Navegación */}
            <div className="lg:col-span-1 space-y-3">
                <h3 className="font-bold text-slate-800 mb-4 px-2">Módulos en Pared</h3>
                {modules.map((m, idx) => (
                    <button
                        key={m.id}
                        onClick={() => setSelectedModuleId(m.id)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition text-left ${selectedModuleId === m.id
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-white bg-white hover:border-slate-200'
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${selectedModuleId === m.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                            {idx + 1}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <span className="block font-bold text-slate-700 truncate">{m.type}</span>
                            <span className="text-[10px] text-slate-500 uppercase">{m.width}mm</span>
                        </div>
                        {selectedModuleId === m.id && <ChevronRight size={16} className="text-blue-600" />}
                    </button>
                ))}
            </div>

            {/* Panel de Configuración */}
            <div className="lg:col-span-3 space-y-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                    {/* Decoración Visual */}
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Settings2 size={120} />
                    </div>

                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div>
                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                                <Box size={18} />
                                <span className="text-xs font-bold uppercase tracking-wider">Módulo {moduleIndex + 1} de {modules.length}</span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-800">
                                {selectedModule?.type} - {selectedModule?.width}mm
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Sección A: Frente y Distribución */}
                        <div className="space-y-6">
                            <h4 className="font-bold text-slate-600 border-b pb-2 flex items-center gap-2">
                                <Check size={16} className="text-green-500" />
                                Estructura Frontal
                            </h4>

                            {/* Lógica Dinámica por Tipo */}
                            {selectedModule?.type !== 'DRAWER' && (
                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-slate-700">Cantidad de Puertas</label>
                                    <div className="flex gap-3">
                                        {[1, 2].map(num => (
                                            <button
                                                key={num}
                                                disabled={selectedModule?.type === 'SINK_BASE' && num === 1}
                                                onClick={() => updateModule(selectedModuleId, { doorCount: num })}
                                                className={`flex-1 py-3 rounded-lg border-2 font-bold transition ${selectedModule?.doorCount === num
                                                    ? 'border-blue-500 bg-blue-600 text-white'
                                                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                                                    }`}
                                            >
                                                {num} {num === 1 ? 'Puerta' : 'Puertas'}
                                            </button>
                                        ))}
                                    </div>
                                    {selectedModule?.type === 'SINK_BASE' && (
                                        <p className="text-[10px] text-orange-500 flex items-center gap-1">
                                            <Info size={12} /> Fregadero requiere 2 puertas por estándar.
                                        </p>
                                    )}
                                </div>
                            )}

                            {(selectedModule?.type === 'BASE' || selectedModule?.type === 'DRAWER') && (
                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-slate-700">Cantidad de Gavetas</label>
                                    <div className="flex gap-2">
                                        {[0, 1, 2, 3].filter(n => selectedModule?.type === 'DRAWER' ? n > 0 : true).map(num => (
                                            <button
                                                key={num}
                                                onClick={() => updateModule(selectedModuleId, { drawerCount: num })}
                                                className={`flex-1 py-3 rounded-lg border-2 font-bold transition ${selectedModule?.drawerCount === num
                                                    ? 'border-blue-500 bg-blue-600 text-white'
                                                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                                                    }`}
                                            >
                                                {num === 0 ? 'Sin gavetas' : num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sección B: Herrajes */}
                        <div className="space-y-6">
                            <h4 className="font-bold text-slate-600 border-b pb-2 flex items-center gap-2">
                                <Settings2 size={16} className="text-blue-500" />
                                Herrajes y Apertura
                            </h4>

                            {(selectedModule?.doorCount || 0) > 0 && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Bisagras Inteligentes</label>
                                        <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-black italic">
                                            <Cpu size={10} /> AUTO-FILTER: {doorInstallationType}
                                        </div>
                                    </div>
                                    <select
                                        className="w-full p-3 rounded-lg border bg-slate-50 font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={selectedModule?.hingeId || ''}
                                        onChange={(e) => {
                                            const item = filteredHinges.find(h => h.id === e.target.value);
                                            updateModule(selectedModuleId, {
                                                hingeId: e.target.value,
                                                hingeType: item?.name || 'Estándar'
                                            });
                                        }}
                                    >
                                        <option value="">Selecciona Herraje...</option>
                                        {filteredHinges.map(h => (
                                            <option key={h.id} value={h.id}>
                                                {h.name} {h.brand ? `(${h.brand})` : ''} - ${h.price.toLocaleString()}
                                            </option>
                                        ))}

                                    </select>
                                    {filteredHinges.length === 0 && (
                                        <p className="text-[10px] text-red-500 font-bold">⚠️ No hay bisagras compatibles con {doorInstallationType}</p>
                                    )}
                                </div>
                            )}

                            {(selectedModule?.drawerCount || 0) > 0 && (
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Sistema de Correderas</label>
                                    <select
                                        className="w-full p-3 rounded-lg border bg-slate-50 font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={selectedModule?.sliderId || ''}
                                        onChange={(e) => {
                                            const item = filteredSliders.find(s => s.id === e.target.value);
                                            updateModule(selectedModuleId, {
                                                sliderId: e.target.value,
                                                sliderType: item?.name || 'Estándar'
                                            });
                                        }}
                                    >
                                        <option value="">Selecciona Corredera...</option>
                                        {filteredSliders.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} - ${s.price.toLocaleString()}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Sección C: Estructura Trasera (Módulos Base/Aéreos/Torres) */}
                            {(selectedModule?.category === 'BASE' || selectedModule?.category === 'WALL' || selectedModule?.category === 'TOWER') && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Configuración de Trasera</label>
                                    <div className="flex gap-2">
                                        {[
                                            { id: 'INSET', label: 'Embutido' },
                                            { id: 'NAILED', label: 'Clavado' },
                                            { id: 'GROOVED', label: 'Ranurado' }
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => updateModule(selectedModuleId, { backMountingType: opt.id as any })}
                                                className={`flex-1 py-2 rounded-lg border-2 font-bold text-[10px] transition ${(selectedModule?.backMountingType || 'INSET') === opt.id
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>

                                    {(selectedModule?.backMountingType === 'GROOVED') && (
                                        <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Cejilla (Ranura mm)</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                                                    value={selectedModule?.grooveDepth ?? 9}
                                                    onChange={(e) => updateModule(selectedModuleId, { grooveDepth: Number(e.target.value) })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Aire (Pared mm)</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                                                    value={selectedModule?.rearGap ?? 18}
                                                    onChange={(e) => updateModule(selectedModuleId, { rearGap: Number(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Representación 2D Simple (Placeholder Iconográfico) */}
                            <div className="mt-8 pt-8 border-t border-dashed">
                                <div className="w-full h-32 bg-slate-100 rounded-xl flex items-center justify-center border-2 border-slate-200 text-slate-400">
                                    <div className="text-center">
                                        <Box size={32} className="mx-auto mb-2 opacity-50" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Esquema 2D de Frente</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex justify-between items-center pt-6 border-t">
                        <button onClick={prevStep} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition">
                            <ArrowLeft size={18} />
                            Volver al Catálogo
                        </button>
                        <button
                            onClick={nextStep}
                            className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-100"
                        >
                            Finalizar Configuración
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
