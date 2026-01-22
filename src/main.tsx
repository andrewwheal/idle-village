import { signal } from "@preact/signals";
import { render } from 'preact'
import App from "./ui/app.tsx";

import { createInitialGameState, type GameState } from "./game/state";
import { stepSimulation } from "./game/sim";
import { RESOURCES } from "./content/resources.ts";
import { BUILDINGS } from "./content/buildings.ts";

console.log("Starting game...");

const initial = createInitialGameState(RESOURCES);

export const stateSignal = signal<GameState>(initial);

console.log("Initial game state:", stateSignal.value);

export function addBuilding(id: string) {
  const state = stateSignal.value;
  state.buildings[id] = (state.buildings[id] ?? 0) + 1;

  stateSignal.value = {
    ...state,
    buildings: { ...state.buildings },
  };
}

function tick(dt: number) {
  const state = stateSignal.value;
  stepSimulation(dt, state, BUILDINGS);

  // Force rerender by updating the signal
  stateSignal.value = { ...state! };
}

// "Hack" to stop multiple intervals/states when module is reloaded in dev mode
declare global {var __idleVillageIntervalId: number | undefined;}
if (globalThis.__idleVillageIntervalId != null) clearInterval(globalThis.__idleVillageIntervalId);

globalThis.__idleVillageIntervalId = window.setInterval(() => tick(1), 1000);

// Expose state for debugging
(window as any).gameState = stateSignal;

render(<App />, document.getElementById("app")!);
