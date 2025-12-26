import { useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { ArrowLeft, Plus, Trash2, Info, Lock, Unlock, Settings2, Layout, LayoutGrid, Layers } from 'lucide-react';

export const Step3ModuleSelection = () => {
    const {
        linearLength, hasStove, stoveWidth, hasSink, sinkWidth, stoveHoodMode, hoodWidth,
        modules, addModule, removeModule, toggleModuleFixed, updateModuleWidth,
        getRemainingSpace, nextStep, prevStep
    } = useProjectStore();

    const [activeTab, setActiveTab] = useState<'TOWER' | 'BASE' | 'WALL'>('BASE');

    const catalog = [
        // CATEGORIA TORRE
        { type: 'TOWER', name: 'Despensa / Torre', defaultWidth: 600, category: 'TOWER' },
        { type: 'TOWER_FRIDGE', name: 'Espacio Nevera', defaultWidth: 800, category: 'TOWER' },
        // CATEGORIA BAJA
        { type: 'BASE', name: 'Módulo Base', defaultWidth: 600, category: 'BASE' },
        { type: 'DRAWER', name: 'Gavetero', defaultWidth: 600, category: 'BASE' },
        { type: 'MUEBLE_FREGADERO', name: 'Mueble Fregadero', defaultWidth: 800, category: 'BASE' },
        // CATEGORIA AEREA
        { type: 'WALL', name: 'Alacena Aérea', defaultWidth: 600, category: 'WALL' },
        { type: 'WALL_OPEN', name: 'Repisa Abierta', defaultWidth: 600, category: 'WALL' },
        { type: 'MUEBLE_CAMPANA', name: 'Mueble Campana', defaultWidth: 600, category: 'WALL' },
    ];

    const handleAddModule = (item: any) => {
        addModule({
            type: item.type,
            category: item.category,
            width: item.defaultWidth,
            isFixed: item.type === 'MUEBLE_CAMPANA' // El mueble campana nace fijo
        });
    };

    const remainingSpace = getRemainingSpace(activeTab);

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Columna Izquierda: Catálogo y Pestañas */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit sticky top-8">
                <div className="flex flex-col gap-2 mb-6 bg-slate-100 p-1.5 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('TOWER')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${activeTab === 'TOWER' ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <Layers size={16} /> 1. TORRES
                    </button>
                    <button
                        onClick={() => setActiveTab('BASE')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${activeTab === 'BASE' ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <LayoutGrid size={16} /> 2. ZONA BAJA
                    </button>
                    <button
                        onClick={() => setActiveTab('WALL')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${activeTab === 'WALL' ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <Layout size={16} /> 3. ZONA AÉREA
                    </button>
                </div>

                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Plus size={18} className="text-blue-600" />
                    Catálogo: {activeTab === 'TOWER' ? 'Torres' : activeTab === 'BASE' ? 'Bajos' : 'Aéreos'}
                </h3>

                <div className="space-y-3">
                    {catalog.filter(i => i.category === activeTab).map(item => (
                        <button
                            key={item.type}
                            onClick={() => handleAddModule(item)}
                            className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition group"
                        >
                            <div className="text-left">
                                <span className="block font-bold text-slate-700 group-hover:text-blue-700">{item.name}</span>
                                <span className="text-xs text-slate-500">{item.type === 'MUEBLE_CAMPANA' ? 'Ancho Fijo' : 'Auto-ajustable'}</span>
                            </div>
                            <Plus size={18} className="text-slate-400 group-hover:text-blue-500" />
                        </button>
                    ))}
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Info size={14} /> Espacio Disponible
                    </h4>
                    <p className="text-xl font-black text-blue-700 leading-relaxed">
                        {remainingSpace}mm
                    </p>
                    <p className="text-[10px] text-blue-500 leading-relaxed mt-1">
                        {activeTab === 'BASE' && "Calculado restando Torres y Equipos."}
                        {activeTab === 'WALL' && "Calculado restando Torres y Campana."}
                        {activeTab === 'TOWER' && "Calculado restando Torres fijas."}
                    </p>
                </div>
            </div>

            {/* Columna Central/Derecha: Configuración de Pared */}
            <div className="lg:col-span-3 space-y-6">
                <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl -mr-32 -mt-32 rounded-full"></div>

                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div className="flex items-center gap-4">
                            <button onClick={prevStep} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition border border-slate-700">
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight uppercase italic font-serif">Ajuste de Composición</h2>
                                <p className="text-slate-400 text-sm">Longitud Total: {linearLength}mm</p>
                            </div>
                        </div>
                    </div>

                    {/* REGLA VISUAL DE DOBLE NIVEL */}
                    <div className="space-y-4">
                        {/* NIVEL SUPERIOR (AÉREO) */}
                        <div className="relative h-16 bg-slate-800/50 rounded-xl border border-slate-700 flex items-center px-4">
                            <div className="flex w-full h-full items-center justify-stretch">
                                {hasStove && (stoveHoodMode === 'GAP' || stoveHoodMode === 'CUSTOM_GAP') && (
                                    <div
                                        className="bg-orange-500/10 border-2 border-dashed border-orange-500/30 h-[80%] rounded-lg flex items-center justify-center text-[7px] font-black text-orange-500/50 uppercase"
                                        style={{ width: `${((stoveHoodMode === 'GAP' ? stoveWidth : hoodWidth) / linearLength) * 100}%` }}
                                    >
                                        HUECO CAMPANA
                                    </div>
                                )}
                                {modules.filter(m => m.category === 'WALL' || m.category === 'TOWER').map((m) => (
                                    <div
                                        key={m.id}
                                        className={`h-[80%] rounded-lg flex items-center justify-center text-[8px] font-black border flex-grow mx-0.5 transition-all ${m.category === 'TOWER' ? 'bg-slate-700 border-slate-500 opacity-50' : 'bg-blue-600/30 border-blue-500/50 text-blue-400'}`}
                                        style={{ width: `${(m.width / linearLength) * 100}%`, flexBasis: `${(m.width / linearLength) * 100}%` }}
                                    >
                                        {m.type === 'MUEBLE_CAMPANA' ? 'CAMPANA' : m.width}
                                    </div>
                                ))}
                            </div>
                            <span className="absolute -right-16 text-[9px] font-black text-slate-600 uppercase">SUPERIOR</span>
                        </div>

                        {/* NIVEL INFERIOR (BAJO) */}
                        <div className="relative h-16 bg-slate-800 rounded-xl border-2 border-slate-700 flex items-center px-4 shadow-inner">
                            <div className="flex w-full h-full items-center justify-stretch">
                                {hasStove && <div className="bg-orange-500/20 border-2 border-orange-500/50 h-[80%] rounded-lg flex items-center justify-center text-[8px] font-black text-white bg-orange-500 flex-grow mx-0.5" style={{ width: `${(stoveWidth / linearLength) * 100}%`, flexBasis: `${(stoveWidth / linearLength) * 100}%` }}>ESTUFA</div>}
                                {hasSink && <div className="bg-cyan-500/20 border-2 border-cyan-500/50 h-[80%] rounded-lg flex items-center justify-center text-[8px] font-black text-white bg-cyan-500 flex-grow mx-0.5" style={{ width: `${(sinkWidth / linearLength) * 100}%`, flexBasis: `${(sinkWidth / linearLength) * 100}%` }}>FREGADERO</div>}
                                {modules.filter(m => m.category === 'BASE' || m.category === 'TOWER').map((m) => (
                                    <div
                                        key={m.id}
                                        className={`h-[80%] rounded-lg flex items-center justify-center text-[8px] font-black border flex-grow mx-0.5 transition-all ${m.category === 'TOWER' ? 'bg-white text-slate-900 border-white' : 'bg-blue-600/60 border-blue-400 text-white'}`}
                                        style={{ width: `${(m.width / linearLength) * 100}%`, flexBasis: `${(m.width / linearLength) * 100}%` }}
                                    >
                                        {m.width}
                                    </div>
                                ))}
                            </div>
                            <span className="absolute -right-16 text-[9px] font-black text-slate-600 uppercase">INFERIOR</span>
                        </div>
                    </div>
                </div>

                {/* Lista Detallada de Módulos (Filtrada por Pestaña) */}
                <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest pl-2">Módulos en la Zona {activeTab}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modules.filter(m => m.category === activeTab).map((m) => (
                        <div
                            key={m.id}
                            className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${m.isFixed ? 'border-slate-200 bg-white shadow-sm' : 'border-blue-100 bg-blue-50/30'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${m.isFixed ? 'bg-slate-100' : 'bg-blue-100'}`}>
                                    <Settings2 size={20} className={m.isFixed ? 'text-slate-600' : 'text-blue-600'} />
                                </div>
                                <div>
                                    <h4 className={`font-bold text-slate-800 text-sm ${!m.isFixed ? 'text-blue-700 italic' : ''}`}>{m.type.replace('_', ' ')}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        {m.isFixed ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={m.width}
                                                    onChange={(e) => updateModuleWidth(m.id, Number(e.target.value))}
                                                    className="w-20 px-2 py-1 border-2 border-slate-200 rounded-lg text-xs font-black outline-none text-slate-900"
                                                />
                                                <span className="text-[10px] font-black text-slate-400">mm Fijo</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-blue-600 font-black text-xl italic">{m.width}</span>
                                                <span className="text-[10px] font-bold text-blue-400 uppercase">mm Auto</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleModuleFixed(m.id)}
                                    className={`p-2 rounded-lg border transition ${m.isFixed ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}
                                >
                                    {m.isFixed ? <Lock size={16} /> : <Unlock size={16} />}
                                </button>
                                <button
                                    onClick={() => removeModule(m.id)}
                                    className="p-2 bg-white border border-slate-200 text-red-400 rounded-lg transition"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-slate-900 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-white">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Resumen General</p>
                        <p className="text-xl font-black">
                            {modules.length} Módulos <span className="text-blue-400">Configurados</span>
                        </p>
                    </div>
                    <button
                        onClick={nextStep}
                        disabled={modules.length === 0}
                        className="px-12 py-5 bg-white text-slate-900 rounded-2xl font-black hover:bg-blue-400 hover:text-white transition shadow-2xl flex items-center gap-3 uppercase tracking-wider text-sm"
                    >
                        Configurar Herrajes
                        <Plus size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
