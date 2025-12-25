import React, { useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';

export const Step1ProjectData = () => {
    const { projectName, clientName, setProjectData, nextStep } = useProjectStore();
    const [localProjectName, setLocalProjectName] = useState(projectName);
    const [localClientName, setLocalClientName] = useState(clientName);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProjectData({ projectName: localProjectName, clientName: localClientName });
        nextStep();
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Paso 1: Datos del Proyecto</h2>
            <p className="text-slate-500 mb-8">Comencemos identificando este nuevo diseño.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre del Proyecto</label>
                    <input
                        type="text"
                        placeholder="Ej: Cocina Juan Pérez"
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        value={localProjectName}
                        onChange={(e) => setLocalProjectName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Cliente (Opcional)</label>
                    <input
                        type="text"
                        placeholder="Nombre del cliente"
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        value={localClientName}
                        onChange={(e) => setLocalClientName(e.target.value)}
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                    >
                        Siguiente: Configurar Espacio
                    </button>
                </div>
            </form>
        </div>
    );
};
