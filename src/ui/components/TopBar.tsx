import { RESOURCE_DEFINITIONS } from "../../content/resources";
import { createInitialGameState } from "../../game/state";
import { stateSignal } from "../../main";

export default function TopBar() {
  console.log("Rendering TopBar");
  return (
    <header class="appHeader">
      <div class="headerRow">
        <div>
          <div class="title">Idle Village</div>
          <div class="subtitle">Resources and buildings... other things to come</div>
        </div>
        <button style={{ float: "right" }} type="button" onClick={() => { if (confirm("Are you sure you want to reset the game?")) { stateSignal.value = createInitialGameState(RESOURCE_DEFINITIONS); } }}>Reset Game</button>
      </div>
    </header>
  );
}
