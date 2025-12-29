import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Settings2, Zap, Package, TrendingUp, Info, Loader2 } from 'lucide-react';
import { calculateAdvancedProjectCosts } from '../../utils/costCalculations';

interface CostDashboardProps {
    modules: any[];
    results: any;
}

export const CostDashboard: React.FC<CostDashboardProps> = ({ modules, results }) => {
    const [allMaterials, setAllMaterials] = useState<any[]>([]);
    const [machines, setMachines] = useState<any[]>([]);
    const [factoryConfig, setFactoryConfig] = useState<any>(null);
    const [manualMargin, setManualMargin] = useState<number>(30);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCostSettings = async () => {
            try {
                const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
                const [matRes, machRes, configRes] = await Promise.all([
                    axios.get(`${apiBaseUrl}/api/materials`),
                    axios.get(`${apiBaseUrl}/api/machines`),
                    axios.get(`${apiBaseUrl}/api/global-config`)
                ]);

                if (matRes.data.success) setAllMaterials(matRes.data.items);
                if (machRes.data.success) setMachines(machRes.data.items);
                if (configRes.data.success) {
                    setFactoryConfig(configRes.data.config);
                    setManualMargin(configRes.data.config?.profitMargin || 30);
                }
            } catch (err) {
                console.error('Error fetching cost settings:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCostSettings();
    }, []);

    // Calculate costs with safety guards
    const costAnalysis = (allMaterials.length > 0 && factoryConfig)
        ? calculateAdvancedProjectCosts(modules, allMaterials, machines, { ...factoryConfig, profitMargin: manualMargin })
        : null;

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-3 bg-blue-50 border-2 border-blue-200 rounded-3xl p-12 text-center">
                    <Loader2 size={48} className="text-blue-600 animate-spin mx-auto mb-4" />
                    <h3 className="text-xl font-black text-blue-800 mb-2">Cargando Motor de Costos...</h3>
                    <p className="text-sm text-blue-600">Obteniendo configuración de máquinas y energía</p>
                </div>
            </div>
        );
    }

    if (!costAnalysis) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-3 bg-yellow-50 border-2 border-yellow-200 rounded-3xl p-12 text-center">
                    <Info size={48} className="text-yellow-600 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-yellow-800 mb-2">Configuración Incompleta</h3>
                    <p className="text-sm text-yellow-600">No se pudo cargar la configuración de costos. Verifica tu conexión.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom duration-300">
            {/* Panel de Desglose de Costos */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
                        <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                            <Package size={20} className="text-green-600" /> Desglose de Costos Directos
                        </h3>
                        <span className="text-xs font-bold text-slate-400">VALORES EN USD</span>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Materiales */}
                            <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-[10px] font-black text-blue-500 uppercase">Materiales</p>
                                        <h4 className="text-xl font-black text-slate-800">
                                            ${costAnalysis?.breakdown?.materials?.toFixed(2) || '0.00'}
                                        </h4>
                                    </div>
                                    <Package className="text-blue-300" />
                                </div>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between text-slate-500">
                                        <span>Tableros (m²)</span>
                                        <span className="font-bold">{results?.summary?.totalArea || 0}m²</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                        <span>Cantos (ML)</span>
                                        <span className="font-bold">{costAnalysis?.stats?.linearMetersEdge?.toFixed(1) || '0.0'}m</span>
                                    </div>
                                </div>
                            </div>

                            {/* Herrajes */}
                            <div className="p-5 bg-orange-50/50 rounded-2xl border border-orange-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-[10px] font-black text-orange-500 uppercase">Herrajes Inteligentes</p>
                                        <h4 className="text-xl font-black text-slate-800">
                                            ${costAnalysis?.breakdown?.hardware?.toFixed(2) || '0.00'}
                                        </h4>
                                    </div>
                                    <Settings2 className="text-orange-300" />
                                </div>
                                <div className="space-y-2 text-xs">
                                    {costAnalysis?.hardwareList?.length > 0 ? (
                                        costAnalysis.hardwareList.map((h: any, i: number) => (
                                            <div key={i} className="flex justify-between text-slate-500">
                                                <span>{h.name}</span>
                                                <span className="font-bold">x{h.count}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-slate-400 italic">No hay herrajes detectados</p>
                                    )}
                                </div>
                            </div>

                            {/* Operaciones */}
                            <div className="p-5 bg-purple-50/50 rounded-2xl border border-purple-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-[10px] font-black text-purple-500 uppercase">Fábrica (Energía + Desgaste)</p>
                                        <h4 className="text-xl font-black text-slate-800">
                                            ${costAnalysis?.breakdown?.operations?.toFixed(2) || '0.00'}
                                        </h4>
                                    </div>
                                    <Zap className="text-purple-300" />
                                </div>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between text-slate-500">
                                        <span>Tiempo Corte</span>
                                        <span className="font-bold text-slate-700">
                                            {((costAnalysis?.stats?.cuttingMeters || 0) / 5 / 60).toFixed(2)}h
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                        <span>Tiempo Canteado</span>
                                        <span className="font-bold text-slate-700">
                                            {((costAnalysis?.stats?.linearMetersEdge || 0) / 8 / 60).toFixed(2)}h
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Insumos */}
                            <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase">Insumos y Químicos</p>
                                        <h4 className="text-xl font-black text-slate-800">
                                            ${costAnalysis?.breakdown?.consumables?.toFixed(2) || '0.00'}
                                        </h4>
                                    </div>
                                    <TrendingUp className="text-slate-300" />
                                </div>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between text-slate-500">
                                        <span>Tornillería</span>
                                        <span className="font-bold text-slate-700">~{costAnalysis?.stats?.screwCount || 0} pzs</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                        <span>Cola y Otros</span>
                                        <span className="font-bold text-slate-700">
                                            ${((factoryConfig?.consumablesRates?.glueFlatRatePerModule || 0) * modules.length).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tip Informativo */}
                <div className="bg-blue-600 rounded-3xl p-6 text-white flex items-center gap-4 shadow-lg shadow-blue-500/20">
                    <Info size={32} className="opacity-50 shrink-0" />
                    <p className="text-sm font-bold italic leading-relaxed">
                        El conteo de bisagras se ajusta automáticamente según la altura de cada puerta (Regla: 2/3/4/5 bisagras).
                        El costo operativo incluye energía consumida y mantenimiento preventivo por metro lineal procesado.
                    </p>
                </div>
            </div>

            {/* Sidebar de Precios */}
            <div className="space-y-6">
                <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Resumen Comercial</p>

                    <div className="space-y-6 pb-6 border-b border-white/10">
                        <div className="flex justify-between items-end">
                            <span className="text-slate-400 text-sm font-bold">Costo Total Producción</span>
                            <span className="text-2xl font-black">
                                ${costAnalysis?.totals?.totalCost?.toFixed(2) || '0.00'}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                                <span className="text-slate-400 text-sm font-bold">Margen de Ganancia</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={manualMargin}
                                        onChange={(e) => setManualMargin(parseFloat(e.target.value) || 0)}
                                        className="w-16 bg-slate-800 border-none text-right rounded-lg font-black text-green-400 px-2 py-1 focus:ring-1 focus:ring-green-500"
                                    />
                                    <span className="text-green-400 font-black">%</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500 italic px-2">Basado en Margen sobre Venta (Sales Margin)</p>
                        </div>
                    </div>

                    <div className="pt-8 space-y-2">
                        <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest text-center mb-2">
                            Precio de Venta Sugerido
                        </p>
                        <h2 className="text-6xl font-black tracking-tighter text-center">
                            ${costAnalysis?.totals?.suggestedPrice?.toFixed(2) || '0.00'}
                        </h2>
                    </div>

                    <button className="w-full mt-8 bg-green-500 hover:bg-green-400 text-slate-900 py-4 rounded-2xl font-black text-lg transition shadow-lg shadow-green-500/20 flex items-center justify-center gap-2">
                        <DollarSign size={20} /> GENERAR COTIZACIÓN
                    </button>
                </div>
            </div>
        </div>
    );
};
