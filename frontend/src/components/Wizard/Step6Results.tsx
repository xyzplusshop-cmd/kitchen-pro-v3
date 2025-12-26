import { useEffect, useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { ArrowLeft, Download, FileText, Layout, Printer, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

export const Step6Results = () => {
    const {
        projectName, linearLength, boardThickness,
        edgeRuleDoors, edgeRuleVisible, edgeRuleInternal,
        plinthLength, countertopLength,
        modules, prevStep
    } = useProjectStore();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<any>(null);

    useEffect(() => {
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
                    modules
                });
                setResults(response.data);
                setLoading(false);
            } catch (err: any) {
                setError(err.message || 'Error al conectar con el motor matemático');
                setLoading(false);
            }
        };

        calculateProject();
    }, [projectName, linearLength, boardThickness, edgeRuleDoors, edgeRuleVisible, edgeRuleInternal, modules]);

    const handleSaveProject = async () => {
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
            const response = await axios.post(`${apiBaseUrl}/api/projects`, {
                projectName,
                clientName: 'Cliente Demo', // Simplificado para MVP
                linearLength,
                modules
            });
            alert(`✅ Proyecto Guardado!\nID: ${response.data.id}\n${response.data.message}`);
        } catch (err: any) {
            alert('❌ Error al guardar: ' + (err.response?.data?.error || err.message));
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
            <div className="max-w-2xl mx-auto bg-red-50 p-8 rounded-2xl border border-red-200 text-center">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-red-800">Error de Cálculo</h2>
                <p className="text-red-600 mb-6">{error}</p>
                <button onClick={prevStep} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold">
                    Regresar y Revisar
                </button>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lista de Corte (Tabla Técnica) */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
                    <div className="p-6 border-b flex justify-between items-center bg-slate-50 print:bg-white">
                        <h3 className="font-black text-slate-800 flex items-center gap-2">
                            <FileText size={20} className="text-blue-600 print:hidden" />
                            LISTA DE CORTE (TALLER)
                        </h3>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black print:border print:border-slate-300">
                            {results?.summary.totalPieces} PIEZAS
                        </span>
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
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {results?.pieces.map((p: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-blue-50/50 transition duration-150 print:hover:bg-transparent">
                                        <td className="px-6 py-4 font-bold text-slate-700">{p.name}</td>
                                        <td className="px-6 py-4 font-black">{p.quantity}</td>
                                        <td className="px-6 py-4 text-slate-400">{p.finalWidth} x {p.finalHeight}</td>
                                        <td className="px-6 py-4 font-black text-blue-600 bg-blue-50 print:bg-transparent print:text-black print:text-lg">{p.cutWidth} x {p.cutHeight}</td>
                                        <td className="px-6 py-4 print:hidden"><span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold">{p.moduleType}</span></td>
                                    </tr>
                                ))}
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
                                <span className="text-slate-500">Planchas ({boardThickness}mm)</span>
                                <span className="font-bold">{results?.summary.estimatedBoards} un</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Zócalo (ml)</span>
                                <span className="font-bold">{plinthLength} ml</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Encimera (ml)</span>
                                <span className="font-bold">{countertopLength} ml</span>
                            </div>
                            <div className="pt-4 mt-4 border-t border-dashed flex justify-between items-center text-xl">
                                <span className="font-black text-slate-800">ESTADO</span>
                                <span className="font-black text-blue-600 tracking-tighter italic font-serif">LISTO 💎</span>
                            </div>
                        </div>
                        <button
                            onClick={handleSaveProject}
                            className="w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-blue-700 transition shadow-xl shadow-blue-200 uppercase tracking-widest text-sm"
                        >
                            GUARDAR EN CLOUD ☁️
                        </button>
                    </div>
                </div>
            </div>

            <button onClick={prevStep} className="text-slate-400 font-bold hover:text-slate-600 transition flex items-center gap-2 print:hidden">
                <ArrowLeft size={18} /> Volver a edición
            </button>
        </div>
    );
};
