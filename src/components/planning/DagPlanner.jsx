import { useState } from "react";
import "./DagPlanner.css";

export default function DagPlanner({ planning = [] }) {
  const [datum, setDatum] = useState(new Date("2026-07-08"));

  const geselecteerdeDatum = datum.toISOString().split("T")[0];

  const diensten = planning.filter(
    (p) => p.datum === geselecteerdeDatum
  );

  return (
    <div className="dagplanner">
      <h2>📅 DagPlanner</h2>

      <h3>{datum.toLocaleDateString("nl-NL")}</h3>

      <p>Aantal diensten: {diensten.length}</p>

      {diensten.map((dienst) => (
        <div
          key={dienst.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "10px",
            background: "#fff",
          }}
        >
          <strong>{dienst.medewerker}</strong>
          <br />
          {dienst.terminal}
          <br />
          {dienst.dienst}
        </div>
      ))}
    </div>
  );
}