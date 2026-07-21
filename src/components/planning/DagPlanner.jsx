import { useState } from "react";
import "./DagPlanner.css";

export default function DagPlanner() {
  const [datum, setDatum] = useState(new Date());

  return (
    <div className="dagplanner">
      <h2>📅 DagPlanner</h2>

      <h3>{datum.toLocaleDateString("nl-NL")}</h3>

      <button onClick={() => setDatum(new Date())}>
        Vandaag
      </button>
    </div>
  );
}