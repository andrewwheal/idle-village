import { BUILDINGS } from "../../content/buildings.ts";
import { stateSignal } from "../../main.tsx";
import { addBuilding } from "../../game/actions.ts";
import { computed } from "@preact/signals";

export default function BuildingsPanel() {
  // console.log("Rendering BuildingsPanel");
  const buildingEntries = computed(() => stateSignal.value.buildingTimers);

  return (
    <div style={{ border: "1px solid #334", borderRadius: 12, padding: 12 }}>
      <h3>Buildings</h3>

      {Object.entries(BUILDINGS).map(([id, building]) => (
        <div key={id} style={{ marginBottom: 8 }}>
          <strong>{building.name}</strong> (Costs: {Object.entries(building.cost).map(([resId, amount]) => `${resId}: ${amount}`).join(", ")}) (Owned: {buildingEntries.value[building.id]?.length || 0})
          <button style={{ marginTop: 4 }} onClick={() => addBuilding(building.id)}>
            Build {building.name}
          </button>
          <p style={{ fontSize: "0.6em", marginTop: 4 }}>
            { (buildingEntries.value[building.id] || []).map((timer) => timer.toFixed(1)).join(", ") }
          </p>
        </div>
      ))}
    </div>
  );
}
