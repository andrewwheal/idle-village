import { stateSignal } from "../main.tsx";
import { BUILDING_DEFINITIONS } from "../content/buildings.ts";
import { ACTIONS, type ActionId } from "../content/actions.ts";
import { applyResourceDelta, type ResourceDelta } from "./resources.ts";
import { RESOURCE_DEFINITIONS } from "../content/resources.ts";


// TODO We should be passing in State and RESOURECS
export function doAction(id: ActionId) {
    const state = stateSignal.value;
    const action = ACTIONS[id];

    // Add the resource gain
    // TODO handle capacity limits
    // TODO action.produces is basically just a resource delta, we should probably just store it as that to avoid having to convert it here
    const delta: ResourceDelta = {};
    for (const [resId, amount] of Object.entries(action.produces)) {
        if (!amount) continue;

        delta[resId] = (delta[resId] || 0) + amount;
    }

    const newResources = applyResourceDelta(delta, state.resources, RESOURCE_DEFINITIONS);

    // Update the signal to trigger reactivity
    stateSignal.value = {
        ...state,
        resources: newResources,
    };
}


export function addBuilding(id: string) {
    const state = stateSignal.value;

    // Check we have enough resources to build
    const building = BUILDING_DEFINITIONS[id];
    for (const [resId, amount] of Object.entries(building.cost)) {
        if (!amount || !state.resources[resId]) continue;

        if (state.resources[resId].amount < amount) {
            return; // Not enough resources
        }
    }

    // Deduct resources
    for (const [resId, amount] of Object.entries(building.cost)) {
        if (!amount || !state.resources[resId]) continue;

        state.resources[resId].amount -= amount;
    }

    // Add the building
    state.buildingTimers[id] = (state.buildingTimers[id] ?? []);
    state.buildingTimers[id].push(0);

    // Update the signal to trigger reactivity
    stateSignal.value = {
        ...state,
        buildingTimers: { ...state.buildingTimers },
    };
}
