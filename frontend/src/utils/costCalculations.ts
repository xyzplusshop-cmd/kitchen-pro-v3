/**
 * Advanced Cost Engine Utilities
 * Implements intelligent hardware counting, operational costs, and energy consumption.
 */

export interface Machine {
    id: string;
    name: string;
    type: 'CUTTING' | 'EDGE_BANDING' | 'CNC';
    powerConsumptionKw: number;
    operationCostPerHour: number;
    processingSpeed: number; // meters per minute
}

export interface GlobalConfig {
    energyPricePerKwh: number;
    consumablesRates: {
        screwUnitPrice: number;
        glueFlatRatePerModule: number;
        dowelUnitPrice: number;
    };
}

/**
 * Intelligent Hinge Rule: Calculates hinges per door based on height.
 */
export const calculateHingesPerDoor = (doorHeight: number): number => {
    if (doorHeight <= 0) return 0;
    if (doorHeight < 900) return 2;
    if (doorHeight <= 1600) return 3;
    if (doorHeight <= 2100) return 4;
    return 5;
};

/**
 * Machine Operational Cost Math:
 * Time (h) = Meters / Speed / 60
 * Cost = Time * ((PowerKw * EnergyPrice) + HourlyRate)
 */
export const calculateMachineOperation = (
    meters: number,
    machine: Machine,
    energyPrice: number
) => {
    if (meters <= 0 || machine.processingSpeed <= 0) return { timeH: 0, cost: 0 };

    const processingTimeMinutes = meters / machine.processingSpeed;
    const processingTimeHours = processingTimeMinutes / 60;

    const energyCostPerHour = machine.powerConsumptionKw * energyPrice;
    const totalHourlyRate = energyCostPerHour + machine.operationCostPerHour;

    const totalCost = processingTimeHours * totalHourlyRate;

    return {
        timeH: Math.round(processingTimeHours * 100) / 100,
        cost: Math.round(totalCost * 100) / 100
    };
};

/**
 * Automated Screw Counting:
 * (Hinges * 4) + (Slides * 12) + (Modules * 8)
 */
export const calculateScrewCount = (
    totalHinges: number,
    totalSlides: number,
    totalModules: number
): number => {
    return (totalHinges * 4) + (totalSlides * 12) + (totalModules * 8);
};

/**
 * Advanced Cost Aggregation
 */
export const calculateAdvancedProjectCosts = (
    modules: any[],
    materials: any[],
    machines: Machine[],
    config: GlobalConfig
) => {
    let materialCost = 0;
    let hardwareCost = 0;
    let operationCost = 0;
    let consumableCost = 0;

    let totalHinges = 0;
    let totalSlides = 0;
    let totalLinearMetersEdge = 0;
    let totalPerimeterMetersWood = 0;

    const hardwareBreakdown: Record<string, { count: number; cost: number; name: string }> = {};

    modules.forEach(mod => {
        const pieces = mod.customPieces || [];

        // 1. Boards & Edges (Material Costs)
        pieces.forEach((p: any) => {
            if (p.category !== 'HARDWARE') {
                const boardMat = materials.find(m => m.id === p.materialId || m.name === p.material);
                const area = (p.finalHeight * p.finalWidth * p.quantity) / 1000000;
                materialCost += area * (boardMat?.unitCost || boardMat?.cost || 0);

                // Perimeter for Cutting Cost (Each piece: 2H + 2W)
                totalPerimeterMetersWood += ((p.finalHeight * 2) + (p.finalWidth * 2)) * p.quantity / 1000;

                // Edge linear meters
                const edges = [p.edgeL1Id, p.edgeL2Id, p.edgeA1Id, p.edgeA2Id];
                edges.forEach((eid, idx) => {
                    if (eid) {
                        const edgeMat = materials.find(m => m.id === eid);
                        const length = (idx < 2 ? p.finalWidth : p.finalHeight) / 1000;
                        materialCost += length * p.quantity * (edgeMat?.unitCost || 0);
                        totalLinearMetersEdge += length * p.quantity;
                    }
                });
            }
        });

        // 2. Intelligent Hardware Calculation
        // Hinges based on door height
        if (mod.doorCount > 0) {
            const doorPiece = pieces.find((p: any) => p.name.toLowerCase().includes('puerta'));
            const hingeCountPerDoor = calculateHingesPerDoor(doorPiece?.finalHeight || mod.height || 720);
            const hingesForModule = mod.doorCount * hingeCountPerDoor;
            totalHinges += hingesForModule;

            const hingeMat = materials.find(m => m.id === mod.hingeId); // Assuming hingeId points to a Hardware Material
            if (hingeMat) {
                if (!hardwareBreakdown[hingeMat.name]) {
                    hardwareBreakdown[hingeMat.name] = { count: 0, cost: 0, name: hingeMat.name };
                }
                hardwareBreakdown[hingeMat.name].count += hingesForModule;
                hardwareBreakdown[hingeMat.name].cost += hingesForModule * (hingeMat.unitCost || hingeMat.price || 0);
                hardwareCost += hingesForModule * (hingeMat.unitCost || hingeMat.price || 0);
            }
        }

        // Slides based on drawers
        if (mod.drawerCount > 0) {
            totalSlides += mod.drawerCount; // 1 pair per drawer
            const sliderMat = materials.find(m => m.id === mod.sliderId || m.id === mod.drawerSystemId);
            if (sliderMat) {
                if (!hardwareBreakdown[sliderMat.name]) {
                    hardwareBreakdown[sliderMat.name] = { count: 0, cost: 0, name: sliderMat.name };
                }
                hardwareBreakdown[sliderMat.name].count += mod.drawerCount;
                hardwareBreakdown[sliderMat.name].cost += mod.drawerCount * (sliderMat.unitCost || sliderMat.price || 0);
                hardwareCost += mod.drawerCount * (sliderMat.unitCost || sliderMat.price || 0);
            }
        }

        // 3. Flat Rate Consumables (per module)
        consumableCost += config.consumablesRates.glueFlatRatePerModule;
    });

    // 4. Consumables (Screws Logic)
    const screwCount = calculateScrewCount(totalHinges, totalSlides, modules.length);
    consumableCost += screwCount * config.consumablesRates.screwUnitPrice;

    // 5. Factory / Operational Costs
    const cuttingMachine = machines.find(m => m.type === 'CUTTING');
    const edgeMachine = machines.find(m => m.type === 'EDGE_BANDING');

    if (cuttingMachine) {
        operationCost += calculateMachineOperation(totalPerimeterMetersWood, cuttingMachine, config.energyPricePerKwh).cost;
    }
    if (edgeMachine) {
        operationCost += calculateMachineOperation(totalLinearMetersEdge, edgeMachine, config.energyPricePerKwh).cost;
    }

    const totalDirectCost = materialCost + hardwareCost + consumableCost + operationCost;
    const suggestedSalesPrice = totalDirectCost / (1 - (config.profitMargin / 100));

    return {
        breakdown: {
            materials: Math.round(materialCost * 100) / 100,
            hardware: Math.round(hardwareCost * 100) / 100,
            consumables: Math.round(consumableCost * 100) / 100,
            operations: Math.round(operationCost * 100) / 100
        },
        totals: {
            totalCost: Math.round(totalDirectCost * 100) / 100,
            suggestedPrice: Math.round(suggestedSalesPrice * 100) / 100,
            margin: config.profitMargin
        },
        stats: {
            totalHinges,
            totalSlides,
            screwCount,
            linearMetersEdge: Math.round(totalLinearMetersEdge * 10) / 10,
            cuttingMeters: Math.round(totalPerimeterMetersWood * 10) / 10
        },
        hardwareList: Object.values(hardwareBreakdown)
    };
};
