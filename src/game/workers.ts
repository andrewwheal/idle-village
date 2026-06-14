import { stateSignal } from "../main";
import type { BuildingId } from "../content/buildings";
import { type GameState, hasValidBuildingInstance } from "./state";

export function canAssignWorkerToBuilding(state: Readonly<GameState>, buildingId: BuildingId, instanceId: number): boolean {
    if (!hasValidBuildingInstance(state, buildingId, instanceId)) {
        return false;
    }
    
    return state.workers.assigned < state.workers.count
}

export function canRemoveWorkerFromBuilding(state: Readonly<GameState>, buildingId: BuildingId, instanceId: number): boolean {
    if (!hasValidBuildingInstance(state, buildingId, instanceId)) {
        return false;
    }

    return (state.buildings[buildingId]?.[instanceId]?.length ?? 0) > 0;
}

export function addWorkerToBuilding(buildingId: string, instanceId: number) {
    const state = stateSignal.value;

    if (!canAssignWorkerToBuilding(state, buildingId as BuildingId, instanceId)) {
        console.warn("Cannot assign more workers than available");
        return;
    }

    const buildingInstances = state.buildings[buildingId];
    if (!buildingInstances || !buildingInstances[instanceId]) {
        console.warn(`Invalid building (${buildingId}) or instance (${instanceId}) when adding worker`);
        return;
    }

    const updatedBuildingInstances = [...buildingInstances];
    updatedBuildingInstances[instanceId] = [...updatedBuildingInstances[instanceId], 0];

    stateSignal.value = {
        ...state,
        buildings: {
            ...state.buildings,
            [buildingId]: updatedBuildingInstances,
        },
        workers: {
            ...state.workers,
            assigned: state.workers.assigned + 1,
        },
    };
}

export function removeWorkerFromBuilding(buildingId: string, instanceId: number) {
    const state = stateSignal.value;

    const buildingInstances = state.buildings[buildingId];
    if (!buildingInstances || !buildingInstances[instanceId]) {
        console.warn(`Invalid building (${buildingId}) or instance ID (${instanceId}) when removing worker`);
        return;
    }

    if (!canRemoveWorkerFromBuilding(state, buildingId as BuildingId, instanceId)) {
        console.warn(`No removable worker on building (${buildingId}) instance (${instanceId})`);
        return;
    }

    const updatedBuildingInstances = [...buildingInstances];
    updatedBuildingInstances[instanceId] = updatedBuildingInstances[instanceId].slice(0, -1);

    stateSignal.value = {
        ...state,
        buildings: {
            ...state.buildings,
            [buildingId]: updatedBuildingInstances,
        },
        workers: {
            ...state.workers,
            assigned: Math.max(0, state.workers.assigned - 1),
        },
    };
}
