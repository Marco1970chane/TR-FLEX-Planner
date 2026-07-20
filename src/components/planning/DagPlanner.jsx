import { useMemo, useState } from "react";
import PlanningCard from "./PlanningCard";
import "./DagPlanner.css";

export default function DagPlanner({
  planning,
  onNieuweDienst,
  onEditDienst,
}) {
  const [datum, setDatum] = useState(new Date());

  function formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  const geselecteerdeDatum = formatDate(datum);

  const diensten = useMemo(
    () =>
      planning.filter((p) => p.datum === geselecteerdeDatum),
    [planning, geselecteerdeDatum]
  );

  function vorigeDag() {
    const d = new Date(datum);
    d.setDate(d.getDate() - 1);
    setDatum(d);
  }

  function volgendeDag() {
    const d = new Date(datum);
    d.setDate(d.getDate() + 1);
    setDatum(d);
  }

  function vandaag() {
    setDatum(new Date());
  }

  return (
    <div className="dagplanner">
      <div className="dagplanner-header">
        <button onClick={vorigeDag}>◀</button>

        <h3>{datum.toLocaleDateString("nl-NL")}</h3>

        <button onClick={volgendeDag}>▶</button>

        <button onClick={vandaag}>Vandaag</button>
      </div>

      <div className="dagplanner-lijst">
        {diensten.length === 0 && (
          <p>Geen diensten gepland.</p>
        )}

        {diensten.map((dienst) => (
          <PlanningCard
            key={dienst.id}
            dienst={dienst}
            onClick={() => onEditDienst(dienst)}
          />
        ))}
      </div>

      <button
        className="new-btn"
        onClick={() => onNieuweDienst(geselecteerdeDatum, "")}
      >
        + Nieuwe dienst
      </button>
    </div>
  );
}