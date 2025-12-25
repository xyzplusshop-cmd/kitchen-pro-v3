import { useProjectStore } from '../../store/useProjectStore';
import { ArrowLeft, Plus, Trash2, Info } from 'lucide-react';

export const Step3ModuleSelection = () => {
    const {
        linearLength, hasStove, stoveWidth, hasSink, sinkWidth,
        modules, addModule, removeModule, getRemainingSpace,
        nextStep, prevStep
    } = useProjectStore();

    const remaining = getRemainingSpace();

    const catalog = [
        { type: 'BASE', name: 'Módulo Base', defaultWidth: 600 },
        { type: 'WALL', name: 'Módulo Aéreo', defaultWidth: 600 },
        { type: 'DRAWER', name: 'Gavetero', defaultWidth: 600 },
        { type: 'SINK_BASE', name: 'Módulo Fregadero', defaultWidth: 800 },
    ];

    const handleAddModule = (item: any) => {
        if (remaining >= item.defaultWidth) {
            addModule({
                id: Math.random().toString(36).substr(2, 9),
                type: item.type,
                width: item.defaultWidth
            });
        }
    };

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna Izquierda: Catálogo */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Plus size={18} className="text-blue-600" />
                    Catálogo de Módulos
                </h3>
                <div className="space-y-3">
                    {catalog.map(item => (
                        <button
                            key={item.type}
                            onClick={() => handleAddModule(item)}
                            disabled={remaining < item.defaultWidth}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition ${remaining >= item.defaultWidth
                                ? 'border-slate-100 hover:border-blue-500 hover:bg-blue-50'
                                : 'opacity-40 cursor-not-allowed bg-slate-50'
                                }`}
                        >
                            <div className="text-left">
                                <span className="block font-bold text-slate-700">{item.name}</span>
                                <span className="text-xs text-slate-500">Ancho: {item.defaultWidth}mm</span>
                            </div>
                            <Plus size={18} className="text-slate-400" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Columna Derecha: Configuración de Pared */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <button onClick={prevStep} className="p-2 hover:bg-slate-700 rounded-lg transition">
                                <ArrowLeft size={20} />
                            </button>
                            <h2 className="text-xl font-bold">Resumen de Espacio</h2>
                        </div>
                        <div className="text-right">
                            <span className="block text-xs uppercase text-slate-400 font-bold tracking-widest">Espacio Restante</span>
                            <span className={`text-3xl font-black ${remaining < 100 ? 'text-red-400' : 'text-green-400'}`}>
                                {remaining} mm
                            </span>
                        </div>
                    </div>

                    {/* Regla Visual de la Pared */}
                    <div className="relative h-20 bg-slate-700 rounded-lg border border-slate-600 flex items-center px-2 overflow-hidden">
                        <div className="absolute top-0 left-0 h-full border-r border-slate-500 w-[1px]"></div>
                        <div className="absolute top-0 right-0 h-full border-l border-slate-500 w-[1px]"></div>

                        <div className="flex gap-1 h-12 w-full">
                            {/* Visualización de Electrodomésticos */}
                            {hasStove && (
                                <div
                                    className="bg-orange-500 h-full rounded flex items-center justify-center text-[10px] font-bold"
                                    style={{ width: `${(stoveWidth / linearLength) * 100}%` }}
                                >
                                    ESTUFA
                                </div>
                            )}
                            {hasSink && (
                                <div
                                    className="bg-blue-500 h-full rounded flex items-center justify-center text-[10px] font-bold"
                                    style={{ width: `${(sinkWidth / linearLength) * 100}%` }}
                                >
                                    LAVAPLATOS
                                </div>
                            )}
                            {/* Visualización de Módulos */}
                            {modules.map(m => (
                                <div
                                    key={m.id}
                                    className="bg-slate-500 border border-slate-400 h-full rounded flex items-center justify-center text-[10px] font-bold relative group"
                                    style={{ width: `${(m.width / linearLength) * 100}%` }}
                                >
                                    {m.type.substring(0, 4)}
                                    <button
                                        onClick={() => removeModule(m.id)}
                                        className="absolute -top-2 -right-2 bg-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <Trash2 size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Info size={18} className="text-slate-400" />
                        Desglose de Medidas
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b text-sm">
                            <span className="text-slate-500">Longitud Pared Total</span>
                            <span className="font-bold">{linearLength} mm</span>
                        </div>
                        {hasStove && (
                            <div className="flex justify-between py-2 border-b text-sm text-orange-600">
                                <span>- Estufa ({stoveWidth}mm)</span>
                                <span>-{stoveWidth} mm</span>
                            </div>
                        )}
                        {hasSink && (
                            <div className="flex justify-between py-2 border-b text-sm text-blue-600">
                                <span>- Lavaplatos ({sinkWidth}mm)</span>
                                <span>-{sinkWidth} mm</span>
                            </div>
                        )}
                        <div className="flex justify-between py-2 border-b text-sm">
                            <span className="text-slate-500">- Módulos Añadidos ({modules.length})</span>
                            <span className="font-bold">-{modules.reduce((acc, m) => acc + m.width, 0)} mm</span>
                        </div>
                        <div className="flex justify-between py-4 text-lg font-black bg-slate-50 px-4 rounded-xl mt-4">
                            <span>ESPACIO DISPONIBLE</span>
                            <span className="text-blue-600 font-black">{remaining} mm</span>
                        </div>
                    </div>

                    <button
                        onClick={nextStep}
                        disabled={modules.length === 0}
                        className="w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 shadow-xl shadow-blue-100"
                    >
                        Siguiente: Configuraciones Detalladas
                    </button>
                </div>
            </div>
        </div>
    );
};
