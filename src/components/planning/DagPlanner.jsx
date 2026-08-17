// src/components/planning/DagPlanner.jsx

import { useEffect, useState } from "react";

import {
  addDays,
  format,
  isSameDay,
} from "date-fns";

import { nl } from "date-fns/locale";

import StatusBadge from "./StatusBadge";

export default function DagPlanner({
  planning = [],
  currentWeek = new Date(),
  onEdit,
}) {
  // ==========================================
  // STATE
  // ==========================================

  const [datum, setDatum] =
    useState(currentWeek);

  // ==========================================
  // WEEK/DATUM BIJWERKEN
  // ==========================================

  useEffect(() => {
    setDatum(currentWeek);
  }, [currentWeek]);

  // ==========================================
  // DATUM SLEUTEL
  // ==========================================

  function datumSleutel(
    datumWaarde
  ) {
    return format(
      datumWaarde,
      "yyyy-MM-dd"
    );
  }

  // ==========================================
  // DAG NAVIGATIE
  // ==========================================

  function vorigeDag() {
    setDatum((vorige) =>
      addDays(vorige, -1)
    );
  }

  function volgendeDag() {
    setDatum((vorige) =>
      addDays(vorige, 1)
    );
  }

  function vandaag() {
    setDatum(new Date());
  }

  // ==========================================
  // DIENSTEN VAN DE GEKOZEN DAG
  // ==========================================

  const diensten = planning
    .filter(
      (item) =>
        item.datum ===
        datumSleutel(datum)
    )
    .sort((a, b) => {
      const tijdA =
        a.starttijd ||
        a.dienst ||
        "";

      const tijdB =
        b.starttijd ||
        b.dienst ||
        "";

      return tijdA.localeCompare(
        tijdB
      );
    });

  // ==========================================
  // DIENSTTIJD
  // ==========================================

  function dienstTekst(item) {
    if (
      item.starttijd &&
      item.eindtijd
    ) {
      return `${item.starttijd} - ${item.eindtijd}`;
    }

    return item.dienst || "-";
  }

  // ==========================================
  // OPEN DIENST
  // ==========================================

  function isOpen(item) {
    return (
      (item.status || "")
        .toLowerCase()
        .trim() === "open"
    );
  }

  // ==========================================
  // KAART STIJL
  // ==========================================

  function kaartStijl(item) {
    if (isOpen(item)) {
      return {
        achtergrond: "#fff7ed",
        border: "#fb923c",
        accent: "#ea580c",
        naam: "#c2410c",
      };
    }

    return {
      achtergrond: "#f0fdf4",
      border: "#86efac",
      accent: "#16a34a",
      naam: "#166534",
    };
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* ======================================
          TITEL
      ======================================= */}

      <div
        style={{
          marginBottom: "15px",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#15803d",
            fontSize: "22px",
            fontWeight: "800",
          }}
        >
          📱 Dagplanner
        </h2>

        <div
          style={{
            marginTop: "5px",
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          Mobiele planning
        </div>
      </div>

      {/* ======================================
          DATUM NAVIGATIE
      ======================================= */}

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #dcfce7",
          borderRadius: "14px",
          padding: "12px",
          marginBottom: "15px",
          boxShadow:
            "0 4px 12px rgba(0,0,0,.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          {/* VORIGE DAG */}

          <button
            type="button"
            onClick={vorigeDag}
            style={{
              width: "44px",
              height: "44px",
              flexShrink: 0,
              border: "none",
              borderRadius: "10px",
              background: "#15803d",
              color: "#ffffff",
              fontSize: "26px",
              cursor: "pointer",
            }}
          >
            ‹
          </button>

          {/* DATUM */}

          <div
            style={{
              textAlign: "center",
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                color: "#0f172a",
                fontWeight: "800",
                fontSize: "17px",
                textTransform:
                  "capitalize",
              }}
            >
              {format(
                datum,
                "EEEE",
                {
                  locale: nl,
                }
              )}
            </div>

            <div
              style={{
                marginTop: "3px",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              {format(
                datum,
                "dd MMMM yyyy",
                {
                  locale: nl,
                }
              )}
            </div>
          </div>

          {/* VOLGENDE DAG */}

          <button
            type="button"
            onClick={volgendeDag}
            style={{
              width: "44px",
              height: "44px",
              flexShrink: 0,
              border: "none",
              borderRadius: "10px",
              background: "#15803d",
              color: "#ffffff",
              fontSize: "26px",
              cursor: "pointer",
            }}
          >
            ›
          </button>
        </div>

        {/* VANDAAG */}

        <button
          type="button"
          onClick={vandaag}
          style={{
            width: "100%",
            marginTop: "10px",
            minHeight: "44px",
            border:
              "1px solid #bbf7d0",
            borderRadius: "10px",
            background: isSameDay(
              datum,
              new Date()
            )
              ? "#dcfce7"
              : "#f8fafc",
            color: "#166534",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          📍 Vandaag
        </button>
      </div>

      {/* ======================================
          AANTAL DIENSTEN
      ======================================= */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <strong
          style={{
            color: "#334155",
          }}
        >
          Diensten
        </strong>

        <span
          style={{
            background: "#dcfce7",
            color: "#166534",
            padding: "5px 10px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          {diensten.length}{" "}
          {diensten.length === 1
            ? "dienst"
            : "diensten"}
        </span>
      </div>

      {/* ======================================
          GEEN DIENSTEN
      ======================================= */}

      {diensten.length === 0 ? (
        <div
          style={{
            background: "#ffffff",
            border:
              "1px dashed #cbd5e1",
            borderRadius: "14px",
            padding: "45px 20px",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          <div
            style={{
              fontSize: "38px",
              marginBottom: "10px",
            }}
          >
            📅
          </div>

          <strong
            style={{
              color: "#334155",
              display: "block",
            }}
          >
            Geen diensten
          </strong>

          <div
            style={{
              marginTop: "5px",
              fontSize: "13px",
            }}
          >
            Er zijn geen
            diensten gepland
            voor deze dag.
          </div>
        </div>
      ) : (
        /* ====================================
           DIENST KAARTEN
        ===================================== */

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {diensten.map((item) => {
            const stijl =
              kaartStijl(item);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  onEdit?.(item)
                }
                disabled={!onEdit}
                style={{
                  width: "100%",
                  padding: "15px",
                  textAlign: "left",
                  border: `1px solid ${stijl.border}`,
                  borderLeft: `5px solid ${stijl.accent}`,
                  borderRadius: "14px",
                  background:
                    stijl.achtergrond,
                  cursor: onEdit
                    ? "pointer"
                    : "default",
                  boxSizing: "border-box",
                  boxShadow:
                    "0 3px 10px rgba(15,23,42,.06)",
                }}
              >
                {/* TIJD */}

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <strong
                    style={{
                      color: "#0f172a",
                      fontSize: "17px",
                    }}
                  >
                    🕒{" "}
                    {dienstTekst(
                      item
                    )}
                  </strong>

                  <span
                    style={{
                      fontSize: "20px",
                    }}
                  >
                    {isOpen(item)
                      ? "📢"
                      : "👤"}
                  </span>
                </div>

                {/* TERMINAL */}

                <div
                  style={{
                    marginTop: "10px",
                    color: "#334155",
                    fontSize: "14px",
                    fontWeight: "700",
                  }}
                >
                  🏭{" "}
                  {item.terminal ||
                    "Geen terminal"}
                </div>

                {/* MEDEWERKER */}

                <div
                  style={{
                    marginTop: "7px",
                    color: stijl.naam,
                    fontSize: "14px",
                    fontWeight: "700",
                  }}
                >
                  {item.medewerker
                    ? `👤 ${item.medewerker}`
                    : "📢 OPEN DIENST"}
                </div>

                {/* STATUS */}

                <div
                  style={{
                    marginTop: "10px",
                  }}
                >
                  <StatusBadge
                    status={
                      item.status
                    }
                  />
                </div>

                {/* BEWERKEN */}

                {onEdit && (
                  <div
                    style={{
                      marginTop: "12px",
                      paddingTop: "10px",
                      borderTop:
                        "1px solid rgba(148,163,184,.25)",
                      color: "#64748b",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    ✏️ Tik om dienst
                    te bewerken
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ======================================
          LEGENDA
      ======================================= */}

      <div
        style={{
          marginTop: "15px",
          padding: "12px",
          background: "#f8fafc",
          borderRadius: "10px",
          color: "#64748b",
          fontSize: "12px",
          lineHeight: "1.8",
        }}
      >
        <strong
          style={{
            color: "#475569",
          }}
        >
          Legenda
        </strong>

        <div>
          📢 Open dienst
        </div>

        <div>
          👤 Ingeplande
          medewerker
        </div>

        <div>
          🖱️ Tik op een
          dienst om deze
          te openen
        </div>
      </div>
    </div>
  );
}