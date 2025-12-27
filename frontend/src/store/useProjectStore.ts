import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
axios.defaults.withCredentials = true; // Ensure cookies are sent


interface Module {
    id: string;
    type: string;
    category: 'TOWER' | 'BASE' | 'WALL';
    width: number;
    isFixed: boolean;
    doorCount: number;
    drawerCount: number;
    hingeType: string;
    sliderType: string;
    hingeId?: string;
    sliderId?: string;
    // Parámetros por módulo (pueden sobrescribir los globales si se desea en el futuro)
    height?: number;
    depth?: number;
    customPieces?: any[] | null;
    templateId?: string;
    drawerSystemId?: string;
}

export interface HardwareItem {
    id: string;
    name: string;
    category: 'BISAGRA' | 'CORREDERA' | 'OTROS';
    compatibility: string[];
    discountRules: any;
    price: number;
    brand?: string;
}


interface ProjectState {
    projectName: string;
    clientName: string;
    linearLength: number; // en mm
    shape: 'LINEAL' | 'L' | 'U';
    currentStep: number;

    // Electrodomésticos (Tratados como espacios reservados en BASE)
    hasStove: boolean;
    stoveWidth: 600 | 750;
    hasSink: boolean;
    sinkWidth: number;

    // Nueva Lógica Estufa-Campana
    stoveHoodMode: 'GAP' | 'CUSTOM_GAP' | 'BUILT_IN_MODULE';
    hoodWidth: number;

    // Materiales y Cantos
    materialColor: string;
    boardThickness: 15 | 18;

    // Reglas Globales de Cantos (Matriz)
    edgeRuleDoors: string;
    edgeRuleVisible: string;
    edgeRuleInternal: string;

    // Costos Adicionales
    plinthLength: number;
    countertopLength: number;

    // Módulos
    modules: Module[];

    // Parámetros Técnicos Globales (NUEVO)
    baseHeight: number;
    plinthHeight: number;
    wallHeight: number;
    baseDepth: number;
    wallDepth: number;
    doorInstallationType: 'FULL_OVERLAY' | 'INSET';
    doorGap: number;
    drawerInstallationType: 'EXTERNAL' | 'INSET';

    hardwareCatalog: HardwareItem[];

    // Actions
    fetchHardware: () => Promise<void>;
    setProjectData: (data: { projectName: string; clientName: string }) => void;
    setSpaceData: (length: number) => void;
    setApplianceData: (data: {
        hasStove: boolean;
        stoveWidth: 600 | 750;
        hasSink: boolean;
        sinkWidth: number;
        stoveHoodMode?: 'GAP' | 'CUSTOM_GAP' | 'BUILT_IN_MODULE';
        hoodWidth?: number;
    }) => void;
    setMaterialData: (data: { materialColor: string; boardThickness: 15 | 18 }) => void;
    setEdgeRules: (data: { edgeRuleDoors: string; edgeRuleVisible: string; edgeRuleInternal: string }) => void;
    setExtraCosts: (data: { plinthLength: number; countertopLength: number }) => void;
    addModule: (module: Partial<Module> & { type: string; width: number; category: 'TOWER' | 'BASE' | 'WALL' }) => void;
    updateModule: (id: string, data: Partial<Module>) => void;
    toggleModuleFixed: (id: string) => void;
    updateModuleWidth: (id: string, width: number) => void;
    removeModule: (id: string) => void;
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (step: number) => void;
    resetProject: () => void;
    setTechnicalConfig: (config: Partial<{
        baseHeight: number;
        plinthHeight: number;
        wallHeight: number;
        baseDepth: number;
        wallDepth: number;
        doorInstallationType: 'FULL_OVERLAY' | 'INSET';
        doorGap: number;
        drawerInstallationType: 'EXTERNAL' | 'INSET';
    }>) => void;
    loadProject: (project: any) => void;
    updateModuleCustomPieces: (moduleId: string, pieces: any[]) => void;
    replicateCustomPieces: (sourceModuleId: string, changedPieceNames: string[]) => Promise<void>;

    // Computations
    getRemainingSpace: (category: 'TOWER' | 'BASE' | 'WALL') => number;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    projectName: '',
    clientName: '',
    linearLength: 0,
    shape: 'LINEAL',
    currentStep: 1,

    materialColor: 'Blanco Frost',
    boardThickness: 18,

    edgeRuleDoors: 'PVC 2mm',
    edgeRuleVisible: 'PVC 0.4mm',
    edgeRuleInternal: 'Ninguno',

    plinthLength: 0,
    countertopLength: 0,

    hasStove: false,
    stoveWidth: 600,
    hasSink: false,
    sinkWidth: 600,

    stoveHoodMode: 'GAP',
    hoodWidth: 600,

    // Valores por defecto profesionales
    baseHeight: 720,
    plinthHeight: 100,
    wallHeight: 720,
    baseDepth: 560,
    wallDepth: 320,
    doorInstallationType: 'FULL_OVERLAY',
    doorGap: 3,
    drawerInstallationType: 'EXTERNAL',

    hardwareCatalog: [],

    fetchHardware: async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/hardware`);
            if (res.data.success) {
                set({ hardwareCatalog: res.data.items });
            }
        } catch (error) {
            console.error('Error fetching hardware:', error);
        }
    },

    modules: [],

    setProjectData: (data) => set((state) => ({ ...state, ...data })),
    setSpaceData: (length) => set((state) => {
        const newModules = recalculateWidths(state.modules, length, state);
        return { ...state, linearLength: length, modules: newModules };
    }),
    setApplianceData: (data) => set((state) => {
        const newState = { ...state, ...data };
        const newModules = recalculateWidths(state.modules, state.linearLength, newState);
        return { ...newState, modules: newModules };
    }),
    setMaterialData: (data) => set((state) => ({ ...state, ...data })),
    setEdgeRules: (data) => set((state) => ({ ...state, ...data })),
    setExtraCosts: (data) => set((state) => ({ ...state, ...data })),

    addModule: (module) => set((state) => {
        const newModule = {
            id: Math.random().toString(36).substr(2, 9),
            isFixed: false,
            doorCount: module.type === 'MUEBLE_FREGADERO' ? 2 : (module.category === 'BASE' || module.category === 'TOWER' ? 1 : 0),
            drawerCount: module.type === 'DRAWER' ? 3 : 0,
            hingeType: 'Estándar',
            sliderType: 'Estándar',
            ...module,
            width: 0
        } as Module;
        const newModules = [...state.modules, newModule];
        return { modules: recalculateWidths(newModules, state.linearLength, state) };
    }),
    updateModule: (id, data) => set((state) => {
        const newModules = state.modules.map((m) => {
            if (m.id === id) {
                const updated = { ...m, ...data };
                // User requirement: Step 5 (apertures) overrides manual edits for those pieces
                if (m.customPieces && (data.doorCount !== undefined || data.drawerCount !== undefined || data.hingeId !== undefined || data.sliderId !== undefined || data.drawerSystemId !== undefined)) {
                    // When aperture config changes, we invalidate customPieces to force a fresh technical generation 
                    // that respects the new door/drawer count.
                    // This matches the user's statement: "los datos se reescribiran cuando se seleccione la cantidad"
                    return { ...updated, customPieces: null };
                }
                return updated;
            }
            return m;
        });
        return { modules: recalculateWidths(newModules, state.linearLength, state) };
    }),
    toggleModuleFixed: (id) => set((state) => {
        const newModules = state.modules.map((m) => m.id === id ? { ...m, isFixed: !m.isFixed } : m);
        return { modules: recalculateWidths(newModules, state.linearLength, state) };
    }),
    updateModuleWidth: (id, width) => set((state) => {
        const newModules = state.modules.map((m) => {
            if (m.id === id) {
                const numWidth = Number(width);
                const widthDiff = numWidth - m.width;
                const updated = { ...m, width: numWidth, isFixed: true };

                // If module width changes manually in the Wizard, we adjust width-dependent custom pieces
                if (m.customPieces && m.customPieces.length > 0) {
                    updated.customPieces = m.customPieces.map(p => {
                        const name = p.name.toLowerCase();
                        // Adjust pieces that span the horizontal width (excluding sides)
                        if (name.includes('piso') || name.includes('amarre') || name.includes('techo') || name.includes('frente') || name.includes('puerta') || name.includes('fondo')) {
                            return { ...p, finalWidth: Math.round((p.finalWidth + (name.includes('puerta') ? widthDiff / (m.doorCount || 1) : widthDiff)) * 10) / 10 };
                        }
                        return p;
                    });
                }
                return updated;
            }
            return m;
        });
        return { modules: recalculateWidths(newModules, state.linearLength, state) };
    }),
    removeModule: (id) => set((state) => {
        const newModules = state.modules.filter(m => m.id !== id);
        return { modules: recalculateWidths(newModules, state.linearLength, state) };
    }),

    nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
    prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),
    goToStep: (step) => set({ currentStep: step }),
    resetProject: () => set({
        projectName: '',
        clientName: '',
        linearLength: 0,
        shape: 'LINEAL',
        currentStep: 1,
        hasStove: false,
        stoveWidth: 600,
        hasSink: false,
        sinkWidth: 600,
        stoveHoodMode: 'GAP',
        hoodWidth: 600,
        materialColor: 'Blanco Frost',
        boardThickness: 18,
        edgeRuleDoors: 'PVC 2mm',
        edgeRuleVisible: 'PVC 0.4mm',
        edgeRuleInternal: 'Ninguno',
        plinthLength: 0,
        countertopLength: 0,
        baseHeight: 720,
        plinthHeight: 100,
        wallHeight: 720,
        baseDepth: 560,
        wallDepth: 320,
        doorInstallationType: 'FULL_OVERLAY',
        doorGap: 3,
        drawerInstallationType: 'EXTERNAL',
        modules: []
    }),
    setTechnicalConfig: (config) => set((state) => ({ ...state, ...config })),
    loadProject: (project) => set((state) => ({
        ...state,
        projectName: project.name,
        clientName: project.clientName || '',
        linearLength: project.linearLength,
        modules: project.modules,
        currentStep: 1,
        // Carga de config si existe
        ...(project.config || {})
    })),
    updateModuleCustomPieces: (moduleId, pieces) => set((state) => ({
        modules: state.modules.map(m => m.id === moduleId ? { ...m, customPieces: pieces } : m)
    })),
    replicateCustomPieces: async (sourceModuleId, changedPieceNames) => {
        const state = get();
        const sourceModule = state.modules.find(m => m.id === sourceModuleId);
        if (!sourceModule || !sourceModule.customPieces || !sourceModule.templateId) return;

        // Procesar todos los módulos en paralelo para mayor velocidad
        const updatedModules = await Promise.all(state.modules.map(async (m) => {
            // Solo replicar en módulos del mismo modelo (templateId) que NO sean el origen
            if (m.templateId === sourceModule.templateId && m.id !== sourceModuleId) {
                let currentPieces = m.customPieces;

                // CRITICAL FIX: Si el módulo destino no tiene piezas personalizadas, 
                // debemos obtener sus piezas estándar primero antes de parchar los cambios.
                if (!currentPieces || currentPieces.length === 0) {
                    try {
                        const res = await axios.post(`${API_BASE_URL}/api/generate-pieces`, {
                            module: m,
                            boardThickness: state.boardThickness,
                            edgeRules: {
                                doors: state.edgeRuleDoors,
                                visible: state.edgeRuleVisible,
                                internal: state.edgeRuleInternal
                            },
                            config: {
                                baseHeight: state.baseHeight,
                                plinthHeight: state.plinthHeight,
                                wallHeight: state.wallHeight,
                                baseDepth: state.baseDepth,
                                wallDepth: state.wallDepth,
                                doorInstallationType: state.doorInstallationType,
                                doorGap: state.doorGap,
                                drawerInstallationType: state.drawerInstallationType
                            }
                        });
                        if (res.data.success) {
                            currentPieces = res.data.pieces;
                        } else {
                            return m; // Fallback al original si falla
                        }
                    } catch (error) {
                        console.error(`Error fetching standard pieces for module ${m.id} during replication:`, error);
                        return m;
                    }
                }

                if (!currentPieces) return m;

                const newCustom = [...currentPieces];

                // Smart Merge Selectivo: Solo sobreescribir las piezas que cambiaron en la sesión origen
                sourceModule.customPieces?.forEach(sourcePiece => {
                    if (changedPieceNames.includes(sourcePiece.name)) {
                        const idx = newCustom.findIndex(p => p.name === sourcePiece.name);
                        if (idx !== -1) {
                            newCustom[idx] = { ...sourcePiece };
                        } else {
                            newCustom.push({ ...sourcePiece });
                        }
                    }
                });

                return { ...m, customPieces: newCustom };
            }
            return m;
        }));

        set({ modules: updatedModules });
    },

    getRemainingSpace: (category) => {
        const { linearLength, hasStove, stoveWidth, hasSink, sinkWidth, modules, stoveHoodMode, hoodWidth } = get();

        const towerSpace = modules.filter(m => m.category === 'TOWER' && m.isFixed).reduce((acc, m) => acc + m.width, 0);

        if (category === 'TOWER') {
            return Math.max(0, linearLength - towerSpace);
        }

        if (category === 'BASE') {
            const reservedBase = (hasStove ? Number(stoveWidth) : 0) + (hasSink ? Number(sinkWidth) : 0) +
                modules.filter(m => m.category === 'BASE' && m.isFixed).reduce((acc, m) => acc + m.width, 0);
            return Math.max(0, linearLength - towerSpace - reservedBase);
        }

        if (category === 'WALL') {
            let reservedWallSpace = 0;
            if (hasStove) {
                if (stoveHoodMode === 'GAP') reservedWallSpace += Number(stoveWidth);
                else if (stoveHoodMode === 'CUSTOM_GAP') reservedWallSpace += Number(hoodWidth);
            }
            const fixedWall = modules.filter(m => m.category === 'WALL' && m.isFixed).reduce((acc, m) => acc + m.width, 0);
            return Math.max(0, linearLength - towerSpace - reservedWallSpace - fixedWall);
        }

        return 0;
    }
}));

const recalculateWidths = (modules: Module[], linearLength: number, state: any): Module[] => {
    const { hasStove, stoveWidth, hasSink, sinkWidth, stoveHoodMode, hoodWidth } = state;

    // 0. Manejo especial de MUEBLE_CAMPANA (Empotrada)
    let currentModules = [...modules];
    if (hasStove && stoveHoodMode === 'BUILT_IN_MODULE') {
        const existingHood = currentModules.find(m => m.type === 'MUEBLE_CAMPANA');
        if (!existingHood) {
            currentModules.push({
                id: 'auto-hood-' + Math.random().toString(36).substr(2, 5),
                type: 'MUEBLE_CAMPANA',
                category: 'WALL',
                width: Number(stoveWidth),
                isFixed: true,
                doorCount: 1,
                drawerCount: 0,
                hingeType: 'Estándar',
                sliderType: 'Estándar'
            });
        }
    } else {
        // Al NO estar en modo empotrado, eliminamos CUALQUIER mueble de campana (o el auto-generado)
        currentModules = currentModules.filter(m => m.type !== 'MUEBLE_CAMPANA');
    }

    // 1. Identificar Torres (Prioridad Máxima)
    const towerModules = currentModules.filter(m => m.category === 'TOWER');
    const fixedTowers = towerModules.filter(m => m.isFixed);
    const elasticTowers = towerModules.filter(m => !m.isFixed);

    const fixedTowerSpace = fixedTowers.reduce((sum, m) => sum + m.width, 0);
    const availableForTowers = Math.max(0, linearLength - fixedTowerSpace);

    let processedModules = [...currentModules];
    if (elasticTowers.length > 0) {
        const baseWidth = Math.floor(availableForTowers / elasticTowers.length);
        const residue = availableForTowers % elasticTowers.length;
        let appliedResidue = 0;

        processedModules = processedModules.map(m => {
            if (m.category === 'TOWER' && !m.isFixed) {
                const currentResidue = appliedResidue < residue ? 1 : 0;
                appliedResidue++;
                return { ...m, width: baseWidth + currentResidue };
            }
            return m;
        });
    }

    // 2. Calcular espacio final robado por Torres
    const totalTowerSpace = processedModules.filter(m => m.category === 'TOWER').reduce((sum, m) => sum + m.width, 0);
    const effectiveLinearLength = Math.max(0, linearLength - totalTowerSpace);

    // 3. Recalcular ZONA BAJA (BASE)
    const baseModules = processedModules.filter(m => m.category === 'BASE');
    const fixedBase = baseModules.filter(m => m.isFixed);
    const elasticBase = baseModules.filter(m => !m.isFixed);
    const reservedBase = fixedBase.reduce((sum, m) => sum + m.width, 0) + (hasStove ? Number(stoveWidth) : 0) + (hasSink ? Number(sinkWidth) : 0);
    const availableForBase = Math.max(0, effectiveLinearLength - reservedBase);

    if (elasticBase.length > 0) {
        const baseWidth = Math.floor(availableForBase / elasticBase.length);
        const residue = availableForBase % elasticBase.length;
        let appliedResidue = 0;

        processedModules = processedModules.map(m => {
            if (m.category === 'BASE' && !m.isFixed) {
                const currentResidue = appliedResidue < residue ? 1 : 0;
                appliedResidue++;
                return { ...m, width: baseWidth + currentResidue };
            }
            return m;
        });
    }

    // 4. Recalcular ZONA AÉREA (WALL)
    let reservedWallGap = 0;
    if (hasStove) {
        if (stoveHoodMode === 'GAP') reservedWallGap = Number(stoveWidth);
        else if (stoveHoodMode === 'CUSTOM_GAP') reservedWallGap = Number(hoodWidth);
    }

    const wallModules = processedModules.filter(m => m.category === 'WALL');
    const fixedWall = wallModules.filter(m => m.isFixed);
    const elasticWall = wallModules.filter(m => !m.isFixed);
    const reservedWall = fixedWall.reduce((sum, m) => sum + m.width, 0) + reservedWallGap;
    const availableForWall = Math.max(0, effectiveLinearLength - reservedWall);

    if (elasticWall.length > 0) {
        const wallWidth = Math.floor(availableForWall / elasticWall.length);
        const residue = availableForWall % elasticWall.length;
        let appliedResidue = 0;

        processedModules = processedModules.map(m => {
            if (m.category === 'WALL' && !m.isFixed) {
                const currentResidue = appliedResidue < residue ? 1 : 0;
                appliedResidue++;
                return { ...m, width: wallWidth + currentResidue };
            }
            return m;
        });
    }

    return processedModules;
};
