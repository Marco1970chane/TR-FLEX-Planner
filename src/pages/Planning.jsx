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

  const [planning, setPlanning] = useState([]);

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
  // + URENREGISTRATIE KOPPELEN
  // ==========================================

  useEffect(() => {
    if (profile) {
      laadPlanning();
    }
  }, [profile]);

  async function laadPlanning() {
    setLaden(true);

    try {
      // ========================================
      // PLANNING OPHALEN
      // ========================================

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
        data: planningData,
        error: planningError,
      } = await query;

      if (planningError) {
        throw planningError;
      }

      const planningLijst =
        planningData || [];

      // ========================================
      // ALS ER GEEN PLANNING IS
      // ========================================

      if (planningLijst.length === 0) {
        setPlanning([]);
        setLaden(false);
        return;
      }

      // ========================================
      // PLANNING ID'S VERZAMELEN
      // ========================================

      const planningIds = [
        ...new Set(
          planningLijst
            .map((p) => p.id)
            .filter(Boolean)
        ),
      ];

      // ========================================
      // URENREGISTRATIES OPHALEN
      // ========================================

      let urenData = [];

      if (planningIds.length > 0) {
        const {
          data,
          error: urenError,
        } = await supabase
          .from("urenregistratie")
          .select("*")
          .in(
            "planning_id",
            planningIds
          )
          .order("ingediend_op", {
            ascending: false,
          });

        if (urenError) {
          console.error(
            "Fout bij laden urenregistratie:",
            urenError
          );
        } else {
          urenData = data || [];
        }
      }

      // ========================================
      // UREN AAN PLANNING KOPPELEN
      // ========================================

      const compleet = planningLijst.map(
        (dienst) => {
          // Zoek alle urenregistraties
          // van deze planning
          const registraties =
            urenData.filter(
              (u) =>
                String(
                  u.planning_id
                ) ===
                String(dienst.id)
            );

          // Nieuwste registratie gebruiken
          const urenregistratie =
            registraties.length > 0
              ? registraties[0]
              : null;

          return {
            ...dienst,

            // ==================================
            // URENINFORMATIE
            // ==================================

            urenregistratie_id:
              urenregistratie?.id ||
              null,

            uren_status:
              urenregistratie?.status ||
              null,

            gewerkte_uren:
              urenregistratie?.gewerkte_uren ||
              0,

            starttijd:
              urenregistratie?.starttijd ||
              null,

            eindtijd:
              urenregistratie?.eindtijd ||
              null,

            pauze_minuten:
              urenregistratie?.pauze_minuten ||
              0,

            uren_opmerking:
              urenregistratie?.opmerking ||
              null,

            uren_ingediend_op:
              urenregistratie?.ingediend_op ||
              null,

            uren_goedgekeurd_op:
              urenregistratie?.goedgekeurd_op ||
              null,

            // Handig voor eventuele
            // toekomstige uitbreidingen
            urenregistratie:
              urenregistratie || null,
          };
        }
      );

      setPlanning(compleet);
    } catch (error) {
      console.error(
        "Fout bij laden planning:",
        error
      );

      alert(
        error.message ||
          "De planning kon niet worden geladen."
      );
    } finally {
      setLaden(false);
    }
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
  // PRINT CSS
  // ==========================================

  useEffect(() => {
    const style =
      document.createElement("style");

    style.id =
      "planning-print-style";

    style.innerHTML = `
      @media print {
        @page {
          size: A4 landscape;
          margin: 8mm;
        }

        html,
        body {
          background: #ffffff !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        body * {
          visibility: hidden !important;
        }

        .planning-print-area,
        .planning-print-area * {
          visibility: visible !important;
        }

        .planning-print-area {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          max-width: none !important;
          background: #ffffff !important;
          border: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        .planning-print-area table {
          width: 100% !important;
          min-width: 0 !important;
          table-layout: fixed !important;
          font-size: 10px !important;
        }

        .planning-print-area th,
        .planning-print-area td {
          page-break-inside: avoid !important;
        }

        .planning-print-area button {
          cursor: default !important;
        }

        .planning-print-area h2 {
          color: #15803d !important;
          margin-bottom: 4px !important;
        }

        .planning-print-area .status-badge {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .planning-print-area * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `;

    document.head.appendChild(style);

    return () => {
      const bestaand =
        document.getElementById(
          "planning-print-style"
        );

      if (bestaand) {
        bestaand.remove();
      }
    };
  }, []);

  // ==========================================
  // PRINTEN
  // ==========================================

  function printPlanning() {
    if (laden) {
      return;
    }

    window.print();
  }

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

      // Ook zoeken op urenstatus
      const urenStatus =
        (
          p.uren_status || ""
        ).toLowerCase();

      return (
        medewerker.includes(zoek) ||
        terminal.includes(zoek) ||
        status.includes(zoek) ||
        dienst.includes(zoek) ||
        datum.includes(zoek) ||
        urenStatus.includes(zoek)
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
            {/* LIJST */}

            <button
              type="button"
              className="new-btn"
              style={{
                background:
                  weergave === "lijst"
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

            {/* PLANNER */}

            <button
              type="button"
              className="new-btn"
              style={{
                background:
                  weergave === "week"
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

            {/* PRINT */}

            <button
              type="button"
              className="new-btn"
              style={{
                background: "#2563eb",
              }}
              onClick={
                printPlanning
              }
              disabled={laden}
            >
              🖨️ Print planning
            </button>

            {/* VERNIEUWEN */}

            <button
              type="button"
              className="new-btn"
              style={{
                background:
                  "#475569",
              }}
              onClick={
                laadPlanning
              }
              disabled={laden}
            >
              🔄 Vernieuwen
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
          className="planning-print-area"
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
              {weergave === "lijst" ? (
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
      ==================================== */}

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