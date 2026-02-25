import { BUILDING_DEFINITIONS } from "../../content/buildings.ts";
import { stateSignal } from "../../main.tsx";
import { addBuilding } from "../../game/actions.ts";
import { computed } from "@preact/signals";

export default function BuildingsPanel() {
  // console.log("Rendering BuildingsPanel");
  const buildingEntries = computed(() => stateSignal.value.buildings);

  return (
    <div style={{ border: "1px solid #334", borderRadius: 12, padding: 12 }}>
      <h3>Buildings</h3>

      {Object.entries(BUILDING_DEFINITIONS).map(([id, building]) => (
        <div key={id} style={{ marginBottom: 8 }}>
          <p>
            <strong>{building.name}</strong>
            <button style={{ marginTop: 4 }} onClick={() => addBuilding(building.id)}>
              Build {building.name}
            </button>
          </p>
          <p>
            (Costs: {Object.entries(building.cost).map(([resId, amount]) => `${resId}: ${amount}`).join(", ")})
            (Owned: {buildingEntries.value[building.id]?.length || 0})
          </p>
          { buildingEntries.value[building.id]?.map((buildingInstance, instanceId) => (
            <p>
              Building {instanceId + 1} workers:
              { buildingInstance.map((timer, i) => (
                <span key={i} style={{ marginLeft: 4 }}>{timer.toFixed(1)}</span>
              ))}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
