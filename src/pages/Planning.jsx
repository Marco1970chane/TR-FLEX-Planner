import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import PlanningForm from "../components/PlanningForm";

export default function Planning() {
  const [planning, setPlanning] = useState([]);
  const [toonForm, setToonForm] = useState(false);

  async function laadPlanning() {
    const { data, error } = await supabase
      .from("planning")
      .select("*")
      .order("datum");

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (!error) {
      setPlanning(data);
    }
  }

  useEffect(() => {
    laadPlanning();
  }, []);

  return (
    <div className="table">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>📅 Planning</h2>

        <button
  className="new-btn"
  onClick={() => setToonForm(true)}
>
  + Nieuwe dienst
</button>
          
        
      </div>

      <table>
        <thead>
          <tr>
            <th>Datum</th>
            <th>Terminal</th>
            <th>Dienst</th>
            <th>Operator</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {planning.map((p) => (
            <tr key={p.id}>
              <td>
  {new Date(p.datum).toLocaleDateString("nl-NL")}
</td>
              <td>{p.terminal}</td>
              <td>{p.dienst}</td>
              <td>{p.medewerker || "OPEN"}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {toonForm && (
  <div className="modal">
    <div className="modal-content">
      <PlanningForm
        onSaved={() => {
          laadPlanning();
          setToonForm(false);
        }}
      />

      <button
        className="new-btn"
        onClick={() => setToonForm(false)}
        style={{ marginTop: "15px" }}
      >
        Sluiten
      </button>
    </div>
  </div>
)}
    </div>
  );
}