import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Edit2, Trash2, X, Save, AlertCircle } from 'lucide-react';

interface Pieza {
    alto: number;
    ancho: number;
    habilitado: boolean;
}

interface PiezasBase {
    lateralDerecho: Pieza;
    lateralIzquierdo: Pieza;
    piso: Pieza;
    techo: Pieza;
    fondo: Pieza;
    mangueteAlto: Pieza;
    mangueteBajo: Pieza;
    mangueteFrontal: Pieza;
}

interface ModuleTemplate {
    id: string;
    modelo: string;
    nombre: string;
    zona: string;
    tipoApertura?: string;
    piezas: PiezasBase;
    thumbnail?: string;
    descripcion?: string;
    isActive: boolean;
}

export const BaseModuleCatalog = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<ModuleTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<ModuleTemplate | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

    const piezasInicial: PiezasBase = {
        lateralDerecho: { alto: 720, ancho: 560, habilitado: true },
        lateralIzquierdo: { alto: 720, ancho: 560, habilitado: true },
        piso: { alto: 560, ancho: 600, habilitado: true },
        techo: { alto: 560, ancho: 600, habilitado: false }, // Opcional
        fondo: { alto: 720, ancho: 600, habilitado: false }, // Opcional
        mangueteAlto: { alto: 100, ancho: 600, habilitado: true },
        mangueteBajo: { alto: 100, ancho: 600, habilitado: true },
        mangueteFrontal: { alto: 720, ancho: 50, habilitado: true }
    };

    const [piezas, setPiezas] = useState<PiezasBase>(piezasInicial);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await axios.get(`${apiBaseUrl}/api/module-templates?zona=BASE`);
            if (res.data.success) {
                setItems(res.data.items);
            }
        } catch (error) {
            console.error('Error fetching module templates');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item?: ModuleTemplate) => {
        if (item) {
            setEditingItem(item);
            setPiezas(item.piezas);
        } else {
            setEditingItem(null);
            setPiezas(piezasInicial);
        }
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return; // Prevent double-click

        setIsSubmitting(true);
        const formData = new FormData(e.target as HTMLFormElement);

        const nextCodeNumber = items.length > 0
            ? Math.max(...items.map(i => {
                const parts = i.modelo.split('-');
                return parts.length > 1 ? parseInt(parts[1]) || 0 : 0;
            })) + 1
            : 1;

        const autoModelo = editingItem ? editingItem.modelo : `NB-${nextCodeNumber}`;

        const data = {
            modelo: autoModelo,
            nombre: formData.get('nombre'),
            zona: 'BASE',
            tipoApertura: formData.get('tipoApertura'),
            piezas,
            descripcion: formData.get('descripcion') || null,
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
            setPiezas(piezasInicial);
        } catch (error) {
            alert('Error al guardar');
        } finally {
            setIsSubmitting(false);
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

    const updatePieza = (nombrePieza: keyof PiezasBase, campo: 'alto' | 'ancho' | 'habilitado', valor: number | boolean) => {
        setPiezas(prev => {
            const newPiezas = {
                ...prev,
                [nombrePieza]: {
                    ...prev[nombrePieza],
                    [campo]: valor
                }
            };

            // Aplicar reglas condicionales
            if (nombrePieza === 'techo' && campo === 'habilitado') {
                // Si tiene techo -> NO manguete frontal
                if (valor === true) {
                    newPiezas.mangueteFrontal.habilitado = false;
                }
            }

            if (nombrePieza === 'fondo' && campo === 'habilitado') {
                // Si tiene fondo -> NO manguetes alto ni bajo
                if (valor === true) {
                    newPiezas.mangueteAlto.habilitado = false;
                    newPiezas.mangueteBajo.habilitado = false;
                }
            }

            // Reglas inversas
            if (nombrePieza === 'mangueteFrontal' && campo === 'habilitado' && valor === true) {
                newPiezas.techo.habilitado = false;
            }

            if ((nombrePieza === 'mangueteAlto' || nombrePieza === 'mangueteBajo') && campo === 'habilitado' && valor === true) {
                newPiezas.fondo.habilitado = false;
            }

            return newPiezas;
        });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-lg">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-white/20 rounded-lg transition text-white">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-white">PLANTILLAS DE MÓDULOS BAJOS</h1>
                </div>
                <button onClick={() => handleOpenModal()} className="bg-white text-amber-700 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-amber-50 transition font-bold shadow-md">
                    <Plus size={18} /> CREAR PLANTILLA
                </button>
            </nav>

            <main className="p-6 max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600 mx-auto"></div>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-slate-400 text-lg">No hay plantillas creadas aún</p>
                            <button onClick={() => handleOpenModal()} className="mt-4 bg-amber-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-amber-700 transition">
                                Crear primera plantilla
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {items.map((item) => (
                                <div key={item.id} className="bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-amber-400 hover:shadow-lg transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-xs font-black text-amber-600 bg-amber-100 px-2 py-1 rounded">{item.modelo}</span>
                                            <h3 className="text-lg font-black text-slate-800 mt-2">{item.nombre}</h3>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                            <button onClick={() => handleOpenModal(item)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    {item.descripcion && <p className="text-sm text-slate-600 mb-3">{item.descripcion}</p>}
                                    <div className="bg-slate-50 rounded-lg p-3">
                                        <p className="text-xs font-bold text-slate-500 mb-2">PIEZAS HABILITADAS:</p>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            {Object.entries(item.piezas).map(([key, pieza]: [string, Pieza]) =>
                                                pieza.habilitado && (
                                                    <div key={key} className="bg-white px-2 py-1 rounded">
                                                        <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                        <span className="text-slate-500 ml-1">{pieza.alto}×{pieza.ancho}</span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                    {item.tipoApertura && (
                                        <div className="mt-3">
                                            <span className="text-xs font-bold text-slate-600">Apertura: </span>
                                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">{item.tipoApertura}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-800">{editingItem ? 'EDITAR' : 'CREAR'} PLANTILLA BAJA</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Modelo (Código Auto)</label>
                                    <input
                                        value={editingItem ? editingItem.modelo : `NB-${items.length > 0 ? Math.max(...items.map(i => parseInt(i.modelo.split('-')[1]) || 0)) + 1 : 1}`}
                                        readOnly
                                        className="w-full px-4 py-2 border border-slate-200 bg-slate-100 rounded-lg font-black text-slate-500 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Nombre</label>
                                    <input name="nombre" defaultValue={editingItem?.nombre} placeholder="Bajo Estándar 2 Puertas" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Tipo de Apertura</label>
                                <select name="tipoApertura" defaultValue={editingItem?.tipoApertura || ''} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500">
                                    <option value="">Sin especificar</option>
                                    <option value="PUSH">Push</option>
                                    <option value="GOLA">Gola</option>
                                    <option value="JALADORES">Jaladores</option>
                                </select>
                            </div>

                            {/* Alertas de Reglas */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                    <AlertCircle size={20} className="text-blue-600 mt-0.5" />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-bold mb-1">Reglas Condicionales:</p>
                                        <ul className="list-disc ml-4 space-y-1">
                                            <li>Si tiene <strong>TECHO</strong> → NO incluye manguete frontal</li>
                                            <li>Si tiene <strong>FONDO</strong> → NO incluye manguetes alto ni bajo</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Piezas */}
                            <div className="bg-slate-50 rounded-xl p-6">
                                <h3 className="text-lg font-black text-slate-800 mb-4">CONFIGURACIÓN DE PIEZAS</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Piezas obligatorias */}
                                    {['lateralDerecho', 'lateralIzquierdo', 'piso'].map((key) => (
                                        <div key={key} className="bg-white p-4 rounded-lg border-2 border-green-200">
                                            <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Obligatorio</span>
                                            </h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 mb-1">
                                                        {key.startsWith('lateral') ? 'Alto (mm)' : 'Profundidad (mm)'}
                                                    </label>
                                                    <input type="number" value={piezas[key as keyof PiezasBase].alto} onChange={(e) => updatePieza(key as keyof PiezasBase, 'alto', parseFloat(e.target.value))} className="w-full px-2 py-1 border border-slate-200 rounded text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 mb-1">
                                                        {key.startsWith('lateral') ? 'Profundidad (mm)' : 'Ancho (mm)'}
                                                    </label>
                                                    <input type="number" value={piezas[key as keyof PiezasBase].ancho} onChange={(e) => updatePieza(key as keyof PiezasBase, 'ancho', parseFloat(e.target.value))} className="w-full px-2 py-1 border border-slate-200 rounded text-sm" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Piezas opcionales con checkbox */}
                                    {(['techo', 'fondo', 'mangueteAlto', 'mangueteBajo', 'mangueteFrontal'] as const).map((key) => (
                                        <div key={key} className={`bg-white p-4 rounded-lg border-2 ${piezas[key].habilitado ? 'border-amber-300' : 'border-slate-200 opacity-60'}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-bold text-slate-700">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" checked={piezas[key].habilitado} onChange={(e) => updatePieza(key, 'habilitado', e.target.checked)} className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                                                </label>
                                            </div>
                                            {piezas[key].habilitado && (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 mb-1">
                                                            {key.includes('manguete') ? 'Largo (mm)' : (key === 'techo' || key === 'fondo' ? (key === 'techo' ? 'Profundidad (mm)' : 'Alto (mm)') : 'Alto (mm)')}
                                                        </label>
                                                        <input type="number" value={piezas[key].alto} onChange={(e) => updatePieza(key, 'alto', parseFloat(e.target.value))} className="w-full px-2 py-1 border border-slate-200 rounded text-sm" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 mb-1">Ancho (mm)</label>
                                                        <input type="number" value={piezas[key].ancho} onChange={(e) => updatePieza(key, 'ancho', parseFloat(e.target.value))} className="w-full px-2 py-1 border border-slate-200 rounded text-sm" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Descripción (opcional)</label>
                                <textarea name="descripcion" defaultValue={editingItem?.descripcion || ''} rows={3} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500" />
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        GUARDANDO...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} /> GUARDAR PLANTILLA
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
