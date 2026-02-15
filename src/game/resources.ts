import type { ResourceId, RESOURCES } from "../content/resources";
import type { GameState } from "./state";


export type ResourceDelta = Partial<Record<ResourceId, number>>;


export function canApplyResourceDelta(delta: ResourceDelta, resourcesState: GameState["resources"]): boolean {
    for (const [resourceId, amount] of Object.entries(delta)) {
        if (!amount) continue;
        
        const currentAmount = resourcesState[resourceId]?.amount ?? 0;

        // TODO We currently only check for amounts going negative, do we also want to check for amounts going above capacity?
        if (currentAmount + amount < 0) {
            return false;
        }
    }
    return true;
}


// This is the only place that should modify the resources state.
// All changes to resources should go through this function, which will ensure that amounts are clamped to capacity and never go negative.
export function applyResourceDelta(delta: ResourceDelta, resourcesState: GameState["resources"], resourcesDef: typeof RESOURCES): GameState["resources"] {
    const newState = { ...resourcesState };
    for (const [resourceId, amount] of Object.entries(delta)) {
        if (!amount) continue;

        // If the resource hasn't been seen yet, initialize it with 0 amount and base capacity
        // TODO extract this initialization logic if we find anywhere else we need to do it
        if (!newState[resourceId]) {
            newState[resourceId] = { amount: 0, capacity: resourcesDef[resourceId].baseCapacity };
        }

        // We floor here to ensure we only deal with whole resources. It shouldn't be necessary but is a good safeguard.
        const newAmount = Math.floor(newState[resourceId].amount + amount);

        if (newAmount < 0) {
            // TODO could be change to throwing an error
            console.error(`Resource ${resourceId} would go negative (${newAmount}), will be set to 0 instead.`);
        }

        // Clamp resource amount to be between 0 and capacity
        newState[resourceId].amount = Math.max(0, Math.min(newState[resourceId]!.capacity, newAmount));
    }
    return newState;
}
