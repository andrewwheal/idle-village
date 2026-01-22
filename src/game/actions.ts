import { stateSignal } from "../main.tsx";
import { BUILDINGS } from "../content/buildings.ts";
import { ACTIONS, type ActionId } from "../content/actions.ts";

export function doAction(id: ActionId) {
    const state = stateSignal.value;
    const action = ACTIONS[id];

    // Add the resource gain
    for (const [resId, amount] of Object.entries(action.produces)) {
        if (!amount || !state.resources[resId]) continue;

        state.resources[resId].amount += amount;
    }

    // Update the signal to trigger reactivity
    stateSignal.value = {
        ...state,
        resources: { ...state.resources },
    };
}

export function addBuilding(id: string) {
    const state = stateSignal.value;

    // Check we have enough resources to build
    const building = BUILDINGS[id];
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
    state.buildings[id] = (state.buildings[id] ?? 0) + 1;

    // Update the signal to trigger reactivity
    stateSignal.value = {
        ...state,
        buildings: { ...state.buildings },
    };
}
