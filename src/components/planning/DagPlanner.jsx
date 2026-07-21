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

      <p>Totaal aantal diensten: {planning.length}</p>

<pre
  style={{
    background: "#f5f5f5",
    padding: "10px",
    overflow: "auto",
    fontSize: "12px",
  }}
>
  {JSON.stringify(planning.slice(0, 5), null, 2)}
</pre>
        
      
    </div>
  );
}