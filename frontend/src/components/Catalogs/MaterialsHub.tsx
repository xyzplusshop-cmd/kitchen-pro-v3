import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Box,
    Layers,
    Maximize,
    Cpu,
    Settings,
    Database,
    Wrench,
    MousePointer2,
    Package
} from 'lucide-react';

export const MaterialsHub = () => {
    const navigate = useNavigate();

    const categories = [
        {
            id: 'melaminas',
            title: 'Melaminas & Tableros',
            description: 'Láminas, MDF y materiales base para carcasas y frentes.',
            icon: <Layers size={24} />,
            route: '/catalogs/materials',
            color: 'from-orange-500 to-orange-600',
            bgColor: 'bg-orange-50/50',
            borderColor: 'border-orange-200'
        },
        {
            id: 'cantos',
            title: 'Cantos (Edge Banding)',
            description: 'PVC, ABS y acabados de borde para cada espesor.',
            icon: <Maximize size={24} />,
            route: '/catalogs/edge-banding',
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50/50',
            borderColor: 'border-blue-200'
        },
        {
            id: 'bisagras',
            title: 'Bisagras',
            description: 'Sistemas de cierre, ángulos y perforaciones técnicas.',
            icon: <Box size={24} />,
            route: '/catalogs/hardware?category=BISAGRA',
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50/50',
            borderColor: 'border-green-200'
        },
        {
            id: 'correderas',
            title: 'Correderas',
            description: 'Telescópicas, ocultas y descuentos de cajón.',
            icon: <Cpu size={24} />,
            route: '/catalogs/hardware?category=CORREDERA',
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50/50',
            borderColor: 'border-purple-200'
        },
        {
            id: 'cajones',
            title: 'Sistemas de Cajón',
            description: 'Cajas metálicas, tandembox y configuraciones.',
            icon: <Database size={24} />,
            route: '/catalogs/drawer-systems',
            color: 'from-pink-500 to-pink-600',
            bgColor: 'bg-pink-50/50',
            borderColor: 'border-pink-200'
        },
        {
            id: 'apertura',
            title: 'PUSH & Gola',
            description: 'Sistemas de apertura sin tirador y perfiles.',
            icon: <MousePointer2 size={24} />,
            route: '/catalogs/hardware?category=OTROS',
            color: 'from-cyan-500 to-cyan-600',
            bgColor: 'bg-cyan-50/50',
            borderColor: 'border-cyan-200'
        },
        {
            id: 'patas',
            title: 'Patas & Nivelación',
            description: 'Soportes regulables y ajustes de altura de zócalo.',
            icon: <Settings size={24} />,
            route: '/catalogs/leg-systems',
            color: 'from-indigo-500 to-indigo-600',
            bgColor: 'bg-indigo-50/50',
            borderColor: 'border-indigo-200'
        },
        {
            id: 'consumibles',
            title: 'Consumibles',
            description: 'Tornillería, pegamentos, siliconas y herramientas.',
            icon: <Wrench size={24} />,
            route: '/catalogs/consumables',
            color: 'from-slate-500 to-slate-600',
            bgColor: 'bg-slate-50/50',
            borderColor: 'border-slate-200'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white border-b border-slate-200 px-8 py-6 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-500"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Materiales e Inventario</h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Centro de Control Técnico</p>
                </div>
            </nav>

            <main className="p-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => navigate(cat.route)}
                            className={`group relative p-6 rounded-3xl border ${cat.borderColor} ${cat.bgColor} hover:shadow-2xl hover:shadow-slate-200 transition-all cursor-pointer overflow-hidden h-full flex flex-col`}
                        >
                            {/* Icon & Color Bar */}
                            <div className={`p-4 rounded-2xl bg-gradient-to-br ${cat.color} text-white w-fit mb-4 shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform`}>
                                {cat.icon}
                            </div>

                            <h2 className="text-lg font-black text-slate-800 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                                {cat.title}
                            </h2>
                            <p className="text-xs font-bold text-slate-500 mt-2 leading-relaxed flex-grow">
                                {cat.description}
                            </p>

                            <div className="mt-6 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-500 transition-colors">Gestionar</span>
                                <div className="h-1 w-8 bg-slate-200 group-hover:bg-blue-500 transition-all rounded-full group-hover:w-12"></div>
                            </div>

                            {/* Decorative background element */}
                            <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                <Package size={120} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 p-8 bg-blue-900 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-blue-200">
                    <div className="max-w-2xl">
                        <h3 className="text-xl font-black mb-2">¿Cómo funciona el inventario?</h3>
                        <p className="text-sm font-medium opacity-80 leading-relaxed">
                            Los datos registrados aquí alimentan directamente al **Wizard de Diseño**.
                            Cualquier ajuste en los espesores de melamina, descuentos de correderas o posiciones de bisagras
                            se aplicará automáticamente en tus próximos despieces.
                        </p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
                        <Database size={32} className="text-blue-200" />
                    </div>
                </div>
            </main>
        </div>
    );
};
