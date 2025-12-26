import { useProjectStore } from '../../store/useProjectStore';
import { ArrowLeft, Plus, Trash2, Info, Lock, Unlock, Settings2 } from 'lucide-react';

export const Step3ModuleSelection = () => {
    const {
        linearLength, hasStove, stoveWidth, hasSink, sinkWidth,
        modules, addModule, removeModule, toggleModuleFixed, updateModuleWidth,
        nextStep, prevStep
    } = useProjectStore();

    // --- LÓGICA DE CÁLCULO AUTO-FIT PRO ---
    const fixedSpace = (hasStove ? stoveWidth : 0) + (hasSink ? sinkWidth : 0) +
        modules.filter(m => m.isFixed).reduce((acc, m) => acc + m.width, 0);

    const elasticModules = modules.filter(m => !m.isFixed);
    const elasticCount = elasticModules.length;

    const remainingSpace = Math.max(0, linearLength - fixedSpace);
    const elasticWidth = elasticCount > 0 ? Math.floor(remainingSpace / elasticCount) : 0;

    // El último módulo elástico se lleva el residuo para que la suma sea exacta
    const lastElasticIndex = [...modules].reverse().findIndex(m => !m.isFixed);
    const actualLastElasticIndex = lastElasticIndex !== -1 ? (modules.length - 1 - lastElasticIndex) : -1;

    const getModuleWidth = (m: any, index: number) => {
        if (m.isFixed) return m.width;
        if (index === actualLastElasticIndex) {
            const otherElasticsWidth = (elasticCount - 1) * elasticWidth;
            return remainingSpace - otherElasticsWidth;
        }
        return elasticWidth;
    };

    const catalog = [
        { type: 'BASE', name: 'Módulo Base', defaultWidth: 600 },
        { type: 'WALL', name: 'Módulo Aéreo', defaultWidth: 600 },
        { type: 'DRAWER', name: 'Gavetero', defaultWidth: 600 },
        { type: 'SINK_BASE', name: 'Módulo Fregadero', defaultWidth: 800 },
    ];

    const handleAddModule = (item: any) => {
        addModule({
            type: item.type,
            width: item.defaultWidth,
            isFixed: false // Por defecto los nuevos son elásticos
        });
    };

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Columna Izquierda: Catálogo */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit sticky top-8">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Plus size={18} className="text-blue-600" />
                    Catálogo de Módulos
                </h3>
                <div className="space-y-3">
                    {catalog.map(item => (
                        <button
                            key={item.type}
                            onClick={() => handleAddModule(item)}
                            className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition group"
                        >
                            <div className="text-left">
                                <span className="block font-bold text-slate-700 group-hover:text-blue-700">{item.name}</span>
                                <span className="text-xs text-slate-500">Auto-ajustable</span>
                            </div>
                            <Plus size={18} className="text-slate-400 group-hover:text-blue-500" />
                        </button>
                    ))}
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Info size={14} /> Modo Auto-Fit Pro
                    </h4>
                    <p className="text-xs text-blue-700 leading-relaxed">
                        Los módulos sin candado se reparten equitativamente el espacio sobrante ({remainingSpace}mm).
                    </p>
                </div>
            </div>

            {/* Columna Central/Derecha: Configuración de Pared */}
            <div className="lg:col-span-3 space-y-6">
                <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                    {/* Background decorativo */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl -mr-32 -mt-32 rounded-full"></div>

                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div className="flex items-center gap-4">
                            <button onClick={prevStep} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition border border-slate-700">
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">Distribución de Pared</h2>
                                <p className="text-slate-400 text-sm">Longitud Total: {linearLength}mm</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-right p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                                <span className="block text-[10px] uppercase text-slate-400 font-bold tracking-widest mb-1">Módulos</span>
                                <span className="text-2xl font-black text-white">{modules.length}</span>
                            </div>
                            <div className="text-right p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30">
                                <span className="block text-[10px] uppercase text-blue-300 font-bold tracking-widest mb-1">Ancho Elástico</span>
                                <span className="text-2xl font-black text-blue-400">{elasticWidth}mm</span>
                            </div>
                        </div>
                    </div>

                    {/* Regla Visual Pro */}
                    <div className="relative h-28 bg-slate-800 rounded-2xl border-2 border-slate-700 flex items-center px-3 mb-4 shadow-inner">
                        <div className="flex gap-1.5 h-20 w-full items-end pb-3">
                            {hasStove && (
                                <div
                                    className="bg-orange-500/20 border-2 border-orange-500/50 h-full rounded-xl flex flex-col items-center justify-center text-[10px] font-black text-orange-400 relative"
                                    style={{ width: `${(stoveWidth / linearLength) * 100}%` }}
                                >
                                    <span className="opacity-50 mb-1">STOVE</span>
                                    {stoveWidth}
                                </div>
                            )}
                            {hasSink && (
                                <div
                                    className="bg-cyan-500/20 border-2 border-cyan-500/50 h-full rounded-xl flex flex-col items-center justify-center text-[10px] font-black text-cyan-400 relative"
                                    style={{ width: `${(sinkWidth / linearLength) * 100}%` }}
                                >
                                    <span className="opacity-50 mb-1">SINK</span>
                                    {sinkWidth}
                                </div>
                            )}
                            {modules.map((m, idx) => {
                                const w = getModuleWidth(m, idx);
                                return (
                                    <div
                                        key={m.id}
                                        className={`h-full rounded-xl flex flex-col items-center justify-center text-[10px] transition-all border-2 relative group ${m.isFixed
                                            ? 'bg-white border-slate-300 text-slate-900 font-bold shadow-sm'
                                            : 'bg-blue-50/50 border-blue-400/30 text-blue-600 font-medium italic'
                                            }`}
                                        style={{ width: `${(w / linearLength) * 100}%` }}
                                    >
                                        <span className="opacity-60 mb-1 uppercase text-[8px]">{m.type.split('_')[0]}</span>
                                        {w}

                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all">
                                            {m.isFixed ? <Lock size={12} className="text-slate-400" /> : <Unlock size={12} className="text-blue-500" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Marcadores de milímetros */}
                        <div className="absolute bottom-1 left-0 w-full flex justify-between px-3 text-[8px] text-slate-500 font-mono">
                            <span>0mm</span>
                            <span>{linearLength}mm</span>
                        </div>
                    </div>
                </div>

                {/* Lista Detallada de Módulos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modules.map((m, idx) => {
                        const currentWidth = getModuleWidth(m, idx);
                        return (
                            <div
                                key={m.id}
                                className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${m.isFixed ? 'border-slate-200 bg-white' : 'border-blue-100 bg-blue-50/30'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${m.isFixed ? 'bg-slate-100' : 'bg-blue-100'}`}>
                                        <Settings2 size={20} className={m.isFixed ? 'text-slate-600' : 'text-blue-600'} />
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-slate-800 text-sm ${!m.isFixed ? 'text-blue-700 italic' : ''}`}>{m.type}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            {m.isFixed ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={m.width}
                                                        onChange={(e) => updateModuleWidth(m.id, Number(e.target.value))}
                                                        className="w-20 px-2 py-1 border-2 border-slate-200 rounded-lg text-xs font-black focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                                                    />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">mm Fijo 🔒</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-blue-600 font-black text-xl italic">{currentWidth}</span>
                                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">mm Auto 🔓</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleModuleFixed(m.id)}
                                        title={m.isFixed ? "Cambiar a Automático" : "Fijar Medida"}
                                        className={`p-2 rounded-lg border transition ${m.isFixed
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                                            : 'bg-white border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200'
                                            }`}
                                    >
                                        {m.isFixed ? <Lock size={16} /> : <Unlock size={16} />}
                                    </button>
                                    <button
                                        onClick={() => removeModule(m.id)}
                                        className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 rounded-lg transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Resumen del Espacio elástico</p>
                        <p className="text-slate-900 font-bold">
                            Restante: <span className="text-blue-600">{remainingSpace}mm</span> repartidos en <span className="text-blue-600">{elasticCount} módulos</span>
                        </p>
                    </div>
                    <button
                        onClick={nextStep}
                        disabled={modules.length === 0}
                        className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition disabled:opacity-50 shadow-2xl shadow-blue-200 flex items-center gap-3 uppercase tracking-wider text-sm"
                    >
                        Configurar Herrajes
                        <Plus size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
