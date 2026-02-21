import { signal } from "@preact/signals";
import { render } from 'preact'
import App from "./ui/app.tsx";

import { createInitialGameState, loadGameState, saveGameState, type GameState } from "./game/state";
import { stepSimulation } from "./game/sim";
import { RESOURCE_DEFINITIONS } from "./content/resources.ts";
import { BUILDING_DEFINITIONS } from "./content/buildings.ts";

console.log("Starting game...");

const loadedState = loadGameState();
const initial = createInitialGameState(RESOURCE_DEFINITIONS);

export const stateSignal = signal<GameState>(loadedState || initial);

console.debug("Initial game state:", stateSignal.value);

// TODO We could make the "FPS" configurable
const frameDuration = 0.250; // 1s / 4 fps

// If an old loop exists (from previous hot reload), kill it.
declare global { var animationFrameCallbackId: number | undefined; }
if (globalThis.animationFrameCallbackId != null) {
  console.debug("Canceling previous animation frame callback with id", globalThis.animationFrameCallbackId);
  cancelAnimationFrame(globalThis.animationFrameCallbackId);
}

function gameLoop(frameTime: number) {
  // Ignore frameTime, and use the actual current time.
  const currentTime = Date.now() / 1000;
  const deltaTime = (currentTime - stateSignal.value.gameTime);
  
  if (deltaTime < frameDuration) {
    // console.debug("Skipping frame. Time since last frame (s):", deltaTime);
    globalThis.animationFrameCallbackId = requestAnimationFrame(gameLoop);
    return;
  }

  if (deltaTime > 0) { // TODO Handle large delta times (e.g., when tab is inactive)
    const newState = stepSimulation(deltaTime, stateSignal.value, RESOURCE_DEFINITIONS, BUILDING_DEFINITIONS);
    newState.gameTime = currentTime;
    stateSignal.value = newState;
    saveGameState(newState);
  }

  globalThis.animationFrameCallbackId = requestAnimationFrame(gameLoop);
}
globalThis.animationFrameCallbackId = requestAnimationFrame(gameLoop);

// Expose state for debugging
(window as any).gameState = stateSignal;

render(<App />, document.getElementById("app")!);
