import { useState } from "react";
import PlanningCard from "./PlanningCard";
import "./DagPlanner.css";

export default function DagPlanner({ planning = [] }) {
  // Voor de test starten we op een datum waarvan we weten dat er diensten zijn.
  // Later veranderen we dit naar new Date().
  const [datum, setDatum] = useState(new Date("2026-07-08"));

  const geselecteerdeDatum = datum.toISOString().split("T")[0];

  const diensten = planning.filter(
    (p) => p.datum === geselecteerdeDatum
  );

  function vorigeDag() {
    const nieuweDatum = new Date(datum);
    nieuweDatum.setDate(nieuweDatum.getDate() - 1);
    setDatum(nieuweDatum);
  }

  function volgendeDag() {
    const nieuweDatum = new Date(datum);
    nieuweDatum.setDate(nieuweDatum.getDate() + 1);
    setDatum(nieuweDatum);
  }

  function vandaag() {
    setDatum(new Date());
  }

  return (
    <div className="dagplanner">
      <h2>📅 DagPlanner</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "15px",
          flexWrap: "wrap",
        }}
      >
        <button onClick={vorigeDag}>⬅️</button>
        <button onClick={vandaag}>Vandaag</button>
        <button onClick={volgendeDag}>➡️</button>
      </div>

      <h3>{datum.toLocaleDateString("nl-NL")}</h3>

      <p>
        <strong>{diensten.length}</strong> dienst(en)
      </p>

      {diensten.length === 0 ? (
        <p>Geen diensten op deze dag.</p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {diensten.map((dienst) => (
            <PlanningCard
              key={dienst.id}
              dienst={dienst}
              onClick={() => {
                // Hier koppelen we later het bewerkformulier.
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}