import { stateSignal } from "../../main.tsx";
import { computed } from "@preact/signals";

export default function WorkerPanel() {
  // console.log("Rendering WorkerPanel");

  const workers = computed(() => stateSignal.value.workers);

  return (
    <div style={{ border: "1px solid #334", borderRadius: 12, padding: 12 }}>
      <h3>Workers</h3>

      <p>Population Cap: {workers.value.population_capacity}</p>
      <p>Total Workers: {workers.value.count}</p>
      <p>Assigned Workers: {workers.value.assigned}</p>
      <p>Unassigned Workers: {workers.value.count - workers.value.assigned}</p>
    </div>
  );
}
