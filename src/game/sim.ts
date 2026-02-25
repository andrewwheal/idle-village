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
  let buildingState: GameState["buildings"] = {};
  for (const [buildingId, buildingInstances] of Object.entries(gameState.buildings)) {
    // Skip if no buildings of this type have been built, usually there wouldn't be an entry in the buildingTimers for a building that hasn't been built, but we might have un-built a building.
    if (!buildingInstances?.length) continue;

    buildingState[buildingId] = [];

    for (let i = 0; i < buildingInstances.length; i++) {
      const updatedTimers = buildingInstances[i].map(workerTimer => workerTimer + deltaTime);
      buildingState[buildingId].push(updatedTimers);
    }
  }

  // Process buildings in a loop in case later buildings produce resources consumed by others or consume resources at cap
  // TODO Possibly limit the number of loops we do if it becomes a performance issue, for now we monitor number of loops used to process buildings
  let processLoops = 0;
  let processedCycles = 0;
  let anyProcessed = true;
  while (anyProcessed) {
    anyProcessed = false;
    for (const [buildingId, buildingInstances] of Object.entries(buildingState)) {
      if (!buildingInstances || buildingInstances.length <= 0) continue;

      const buildingDefinition = buildingDefinitions[buildingId];

      for (let i = 0; i < buildingInstances.length; i++) {
        for (let j = 0; j < buildingInstances[i].length; j++) {
          // TODO If there is some capacity left but not enough for a full cycle, do we want to allow the space to be filled even though it's technically not a full cycle? We currently leave "space" that the player may expect to be filled.
          const runnableCycles = Math.floor(buildingInstances[i][j] / buildingDefinition.cycleSeconds);
          if (runnableCycles < 1) continue;

          const maxCycles = maxCyclesRunnable(runnableCycles, resourceState, buildingDefinition, resourceDefinitions);
          if (maxCycles < 1) continue;

          const delta = cyclesToDelta(maxCycles, buildingDefinition);
          if (! canApplyResourceDelta(delta, resourceState)) continue;

          resourceState = applyResourceDelta(delta, resourceState, resourceDefinitions);
          buildingInstances[i][j] -= maxCycles * buildingDefinition.cycleSeconds;
          anyProcessed = true;
          processedCycles += maxCycles;
        }
      }

      buildingState[buildingId] = buildingInstances;
    }
    anyProcessed && processLoops++;
  }

  if (processLoops > 2) {
    console.warn(`Processed ${processLoops} loops in one step`);
  }

  // Cap timers at their cycle time so we don't have infinitely growing timers which would cause space-time anomalies
  for (const [buildingId, buildingInstances] of Object.entries(buildingState)) {
    // Skip if no buildings of this type have been built (`!count` seems superfluous, but TS wants it)
    if (!buildingInstances || buildingInstances.length <= 0) continue;

    for (let i = 0; i < buildingInstances.length; i++) {
      for (let j = 0; j < buildingInstances[i].length; j++) {
        if (buildingInstances[i][j] > buildingDefinitions[buildingId].cycleSeconds * 2) {
          // TODO Is there a better way to cap timers. We want to stop them at cycleSeconds so a building doesn't run multiple times when freed up, but if we just cap at the cycleSeconds then they all get synced up which goes against the point of having individual instance timers.
          const instance_phase = buildingInstances[i][j] % buildingDefinitions[buildingId].cycleSeconds
          buildingInstances[i][j] = instance_phase + buildingDefinitions[buildingId].cycleSeconds;
        }
      }
    }

    buildingState[buildingId] = buildingInstances;
  }

  return { ...gameState, resources: resourceState, buildings: buildingState };
}
