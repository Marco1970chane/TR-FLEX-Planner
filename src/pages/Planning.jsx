import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import PlanningForm from "../components/PlanningForm";
import PlanningTable from "../components/planning/PlanningTable";
import WeekPlanner from "../components/planning/WeekPlanner";
import DagPlanner from "../components/planning/DagPlanner";

export default function Planning() {
  const [planning, setPlanning] = useState([]);
  const [toonForm, setToonForm] = useState(false);
  const [geselecteerdePlanning, setGeselecteerdePlanning] = useState(null);
  const [zoekterm, setZoekterm] = useState("");
  const [weergave, setWeergave] = useState("lijst");
  const isMobiel = window.matchMedia("(max-width: 900px)").matches;

  // Planning laden
  useEffect(() => {
    laadPlanning();
  }, []);


  
    
    
    

    
    

    


  async function laadPlanning() {
    const { data, error } = await supabase
      .from("planning")
      .select("*")
      .order("datum");

    if (!error) {
      setPlanning(data);
    }
  }

  async function verwijderPlanning(id) {
    if (!window.confirm("Weet je zeker dat je deze dienst wilt verwijderen?")) {
      return;
    }

    const { error } = await supabase
      .from("planning")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    laadPlanning();
  }

  const gefilterdePlanning = planning.filter(
    (p) =>
      p.medewerker?.toLowerCase().includes(zoekterm.toLowerCase()) ||
      p.terminal?.toLowerCase().includes(zoekterm.toLowerCase())
  );

  return (
    <>
      <div className="table">

        {/* Tijdelijke test */}
        <h1 style={{ color: "red" }}>TEST V2</h1>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <h2>📅 Planning</h2>

          <p style={{ color: "red", fontWeight: "bold" }}>
            Breedte: {window.innerWidth}px | isMobiel: {isMobiel ? "JA" : "NEE"}
          </p>

          <button
            className="new-btn"
            onClick={() => {
              setGeselecteerdePlanning(null);
              setToonForm(true);
            }}
          >
            + Nieuwe dienst
          </button>
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button
            className="new-btn"
            onClick={() => setWeergave("lijst")}
          >
            📋 Lijst
          </button>

          <button
            className="new-btn"
            onClick={() => setWeergave("week")}
          >
            📅 Weekplanner
          </button>
        </div>

        {weergave === "lijst" && (
          <>
            <input
              type="text"
              placeholder="🔍 Zoek medewerker of terminal..."
              value={zoekterm}
              onChange={(e) => setZoekterm(e.target.value)}
            />

            <br />
            <br />

            <PlanningTable
              planning={gefilterdePlanning}
              onEdit={(planning) => {
                setGeselecteerdePlanning(planning);
                setToonForm(true);
              }}
              onDelete={verwijderPlanning}
            />
          </>
        )}

        {weergave === "week" &&
          (isMobiel ? (
            <DagPlanner
              planning={planning}
              onNieuweDienst={(datum, medewerker) => {
                setGeselecteerdePlanning({
                  datum,
                  medewerker,
                });
                setToonForm(true);
              }}
              onEditDienst={(dienst) => {
                setGeselecteerdePlanning(dienst);
                setToonForm(true);
              }}
            />
          ) : (
            <WeekPlanner
              planning={planning}
              onNieuweDienst={(datum, medewerker) => {
                setGeselecteerdePlanning({
                  datum,
                  medewerker,
                });
                setToonForm(true);
              }}
              onEditDienst={(dienst) => {
                setGeselecteerdePlanning(dienst);
                setToonForm(true);
              }}
            />
          ))}
      </div>

      {toonForm && (
        <div className="modal">
          <div className="modal-content">
            <PlanningForm
              planning={geselecteerdePlanning}
              defaultDatum={geselecteerdePlanning?.datum || ""}
              defaultMedewerker={geselecteerdePlanning?.medewerker || ""}
              onSaved={() => {
                laadPlanning();
                setToonForm(false);
                setGeselecteerdePlanning(null);
              }}
            />

            <button
              className="new-btn"
              style={{ marginTop: "15px" }}
              onClick={() => {
                setToonForm(false);
                setGeselecteerdePlanning(null);
              }}
            >
              Sluiten
            </button>
          </div>
        </div>
      )}
    </>
  );
}