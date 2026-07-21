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

  const [isMobiel, setIsMobiel] = useState(
    window.matchMedia("(max-width: 900px)").matches
  );

  useEffect(() => {
    laadPlanning();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 900px)");

    const handleChange = (e) => {
      setIsMobiel(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
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

  function openPlanning(planningItem) {
    setGeselecteerdePlanning(planningItem);
    setToonForm(true);
  }

  return (
    <>
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
            onClick={() => {
              setGeselecteerdePlanning(null);
              setToonForm(true);
            }}
          >
            + Nieuwe dienst
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
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
            📅 Planner
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
              onEdit={openPlanning}
              onDelete={verwijderPlanning}
            />
          </>
        )}

        {weergave === "week" &&
          (isMobiel ? (
            <DagPlanner
              planning={planning}
              onEdit={openPlanning}
            />
          ) : (
            <WeekPlanner
              planning={planning}
              onEdit={openPlanning}
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