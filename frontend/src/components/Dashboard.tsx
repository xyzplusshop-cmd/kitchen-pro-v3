import { Package, Plus, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Panel de Control</h1>
                    <p className="text-slate-500">Bienvenido a Kitchen Pro V3.1</p>
                </div>
                <button
                    onClick={() => navigate('/wizard')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                >
                    <Plus size={20} />
                    Nuevo Proyecto
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition cursor-pointer">
                    <div className="bg-blue-100 p-3 rounded-lg w-fit text-blue-600 mb-4">
                        <ClipboardList size={24} />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800">Proyectos Activos</h2>
                    <p className="text-3xl font-bold text-slate-900 mt-2">0</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition cursor-pointer opacity-50">
                    <div className="bg-slate-100 p-3 rounded-lg w-fit text-slate-600 mb-4">
                        <Package size={24} />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800">Inventario (Fase 3)</h2>
                    <p className="text-sm text-slate-500 mt-2">Próximamente</p>
                </div>
            </div>

            <div className="mt-12 text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400">No hay proyectos recientes. ¡Comienza uno nuevo!</p>
            </div>
        </div>
    );
};
