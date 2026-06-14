import { createPortal } from "preact/compat";
import { useState } from "preact/hooks";
import { RESOURCE_DEFINITIONS } from "../../content/resources";
import { createInitialGameState } from "../../game/state";
import { stateSignal } from "../../main";


function HelpPopup({ onClose }: { onClose: () => void }) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}
      onClick={onClose}
    >
      <div
        style={{ background: "radial-gradient(1200px 800px at 30% 10%, #1e293b 0%, var(--bg) 55%)", padding: "2em", borderRadius: "8px", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", textAlign: "left", margin: "0 1rem", width: "calc(100% - 2rem)", boxSizing: "border-box" }}
        onClick={(event) => event.stopPropagation()}
      >
        <h2>Help</h2>
        <p>Welcome to Idle Village! This game is in development and has a long way to go.</p>
        <p>Use the buttons in the building panel to construct buildings and assign workers to them. Each building produces resources over time.</p>
        <p>Keep an eye on your resources and make sure to manage your workers effectively!</p>
        <hr />
        <h2>Notes</h2>
        <p>The timers next to buildings represent each worker and their progress. This obviously needs some UI work 😅</p>
        <p>There is currently no way to get more workers 🤦 this is the next feature to be implemented.</p>
        <p>The game is in no way balanced and your resources fill up fast, so there's currently a reset button if you want to start over.</p>
        <button type="button" onClick={onClose}>Close</button>
      </div>
    </div>,
    document.body
  );
}

export default function TopBar() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <header class="appHeader">
      <div class="headerRow">
        <div>
          <div class="title">Idle Village</div>
          <div class="subtitle">Resources and buildings... other things to come</div>
        </div>
        <div style={{ float: "right", marginLeft: "auto" }}>
          <button type="button" style={{ marginRight: "0.5rem" }} onClick={() => setShowHelp(true)}>❔</button>
          <button type="button" onClick={() => { if (confirm("Are you sure you want to reset the game?")) { stateSignal.value = createInitialGameState(RESOURCE_DEFINITIONS); } }}>Reset Game</button>
        </div>
      </div>
      {showHelp ? <HelpPopup onClose={() => setShowHelp(false)} /> : null}
    </header>
  );
}
