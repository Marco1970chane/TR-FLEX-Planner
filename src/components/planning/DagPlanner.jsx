import { useState } from "react";
import "./DagPlanner.css";

export default function DagPlanner({ planning = [] }) {
  const [datum] = useState(new Date());

  const geselecteerdeDatum = datum.toISOString().split("T")[0];

  const diensten = planning.filter(
    (p) => p.datum === geselecteerdeDatum
  );

  return (
    <div className="dagplanner">
      <h2>📅 DagPlanner</h2>

      <h3>{datum.toLocaleDateString("nl-NL")}</h3>

      <p>
        Vandaag zijn er <strong>{diensten.length}</strong> dienst(en).
      </p>
    </div>
  );
}