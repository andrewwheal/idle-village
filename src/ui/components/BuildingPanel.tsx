import { BUILDING_DEFINITIONS } from "../../content/buildings.ts";
import { RESOURCE_DEFINITIONS } from "../../content/resources.ts";
import type { BuildingId } from "../../content/buildings.ts";
import { stateSignal } from "../../main.tsx";
import { addBuilding } from "../../game/actions.ts";
import {
  addWorkerToBuilding,
  canAssignWorkerToBuilding,
  canRemoveWorkerFromBuilding,
  removeWorkerFromBuilding,
} from "../../game/workers.ts";

function formatCost(cost: Partial<Record<string, number>>): string {
  return Object.entries(cost)
    .map(([resId, amount]) => `${amount} ${RESOURCE_DEFINITIONS[resId].name}`)
    .join(", ");
}

type BuildingInstanceRowProps = {
  buildingId: BuildingId;
  buildingName: string;
  instanceId: number;
  workerTimers: number[];
};

function BuildingInstanceRow({ buildingId, buildingName, instanceId, workerTimers }: BuildingInstanceRowProps) {
  const state = stateSignal.value;
  const canAssign = canAssignWorkerToBuilding(state, buildingId, instanceId);
  const canRemove = canRemoveWorkerFromBuilding(state, buildingId, instanceId);

  return (
    <p key={instanceId}>
      Building {instanceId + 1} workers:

      <button
        aria-label={`Add worker to ${buildingName} ${instanceId + 1}`}
        style={{ marginLeft: "0.3em", padding: "0.3em 0.5em" }}
        type="button"
        disabled={!canAssign}
        onClick={() => addWorkerToBuilding(buildingId, instanceId)}
      >
        ➕
      </button>

      <button
        aria-label={`Remove worker from ${buildingName} ${instanceId + 1}`}
        style={{ marginLeft: "0.3em", padding: "0.3em 0.5em" }}
        type="button"
        disabled={!canRemove}
        onClick={() => removeWorkerFromBuilding(buildingId, instanceId)}
      >
        ➖
      </button>

      {workerTimers.map((timer, i) => (
        <span key={i} style={{ marginLeft: "0.5em" }}>{timer.toFixed(1)}</span>
      ))}
    </p>
  );
}

type BuildingCardProps = {
  buildingId: BuildingId;
};

function BuildingCard({ buildingId }: BuildingCardProps) {
  const state = stateSignal.value;
  const building = BUILDING_DEFINITIONS[buildingId];
  const ownedInstances = state.buildings[buildingId] ?? [];

  return (
    <div key={buildingId} style={{ marginBottom: 8 }}>
      <p>
        <strong>{building.name}</strong>
        <span style={{ marginLeft: "1em", color: "#888", fontSize: "0.8em" }}>(Owned: {ownedInstances.length})</span>
      </p>
      <p>
        <button aria-label={`Build ${building.name}`} onClick={() => addBuilding(building.id)}>
          Build
          <span style={{ marginLeft: "1em", color: "#888", fontSize: "0.8em" }}>(Costs: {formatCost(building.cost)})</span>
        </button>
      </p>
      {ownedInstances.map((workerTimers, instanceId) => (
        <BuildingInstanceRow
          key={instanceId}
          buildingId={building.id}
          buildingName={building.name}
          instanceId={instanceId}
          workerTimers={workerTimers}
        />
      ))}
    </div>
  );
}

export default function BuildingsPanel() {
  return (
    <div style={{ border: "1px solid #334", borderRadius: 12, padding: 12 }}>
      <h3>Buildings</h3>

      {(Object.keys(BUILDING_DEFINITIONS) as BuildingId[]).map((buildingId) => (
        <BuildingCard key={buildingId} buildingId={buildingId} />
      ))}
    </div>
  );
}
