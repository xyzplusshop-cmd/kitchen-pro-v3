import {
    Package,
    Plus,
    FileText,
    Trash2,
    Edit3,
    ClipboardList,
    LogOut,
    Database,
    User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useProjectStore } from '../store/useProjectStore';

export const Dashboard = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const { loadProject, resetProject } = useProjectStore();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
            const res = await axios.get(`${apiBaseUrl} /api/projects`, { withCredentials: true });
            if (res.data.success) {
                setProjects(res.data.projects);
            }
        } catch (error) {
            console.error('Error fetching projects');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar este proyecto?')) {
            try {
                const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
                await axios.delete(`${apiBaseUrl} /api/projects / ${id} `, { withCredentials: true });
                setProjects(prev => prev.filter(p => p.id !== id));
            } catch (error) {
                alert('No se pudo eliminar el proyecto');
            }
        }
    };

    const handleEdit = (project: any) => {
        loadProject(project);
        navigate('/wizard');
    };

    const handleNewProject = () => {
        resetProject();
        navigate('/wizard');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <Package size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tighter">KITCHEN PRO <span className="text-blue-600">V3.1</span></h1>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                            <User size={10} /> {user?.name}
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleNewProject}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-200"
                    >
                        <Plus size={20} /> NUEVO PROYECTO
                    </button>
                    <button
                        onClick={logout}
                        className="bg-slate-100 text-slate-600 p-2 rounded-xl hover:bg-red-50 hover:text-red-600 transition"
                        title="Cerrar Sesión"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </nav>

            <main className="p-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="bg-blue-100 p-3 rounded-xl w-fit text-blue-600 mb-4">
                            <ClipboardList size={24} />
                        </div>
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Tus Proyectos</h2>
                        <p className="text-4xl font-black text-slate-900 mt-1">{projects.length}</p>
                    </div>

                    {/* Unified Materials & Inventory Hub */}
                    <div className="md:col-span-3 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-2xl shadow-blue-200 cursor-pointer hover:shadow-blue-300 transition-all border border-blue-400 group relative overflow-hidden" onClick={() => navigate('/catalogs/materials-hub')}>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl w-fit text-white mb-4 border border-white/30 group-hover:scale-110 transition-transform">
                                    <Database size={28} />
                                </div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Materiales e Inventario</h2>
                                <p className="text-sm font-bold text-blue-100 mt-2 max-w-md">
                                    Gestiona melaminas, herrajes, consumibles y sistemas técnicos desde un solo lugar.
                                    La base de datos centralizada para el asistente.
                                </p>
                            </div>
                            <div className="mt-8 flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest">
                                <span>Abrir Portal Técnico</span>
                                <div className="h-1 w-8 bg-white/30 rounded-full group-hover:w-16 transition-all"></div>
                            </div>
                        </div>
                        {/* Decorative background element */}
                        <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform">
                            <Package size={200} className="text-white" />
                        </div>
                    </div>
                </div>

                {/* Module Template Catalogs by Zone */}
                <div className="mb-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Plantillas de Módulos por Zona</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-6 rounded-2xl shadow-sm border border-sky-200 cursor-pointer hover:shadow-xl transition-all" onClick={() => navigate('/catalogs/modules/wall')}>
                            <div className="bg-sky-600 p-3 rounded-xl w-fit text-white mb-4">
                                <Package size={24} />
                            </div>
                            <h2 className="text-xs font-black text-slate-700 uppercase tracking-widest">Módulos Aéreos</h2>
                            <p className="text-sm font-bold text-sky-700 mt-2">Plantillas WALL →</p>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-2xl shadow-sm border border-amber-200 cursor-pointer hover:shadow-xl transition-all" onClick={() => navigate('/catalogs/modules/base')}>
                            <div className="bg-amber-600 p-3 rounded-xl w-fit text-white mb-4">
                                <Package size={24} />
                            </div>
                            <h2 className="text-xs font-black text-slate-700 uppercase tracking-widest">Módulos Bajos</h2>
                            <p className="text-sm font-bold text-amber-700 mt-2">Plantillas BASE →</p>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl shadow-sm border border-emerald-200 cursor-pointer hover:shadow-xl transition-all" onClick={() => navigate('/catalogs/modules/tower')}>
                            <div className="bg-emerald-600 p-3 rounded-xl w-fit text-white mb-4">
                                <Package size={24} />
                            </div>
                            <h2 className="text-xs font-black text-slate-700 uppercase tracking-widest">Despensas/Torres</h2>
                            <p className="text-sm font-bold text-emerald-700 mt-2">Plantillas TOWER →</p>
                        </div>

                        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-6 rounded-2xl shadow-sm border border-cyan-200 cursor-pointer hover:shadow-xl transition-all opacity-60" onClick={() => navigate('/catalogs/modules/island')}>
                            <div className="bg-cyan-600 p-3 rounded-xl w-fit text-white mb-4">
                                <Package size={24} />
                            </div>
                            <h2 className="text-xs font-black text-slate-700 uppercase tracking-widest">Islas</h2>
                            <p className="text-xs font-bold text-cyan-700 mt-2">⏳ Próximamente</p>
                        </div>
                    </div>
                </div>


                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-black text-slate-800 tracking-tight">BIBLIOTECA DE TRABAJOS</h2>
                    </div>

                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center">
                            <div className="bg-slate-50 p-6 rounded-full mb-4">
                                <Plus size={48} className="text-slate-200" />
                            </div>
                            <p className="text-slate-400 font-medium">No has guardado proyectos aún.</p>
                            <button onClick={handleNewProject} className="text-blue-600 font-bold mt-2 hover:underline">¡Crea el primero ahora!</button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Proyecto</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Medida</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {projects.map((p) => (
                                        <tr key={p.id} className="hover:bg-blue-50/30 transition group">
                                            <td className="px-8 py-5">
                                                <div className="font-bold text-slate-800">{p.name || 'Sin nombre'}</div>
                                                <div className="text-[10px] text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-8 py-5 text-sm text-slate-600 font-medium">{p.clientName || '-'}</td>
                                            <td className="px-8 py-5">
                                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase ring-1 ring-blue-100">
                                                    {p.linearLength / 1000}m Lineales
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEdit(p)}
                                                        className="p-2 bg-white border border-slate-200 rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-sm"
                                                        title="Editar Proyecto"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button
                                                        className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition shadow-sm"
                                                        title="Ver PDF (Próximamente)"
                                                    >
                                                        <FileText size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(p.id)}
                                                        className="p-2 bg-white border border-slate-200 rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition shadow-sm"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
