import { BUILDINGS } from "../../content/buildings.ts";
import { stateSignal, addBuilding } from "../../main.tsx";

export default function BuildingsPanel() {
  const state = stateSignal.value;

  return (
    <div style={{ border: "1px solid #334", borderRadius: 12, padding: 12 }}>
      <h3>Buildings</h3>

      {Object.entries(BUILDINGS).map(([id, building]) => (
        <div key={id} style={{ marginBottom: 8 }}>
          <strong>{building.name}</strong> (Owned: {state.buildings[building.id] || 0})
          <button style={{ marginTop: 4 }} onClick={() => addBuilding(building.id)}>
            Build {building.name}
          </button>
        </div>
      ))}
    </div>
  );
}
