import { useEffect, useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { ArrowLeft, Download, FileText, Layout, Printer, CheckCircle2, Loader2, AlertCircle, DollarSign } from 'lucide-react';
import axios from 'axios';
import { ProductionPDFExport } from '../Reports/ProductionPDF';
import { CostDashboard } from '../Results/CostDashboard';
import { exportCutlistToCSV } from '../../utils/exportFormats';
import { calculatePieceMachining } from '../../utils/machiningEngine';
import { exportPieceToDXF } from '../../utils/dxfGenerator';

export const Step6Results = () => {
    const {
        projectName, linearLength, boardThickness,
        edgeRuleDoors, edgeRuleVisible, edgeRuleInternal,
        modules, prevStep, goToStep, resetProject,
        baseHeight, plinthHeight, wallHeight,
        baseDepth, wallDepth,
        doorInstallationType, doorGap, drawerInstallationType,
        plinthLength, countertopLength
    } = useProjectStore();



    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<any>(null);
    const [allMaterials, setAllMaterials] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'despiece' | 'costos'>('despiece');

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
                const matRes = await axios.get(`${apiBaseUrl}/api/materials`);
                if (matRes.data.success) {
                    setAllMaterials(matRes.data.items);
                }
            } catch (err) {
                console.error('Error fetching materials:', err);
            }
        };

        const calculateProject = async () => {
            try {
                const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
                const response = await axios.post(`${apiBaseUrl}/api/calculate-project`, {
                    projectName,
                    linearLength,
                    boardThickness,
                    edgeRules: {
                        doors: edgeRuleDoors,
                        visible: edgeRuleVisible,
                        internal: edgeRuleInternal
                    },
                    modules,
                    config: {
                        baseHeight, plinthHeight, wallHeight,
                        baseDepth, wallDepth,
                        doorInstallationType, doorGap, drawerInstallationType,
                        plinthLength, countertopLength
                    }
                });

                setResults(response.data);
                setLoading(false);
            } catch (err: any) {

                setError(err.message || 'Error al conectar con el motor matemático');
                setLoading(false);
            }
        };

        fetchMaterials();
        calculateProject();
    }, [projectName, linearLength, boardThickness, edgeRuleDoors, edgeRuleVisible, edgeRuleInternal, modules]);


    const [saving, setSaving] = useState(false);

    const handleSaveProject = async () => {
        try {
            setSaving(true);
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

            const response = await axios.post(`${apiBaseUrl}/api/projects`, {
                projectName: projectName || 'Mi Cocina Pro',
                clientName: 'Cliente Demo',
                linearLength,
                modules,
                config: {
                    baseHeight, plinthHeight, wallHeight,
                    baseDepth, wallDepth,
                    doorInstallationType, doorGap, drawerInstallationType,
                    boardThickness,
                    edgeRuleDoors, edgeRuleVisible, edgeRuleInternal,
                    plinthLength, countertopLength
                },
                thumbnail: null,
                totalPrice: results?.summary.totalEstimatedPrice || 0
            });

            alert(`✅ ¡PROYECTO GUARDADO CON ÉXITO!\n\nID: ${response.data.id}\n${response.data.message}\n\nYa puedes acceder a este diseño desde tu panel.`);
            // window.location.href = '/dashboard'; // Descomentar cuando el dashboard esté listo
        } catch (err: any) {
            console.error('Save Error:', err);
            alert('❌ Error al guardar el proyecto: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 animate-pulse">
                <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
                <h2 className="text-2xl font-bold text-slate-800">Cerebro Calculando...</h2>
                <p className="text-slate-500">Generando despiece milimétrico y optimizando materiales.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto bg-red-100 p-10 rounded-3xl border-2 border-red-300 text-center shadow-2xl">
                <div className="bg-red-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <AlertCircle size={40} />
                </div>
                <h2 className="text-2xl font-black text-red-900 uppercase tracking-tight mb-2">Error de Conexión</h2>
                <p className="text-red-700 font-medium mb-8">
                    {error.includes('Network Error')
                        ? 'No se pudo conectar con el motor de cálculo en Railway. Verifica tu internet o intenta de nuevo.'
                        : error}
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-red-600 text-white py-4 rounded-xl font-black shadow-xl hover:bg-red-700 transition uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        <Loader2 size={20} className="animate-spin" /> Reintentar Cálculo
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => goToStep(3)}
                            className="bg-white text-red-700 border-2 border-red-200 py-3 rounded-xl font-bold hover:bg-red-50 transition text-sm"
                        >
                            Ajustar Campana
                        </button>
                        <button
                            onClick={() => goToStep(2)}
                            className="bg-white text-red-700 border-2 border-red-200 py-3 rounded-xl font-bold hover:bg-red-50 transition text-sm"
                        >
                            Ajustar Medidas
                        </button>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-red-200">
                    <p className="text-[10px] text-red-400 font-bold uppercase mb-2">Debug Info para Soporte:</p>
                    <code className="text-[10px] bg-red-200/50 p-2 rounded block text-red-800 break-all">
                        {`API: ${import.meta.env.VITE_API_BASE_URL || 'RAILWAY_PROD'} | ERR: ${error}`}
                    </code>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Cabecera de Éxito */}
            <div className="bg-green-600 text-white p-8 rounded-3xl shadow-xl flex justify-between items-center print:hidden">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-full">
                        <CheckCircle2 size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter">Proyecto: {projectName}</h2>
                        <p className="text-green-100 font-bold">Cálculo completado con precisión milimétrica</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={resetProject}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition font-bold border border-white/30"
                    >
                        <Layout size={18} /> Nuevo Proyecto
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition font-bold border border-white/30"
                    >
                        <Printer size={18} /> Imprimir
                    </button>
                    <button className="flex items-center gap-2 bg-white text-green-700 px-6 py-2 rounded-xl transition font-black shadow-lg shadow-green-900/20 hover:scale-105">
                        <Download size={18} /> EXPORTAR
                    </button>
                </div>
            </div>

            {/* Cabecera de Impresión (Solo visible al imprimir) */}
            <div className="hidden print:block border-b-4 border-slate-900 pb-4 mb-8">
                <h1 className="text-4xl font-black uppercase tracking-tighter">Reporte Técnico: {projectName}</h1>
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm font-bold text-slate-600">
                    <p>Cliente: Demo</p>
                    <p>Pared: {linearLength}mm</p>
                    <p>Tablero: {boardThickness}mm</p>
                    <p>Fecha: {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Selector de Pestañas */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit print:hidden">
                <button
                    onClick={() => setActiveTab('despiece')}
                    className={`px-6 py-2 rounded-xl font-bold transition flex items-center gap-2 ${activeTab === 'despiece' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
                >
                    <FileText size={18} /> Despiece Técnico
                </button>
                <button
                    onClick={() => setActiveTab('costos')}
                    className={`px-6 py-2 rounded-xl font-bold transition flex items-center gap-2 ${activeTab === 'costos' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
                >
                    <DollarSign size={18} /> Presupuesto y Costos
                </button>
            </div>

            {activeTab === 'despiece' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Lista de Corte (Tabla Técnica) */}
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
                        <div className="p-6 border-b flex justify-between items-center bg-slate-50 print:bg-white">
                            <h3 className="font-black text-slate-800 flex items-center gap-2">
                                <FileText size={20} className="text-blue-600 print:hidden" />
                                LISTA DE CORTE (TALLER)
                            </h3>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        if (results?.pieces && allMaterials.length > 0) {
                                            exportCutlistToCSV(results.pieces, allMaterials, projectName);
                                        } else {
                                            alert('⚠️ No hay piezas para exportar o faltan datos de materiales.');
                                        }
                                    }}
                                    className="print:hidden flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-700 transition shadow-md"
                                >
                                    <Download size={16} /> Exportar CSV
                                </button>
                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black print:border print:border-slate-300">
                                    {results?.summary.totalPieces} PIEZAS
                                </span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-slate-100 text-slate-500 border-b print:bg-slate-200">
                                    <tr>
                                        <th className="px-6 py-4">Pieza</th>
                                        <th className="px-6 py-4">Cant</th>
                                        <th className="px-6 py-4">Final (mm)</th>
                                        <th className="px-6 py-4 font-black text-blue-600 print:text-slate-900">Corte (mm)</th>
                                        <th className="px-6 py-4 print:hidden">Módulo</th>
                                        <th className="px-6 py-4 print:hidden text-center">CNC</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {['TOWER', 'BASE', 'WALL'].map(cat => {
                                        const catPieces = results?.pieces.filter((p: any) => p.category === cat);
                                        if (!catPieces || catPieces.length === 0) return null;

                                        return (
                                            <div key={cat} className="contents">
                                                <tr className="bg-slate-50 print:bg-slate-100">
                                                    <td colSpan={6} className="px-6 py-2 font-black text-[10px] text-blue-600 uppercase tracking-widest leading-none">
                                                        Zona: {cat === 'TOWER' ? 'Torres y Columnas' : cat === 'BASE' ? 'Muebles Bajos' : 'Muebles Aéreos'}
                                                    </td>
                                                </tr>
                                                {catPieces.map((p: any, idx: number) => (
                                                    <tr key={`${cat}-${idx}`} className="hover:bg-blue-50/50 transition duration-150 print:hover:bg-transparent">
                                                        <td className="px-6 py-4 font-bold text-slate-700">{p.name}</td>
                                                        <td className="px-6 py-4 font-black">{p.quantity}</td>
                                                        <td className="px-6 py-4 text-slate-400">{p.finalWidth} x {p.finalHeight}</td>
                                                        <td className="px-6 py-4 font-black text-blue-600 bg-blue-50 print:bg-transparent print:text-black print:text-lg">{p.cutWidth} x {p.cutHeight}</td>
                                                        <td className="px-6 py-4 print:hidden text-[10px] text-slate-400 font-bold uppercase">{cat}</td>
                                                    </tr>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Resumen de Materiales y Visualización 2D */}
                    <div className="space-y-8 print:break-before-page">
                        {/* Visualización 2D Plano Cenital */}
                        <div className="bg-slate-900 p-6 rounded-3xl shadow-2xl relative group print:bg-white print:border-2 print:border-slate-200 print:shadow-none print:text-slate-900">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-white font-black text-sm flex items-center gap-2 print:text-slate-900">
                                    <Layout size={18} className="text-blue-400 print:hidden" />
                                    PLANO TÉCNICO 2D
                                </h3>
                            </div>
                            <div className="aspect-video bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center overflow-hidden print:bg-white print:border-slate-300">
                                <div className="relative w-[80%] h-12 bg-blue-900/30 border-2 border-blue-500/50 rounded flex gap-1 p-0.5 print:bg-slate-100 print:border-slate-800">
                                    {modules.map((m, i) => (
                                        <div key={i} className="bg-blue-500/20 border border-blue-400/50 h-full rounded print:border-slate-800" style={{ width: `${(m.width / linearLength) * 100}%` }}></div>
                                    ))}
                                    <div className="absolute -bottom-6 left-0 text-[10px] text-slate-500 font-bold">0mm</div>
                                    <div className="absolute -bottom-6 right-0 text-[10px] text-slate-500 font-bold">{linearLength}mm</div>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-6 text-center italic">Vista: Planta Cenital (Módulos Bajos)</p>
                        </div>

                        {/* Presupuesto y Botón Guardar */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 print:hidden">
                            <h3 className="font-black text-slate-800 mb-6 border-b pb-4 tracking-tighter uppercase">Resumen de Materiales</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Materiales Base</span>
                                </div>
                                <div className="flex justify-between text-sm pl-2">
                                    <span className="text-slate-500 italic">Planchas ({boardThickness}mm)</span>
                                    <span className="font-bold">{results?.summary.estimatedBoards} un</span>
                                </div>
                                <div className="flex justify-between text-sm pl-2">
                                    <span className="text-slate-500 italic font-medium">Costo Tableros (Est.)</span>
                                    <span className="font-black text-slate-700">$ {((results?.summary.totalEstimatedPrice || 0) - (results?.summary.hardwareCost || 0)).toLocaleString()}</span>
                                </div>

                                <div className="pt-2">
                                    <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Herrajes Seleccionados</span>
                                </div>
                                <div className="flex justify-between text-sm pl-2">
                                    <span className="text-slate-500 italic font-medium">Costo Herrajes (Real)</span>
                                    <span className="font-black text-blue-600">$ {(results?.summary.hardwareCost || 0).toLocaleString()}</span>
                                </div>

                                <div className="pt-4 mt-4 border-t-2 border-slate-900 flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                                    <span className="font-black text-slate-900 tracking-tighter uppercase">Precio Total</span>
                                    <span className="font-black text-2xl text-blue-600 tracking-tighter">$ {(results?.summary.totalEstimatedPrice || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSaveProject}
                                disabled={saving}
                                className={`w-full mt-8 py-4 rounded-xl font-black transition shadow-xl uppercase tracking-widest text-sm flex items-center justify-center gap-2 ${saving
                                    ? 'bg-slate-400 cursor-not-allowed shadow-none'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                                    }`}
                            >
                                {saving ? (
                                    <><Loader2 className="animate-spin" size={20} /> GUARDANDO...</>
                                ) : (
                                    'GUARDAR EN CLOUD ☁️'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <CostDashboard modules={modules} results={results} />
            )}

            <div className="flex justify-between items-center pt-8 border-t border-slate-100 print:hidden">
                <button onClick={prevStep} className="text-slate-400 font-bold hover:text-slate-600 transition flex items-center gap-2">
                    <ArrowLeft size={18} /> Volver a edición
                </button>

                <button
                    onClick={() => {
                        resetProject();
                        window.location.href = '/';
                    }}
                    className="bg-slate-100 text-slate-600 px-8 py-3 rounded-xl font-black hover:bg-slate-200 transition uppercase tracking-widest text-xs"
                >
                    Volver al Dashboard
                </button>
            </div>
        </div>
    );
};
