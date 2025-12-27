import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Upload, Edit2, Trash2, X, Save } from 'lucide-react';

interface LegSystem {
    id: string;
    name: string;
    height: number;
    price: number;
    brand?: string;
}

export const LegSystemCatalog = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<LegSystem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [editingItem, setEditingItem] = useState<LegSystem | null>(null);
    const [importData, setImportData] = useState('');

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await axios.get(`${apiBaseUrl}/api/leg-systems`);
            if (res.data.success) {
                setItems(res.data.items);
            }
        } catch (error) {
            console.error('Error fetching leg systems');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data: any = {
            name: formData.get('name'),
            height: parseFloat(formData.get('height') as string),
            price: parseFloat(formData.get('price') as string),
            brand: formData.get('brand') || null
        };

        try {
            if (editingItem) {
                await axios.put(`${apiBaseUrl}/api/leg-systems/${editingItem.id}`, data);
            } else {
                await axios.post(`${apiBaseUrl}/api/leg-systems`, data);
            }
            fetchItems();
            setShowModal(false);
            setEditingItem(null);
        } catch (error) {
            alert('Error al guardar');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Eliminar este sistema de patas?')) {
            try {
                await axios.delete(`${apiBaseUrl}/api/leg-systems/${id}`);
                fetchItems();
            } catch (error) {
                alert('Error al eliminar');
            }
        }
    };

    const handleImport = async () => {
        try {
            const items = JSON.parse(importData);
            await axios.post(`${apiBaseUrl}/api/leg-systems/import`, { items });
            fetchItems();
            setShowImportModal(false);
            setImportData('');
            alert('Importación exitosa');
        } catch (error) {
            alert('Error en importación. Verifica el formato JSON.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-lg transition">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-slate-800">CATÁLOGO DE SISTEMAS DE PATAS</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowImportModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition font-bold">
                        <Upload size={18} /> IMPORTAR JSON
                    </button>
                    <button onClick={() => { setEditingItem(null); setShowModal(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition font-bold">
                        <Plus size={18} /> AÑADIR SISTEMA
                    </button>
                </div>
            </nav>

            <main className="p-6 max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Nombre</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Altura (mm)</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Marca</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Precio</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {items.map((item) => (
                                    <tr key={item.id} className="hover:bg-indigo-50/30 transition group">
                                        <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{item.height}mm</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{item.brand || '-'}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-indigo-700">${item.price}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setEditingItem(item); setShowModal(true); }} className="p-2 bg-white border border-slate-200 rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white transition">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 bg-white border border-slate-200 rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition">
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-800">{editingItem ? 'EDITAR' : 'AÑADIR'} SISTEMA DE PATAS</h2>
                            <button onClick={() => { setShowModal(false); setEditingItem(null); }} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Nombre</label>
                                <input name="name" defaultValue={editingItem?.name} required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Altura (mm)</label>
                                <input name="height" type="number" step="0.1" defaultValue={editingItem?.height} required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Marca (opcional)</label>
                                <input name="brand" defaultValue={editingItem?.brand || ''} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Precio</label>
                                <input name="price" type="number" step="0.01" defaultValue={editingItem?.price} required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                                <Save size={18} /> GUARDAR
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-800">IMPORTAR SISTEMAS DE PATAS (JSON)</h2>
                            <button onClick={() => setShowImportModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <textarea
                            value={importData}
                            onChange={(e) => setImportData(e.target.value)}
                            placeholder='[{"name": "Pata Regulable 100mm", "height": 100, "price": 850, "brand": "Hafele"}]'
                            className="w-full h-64 px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                        />
                        <button onClick={handleImport} className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                            <Upload size={18} /> IMPORTAR
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
