import type { BuildingDefinition } from "../content/buildings";
import type { ResourceDefinitionMap } from "../content/resources";
import type { ResourceDelta } from "./resources";
import type { GameState } from "./state";


export function cyclesToDelta(cycles: number, buildingDefinition: BuildingDefinition): ResourceDelta {
    const delta: ResourceDelta = {};
    if (buildingDefinition.consumes) {
        for (const [resourceId, amount] of Object.entries(buildingDefinition.consumes)) {
            if (!amount) continue;
            delta[resourceId] = (delta[resourceId] || 0) - (amount * cycles);
        }
    }
    for (const [resourceId, amount] of Object.entries(buildingDefinition.produces)) {
        if (!amount) continue;
        delta[resourceId] = (delta[resourceId] || 0) + (amount * cycles);
    }
    return delta;
}


export function maxCyclesRunnable(ready: number, resourceState: Readonly<GameState["resources"]>, buildingDefinition: BuildingDefinition, resourceDefinitions: ResourceDefinitionMap): number {
    // We floor to ensure we are only counting fully completed cycles.
    let max = Math.floor(ready);

    if (buildingDefinition.consumes) {
        for (const [resourceId, amountPerCycle] of Object.entries(buildingDefinition.consumes)) {
            if (!amountPerCycle) continue;
            const currentAmount = resourceState[resourceId]?.amount ?? 0;
            const possibleCycles = Math.floor(currentAmount / amountPerCycle);
            max = Math.min(max, possibleCycles);
            if (max <= 0) return 0;
        }
    }

    for (const [resourceId, amountPerCycle] of Object.entries(buildingDefinition.produces)) {
        if (!amountPerCycle) continue;
        const currentAmount = resourceState[resourceId]?.amount ?? 0;
        const capacityLimit = resourceState[resourceId]?.capacity ?? resourceDefinitions[resourceId].baseCapacity;
        const availableCapacity = capacityLimit - currentAmount;
        const possibleCycles = Math.floor(availableCapacity / amountPerCycle);
        max = Math.min(max, possibleCycles);
        if (max <= 0) return 0;
    }

    return max;
}
