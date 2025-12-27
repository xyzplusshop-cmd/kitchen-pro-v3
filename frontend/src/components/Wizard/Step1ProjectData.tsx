import React, { useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';

export const Step1ProjectData = () => {
    const {
        projectName, clientName,
        baseHeight, plinthHeight, wallHeight,
        baseDepth, wallDepth,
        doorInstallationType, doorGap, drawerInstallationType,
        setProjectData, setTechnicalConfig, nextStep
    } = useProjectStore();

    const [localProjectName, setLocalProjectName] = useState(projectName);
    const [localClientName, setLocalClientName] = useState(clientName);

    // Estados locales para la configuración técnica
    const [localBaseHeight, setLocalBaseHeight] = useState(baseHeight);
    const [localPlinthHeight, setLocalPlinthHeight] = useState(plinthHeight);
    const [localWallHeight, setLocalWallHeight] = useState(wallHeight);
    const [localBaseDepth, setLocalBaseDepth] = useState(baseDepth);
    const [localWallDepth, setLocalWallDepth] = useState(wallDepth);
    const [localDoorType, setLocalDoorType] = useState(doorInstallationType);
    const [localDoorGap, setLocalDoorGap] = useState(doorGap);
    const [localDrawerType, setLocalDrawerType] = useState(drawerInstallationType);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProjectData({ projectName: localProjectName, clientName: localClientName });
        setTechnicalConfig({
            baseHeight: Number(localBaseHeight),
            plinthHeight: Number(localPlinthHeight),
            wallHeight: Number(localWallHeight),
            baseDepth: Number(localBaseDepth),
            wallDepth: Number(localWallDepth),
            doorInstallationType: localDoorType as any,
            doorGap: Number(localDoorGap),
            drawerInstallationType: localDrawerType as any
        });
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

                <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-black text-slate-800 mb-4 uppercase tracking-tight">Estándares de Carpintería</h3>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Altura Muebles Bajos (mm)</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={localBaseHeight}
                                onChange={(e) => setLocalBaseHeight(Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Altura Zócalo/Patas (mm)</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={localPlinthHeight}
                                onChange={(e) => setLocalPlinthHeight(Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Altura Muebles Aéreos (mm)</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={localWallHeight}
                                onChange={(e) => setLocalWallHeight(Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Separación Puertas (Gap mm)</label>
                            <input
                                type="number"
                                step="0.5"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={localDoorGap}
                                onChange={(e) => setLocalDoorGap(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Profundidad Bajos (mm)</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={localBaseDepth}
                                onChange={(e) => setLocalBaseDepth(Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Profundidad Aéreos (mm)</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={localWallDepth}
                                onChange={(e) => setLocalWallDepth(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-3 text-center">Tipo de Instalación de Puerta</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setLocalDoorType('FULL_OVERLAY')}
                                    className={`py-3 rounded-lg font-bold text-[10px] transition border-2 ${localDoorType === 'FULL_OVERLAY'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200'
                                        }`}
                                >
                                    OVERLAY (EXT)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLocalDoorType('INSET')}
                                    className={`py-3 rounded-lg font-bold text-[10px] transition border-2 ${localDoorType === 'INSET'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200'
                                        }`}
                                >
                                    INSET (INT)
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-3 text-center">Frente de Cajón</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setLocalDrawerType('EXTERNAL')}
                                    className={`py-3 rounded-lg font-bold text-[10px] transition border-2 ${localDrawerType === 'EXTERNAL'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200'
                                        }`}
                                >
                                    TAPA EXTERNA
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLocalDrawerType('INSET')}
                                    className={`py-3 rounded-lg font-bold text-[10px] transition border-2 ${localDrawerType === 'INSET'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200'
                                        }`}
                                >
                                    TAPA EMBUTIDA
                                </button>
                            </div>
                        </div>
                    </div>
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
