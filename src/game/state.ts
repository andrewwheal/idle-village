import { RESOURCE_DEFINITIONS, type ResourceId, type ResourceDefinitionMap } from "../content/resources";
import { BUILDING_DEFINITIONS, type BuildingId } from "../content/buildings";
import { initialResources } from "../content/resources";

export type ResourceState = {
  amount: number;
  capacity: number;
}

// TODO would a building ever "require" more than one worker to operate?
export type BuildingInstanceState = number[];
export type BuildingState = BuildingInstanceState[];

export type WorkerState = {
  // TODO for now we just have a count and cap of workers, but we may want to track individual workers in the future if we add more complex worker mechanics like training times or different worker types
  count: number;
  assigned: number; // TODO should we track assigned workers, or calculate it every time?
  population_capacity: number;
}

export type GameState = {
  gameTime: number;
  version: number;
  resources: Partial<Record<ResourceId, ResourceState>>;
  buildings: Partial<Record<BuildingId, BuildingState>>;
  workers: WorkerState;
}

// TODO should we have all resources/buildings in the state, or only those that have been unlocked/built?
export function createInitialGameState(resources: ResourceDefinitionMap): GameState {
  console.debug("Creating initial game state");

  const resourceStates: Partial<Record<ResourceId, ResourceState>> = {};
  for (const id of initialResources) {
    resourceStates[id] = {
      amount: 0,
      capacity: resources[id].baseCapacity,
    };
  }

  return {
    gameTime: 0,
    version: 3,
    resources: resourceStates,
    buildings: {},
    workers: {
      count: 0,
      assigned: 0,
      population_capacity: 0,
    },
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

    const latestVersion = 3;
    if (parsed.version != latestVersion) {
      // Keep a copy of the legacy state in case something goes wrong with the migration, and to allow for manual migration if needed
      localStorage.setItem("idle-village-state-legacy", savedState);
    }

    // TODO how should we actually handle game state versioning and migrations?
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
            Math.floor(Math.random() * 1000) / 1000 * BUILDING_DEFINITIONS[buildingId as BuildingId].cycleSeconds
          );
        }
      }
      delete parsed.buildings;

      parsed.version = 2;
    }
    if (parsed.version == 2) {
      // migrate from version 2 to version 2.1
      console.log("Migrating game state from version 2 to version 2.1");

      for (const [resourceId, resourceState] of Object.entries(parsed.resources)) {
        if (!resourceState) continue;
        (resourceState as any).capacity = RESOURCE_DEFINITIONS[resourceId as ResourceId].baseCapacity;
      }
      parsed.version = 2.1;
    }
    if (parsed.version == 2.1) {
      // migrate from version 2.1 to version 3
      console.log("Migrating game state from version 2.1 to version 3");

      let workerCount = 0;

      // Convert building timers to workers
      parsed.buildings = {};
      for (const [buildingId, timers] of Object.entries(parsed.buildingTimers) as [BuildingId, number[]][]) {
        parsed.buildings[buildingId] = [timers];
        workerCount += timers.length;
      }
      delete parsed.buildingTimers;

      parsed.workers = {
        count: workerCount,
        assigned: workerCount,
        population_capacity: workerCount,
      };

      parsed.version = 3;
    }

    return parsed;
  } catch (e) {
    console.error("Failed to load game state:", e);
    return null;
  }
}
