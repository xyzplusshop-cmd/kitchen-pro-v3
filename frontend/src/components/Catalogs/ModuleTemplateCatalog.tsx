import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Upload, Edit2, Trash2, X, Save } from 'lucide-react';

interface ModuleTemplate {
    id: string;
    name: string;
    zone: string;
    width: number;
    height: number;
    depth: number;
    doorCount: number;
    drawerCount: number;
    defaultHingeId?: string;
    defaultSliderId?: string;
    thumbnail?: string;
    description?: string;
    isActive: boolean;
}

interface ModuleTemplateCatalogProps {
    zone: string;
    zoneName: string;
    color: string;
}

export const ModuleTemplateCatalog = ({ zone, zoneName, color }: ModuleTemplateCatalogProps) => {
    const navigate = useNavigate();
    const [items, setItems] = useState<ModuleTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [editingItem, setEditingItem] = useState<ModuleTemplate | null>(null);
    const [importData, setImportData] = useState('');

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

    useEffect(() => {
        fetchItems();
    }, [zone]);

    const fetchItems = async () => {
        try {
            const res = await axios.get(`${apiBaseUrl}/api/module-templates?zone=${zone}`);
            if (res.data.success) {
                setItems(res.data.items);
            }
        } catch (error) {
            console.error('Error fetching module templates');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data: any = {
            name: formData.get('name'),
            zone,
            width: parseFloat(formData.get('width') as string),
            height: parseFloat(formData.get('height') as string),
            depth: parseFloat(formData.get('depth') as string),
            doorCount: parseInt(formData.get('doorCount') as string),
            drawerCount: parseInt(formData.get('drawerCount') as string),
            description: formData.get('description') || null,
            isActive: true
        };

        try {
            if (editingItem) {
                await axios.put(`${apiBaseUrl}/api/module-templates/${editingItem.id}`, data);
            } else {
                await axios.post(`${apiBaseUrl}/api/module-templates`, data);
            }
            fetchItems();
            setShowModal(false);
            setEditingItem(null);
        } catch (error) {
            alert('Error al guardar');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Eliminar esta plantilla?')) {
            try {
                await axios.delete(`${apiBaseUrl}/api/module-templates/${id}`);
                fetchItems();
            } catch (error) {
                alert('Error al eliminar');
            }
        }
    };

    const handleImport = async () => {
        try {
            const items = JSON.parse(importData);
            // Add zone to all items
            const itemsWithZone = items.map((item: any) => ({ ...item, zone }));
            await axios.post(`${apiBaseUrl}/api/module-templates/import`, { items: itemsWithZone });
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
            <nav className={`bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm`}>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-lg transition">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-slate-800">PLANTILLAS DE {zoneName.toUpperCase()}</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowImportModal(true)} className={`bg-${color}-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-${color}-700 transition font-bold`}>
                        <Upload size={18} /> IMPORTAR JSON
                    </button>
                    <button onClick={() => { setEditingItem(null); setShowModal(true); }} className={`bg-${color}-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-${color}-700 transition font-bold`}>
                        <Plus size={18} /> AÑADIR PLANTILLA
                    </button>
                </div>
            </nav>

            <main className="p-6 max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="py-20 text-center">
                            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-${color}-600 mx-auto`}></div>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Nombre</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Dimensiones</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Puertas</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Cajones</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {items.map((item) => (
                                    <tr key={item.id} className={`hover:bg-${color}-50/30 transition group`}>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{item.name}</div>
                                            {item.description && <div className="text-xs text-slate-500 mt-1">{item.description}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {item.width} x {item.height} x {item.depth}mm
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{item.doorCount}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{item.drawerCount}</td>
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
                            <h2 className="text-2xl font-black text-slate-800">{editingItem ? 'EDITAR' : 'CREAR'} PLANTILLA</h2>
                            <button onClick={() => { setShowModal(false); setEditingItem(null); }} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Nombre</label>
                                <input name="name" defaultValue={editingItem?.name} required className={`w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-${color}-500 focus:border-transparent`} />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Ancho (mm)</label>
                                    <input name="width" type="number" step="0.1" defaultValue={editingItem?.width} required className={`w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-${color}-500`} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Alto (mm)</label>
                                    <input name="height" type="number" step="0.1" defaultValue={editingItem?.height} required className={`w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-${color}-500`} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Profundidad (mm)</label>
                                    <input name="depth" type="number" step="0.1" defaultValue={editingItem?.depth} required className={`w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-${color}-500`} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Puertas</label>
                                    <input name="doorCount" type="number" defaultValue={editingItem?.doorCount || 0} required className={`w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-${color}-500`} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Cajones</label>
                                    <input name="drawerCount" type="number" defaultValue={editingItem?.drawerCount || 0} required className={`w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-${color}-500`} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Descripción (opcional)</label>
                                <textarea name="description" defaultValue={editingItem?.description || ''} rows={3} className={`w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-${color}-500`} />
                            </div>
                            <button type="submit" className={`w-full bg-${color}-600 text-white py-3 rounded-xl font-bold hover:bg-${color}-700 transition flex items-center justify-center gap-2`}>
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
                            <h2 className="text-2xl font-black text-slate-800">IMPORTAR PLANTILLAS (JSON)</h2>
                            <button onClick={() => setShowImportModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <textarea
                            value={importData}
                            onChange={(e) => setImportData(e.target.value)}
                            placeholder={`[{"name": "Módulo Estándar", "width": 600, "height": 720, "depth": 560, "doorCount": 2, "drawerCount": 0}]`}
                            className={`w-full h-64 px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-${color}-500 font-mono text-sm`}
                        />
                        <button onClick={handleImport} className={`w-full mt-4 bg-${color}-600 text-white py-3 rounded-xl font-bold hover:bg-${color}-700 transition flex items-center justify-center gap-2`}>
                            <Upload size={18} /> IMPORTAR
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
