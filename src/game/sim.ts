import type { ResourceId, Resource } from "../content/resources";
import type { BuildingId, Building } from "../content/buildings";
import type { GameState } from "./state";


function canRunBuilding(building: Building, current_resources: GameState["resources"]): boolean {
  if (building.consumes) {
    for (const [resourceId, amount] of Object.entries(building.consumes)) {
      if (!amount) continue;
      const resourceState = current_resources[resourceId as ResourceId];
      if (!resourceState || resourceState.amount < amount) {
        return false;
      }
    }
  }

  for (const [resourceId, amount] of Object.entries(building.produces)) {
    if (!amount) continue;
    const resourceState = current_resources[resourceId as ResourceId];
    if (resourceState && resourceState.amount + amount > resourceState.capacity) {
      return false;
    }
  }

  return true;
}


function applyBuildingEffects(building: Building, current_resources: GameState["resources"], resourceDefs: Record<ResourceId, Resource>): GameState["resources"] {
  let updated_resources = { ...current_resources };

  if (building.consumes) {
    for (const [resourceId, amount] of Object.entries(building.consumes)) {
      if (!amount) continue;
      const resourceState = updated_resources[resourceId as ResourceId]!;
      updated_resources[resourceId as ResourceId] = {
        ...resourceState,
        amount: resourceState.amount - amount
      };
    }
  }

  for (const [resourceId, amount] of Object.entries(building.produces)) {
    if (!amount) continue;
    const resourceState = updated_resources[resourceId as ResourceId] || { amount: 0, raw_amount: 0, capacity: resourceDefs[resourceId as ResourceId].baseCap };
    updated_resources[resourceId as ResourceId] = {
      ...resourceState,
      amount: resourceState.amount + amount
    };
  }

  return updated_resources;
}


// TODO Should this be manipulating the gameState in place, or returning a new one?
export function stepSimulation(deltaTime: number, gameState: Readonly<GameState>, resources: Record<ResourceId, Resource>, buildings: Record<BuildingId, Building>): GameState {
  // if (deltaTime <= 0) return gameState;

  // TODO resource states need to also be deep copied if we want to avoid mutating the input state
  let current_resources: GameState["resources"] = { ...gameState.resources };
  const current_building_timers: GameState["buildingTimers"] = { ...gameState.buildingTimers };

  // TODO How could we handle a building processed early not having enough resources to consume which are later produced by another building?
  for (const [buildingId, timers] of Object.entries(current_building_timers)) buildingLoop:{
    // Skip if no buildings of this type have been built (`!count` seems superfluous, but TS wants it)
    if (!timers || timers.length <= 0) {
      // console.debug("Skipping building:", buildingId, "count:", count);
      continue;
    }

    const building = buildings[buildingId as BuildingId];

    // TODO timers aren't getting updated in the game state
    for (let i = 0; i < timers.length; i++) {
      timers[i] += deltaTime;
      // If a timer should complete every 5 seconds and the delta is 10 seconds, should we:
      // - run the building twice (or more) to catch up
      // - run the building once then other buildings which might produce resources it consumes, then run it again to catch up
      // - run the building once and carry over extra time to the next tick
      if (timers[i] >= building.cycleSeconds) {
        if (!canRunBuilding(building, current_resources)) {
          // Not enough resources to run this building instance, skip to next building (we wouldn't have enough resources to run any more instances of this building either, so no point checking them)
          timers[i] = building.cycleSeconds; // stop the timer from running away, once ready it waits
          break;
        }
        
        timers[i] -= building.cycleSeconds;
        current_resources = applyBuildingEffects(building, current_resources, resources);
      }
    }

    current_building_timers[buildingId as BuildingId] = timers;
  }

  return { ...gameState, gameTime: gameState.gameTime + deltaTime, resources: current_resources };
}
