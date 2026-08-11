// src/pages/Planning.jsx

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

  // ==========================================
  // RECHTEN
  // ==========================================

  const magBeheren = [
    "admin",
    "planner",
    "operations",
  ].includes(profile?.rol);

  // ==========================================
  // STATE
  // ==========================================

  const [planning, setPlanning] =
    useState([]);

  const [toonForm, setToonForm] =
    useState(false);

  const [
    geselecteerdePlanning,
    setGeselecteerdePlanning,
  ] = useState(null);

  const [zoekterm, setZoekterm] =
    useState("");

  const [weergave, setWeergave] =
    useState("week");

  const [currentWeek, setCurrentWeek] =
    useState(new Date());

  const [isMobiel, setIsMobiel] =
    useState(
      window
        .matchMedia("(max-width:900px)")
        .matches
    );

  const [laden, setLaden] =
    useState(true);

  // ==========================================
  // PLANNING LADEN
  // ==========================================

  useEffect(() => {
    if (profile) {
      laadPlanning();
    }
  }, [profile]);

  async function laadPlanning() {
    setLaden(true);

    let query = supabase
      .from("planning")
      .select("*")
      .order("datum", {
        ascending: true,
      });

    // Medewerker ziet alleen eigen planning
    if (profile?.rol === "medewerker") {
      query = query.eq(
        "medewerker",
        profile.naam
      );
    }

    const {
      data,
      error,
    } = await query;

    if (error) {
      console.error(
        "Fout bij laden planning:",
        error
      );

      alert(error.message);
      setLaden(false);
      return;
    }

    setPlanning(data || []);
    setLaden(false);
  }

  // ==========================================
  // MOBIELE WEERGAVE
  // ==========================================

  useEffect(() => {
    const media =
      window.matchMedia(
        "(max-width:900px)"
      );

    function handleChange(e) {
      setIsMobiel(e.matches);
    }

    media.addEventListener(
      "change",
      handleChange
    );

    return () => {
      media.removeEventListener(
        "change",
        handleChange
      );
    };
  }, []);

  // ==========================================
  // DIENST VERWIJDEREN
  // ==========================================

  async function verwijderPlanning(id) {
    if (!magBeheren) {
      alert(
        "Je hebt geen rechten om diensten te verwijderen."
      );
      return;
    }

    if (!id) {
      return;
    }

    const akkoord =
      window.confirm(
        "Weet je zeker dat je deze dienst wilt verwijderen?"
      );

    if (!akkoord) {
      return;
    }

    const {
      error,
    } = await supabase
      .from("planning")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "Fout bij verwijderen planning:",
        error
      );

      alert(error.message);
      return;
    }

    alert(
      "🗑️ Dienst verwijderd."
    );

    await laadPlanning();
  }

  // ==========================================
  // PLANNING BEWERKEN
  // ==========================================

  function openPlanning(item) {
    if (!magBeheren) {
      return;
    }

    setGeselecteerdePlanning(item);
    setToonForm(true);
  }

  // ==========================================
  // NIEUWE DIENST
  // ==========================================

  function openNieuweDienst() {
    if (!magBeheren) {
      alert(
        "Je hebt geen rechten om diensten toe te voegen."
      );
      return;
    }

    setGeselecteerdePlanning(null);
    setToonForm(true);
  }

  // ==========================================
  // FILTER
  // ==========================================

  const gefilterdePlanning =
    planning.filter((p) => {
      const zoek =
        zoekterm
          .toLowerCase()
          .trim();

      if (!zoek) {
        return true;
      }

      const medewerker =
        (
          p.medewerker ||
          "Open dienst"
        )
          .toLowerCase();

      const terminal =
        (
          p.terminal || ""
        ).toLowerCase();

      const status =
        (
          p.status || ""
        ).toLowerCase();

      const dienst =
        (
          p.dienst || ""
        ).toLowerCase();

      const datum =
        (
          p.datum || ""
        ).toLowerCase();

      return (
        medewerker.includes(
          zoek
        ) ||
        terminal.includes(
          zoek
        ) ||
        status.includes(
          zoek
        ) ||
        dienst.includes(
          zoek
        ) ||
        datum.includes(
          zoek
        )
      );
    });

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <>
      <div
        style={{
          background: "#f8fafc",
          minHeight: "100vh",
          padding: "25px",
          boxSizing: "border-box",
        }}
      >
        {/* ====================================
            HEADER
        ===================================== */}

        <PlanningHeader
          currentWeek={currentWeek}
          onPreviousWeek={() =>
            setCurrentWeek(
              addWeeks(
                currentWeek,
                -1
              )
            )
          }
          onNextWeek={() =>
            setCurrentWeek(
              addWeeks(
                currentWeek,
                1
              )
            )
          }
          onToday={() =>
            setCurrentWeek(
              new Date()
            )
          }
          onNieuweDienst={
            openNieuweDienst
          }
        />

        {/* ====================================
            FILTER
        ===================================== */}

        <WeekFilters
          zoekterm={zoekterm}
          setZoekterm={
            setZoekterm
          }
        />

        {/* ====================================
            STATISTIEKEN
        ===================================== */}

        <PlanningStats
          planning={planning}
        />

        {/* ====================================
            WEERGAVE KEUZE
        ===================================== */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
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
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              className="new-btn"
              style={{
                background:
                  weergave ===
                  "lijst"
                    ? "#15803d"
                    : "#22c55e",
              }}
              onClick={() =>
                setWeergave(
                  "lijst"
                )
              }
            >
              📋 Lijst
            </button>

            <button
              type="button"
              className="new-btn"
              style={{
                background:
                  weergave ===
                  "week"
                    ? "#15803d"
                    : "#22c55e",
              }}
              onClick={() =>
                setWeergave(
                  "week"
                )
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
            {gefilterdePlanning.length}{" "}
            diensten gevonden
          </div>
        </div>

        {/* ====================================
            PLANNING
        ===================================== */}

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
          {laden ? (
            <div
              style={{
                padding: "50px",
                textAlign:
                  "center",
                color:
                  "#64748b",
              }}
            >
              ⏳ Planning laden...
            </div>
          ) : (
            <>
              {weergave ===
              "lijst" ? (
                <PlanningTable
                  planning={
                    gefilterdePlanning
                  }
                  onEdit={
                    magBeheren
                      ? openPlanning
                      : undefined
                  }
                  onDelete={
                    magBeheren
                      ? verwijderPlanning
                      : undefined
                  }
                />
              ) : isMobiel ? (
                <DagPlanner
                  planning={
                    gefilterdePlanning
                  }
                  onEdit={
                    magBeheren
                      ? openPlanning
                      : undefined
                  }
                />
              ) : (
                <WeekPlanner
                  planning={
                    gefilterdePlanning
                  }
                  currentWeek={
                    currentWeek
                  }
                  onEdit={
                    magBeheren
                      ? openPlanning
                      : undefined
                  }
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* ====================================
          NIEUW / BEWERKEN MODAL
      ===================================== */}

      {magBeheren &&
        toonForm && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background:
                "rgba(15,23,42,.55)",
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              padding: "20px",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "700px",
                maxHeight: "90vh",
                overflowY:
                  "auto",
                background:
                  "#ffffff",
                borderRadius:
                  "18px",
                padding:
                  "25px",
                boxSizing:
                  "border-box",
                boxShadow:
                  "0 20px 50px rgba(0,0,0,.25)",
              }}
            >
              <PlanningForm
                planning={
                  geselecteerdePlanning
                }
                defaultDatum={
                  geselecteerdePlanning?.datum ||
                  ""
                }
                defaultMedewerker={
                  geselecteerdePlanning?.medewerker ||
                  ""
                }
                onSaved={() => {
                  laadPlanning();

                  setToonForm(
                    false
                  );

                  setGeselecteerdePlanning(
                    null
                  );
                }}
              />

              <button
                type="button"
                className="new-btn"
                style={{
                  marginTop:
                    "20px",
                  width:
                    "100%",
                  background:
                    "#64748b",
                }}
                onClick={() => {
                  setToonForm(
                    false
                  );

                  setGeselecteerdePlanning(
                    null
                  );
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