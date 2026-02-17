import { RESOURCES, type ResourceId, type Resource } from "../content/resources";
import { BUILDINGS, type BuildingId } from "../content/buildings";
import { initialResources } from "../content/resources";

export type ResourceState = {
  amount: number;
  capacity: number;
}

export type GameState = {
  gameTime: number;
  version: number;
  resources: Partial<Record<ResourceId, ResourceState>>;
  buildingTimers: Partial<Record<BuildingId, number[]>>;
}

// TODO should we have all resources/buildings in the state, or only those that have been unlocked/built?
export function createInitialGameState(resources: Record<ResourceId, Resource>): GameState {
  console.debug("Creating initial game state");

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
      capacity: resources[id].baseCapacity,
    };
  }

  const buildingTimers: Partial<Record<BuildingId, number[]>> = {};
  // for (const id of Object.keys(resources)) {
  //   buildingStates[id as BuildingId] = 0;
  // }

  return {
    gameTime: 0,
    version: 2,
    resources: resourceStates,
    buildingTimers: buildingTimers,
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
    console.debug("Loading saved game state:", savedState);
    const decoded = atob(savedState);
    const parsed: any = JSON.parse(decoded);

    if (parsed.version == 1) {
      // migrate from version 1 to version 2
      console.log("Migrating game state from version 1 to version 2");

      // Convert building counts to timers
      parsed.buildingTimers = {};
      for (const [buildingId, count] of Object.entries(parsed.buildings)) {
        //parsed.buildingTimers[buildingId] = Array(count as number).fill(0);
        parsed.buildingTimers[buildingId] = [];
        for (let i = 0; i < (count as number); i++) {
          parsed.buildingTimers[buildingId].push(
            Math.floor(Math.random() * 1000) / 1000 * BUILDINGS[buildingId as BuildingId].cycleSeconds
          );
        }
      }
      delete parsed.buildings;

      parsed.version = 2;
    }
    if (parsed.version == 2) {
      for (const [resourceId, resourceState] of Object.entries(parsed.resources)) {
        if (!resourceState) continue;
        (resourceState as any).capacity = RESOURCES[resourceId as ResourceId].baseCapacity;
      }
      parsed.version = 2.1;
    }

    return parsed;
  } catch (e) {
    console.error("Failed to load game state:", e);
    return null;
  }
}
