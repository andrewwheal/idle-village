import type { ResourceId, Resource } from "../content/resources";
import type { BuildingId, Building } from "../content/buildings";
import type { GameState } from "./state";
import { cyclesToDelta, maxCyclesRunnable } from "./buildings";
import { applyResourceDelta, canApplyResourceDelta } from "./resources";


// TODO Should this be manipulating the gameState in place, or returning a new one?
export function stepSimulation(deltaTime: number, gameState: Readonly<GameState>, resources: Record<ResourceId, Resource>, buildings: Record<BuildingId, Building>): GameState {
  // if (deltaTime <= 0) return gameState;

  // TODO resource states need to also be deep copied if we want to avoid mutating the input state
  let current_resources: GameState["resources"] = { ...gameState.resources };
  const current_building_timers: GameState["buildingTimers"] = { ...gameState.buildingTimers };

  for (const [buildingId, timers] of Object.entries(current_building_timers)) {
    // Skip if no buildings of this type have been built (`!count` seems superfluous, but TS wants it)
    if (!timers || timers.length <= 0) continue;

    for (let i = 0; i < timers.length; i++) {
      timers[i] += deltaTime;
    }
    current_building_timers[buildingId as BuildingId] = timers;
  }

  // Process buildings in a loop in case later buildings produce resources consumed by others or consume resources at cap
  let anyProcessed = true;
  while (anyProcessed) {
    anyProcessed = false;
    for (const [buildingId, timers] of Object.entries(current_building_timers)) {
      if (!timers || timers.length <= 0) continue;

      const building = buildings[buildingId as BuildingId];

      for (let i = 0; i < timers.length; i++) {
        // TODO If there is some capacity left but not enough for a full cycle, do we want to allow the space to be filled even though it's technically not a full cycle? We currently leave "space" that the player may expect to be filled.
        const runnableCycles = Math.floor(timers[i] / building.cycleSeconds);
        if (runnableCycles < 1) continue;

        const maxCycles = maxCyclesRunnable(runnableCycles, current_resources, building, resources);
        if (maxCycles < 1) continue;

        const delta = cyclesToDelta(maxCycles, building);
        if (! canApplyResourceDelta(delta, current_resources)) continue;

        current_resources = applyResourceDelta(delta, current_resources, resources);
        timers[i] -= maxCycles * building.cycleSeconds;
        anyProcessed = true;
      }

      current_building_timers[buildingId as BuildingId] = timers;
    }
  }

  // Cap timers at their cycle time so we don't have infinitely growing timers which would cause space-time anomalies
  for (const [buildingId, timers] of Object.entries(current_building_timers)) {
    // Skip if no buildings of this type have been built (`!count` seems superfluous, but TS wants it)
    if (!timers || timers.length <= 0) continue;

    for (let i = 0; i < timers.length; i++) {
      timers[i] = Math.min(timers[i], buildings[buildingId].cycleSeconds);
    }

    current_building_timers[buildingId as BuildingId] = timers;
  }

  return { ...gameState, gameTime: gameState.gameTime + deltaTime, resources: current_resources, buildingTimers: current_building_timers };
}
