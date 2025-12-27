import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';

export const IslandModuleCatalog = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-lg transition">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-slate-800">PLANTILLAS DE ISLAS</h1>
                </div>
            </nav>

            <main className="p-6 max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl shadow-xl p-12 text-center border-2 border-cyan-200">
                    <div className="bg-cyan-600 p-6 rounded-full w-fit mx-auto mb-6">
                        <Lock size={48} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-4">FUNCIONALIDAD EN DESARROLLO</h2>
                    <p className="text-lg text-slate-600 mb-6">
                        El catálogo de <span className="font-bold text-cyan-700">Módulos para Islas</span> está reservado para una futura actualización.
                    </p>
                    <div className="bg-white rounded-xl p-6 shadow-sm max-w-2xl mx-auto">
                        <h3 className="font-bold text-slate-700 mb-3">¿Por qué está en desarrollo?</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Las islas de cocina requieren consideraciones especiales de diseño, como accesibilidad desde 4 lados,
                            instalación de tomas eléctricas, consideraciones de plomería, y cálculos de despiece únicos.
                            Esta complejidad adicional será implementada en una fase posterior del desarrollo.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-8 bg-cyan-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-cyan-700 transition"
                    >
                        Volver al Dashboard
                    </button>
                </div>
            </main>
        </div>
    );
};
