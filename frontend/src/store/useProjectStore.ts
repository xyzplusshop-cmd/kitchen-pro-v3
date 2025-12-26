import { create } from 'zustand';

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

    // Actions
    setProjectData: (data: { projectName: string; clientName: string }) => void;
    setSpaceData: (length: number) => void;
    setApplianceData: (data: { hasStove: boolean; stoveWidth: 600 | 750; hasSink: boolean; sinkWidth: number }) => void;
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

    modules: [],

    setProjectData: (data) => set((state) => ({ ...state, ...data })),
    setSpaceData: (length) => set((state) => {
        const newModules = recalculateWidths(state.modules, length, state.hasStove ? state.stoveWidth : 0, state.hasSink ? state.sinkWidth : 0);
        return { ...state, linearLength: length, modules: newModules };
    }),
    setApplianceData: (data) => set((state) => {
        const newModules = recalculateWidths(
            state.modules,
            state.linearLength,
            data.hasStove ? data.stoveWidth : 0,
            data.hasSink ? data.sinkWidth : 0
        );
        return { ...state, ...data, modules: newModules };
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
        return { modules: recalculateWidths(newModules, state.linearLength, state.hasStove ? state.stoveWidth : 0, state.hasSink ? state.sinkWidth : 0) };
    }),
    updateModule: (id, data) => set((state) => ({
        modules: state.modules.map((m) => m.id === id ? { ...m, ...data } : m)
    })),
    toggleModuleFixed: (id) => set((state) => {
        const newModules = state.modules.map((m) => m.id === id ? { ...m, isFixed: !m.isFixed } : m);
        return { modules: recalculateWidths(newModules, state.linearLength, state.hasStove ? state.stoveWidth : 0, state.hasSink ? state.sinkWidth : 0) };
    }),
    updateModuleWidth: (id, width) => set((state) => {
        const newModules = state.modules.map((m) => m.id === id ? { ...m, width: Number(width), isFixed: true } : m);
        return { modules: recalculateWidths(newModules, state.linearLength, state.hasStove ? state.stoveWidth : 0, state.hasSink ? state.sinkWidth : 0) };
    }),
    removeModule: (id) => set((state) => {
        const newModules = state.modules.filter(m => m.id !== id);
        return { modules: recalculateWidths(newModules, state.linearLength, state.hasStove ? state.stoveWidth : 0, state.hasSink ? state.sinkWidth : 0) };
    }),

    nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
    prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),

    getRemainingSpace: (category) => {
        const { linearLength, hasStove, stoveWidth, hasSink, sinkWidth, modules } = get();

        // Torres siempre restan de todo
        const towerSpace = modules.filter(m => m.category === 'TOWER' && m.isFixed).reduce((acc, m) => acc + m.width, 0);

        if (category === 'TOWER') {
            return Math.max(0, linearLength - towerSpace);
        }

        if (category === 'BASE') {
            const reservedBase = (hasStove ? stoveWidth : 0) + (hasSink ? sinkWidth : 0) +
                modules.filter(m => m.category === 'BASE' && m.isFixed).reduce((acc, m) => acc + m.width, 0);
            return Math.max(0, linearLength - towerSpace - reservedBase);
        }

        if (category === 'WALL') {
            const reservedWall = modules.filter(m => m.category === 'WALL' && m.isFixed).reduce((acc, m) => acc + m.width, 0);
            return Math.max(0, linearLength - towerSpace - reservedWall);
        }

        return 0;
    }
}));

const recalculateWidths = (modules: Module[], linearLength: number, stoveWidth: number, sinkWidth: number): Module[] => {
    // 1. Identificar Torres (Prioridad Máxima)
    const towerModules = modules.filter(m => m.category === 'TOWER');
    const fixedTowers = towerModules.filter(m => m.isFixed);
    const elasticTowers = towerModules.filter(m => !m.isFixed);

    // Calcular espacio ocupado por torres fijas
    const fixedTowerSpace = fixedTowers.reduce((sum, m) => sum + m.width, 0);
    const availableForTowers = Math.max(0, linearLength - fixedTowerSpace);

    // Distribuir espacio entre torres elásticas (si existen)
    let processedModules = [...modules];
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

    // 2. Calcular espacio final robado por Torres (Fijas + Elásticas ya calculadas)
    const totalTowerSpace = processedModules.filter(m => m.category === 'TOWER').reduce((sum, m) => sum + m.width, 0);
    const effectiveLinearLength = Math.max(0, linearLength - totalTowerSpace);

    // 3. Recalcular ZONA BAJA (BASE)
    const baseModules = processedModules.filter(m => m.category === 'BASE');
    const fixedBase = baseModules.filter(m => m.isFixed);
    const elasticBase = baseModules.filter(m => !m.isFixed);
    const reservedBase = fixedBase.reduce((sum, m) => sum + m.width, 0) + stoveWidth + sinkWidth;
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
    const wallModules = processedModules.filter(m => m.category === 'WALL');
    const fixedWall = wallModules.filter(m => m.isFixed);
    const elasticWall = wallModules.filter(m => !m.isFixed);
    const reservedWall = fixedWall.reduce((sum, m) => sum + m.width, 0);
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
