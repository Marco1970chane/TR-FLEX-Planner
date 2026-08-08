import { useEffect, useState } from "react";
import { addWeeks } from "date-fns";

import { supabase } from "../services/supabase";
import { useAuthContext } from "../contexts/AuthContext";

import PlanningHeader from "../components/planning/PlanningHeader";
import WeekFilters from "../components/planning/WeekFilters";

import PlanningStats from "../components/planning/PlanningStats";
import PlanningTable from "../components/planning/PlanningTable";
import WeekPlanner from "../components/planning/WeekPlanner";
import DagPlanner from "../components/planning/DagPlanner";

import PlanningForm from "../components/PlanningForm";

export default function Planning() {
  const { profile } = useAuthContext();

  const magBeheren = [
    "admin",
    "planner",
    "operations",
  ].includes(profile?.rol);

  const [planning, setPlanning] = useState([]);

  const [toonForm, setToonForm] = useState(false);

  const [geselecteerdePlanning, setGeselecteerdePlanning] =
    useState(null);

  const [zoekterm, setZoekterm] = useState("");

  const [weergave, setWeergave] =
    useState("week");

  const [currentWeek, setCurrentWeek] =
    useState(new Date());

  const [isMobiel, setIsMobiel] =
    useState(
      window.matchMedia("(max-width:900px)")
        .matches
    );

  useEffect(() => {
    if (profile) {
      laadPlanning();
    }
  }, [profile]);

  useEffect(() => {
    const media =
      window.matchMedia("(max-width:900px)");

    function handleChange(e) {
      setIsMobiel(e.matches);
    }

    media.addEventListener(
      "change",
      handleChange
    );

    return () =>
      media.removeEventListener(
        "change",
        handleChange
      );
  }, []);

  async function laadPlanning() {
    let query = supabase
      .from("planning")
      .select("*")
      .order("datum");

    if (profile?.rol === "medewerker") {
      query = query.eq(
        "medewerker",
        profile.naam
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      return;
    }

    setPlanning(data || []);
  }

  async function verwijderPlanning(id) {
    if (
      !window.confirm(
        "Weet je zeker dat je deze dienst wilt verwijderen?"
      )
    ) {
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

  function openPlanning(item) {
    setGeselecteerdePlanning(item);
    setToonForm(true);
  }

  const gefilterdePlanning =
    planning.filter((p) => {
      const zoek =
        zoekterm.toLowerCase();

      return (
        (p.medewerker || "Open dienst")
          .toLowerCase()
          .includes(zoek) ||
        (p.terminal || "")
          .toLowerCase()
          .includes(zoek) ||
        (p.status || "")
          .toLowerCase()
          .includes(zoek)
      );
    });
      return (
    <>
      <div
        style={{
          background: "#f8fafc",
          minHeight: "100vh",
          padding: "25px",
        }}
      >
        <PlanningHeader
          currentWeek={currentWeek}
          onPreviousWeek={() =>
            setCurrentWeek(addWeeks(currentWeek, -1))
          }
          onNextWeek={() =>
            setCurrentWeek(addWeeks(currentWeek, 1))
          }
          onToday={() =>
            setCurrentWeek(new Date())
          }
          onNieuweDienst={() => {
            setGeselecteerdePlanning(null);
            setToonForm(true);
          }}
        />

        <WeekFilters
          zoekterm={zoekterm}
          setZoekterm={setZoekterm}
        />

        <PlanningStats planning={planning} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "25px",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              className="new-btn"
              style={{
                background:
                  weergave === "lijst"
                    ? "#15803d"
                    : "#22c55e",
              }}
              onClick={() =>
                setWeergave("lijst")
              }
            >
              📋 Lijst
            </button>

            <button
              className="new-btn"
              style={{
                background:
                  weergave === "week"
                    ? "#15803d"
                    : "#22c55e",
              }}
              onClick={() =>
                setWeergave("week")
              }
            >
              📅 Planner
            </button>
          </div>

          <div
            style={{
              color: "#166534",
              fontWeight: "600",
              fontSize: "15px",
            }}
          >
            {planning.length} diensten gevonden
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            padding: "20px",
            boxShadow:
              "0 8px 24px rgba(0,0,0,.08)",
            border:
              "1px solid #dcfce7",
          }}
        >
          {weergave === "lijst" ? (
            <PlanningTable
              planning={gefilterdePlanning}
              onEdit={openPlanning}
              onDelete={verwijderPlanning}
            />
          ) : isMobiel ? (
            <DagPlanner
              planning={planning}
              onEdit={openPlanning}
            />
          ) : (
            <WeekPlanner
  planning={planning}
  currentWeek={currentWeek}
  onEdit={openPlanning}
/>
          )}
        </div>
      </div>
            {magBeheren && toonForm && (
        <div className="modal">
          <div
            className="modal-content"
            style={{
              maxWidth: "700px",
            }}
          >
            <PlanningForm
              planning={geselecteerdePlanning}
              defaultDatum={
                geselecteerdePlanning?.datum || ""
              }
              defaultMedewerker={
                geselecteerdePlanning?.medewerker || ""
              }
              onSaved={() => {
                laadPlanning();
                setToonForm(false);
                setGeselecteerdePlanning(null);
              }}
            />

            <button
              className="new-btn"
              style={{
                marginTop: "20px",
                width: "100%",
                background: "#16a34a",
              }}
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