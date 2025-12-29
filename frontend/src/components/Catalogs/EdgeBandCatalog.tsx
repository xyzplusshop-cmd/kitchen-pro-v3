import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Edit2, Trash2, X, Save, Maximize } from 'lucide-react';

interface EdgeBand {
    id: string;
    name: string;
    thickness: number;
    width: number;
    cost: number;
    codigo?: string;
}

export const EdgeBandCatalog = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<EdgeBand[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<EdgeBand | null>(null);

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await axios.get(`${apiBaseUrl}/api/edge-bands`);
            if (res.data.success) {
                setItems(res.data.items);
            }
        } catch (error) {
            console.error('Error fetching edge bands');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data: any = {
            name: formData.get('name'),
            thickness: parseFloat(formData.get('thickness') as string),
            width: parseFloat(formData.get('width') as string),
            cost: parseFloat(formData.get('cost') as string),
            codigo: formData.get('codigo')
        };

        try {
            if (editingItem) {
                await axios.put(`${apiBaseUrl}/api/edge-bands/${editingItem.id}`, data);
            } else {
                await axios.post(`${apiBaseUrl}/api/edge-bands`, data);
            }
            fetchItems();
            setShowModal(false);
            setEditingItem(null);
        } catch (error) {
            alert('Error al guardar');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Eliminar este canto?')) {
            try {
                await axios.delete(`${apiBaseUrl}/api/edge-bands/${id}`);
                fetchItems();
            } catch (error) {
                alert('Error al eliminar');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/catalogs/materials-hub')} className="p-2 hover:bg-slate-100 rounded-lg transition">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-2 rounded-lg text-white">
                            <Maximize size={20} />
                        </div>
                        <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">Catálogo de Cantos</h1>
                    </div>
                </div>
                <button onClick={() => { setEditingItem(null); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-200">
                    <Plus size={18} /> AÑADIR CANTO
                </button>
            </nav>

            <main className="p-6 max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center">
                            <div className="bg-slate-50 p-6 rounded-full mb-4 text-slate-200">
                                <Maximize size={48} />
                            </div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay cantos registrados</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Código</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Nombre</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Espesor</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Ancho</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Costo/m</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {items.map((item) => (
                                    <tr key={item.id} className="hover:bg-blue-50/30 transition group">
                                        <td className="px-6 py-4 font-black text-blue-600 text-xs">{item.codigo || '-'}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-bold">{item.thickness}mm</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">{item.width}mm</td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900">${item.cost}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setEditingItem(item); setShowModal(true); }} className="p-2 bg-white border border-slate-200 rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-sm">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 bg-white border border-slate-200 rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition shadow-sm">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-xl w-full mx-4 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{editingItem ? 'EDITAR' : 'AÑADIR'} CANTO</h2>
                            <button onClick={() => { setShowModal(false); setEditingItem(null); }} className="p-2 hover:bg-slate-100 rounded-xl transition">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Código (SKU)</label>
                                <input name="codigo" defaultValue={editingItem?.codigo} placeholder="EDG-001" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent font-bold text-slate-700 h-12" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nombre Descriptivo</label>
                                <input name="name" defaultValue={editingItem?.name} required placeholder="PVC Blanco 2mm" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent font-bold text-slate-700 h-12" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Espesor</label>
                                    <input name="thickness" type="number" step="0.1" defaultValue={editingItem?.thickness} required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 h-12 font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ancho</label>
                                    <input name="width" type="number" step="1" defaultValue={editingItem?.width || 22} required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 h-12 font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Costo/m</label>
                                    <input name="cost" type="number" step="0.01" defaultValue={editingItem?.cost} required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 h-12 font-bold" />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-xl shadow-blue-200 mt-6">
                                <Save size={18} /> GUARDAR CANTO
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
