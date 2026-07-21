import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import PlanningCard from "./PlanningCard";
import "./DagPlanner.css";

export default function DagPlanner({
  planning = [],
  onEdit,
}) {
  const [datum, setDatum] = useState(new Date());

  useEffect(() => {
    if (planning.length === 0) return;

    const vandaag = new Date();
    vandaag.setHours(0, 0, 0, 0);

    const vandaagString = vandaag.toISOString().split("T")[0];

    // Is er planning vandaag?
    if (planning.some((p) => p.datum === vandaagString)) {
      setDatum(vandaag);
      return;
    }

    // Zoek eerstvolgende datum met planning
    const uniekeDatums = [...new Set(planning.map((p) => p.datum))].sort();

    const volgende =
      uniekeDatums.find((d) => d >= vandaagString) || uniekeDatums[0];

    if (volgende) {
      setDatum(new Date(`${volgende}T00:00:00`));
    }
  }, [planning]);

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

  const handlers = useSwipeable({
    onSwipedLeft: volgendeDag,
    onSwipedRight: vorigeDag,
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: false,
  });

  const geselecteerdeDatum = datum.toISOString().split("T")[0];

  const diensten = planning.filter(
    (p) => p.datum === geselecteerdeDatum
  );

  return (
    <div className="dagplanner" {...handlers}>
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

        <button onClick={vandaag}>
          Vandaag
        </button>

        <button onClick={volgendeDag}>➡️</button>
      </div>

      <h3>
        {datum.toLocaleDateString("nl-NL", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </h3>

      <p>
        <strong>{diensten.length}</strong>{" "}
        {diensten.length === 1 ? "dienst" : "diensten"}
      </p>

      {diensten.length === 0 ? (
        <div
          style={{
            padding: "30px",
            textAlign: "center",
            color: "#777",
          }}
        >
          Geen diensten gepland.
        </div>
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
              onClick={() => onEdit?.(dienst)}
            />
          ))}
        </div>
      )}
    </div>
  );
}