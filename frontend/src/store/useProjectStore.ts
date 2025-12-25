import { create } from 'zustand';

interface Module {
    id: string;
    type: string;
    width: number;
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

    // Electrodomésticos
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
    addModule: (module: Partial<Module> & { type: string; width: number }) => void;
    updateModule: (id: string, data: Partial<Module>) => void;
    removeModule: (id: string) => void;
    nextStep: () => void;
    prevStep: () => void;

    // Computations
    getRemainingSpace: () => number;
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
    setSpaceData: (length) => set({ linearLength: length }),
    setApplianceData: (data) => set((state) => ({ ...state, ...data })),
    setMaterialData: (data) => set((state) => ({ ...state, ...data })),
    setEdgeRules: (data) => set((state) => ({ ...state, ...data })),
    setExtraCosts: (data) => set((state) => ({ ...state, ...data })),

    addModule: (module) => set((state) => ({
        modules: [...state.modules, {
            id: Math.random().toString(36).substr(2, 9),
            doorCount: module.type === 'SINK_BASE' ? 2 : (module.type === 'BASE' ? 1 : 0),
            drawerCount: module.type === 'DRAWER' ? 3 : 0,
            hingeType: 'Estándar',
            sliderType: 'Estándar',
            ...module
        } as Module]
    })),
    updateModule: (id, data) => set((state) => ({
        modules: state.modules.map((m) => m.id === id ? { ...m, ...data } : m)
    })),
    removeModule: (id) => set((state) => ({ modules: state.modules.filter(m => m.id !== id) })),

    nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
    prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),

    getRemainingSpace: () => {
        const { linearLength, hasStove, stoveWidth, hasSink, sinkWidth, modules } = get();
        let occupied = 0;
        if (hasStove) occupied += stoveWidth;
        if (hasSink) occupied += sinkWidth;
        occupied += modules.reduce((acc, m) => acc + m.width, 0);
        return Math.max(0, linearLength - occupied);
    }
}));
