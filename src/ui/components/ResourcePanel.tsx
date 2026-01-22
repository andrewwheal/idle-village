import { stateSignal } from "../../main.tsx";

export default function ResourcePanel() {
  return (
    <div style={{ border: "1px solid #334", borderRadius: 12, padding: 12 }}>
      <h3>Resources</h3>
      
      {Object.entries(stateSignal.value.resources).map(([id, res]) => (
        <div key={id}>
          {res ? `${id}: ${res.amount} / ${res.capacity}` : `${id}: 0 / 0`}
        </div>
      ))}
    </div>
  );
}
