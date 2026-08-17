// src/pages/Medewerkers.jsx

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabase";

import MedewerkerForm from "../components/MedewerkerForm";
import SearchBar from "../components/SearchBar";
import MedewerkerTable from "../components/MedewerkerTable";

export default function Medewerkers() {
  const [medewerkers, setMedewerkers] =
    useState([]);

  const [toonForm, setToonForm] =
    useState(false);

  const [zoekterm, setZoekterm] =
    useState("");

  const [
    geselecteerdeMedewerker,
    setGeselecteerdeMedewerker,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  // ==========================================
  // MEDEWERKERS LADEN
  // ==========================================

  useEffect(() => {
    laadMedewerkers();
  }, []);

  async function laadMedewerkers() {
    setLoading(true);

    const {
      data,
      error,
    } = await supabase
      .from("medewerkers")
      .select("*")
      .order("naam");

    console.log("DATA:", data);
    console.log("ERROR:", error);
    console.log(
      "Aantal medewerkers:",
      data?.length
    );

    if (error) {
      console.error(error);
      alert(error.message);
      setLoading(false);
      return;
    }

    setMedewerkers(data || []);
    setLoading(false);
  }

  // ==========================================
  // MEDEWERKER VERWIJDEREN
  // ==========================================

  async function verwijderMedewerker(id) {
    if (!id) {
      return;
    }

    const akkoord =
      window.confirm(
        "Weet je zeker dat je deze medewerker wilt verwijderen?"
      );

    if (!akkoord) {
      return;
    }

    const {
      error,
    } = await supabase
      .from("medewerkers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert(
      "🗑️ Medewerker verwijderd."
    );

    await laadMedewerkers();
  }

  // ==========================================
  // FILTER
  // ==========================================

  const gefilterdeMedewerkers =
    useMemo(() => {
      const zoek =
        zoekterm
          .toLowerCase()
          .trim();

      if (!zoek) {
        return medewerkers;
      }

      return medewerkers.filter(
        (m) => {
          const naam =
            (
              m.naam || ""
            ).toLowerCase();

          const functie =
            (
              m.functie || ""
            ).toLowerCase();

          const terminal =
            (
              m.terminal || ""
            ).toLowerCase();

          const telefoon =
            (
              m.telefoon || ""
            ).toLowerCase();

          const email =
            (
              m.email || ""
            ).toLowerCase();

          const status =
            (
              m.status || ""
            ).toLowerCase();

          const rol =
            (
              m.rol || ""
            ).toLowerCase();

          return (
            naam.includes(zoek) ||
            functie.includes(zoek) ||
            terminal.includes(zoek) ||
            telefoon.includes(zoek) ||
            email.includes(zoek) ||
            status.includes(zoek) ||
            rol.includes(zoek)
          );
        }
      );
    }, [
      medewerkers,
      zoekterm,
    ]);

  // ==========================================
  // NIEUWE MEDEWERKER
  // ==========================================

  function nieuweMedewerker() {
    setGeselecteerdeMedewerker(
      null
    );

    setToonForm(true);
  }

  // ==========================================
  // BEWERKEN
  // ==========================================

  function bewerkMedewerker(
    medewerker
  ) {
    setGeselecteerdeMedewerker(
      medewerker
    );

    setToonForm(true);
  }

  // ==========================================
  // MODAL SLUITEN
  // ==========================================

  function sluitForm() {
    setToonForm(false);

    setGeselecteerdeMedewerker(
      null
    );
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <>
      {/* ======================================
          PAGINA
      ======================================= */}

      <div
        className="table"
        style={{
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* ====================================
            HEADER
        ===================================== */}

        <div
          className="page-header"
          style={{
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div>
            <h2>
              👷 Medewerkers
            </h2>

            <p>
              {
                gefilterdeMedewerkers.length
              }{" "}
              van{" "}
              {
                medewerkers.length
              }{" "}
              medewerkers
            </p>
          </div>

          <button
            type="button"
            className="new-btn"
            onClick={
              nieuweMedewerker
            }
          >
            + Nieuwe medewerker
          </button>
        </div>

        {/* ====================================
            STATISTIEKEN
        ===================================== */}

        <div
          className="stats-row"
          style={{
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div className="stat-card">
            <h3>
              {medewerkers.length}
            </h3>

            <span>
              Totaal
            </span>
          </div>

          <div className="stat-card">
            <h3>
              {
                gefilterdeMedewerkers.length
              }
            </h3>

            <span>
              Resultaten
            </span>
          </div>
        </div>

        {/* ====================================
            ZOEKEN
        ===================================== */}

        <SearchBar
          value={zoekterm}
          onChange={setZoekterm}
        />

        <br />

        {/* ====================================
            TABEL
        ===================================== */}

        {loading ? (
          <div
            style={{
              padding: "30px",
              textAlign: "center",
            }}
          >
            ⏳ Medewerkers laden...
          </div>
        ) : (
          <MedewerkerTable
            medewerkers={
              gefilterdeMedewerkers
            }
            onEdit={
              bewerkMedewerker
            }
            onDelete={
              verwijderMedewerker
            }
          />
        )}
      </div>

      {/* ======================================
          MODAL
      ======================================= */}

      {toonForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,

            width: "100vw",
            height: "100vh",

            background:
              "rgba(15,23,42,.60)",

            zIndex: 9999,

            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",

            padding: "10px",

            boxSizing: "border-box",

            overflowY: "auto",
            overflowX: "hidden",

            WebkitOverflowScrolling:
              "touch",
          }}
        >
          {/* ==================================
              MODAL CONTENT
          =================================== */}

          <div
            style={{
              width: "100%",
              maxWidth: "600px",

              maxHeight:
                "calc(100vh - 20px)",

              background: "#ffffff",

              borderRadius: "16px",

              boxSizing:
                "border-box",

              display: "flex",
              flexDirection:
                "column",

              overflow: "hidden",

              boxShadow:
                "0 20px 60px rgba(0,0,0,.30)",
            }}
          >
            {/* =================================
                FORMULIER SCROLL
            ================================== */}

            <div
              style={{
                flex: 1,

                minHeight: 0,

                overflowY: "auto",
                overflowX: "hidden",

                padding: "10px",

                boxSizing:
                  "border-box",

                WebkitOverflowScrolling:
                  "touch",
              }}
            >
              <MedewerkerForm
                medewerker={
                  geselecteerdeMedewerker
                }
                onSaved={async () => {
                  await laadMedewerkers();

                  sluitForm();
                }}
              />
            </div>

            {/* =================================
                SLUITEN
            ================================== */}

            <div
              style={{
                flexShrink: 0,

                padding: "10px",

                borderTop:
                  "1px solid #e2e8f0",

                background:
                  "#ffffff",

                boxSizing:
                  "border-box",
              }}
            >
              <button
                type="button"
                className="new-btn"
                onClick={
                  sluitForm
                }
                style={{
                  width: "100%",
                  minHeight: "44px",

                  margin: 0,

                  background:
                    "#64748b",

                  color: "#ffffff",

                  border: "none",

                  borderRadius:
                    "8px",

                  boxSizing:
                    "border-box",
                }}
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}