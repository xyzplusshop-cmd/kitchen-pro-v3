import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../store/useProjectStore';

export const Step1ProjectData = () => {
    const {
        projectName, clientName,
        baseHeight, plinthHeight, wallHeight, towerHeight,
        baseDepth, wallDepth,
        doorInstallationType, doorGap, drawerInstallationType,
        carcassThickness, frontsThickness,
        backMountingType, grooveDepth, rearGap,
        setProjectData, setTechnicalConfig, setProjectThickness, nextStep
    } = useProjectStore();

    const [localProjectName, setLocalProjectName] = useState(projectName);
    const [localClientName, setLocalClientName] = useState(clientName);

    // Estados locales para thickness
    const [localCarcassThickness, setLocalCarcassThickness] = useState<15 | 18>(carcassThickness);
    const [localFrontsThickness, setLocalFrontsThickness] = useState<15 | 18 | 22>(frontsThickness);

    // Estados locales para la configuración técnica
    const [localBaseHeight, setLocalBaseHeight] = useState(baseHeight);
    const [localPlinthHeight, setLocalPlinthHeight] = useState(plinthHeight);
    const [localWallHeight, setLocalWallHeight] = useState(wallHeight);
    const [localBaseDepth, setLocalBaseDepth] = useState(baseDepth);
    const [localWallDepth, setLocalWallDepth] = useState(wallDepth);
    const [localTowerHeight, setLocalTowerHeight] = useState(towerHeight);
    const [localDoorType, setLocalDoorType] = useState(doorInstallationType);
    const [localDoorGap, setLocalDoorGap] = useState(doorGap);
    const [localDrawerType, setLocalDrawerType] = useState(drawerInstallationType);
    const [localBackMounting, setLocalBackMounting] = useState(backMountingType);
    const [localGrooveDepth, setLocalGrooveDepth] = useState(grooveDepth);
    const [localRearGap, setLocalRearGap] = useState(rearGap);

    // Sync local state when store changes (critical for project loading)
    useEffect(() => {
        setLocalProjectName(projectName);
        setLocalClientName(clientName);
        setLocalCarcassThickness(carcassThickness);
        setLocalFrontsThickness(frontsThickness);
        setLocalBaseHeight(baseHeight);
        setLocalPlinthHeight(plinthHeight);
        setLocalWallHeight(wallHeight);
        setLocalBaseDepth(baseDepth);
        setLocalWallDepth(wallDepth);
        setLocalTowerHeight(towerHeight);
        setLocalDoorType(doorInstallationType);
        setLocalDoorGap(doorGap);
        setLocalDrawerType(drawerInstallationType);
        setLocalBackMounting(backMountingType);
        setLocalGrooveDepth(grooveDepth);
        setLocalRearGap(rearGap);
    }, [projectName, clientName, carcassThickness, frontsThickness, baseHeight, plinthHeight, wallHeight, baseDepth, wallDepth, doorInstallationType, doorGap, drawerInstallationType, backMountingType, grooveDepth, rearGap]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProjectData({ projectName: localProjectName, clientName: localClientName });

        // Save thickness configuration
        setProjectThickness({
            carcassThickness: localCarcassThickness,
            frontsThickness: localFrontsThickness
        });

        // Debug logging for persistence verification
        console.log('🔍 Thickness Configuration Saved:', {
            carcassThickness: localCarcassThickness,
            frontsThickness: localFrontsThickness,
            timestamp: new Date().toISOString()
        });

        setTechnicalConfig({
            baseHeight: Number(localBaseHeight),
            plinthHeight: Number(localPlinthHeight),
            wallHeight: Number(localWallHeight),
            towerHeight: Number(localTowerHeight),
            baseDepth: Number(localBaseDepth),
            wallDepth: Number(localWallDepth),
            doorInstallationType: localDoorType as any,
            doorGap: Number(localDoorGap),
            drawerInstallationType: localDrawerType as any,
            backMountingType: localBackMounting as any,
            grooveDepth: Number(localGrooveDepth),
            rearGap: Number(localRearGap)
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

                {/* THICKNESS MANAGEMENT - New Section */}
                <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-tight">Estándares de Material</h3>
                    <p className="text-xs text-slate-500 mb-4">Estos grosores se aplicarán automáticamente a todos los módulos del proyecto</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* Carcass Thickness */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
                                    🏗️
                                </div>
                                <label className="block text-xs font-black text-blue-900 uppercase">
                                    Grosor Estructura
                                </label>
                            </div>
                            <select
                                value={localCarcassThickness}
                                onChange={(e) => {
                                    const val = Number(e.target.value) as 15 | 18;
                                    setLocalCarcassThickness(val);
                                    setProjectThickness({ carcassThickness: val, frontsThickness: localFrontsThickness });
                                }}
                                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg font-black text-blue-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value={15}>15mm (Económico)</option>
                                <option value={18}>18mm (Estándar)</option>
                            </select>
                            <p className="text-[10px] text-blue-700 mt-2 font-medium leading-tight">
                                Aplica a: Laterales, pisos, techos, estantes y fondo
                            </p>
                        </div>

                        {/* Fronts Thickness */}
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border-2 border-purple-200">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
                                    🎨
                                </div>
                                <label className="block text-xs font-black text-purple-900 uppercase">
                                    Grosor Frentes
                                </label>
                            </div>
                            <select
                                value={localFrontsThickness}
                                onChange={(e) => {
                                    const val = Number(e.target.value) as 15 | 18 | 22;
                                    setLocalFrontsThickness(val);
                                    setProjectThickness({ carcassThickness: localCarcassThickness, frontsThickness: val });
                                }}
                                className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg font-black text-purple-900 bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                            >
                                <option value={15}>15mm</option>
                                <option value={18}>18mm (Estándar)</option>
                                <option value={22}>22mm (Premium)</option>
                            </select>
                            <p className="text-[10px] text-purple-700 mt-2 font-medium leading-tight">
                                Aplica a: Puertas y frentes de cajones
                            </p>
                        </div>
                    </div>
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
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setLocalBaseHeight(val);
                                    setTechnicalConfig({ baseHeight: val });
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Altura Zócalo/Patas (mm)</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={localPlinthHeight}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setLocalPlinthHeight(val);
                                    setTechnicalConfig({ plinthHeight: val });
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Altura Muebles Aéreos (mm)</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={localWallHeight}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setLocalWallHeight(val);
                                    setTechnicalConfig({ wallHeight: val });
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Altura Torres (mm)</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={localTowerHeight}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setLocalTowerHeight(val);
                                    setTechnicalConfig({ towerHeight: val });
                                }}
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
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setLocalBaseDepth(val);
                                    setTechnicalConfig({ baseDepth: val });
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Profundidad Aéreos (mm)</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={localWallDepth}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setLocalWallDepth(val);
                                    setTechnicalConfig({ wallDepth: val });
                                }}
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

                        {/* BACK MOUNTING SYSTEM */}
                        <div className="pt-4 border-t border-slate-200">
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-3 text-center">Montaje de Fondo (Trasera)</label>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setLocalBackMounting('INSET')}
                                    className={`py-3 rounded-lg font-bold text-[9px] transition border-2 ${localBackMounting === 'INSET'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200'
                                        }`}
                                >
                                    EMBUTIDO (Legacy)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLocalBackMounting('NAILED')}
                                    className={`py-3 rounded-lg font-bold text-[9px] transition border-2 ${localBackMounting === 'NAILED'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200'
                                        }`}
                                >
                                    APLAUSADO (Nailed)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLocalBackMounting('GROOVED')}
                                    className={`py-3 rounded-lg font-bold text-[9px] transition border-2 ${localBackMounting === 'GROOVED'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200'
                                        }`}
                                >
                                    RANURADO (Premium)
                                </button>
                            </div>

                            {localBackMounting === 'GROOVED' && (
                                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Profundidad Ranura (mm)</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={localGrooveDepth}
                                            onChange={(e) => setLocalGrooveDepth(Number(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Retranqueo/Gap Aire (mm)</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={localRearGap}
                                            onChange={(e) => setLocalRearGap(Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                            )}
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
