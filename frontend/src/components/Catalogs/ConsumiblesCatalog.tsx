import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Edit2, Trash2, X, Save, Wrench, Package } from 'lucide-react';

interface Consumable {
    id: string;
    name: string;
    codigo: string;
    brand?: string;
    price: number;
    stock: number;
    type: 'TOOL' | 'ACCESSORY';
}

export const ConsumiblesCatalog = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<Consumable[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'TOOL' | 'ACCESSORY'>('TOOL');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Consumable | null>(null);

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const [toolsRes, accRes] = await Promise.all([
                axios.get(`${apiBaseUrl}/api/tools`),
                axios.get(`${apiBaseUrl}/api/accessories`)
            ]);

            const tools = (toolsRes.data.items || []).map((i: any) => ({ ...i, type: 'TOOL' }));
            const accessories = (accRes.data.items || []).map((i: any) => ({ ...i, type: 'ACCESSORY' }));

            setItems([...tools, ...accessories]);
        } catch (error) {
            console.error('Error fetching consumables');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const type = activeTab;
        const data: any = {
            name: formData.get('name'),
            codigo: formData.get('codigo'),
            price: parseFloat(formData.get('price') as string),
            stock: parseInt(formData.get('stock') as string),
            brand: formData.get('brand') || null
        };

        const endpoint = type === 'TOOL' ? 'tools' : 'accessories';

        try {
            if (editingItem) {
                await axios.put(`${apiBaseUrl}/api/${endpoint}/${editingItem.id}`, data);
            } else {
                await axios.post(`${apiBaseUrl}/api/${endpoint}`, data);
            }
            fetchItems();
            setShowModal(false);
            setEditingItem(null);
        } catch (error) {
            alert('Error al guardar');
        }
    };

    const handleDelete = async (id: string, type: 'TOOL' | 'ACCESSORY') => {
        if (window.confirm('¿Eliminar este elemento?')) {
            const endpoint = type === 'TOOL' ? 'tools' : 'accessories';
            try {
                await axios.delete(`${apiBaseUrl}/api/${endpoint}/${id}`);
                fetchItems();
            } catch (error) {
                alert('Error al eliminar');
            }
        }
    };

    const filteredItems = items.filter(i => i.type === activeTab);

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/catalogs/materials-hub')} className="p-2 hover:bg-slate-100 rounded-lg transition">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="bg-slate-800 p-2 rounded-lg text-white">
                            <Wrench size={20} />
                        </div>
                        <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">Consumibles & Herramientas</h1>
                    </div>
                </div>
                <button onClick={() => { setEditingItem(null); setShowModal(true); }} className="bg-slate-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-900 transition font-bold shadow-lg shadow-slate-200">
                    <Plus size={18} /> AÑADIR {activeTab === 'TOOL' ? 'HERRAMIENTA' : 'ACCESORIO'}
                </button>
            </nav>

            <main className="p-6 max-w-7xl mx-auto">
                {/* Tabs */}
                <div className="flex gap-2 mb-6 bg-white p-1 rounded-2xl border border-slate-200 w-fit">
                    <button
                        onClick={() => setActiveTab('TOOL')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'TOOL' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Tornillería & Herramientas
                    </button>
                    <button
                        onClick={() => setActiveTab('ACCESSORY')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'ACCESSORY' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Pegamentos & Otros
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-800 mx-auto"></div>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center">
                            <div className="bg-slate-50 p-6 rounded-full mb-4 text-slate-200">
                                <Package size={48} />
                            </div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay elementos registrados en esta categoría</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Código</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Nombre</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Marca</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Stock</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Precio</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition group">
                                        <td className="px-6 py-4 font-black text-slate-500 text-xs">{item.codigo}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{item.brand || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.stock > 10 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                {item.stock} UNID.
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900">${item.price}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setEditingItem(item); setShowModal(true); }} className="p-2 bg-white border border-slate-200 rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-sm">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(item.id, item.type)} className="p-2 bg-white border border-slate-200 rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition shadow-sm">
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
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{editingItem ? 'EDITAR' : 'AÑADIR'} {activeTab === 'TOOL' ? 'HERRAMIENTA' : 'ACCESORIO'}</h2>
                            <button onClick={() => { setShowModal(false); setEditingItem(null); }} className="p-2 hover:bg-slate-100 rounded-xl transition">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Código (SKU)</label>
                                    <input name="codigo" defaultValue={editingItem?.codigo} required placeholder="TOL-001" className="w-full px-4 py-3 border border-slate-200 rounded-xl h-12 font-bold text-slate-700" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Marca</label>
                                    <input name="brand" defaultValue={editingItem?.brand} placeholder="Ej: Bosch, Wurth" className="w-full px-4 py-3 border border-slate-200 rounded-xl h-12 font-bold text-slate-700" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nombre</label>
                                <input name="name" defaultValue={editingItem?.name} required placeholder="Tornillo Drywall 1 1/4" className="w-full px-4 py-3 border border-slate-200 rounded-xl h-12 font-bold text-slate-700" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Precio</label>
                                    <input name="price" type="number" step="0.01" defaultValue={editingItem?.price} required className="w-full px-4 py-3 border border-slate-200 rounded-xl h-12 font-bold text-slate-700" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Actual</label>
                                    <input name="stock" type="number" defaultValue={editingItem?.stock} required className="w-full px-4 py-3 border border-slate-200 rounded-xl h-12 font-bold text-slate-700" />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 transition flex items-center justify-center gap-2 shadow-xl shadow-slate-200 mt-6">
                                <Save size={18} /> GUARDAR ELEMENTO
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
