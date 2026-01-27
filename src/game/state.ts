import type { ResourceId, Resource } from "../content/resources";
import type { BuildingId } from "../content/buildings";
import { initialResources } from "../content/resources";

export type ResourceState = {
  amount: number;
  capacity: number;
}

export type GameState = {
  gameTime: number;
  version: number;
  resources: Partial<Record<ResourceId, ResourceState>>;
  buildings: Partial<Record<BuildingId, number>>;
}

// TODO should we have all resources/buildings in the state, or only those that have been unlocked/built?
export function createInitialGameState(resources: Record<ResourceId, Resource>): GameState {
  console.log("Creating initial game state");

  const resourceStates: Partial<Record<ResourceId, ResourceState>> = {};
  // for (const [id, resource] of Object.entries(resources)) {
  //   resourceStates[id as ResourceId] = {
  //     amount: 0,
  //     capacity: resource.baseCap,
  //   };
  // }
  for (const id of initialResources) {
    resourceStates[id] = {
      amount: 0,
      capacity: resources[id].baseCap,
    };
  }

  const buildingStates: Partial<Record<BuildingId, number>> = {};
  // for (const id of Object.keys(resources)) {
  //   buildingStates[id as BuildingId] = 0;
  // }

  return {
    gameTime: 0,
    version: 1,
    resources: resourceStates,
    buildings: buildingStates,
  } as GameState;
}

export function saveGameState(state: GameState): string {
  const stateStr = btoa(JSON.stringify(state));
  localStorage.setItem("idle-village-state", stateStr);
  return stateStr;
}

export function loadGameState(): GameState | null {
  try {
    const savedState = localStorage.getItem("idle-village-state");
    if (!savedState) {
      return null;
    }
    const decoded = atob(savedState);
    const parsed: GameState = JSON.parse(decoded);
    return parsed;
  } catch (e) {
    console.error("Failed to load game state:", e);
    return null;
  }
}
