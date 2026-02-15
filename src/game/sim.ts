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

  // TODO How could we handle a building processed early not having enough resources to consume which are later produced by another building?
  // TODO We could do multiple passes until we have processed all buildings or we can't process any more buildings. Maybe one pass to increment timers, then repeated passes to process buildings until no timers are ready or we can't apply any more cycles, then a final pass to "reset" timers to their max so we don't have infinite timers to apply any time resources are used.
  for (const [buildingId, timers] of Object.entries(current_building_timers)) {
    // Skip if no buildings of this type have been built (`!count` seems superfluous, but TS wants it)
    if (!timers || timers.length <= 0) {
      // console.debug("Skipping building:", buildingId, "count:", count);
      continue;
    }

    const building = buildings[buildingId as BuildingId];

    for (let i = 0; i < timers.length; i++) {
      timers[i] += deltaTime;
      // If a timer should complete every 5 seconds and the delta is 10 seconds, should we:
      // - run the building twice (or more) to catch up
      // - run the building once then other buildings which might produce resources it consumes, then run it again to catch up
      // - run the building once and carry over extra time to the next tick
      const runnableCycles = Math.floor(timers[i] / building.cycleSeconds);
      if (runnableCycles < 1) continue;

      const maxCycles = maxCyclesRunnable(runnableCycles, gameState, building, resources);
      if (maxCycles < 1) continue;

      const delta = cyclesToDelta(maxCycles, building);
      if (! canApplyResourceDelta(delta, current_resources)) continue;

      current_resources = applyResourceDelta(delta, current_resources, resources);
      timers[i] -= maxCycles * building.cycleSeconds;
    }

    current_building_timers[buildingId as BuildingId] = timers;
  }

  return { ...gameState, gameTime: gameState.gameTime + deltaTime, resources: current_resources, buildingTimers: current_building_timers };
}
