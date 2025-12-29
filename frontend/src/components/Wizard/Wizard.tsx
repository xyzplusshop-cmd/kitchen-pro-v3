import { useNavigate } from 'react-router-dom';
import { Home, Layout } from 'lucide-react';
import { useProjectStore } from '../../store/useProjectStore';
import { Step1ProjectData } from './Step1ProjectData';
import { Step2SpaceConfig } from './Step2SpaceConfig';
import { Step2_5Appliances } from './Step2_5Appliances';
import { Step3ModuleSelection } from './Step3ModuleSelection';
import { Step4DetailedConfig } from './Step4DetailedConfig';
import { Step5MaterialsEdges } from './Step5MaterialsEdges';
import { Step6Results } from './Step6Results';

export const Wizard = () => {
    const navigate = useNavigate();
    const { currentStep, goToStep } = useProjectStore();

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1ProjectData />;
            case 2:
                return <Step2SpaceConfig />;
            case 3:
                return <Step2_5Appliances />;
            case 4:
                return <Step3ModuleSelection />;
            case 5:
                return <Step4DetailedConfig />;
            case 6:
                return <Step5MaterialsEdges />;
            case 7:
                return <Step6Results />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
                        <h3 className="text-xl font-bold text-slate-400">Paso {currentStep} en construcción</h3>
                        <p className="text-slate-500">Pronto activaremos la selección de módulos.</p>
                    </div>
                );
        }
    };

    const steps = [
        "Datos", "Espacio", "Equipos", "Módulos", "Configuración", "Materiales", "Resultados"
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6">
            <div className="max-w-5xl mx-auto mb-12">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
                            <Layout size={24} />
                        </div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Asistente de Diseño</h1>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition shadow-sm"
                    >
                        <Home size={16} />
                        VOLVER AL PANEL
                    </button>
                </div>

                <div className="flex justify-between relative">
                    {/* Línea de fondo */}
                    <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200 -z-0"></div>

                    {steps.map((label, index) => {
                        const stepNum = index + 1;
                        const isActive = currentStep === stepNum;
                        const isCompleted = currentStep > stepNum;
                        const isNavigable = stepNum <= currentStep; // Solo permite ir a pasos ya alcanzados

                        return (
                            <div key={label} className="flex flex-col items-center relative z-10 w-24">
                                <button
                                    onClick={() => isNavigable && goToStep(stepNum)}
                                    disabled={!isNavigable}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110' :
                                        isCompleted ? 'bg-green-500 text-white cursor-pointer hover:scale-105' : 'bg-white text-slate-400 border-2 border-slate-200 cursor-not-allowed'
                                        }`}
                                >
                                    {isCompleted ? '✓' : stepNum}
                                </button>
                                <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${isActive ? 'text-blue-600' : 'text-slate-400'
                                    }`}>
                                    {label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {renderCurrentStep()}
        </div>
    );
};
