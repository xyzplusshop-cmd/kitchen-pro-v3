import React, { useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { ArrowLeft, Layout, LayoutPanelLeft, LayoutPanelTop } from 'lucide-react';

export const Step2SpaceConfig = () => {
    const { linearLength, setSpaceData, nextStep, prevStep } = useProjectStore();
    const [localLength, setLocalLength] = useState(linearLength || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSpaceData(Number(localLength));
        nextStep();
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
                <button onClick={prevStep} className="p-2 hover:bg-slate-100 rounded-lg transition">
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <h2 className="text-2xl font-bold text-slate-800">Paso 2: Forma y Espacio</h2>
            </div>
            <p className="text-slate-500 mb-8 ml-10">Define la geometría de tu cocina para el despiece automático.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Opción Lineal - Única habilitada */}
                <div className="border-2 border-blue-500 bg-blue-50 p-6 rounded-xl relative">
                    <div className="bg-blue-600 text-white p-2 rounded-lg w-fit mb-4">
                        <Layout size={24} />
                    </div>
                    <h3 className="font-bold text-slate-800">Cocina Lineal</h3>
                    <p className="text-xs text-slate-500 mt-1">Optimizada para el MVP</p>
                    <div className="absolute top-2 right-2">
                        <div className="h-4 w-4 bg-blue-600 rounded-full flex items-center justify-center">
                            <div className="h-2 w-2 bg-white rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Opción en L - Deshabilitada */}
                <div className="border-2 border-slate-200 bg-slate-50 p-6 rounded-xl opacity-60 cursor-not-allowed">
                    <div className="bg-slate-400 text-white p-2 rounded-lg w-fit mb-4">
                        <LayoutPanelLeft size={24} />
                    </div>
                    <h3 className="font-bold text-slate-400">Cocina en L</h3>
                    <span className="inline-block mt-2 text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded uppercase">
                        Próximamente
                    </span>
                </div>

                {/* Opción en U - Deshabilitada */}
                <div className="border-2 border-slate-200 bg-slate-50 p-6 rounded-xl opacity-60 cursor-not-allowed">
                    <div className="bg-slate-400 text-white p-2 rounded-lg w-fit mb-4">
                        <LayoutPanelTop size={24} />
                    </div>
                    <h3 className="font-bold text-slate-400">Cocina en U</h3>
                    <span className="inline-block mt-2 text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded uppercase">
                        Próximamente
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Longitud Total de la Pared (mm)
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="number"
                            placeholder="Ej: 3600"
                            className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition text-xl font-bold"
                            value={localLength}
                            onChange={(e) => setLocalLength(e.target.value)}
                            required
                            min="300"
                            max="10000"
                        />
                        <span className="text-slate-500 font-bold text-lg">mm</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        * Ingrese la medida real del espacio en milímetros (mm).
                    </p>
                </div>

                <div className="pt-4 flex gap-4">
                    <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                    >
                        Siguiente: Selección de Módulos
                    </button>
                </div>
            </form>
        </div>
    );
};
