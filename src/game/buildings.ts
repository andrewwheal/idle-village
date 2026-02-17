import type { Building } from "../content/buildings";
import type { ResourceMap } from "../content/resources";
import type { ResourceDelta } from "./resources";
import type { GameState } from "./state";


export function cyclesToDelta(cycles: number, buildingDef: Building): ResourceDelta {
    const delta: ResourceDelta = {};
    if (buildingDef.consumes) {
        for (const [resourceId, amount] of Object.entries(buildingDef.consumes)) {
            if (!amount) continue;
            delta[resourceId] = (delta[resourceId] || 0) - (amount * cycles);
        }
    }
    for (const [resourceId, amount] of Object.entries(buildingDef.produces)) {
        if (!amount) continue;
        delta[resourceId] = (delta[resourceId] || 0) + (amount * cycles);
    }
    return delta;
}


export function maxCyclesRunnable(ready: number, stateResources: Readonly<GameState["resources"]>, buildingDef: Building, resourceDefs: ResourceMap): number {
    // We floor to ensure we are only counting fully completed cycles.
    let max = Math.floor(ready);

    if (buildingDef.consumes) {
        for (const [resourceId, amountPerCycle] of Object.entries(buildingDef.consumes)) {
            if (!amountPerCycle) continue;
            const currentAmount = stateResources[resourceId]?.amount ?? 0;
            const possibleCycles = Math.floor(currentAmount / amountPerCycle);
            max = Math.min(max, possibleCycles);
            if (max <= 0) return 0;
        }
    }

    for (const [resourceId, amountPerCycle] of Object.entries(buildingDef.produces)) {
        if (!amountPerCycle) continue;
        const currentAmount = stateResources[resourceId]?.amount ?? 0;
        const capacityLimit = stateResources[resourceId]?.capacity ?? resourceDefs[resourceId].baseCapacity;
        const availableCapacity = capacityLimit - currentAmount;
        const possibleCycles = Math.floor(availableCapacity / amountPerCycle);
        max = Math.min(max, possibleCycles);
        if (max <= 0) return 0;
    }

    return max;
}
