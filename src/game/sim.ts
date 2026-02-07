import type { ResourceId, Resource } from "../content/resources";
import type { BuildingId, Building } from "../content/buildings";
import type { GameState } from "./state";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// TODO Should this be manipulating the gameState in place, or returning a new one?
export function stepSimulation(deltaTime: number, gameState: Readonly<GameState>, resources: Record<ResourceId, Resource>, buildings: Record<BuildingId, Building>): GameState {
  // if (deltaTime <= 0) return gameState;

  // TODO resource states need to also be deep copied if we want to avoid mutating the input state
  const current_resources = { ...gameState.resources };

  // TODO How could we handle a building processed early not having enough resources to consume which are later produced by another building?
  for (const [buildingId, count] of Object.entries(gameState.buildings)) buildingLoop:{
    // Skip if no buildings of this type have been built (`!count` seems superfluous, but TS wants it)
    if (!count || count <= 0) {
      // console.debug("Skipping building:", buildingId, "count:", count);
      continue;
    }
    
    // console.log("Processing building:", buildingId, "count:", count);

    const building = buildings[buildingId as BuildingId];

    let resourceChanges: Partial<Record<ResourceId, number>> = {};
    
    // Calculate resource consumption, checking if we have enough resources to consume
    if (building.consumes) {
      // console.log("Building consumes resources:", building.consumes);
      for (const [resourceId, amount] of Object.entries(building.consumes)) {
        // Shouldn't be necessary but TS wants it
        if (!amount) continue;

        const resourceState = gameState.resources[resourceId as ResourceId];
        if (!resourceState || resourceState.amount < amount * count * deltaTime) {
          // TODO If we have 2 buildings, we might have enough for one but not both
          // Not enough resources to run this building, skip to next building
          console.log("Not enough resource", resourceId, "to run building", buildingId);
          break buildingLoop;
        }

        resourceChanges[resourceId as ResourceId] = -amount * count * deltaTime;
      }
    }

    // Calculate resource production
    // console.log("Building produces resources:", building.produces);
    for (const [resourceId, amount] of Object.entries(building.produces)) {
      // Shouldn't be necessary but TS wants it
      if (!amount) continue;

      const change = (resourceChanges[resourceId as ResourceId] || 0) + amount * count * deltaTime;

      const resourceState = gameState.resources[resourceId as ResourceId];
      if (!resourceState || resourceState.raw_amount + change > resourceState.capacity) {
        // TODO If we have 2 buildings, we might have enough for one but not both
        // Not enough capacity to store produced resources, skip to next building
        // console.log("Not enough capacity for resource", resourceId, "to store production from building", buildingId);
        break buildingLoop;
      }

      // console.log("Producing resource", resourceId, "amount", amount * count * deltaTime);
      resourceChanges[resourceId as ResourceId] = change;
      // console.log("Total change for resource", resourceId, "is now", resourceChanges[resourceId as ResourceId]);
    }

    // Apply resource changes
    // console.log("Applying resource changes:", resourceChanges);
    for (const [resourceId, change] of Object.entries(resourceChanges)) {
      if (!change || change === 0) continue;
      
      // TODO How best to handle fractions of resources? Rounding here would starve small productions, currenlty rounding in UI, but that feels wrong
      let resourceState = current_resources[resourceId as ResourceId] || { amount: 0, raw_amount: 0, capacity: resources[resourceId as ResourceId].baseCap };
      // console.log("Resource", resourceId, "before change:", resourceState.amount, "change:", change, "capacity:", resourceState.capacity);
      resourceState.raw_amount = clamp(resourceState.raw_amount + change, 0, resourceState.capacity);
      resourceState.amount = Math.floor(resourceState.raw_amount);
      current_resources[resourceId as ResourceId] = { ...resourceState };
    }
  }

  return { ...gameState, gameTime: gameState.gameTime + deltaTime, resources: current_resources };
}
