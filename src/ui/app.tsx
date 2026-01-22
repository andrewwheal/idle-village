import './styles/index.css'
import './styles/app.css'
import TopBar from "./components/TopBar";
import ResourcePanel from "./components/ResourcePanel";
import BuildingPanel from "./components/BuildingPanel";

export default function App() {
  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <TopBar />
      <ResourcePanel />
      <BuildingPanel />
    </div>
  )
}
