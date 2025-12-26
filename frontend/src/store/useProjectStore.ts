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

    // Actions
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
        const newModules = state.modules.map((m) => m.id === id ? { ...m, ...data } : m);
        return { modules: recalculateWidths(newModules, state.linearLength, state) };
    }),
    toggleModuleFixed: (id) => set((state) => {
        const newModules = state.modules.map((m) => m.id === id ? { ...m, isFixed: !m.isFixed } : m);
        return { modules: recalculateWidths(newModules, state.linearLength, state) };
    }),
    updateModuleWidth: (id, width) => set((state) => {
        const newModules = state.modules.map((m) => m.id === id ? { ...m, width: Number(width), isFixed: true } : m);
        return { modules: recalculateWidths(newModules, state.linearLength, state) };
    }),
    removeModule: (id) => set((state) => {
        const newModules = state.modules.filter(m => m.id !== id);
        return { modules: recalculateWidths(newModules, state.linearLength, state) };
    }),

    nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
    prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),
    goToStep: (step) => set({ currentStep: step }),

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
