import { signal } from "@preact/signals";
import { render } from 'preact'
import App from "./ui/app.tsx";

import { createInitialGameState, loadGameState, saveGameState, type GameState } from "./game/state";
import { stepSimulation } from "./game/sim";
import { RESOURCES } from "./content/resources.ts";
import { BUILDINGS } from "./content/buildings.ts";

console.log("Starting game...");

const loadedState = loadGameState();
const initial = createInitialGameState(RESOURCES);

export const stateSignal = signal<GameState>(loadedState || initial);

console.log("Initial game state:", stateSignal.value);

let lastTime = 0;
const frameDuration = 250; // 1000ms / 4 fps

// If an old loop exists (from previous hot reload), kill it.
declare global { var animationFrameCallbackId: number | undefined; }
if (globalThis.animationFrameCallbackId != null) {
  console.debug("Canceling previous animation frame callback with id", globalThis.animationFrameCallbackId);
  cancelAnimationFrame(globalThis.animationFrameCallbackId);
}

function gameLoop(currentTime: number) {
  if (currentTime - lastTime < frameDuration) {
    // console.debug("Skipping frame. Time since last frame (ms):", currentTime - lastTime);
    globalThis.animationFrameCallbackId = requestAnimationFrame(gameLoop);
    return;
  }

  const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
  lastTime = currentTime;

  if (deltaTime > 0) { // TODO Handle large delta times (e.g., when tab is inactive)
    const newState = stepSimulation(deltaTime, stateSignal.value, RESOURCES, BUILDINGS);
    stateSignal.value = newState;
    saveGameState(newState);
  }

  globalThis.animationFrameCallbackId = requestAnimationFrame(gameLoop);
}
globalThis.animationFrameCallbackId = requestAnimationFrame(gameLoop);

// Expose state for debugging
(window as any).gameState = stateSignal;

render(<App />, document.getElementById("app")!);
