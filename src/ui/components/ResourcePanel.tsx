import { stateSignal } from "../../main.tsx";
import { ACTIONS } from "../../content/actions.ts";
import { doAction } from "../../game/actions.ts";

export default function ResourcePanel() {
  return (
    <div style={{ border: "1px solid #334", borderRadius: 12, padding: 12 }}>
      <h3>Resources</h3>

      {Object.entries(stateSignal.value.resources).map(([id, res]) => (
        <div key={id}>
          {res ? `${id}: ${res.amount} / ${res.capacity}` : `${id}: 0 / 0`}
        </div>
      ))}

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        {Object.entries(ACTIONS).map(([id, action]) => (
          <button onClick={() => doAction(id)}>{action.name}</button>
        ))}
      </div>
    </div>
  );
}
