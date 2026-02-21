import type { ResourceDefinitionMap } from "../content/resources";
import type { BuildingDefinitionMap } from "../content/buildings";
import type { GameState } from "./state";
import { cyclesToDelta, maxCyclesRunnable } from "./buildings";
import { applyResourceDelta, canApplyResourceDelta } from "./resources";


// TODO Ensure that there is no mutation of the input gameState or its nested objects, we want to treat it as immutable and return a new updated state object.
// TODO If two buildings produce or consume the same resource are the order they are processed important? Perhaps we need to process buildings on a first come first basis, but that would require sorting individual timers across all building types.
export function stepSimulation(deltaTime: number, gameState: Readonly<GameState>, resourceDefinitions: ResourceDefinitionMap, buildingDefinitions: BuildingDefinitionMap): GameState {
  if (deltaTime > 5) {
    // Probably slept?
    console.warn(`deltaTime is ${deltaTime}s`);
  }

  // Following copy-on-write, we don't need to deep copy here, we can rely on that happening later if/when resources are updated.
  let resourceState: GameState["resources"] = { ...gameState.resources };
  
  // Deep copy building timers while incrementing them
  let buildingTimerState: GameState["buildingTimers"] = {};
  for (const [buildingId, timers] of Object.entries(gameState.buildingTimers)) {
    // Skip if no buildings of this type have been built, usually there wouldn't be an entry in the buildingTimers for a building that hasn't been built, but we might have un-built a building.
    if (!timers?.length) continue;

    buildingTimerState[buildingId] = [];

    for (let i = 0; i < timers.length; i++) {
      buildingTimerState[buildingId][i] = timers[i] + deltaTime;
    }
  }

  // Process buildings in a loop in case later buildings produce resources consumed by others or consume resources at cap
  // TODO Possibly limit the number of loops we do if it becomes a performance issue, for now we monitor number of loops used to process buildings
  let processLoops = 0;
  let processedCycles = 0;
  let anyProcessed = true;
  while (anyProcessed) {
    anyProcessed = false;
    for (const [buildingId, timers] of Object.entries(buildingTimerState)) {
      if (!timers || timers.length <= 0) continue;

      const buildingDefinition = buildingDefinitions[buildingId];

      for (let i = 0; i < timers.length; i++) {
        // TODO If there is some capacity left but not enough for a full cycle, do we want to allow the space to be filled even though it's technically not a full cycle? We currently leave "space" that the player may expect to be filled.
        const runnableCycles = Math.floor(timers[i] / buildingDefinition.cycleSeconds);
        if (runnableCycles < 1) continue;

        const maxCycles = maxCyclesRunnable(runnableCycles, resourceState, buildingDefinition, resourceDefinitions);
        if (maxCycles < 1) continue;

        const delta = cyclesToDelta(maxCycles, buildingDefinition);
        if (! canApplyResourceDelta(delta, resourceState)) continue;

        resourceState = applyResourceDelta(delta, resourceState, resourceDefinitions);
        timers[i] -= maxCycles * buildingDefinition.cycleSeconds;
        anyProcessed = true;
        processedCycles += maxCycles;
      }

      buildingTimerState[buildingId] = timers;
    }
    anyProcessed && processLoops++;
  }

  if (processLoops > 2) {
    console.warn(`Processed ${processLoops} loops in one step`);
  }

  // Cap timers at their cycle time so we don't have infinitely growing timers which would cause space-time anomalies
  for (const [buildingId, timers] of Object.entries(buildingTimerState)) {
    // Skip if no buildings of this type have been built (`!count` seems superfluous, but TS wants it)
    if (!timers || timers.length <= 0) continue;

    for (let i = 0; i < timers.length; i++) {
      if (timers[i] > buildingDefinitions[buildingId].cycleSeconds * 2) {
        // TODO Is there a better way to cap timers. We want to stop them at cycleSeconds so a building doesn't run multiple times when freed up, but if we just cap at the cycleSeconds then they all get synced up which goes against the point of having individual instance timers.
        const instance_phase = timers[i] % buildingDefinitions[buildingId].cycleSeconds
        timers[i] = instance_phase + buildingDefinitions[buildingId].cycleSeconds;
      }
    }

    buildingTimerState[buildingId] = timers;
  }

  return { ...gameState, resources: resourceState, buildingTimers: buildingTimerState };
}
