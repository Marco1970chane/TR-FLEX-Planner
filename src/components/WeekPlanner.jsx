// src/components/planning/WeekPlanner.jsx

import {
  addDays,
  startOfWeek,
  format,
} from "date-fns";

import { nl } from "date-fns/locale";

import StatusBadge from "./StatusBadge";

const dagen = [
  "Maandag",
  "Dinsdag",
  "Woensdag",
  "Donderdag",
  "Vrijdag",
  "Zaterdag",
  "Zondag",
];

export default function WeekPlanner({
  planning = [],
  currentWeek = new Date(),
  onEdit,
}) {
  // ==========================================
  // WEEK
  // ==========================================

  const weekStart = startOfWeek(
    currentWeek,
    {
      weekStartsOn: 1,
    }
  );

  // ==========================================
  // DATUM
  // ==========================================

  function datumVanDag(index) {
    return addDays(
      weekStart,
      index
    );
  }

  function datumSleutel(datum) {
    return format(
      datum,
      "yyyy-MM-dd"
    );
  }

  // ==========================================
  // TERMINALS
  // ==========================================

  const terminals = [
    ...new Set(
      planning
        .map(
          (item) =>
            item.terminal
        )
        .filter(Boolean)
    ),
  ].sort((a, b) =>
    a.localeCompare(
      b,
      "nl"
    )
  );

  // ==========================================
  // DIENSTEN PER TERMINAL + DAG
  // ==========================================

  function dienstenVoor(
    terminal,
    index
  ) {
    const datum =
      datumSleutel(
        datumVanDag(index)
      );

    return planning
      .filter(
        (item) =>
          (item.terminal ||
            "") === terminal &&
          item.datum === datum
      )
      .sort((a, b) => {
        const tijdA =
          a.starttijd || "";

        const tijdB =
          b.starttijd || "";

        return tijdA.localeCompare(
          tijdB
        );
      });
  }

  // ==========================================
  // DIENST TIJD
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
  // STATUS
  // ==========================================

  function isOpen(item) {
    return (
      (item.status || "")
        .toLowerCase()
        .trim() === "open"
    );
  }

  function isGoedgekeurd(item) {
    const status =
      (item.status || "")
        .toLowerCase()
        .trim();

    return (
      status === "goedgekeurd" ||
      status === "akkoord" ||
      status === "voltooid"
    );
  }

  // ==========================================
  // KAART STIJL
  // ==========================================

  function kaartStijl(item) {
    if (isOpen(item)) {
      return {
        background:
          "#fff7ed",
        border:
          "#fb923c",
        accent:
          "#ea580c",
      };
    }

    if (
      isGoedgekeurd(item)
    ) {
      return {
        background:
          "#f0fdf4",
        border:
          "#86efac",
        accent:
          "#15803d",
      };
    }

    return {
      background:
        "#eff6ff",
      border:
        "#93c5fd",
      accent:
        "#2563eb",
    };
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div
      style={{
        width: "100%",
      }}
    >
      {/* ======================================
          TITEL
      ======================================= */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "flex-end",
          gap: "15px",
          flexWrap:
            "wrap",
          marginBottom:
            "18px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: "#15803d",
              fontSize: "23px",
              fontWeight: "800",
            }}
          >
            📅 Weekplanner
          </h2>

          <div
            style={{
              marginTop: "5px",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Week{" "}
            {format(
              weekStart,
              "w",
              {
                locale: nl,
              }
            )}{" "}
            •{" "}
            {format(
              weekStart,
              "dd MMMM yyyy",
              {
                locale: nl,
              }
            )}
          </div>
        </div>

        <div
          style={{
            padding:
              "7px 12px",
            background:
              "#f0fdf4",
            border:
              "1px solid #bbf7d0",
            borderRadius:
              "999px",
            color:
              "#166534",
            fontSize:
              "13px",
            fontWeight:
              "700",
          }}
        >
          {planning.length}{" "}
          diensten
        </div>
      </div>

      {/* ======================================
          GEEN PLANNING
      ======================================= */}

      {terminals.length ===
      0 ? (
        <div
          style={{
            padding:
              "50px 20px",
            textAlign:
              "center",
            color:
              "#64748b",
            background:
              "#f8fafc",
            border:
              "1px dashed #cbd5e1",
            borderRadius:
              "14px",
          }}
        >
          <div
            style={{
              fontSize:
                "35px",
              marginBottom:
                "10px",
            }}
          >
            📅
          </div>

          <strong
            style={{
              color:
                "#334155",
            }}
          >
            Geen planning
            gevonden
          </strong>

          <div
            style={{
              marginTop:
                "5px",
              fontSize:
                "13px",
            }}
          >
            Er zijn geen
            diensten
            beschikbaar.
          </div>
        </div>
      ) : (
        /* ====================================
           PLANNER
        ===================================== */

        <div
          style={{
            width: "100%",
            overflowX:
              "auto",
            overflowY:
              "hidden",
            borderRadius:
              "14px",
            border:
              "1px solid #dbe5e1",
            background:
              "#ffffff",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth:
                "1280px",
              borderCollapse:
                "separate",
              borderSpacing: 0,
              tableLayout:
                "fixed",
            }}
          >
            {/* =================================
                HEADER
            ================================== */}

            <thead>
              <tr>
                <th
                  style={{
                    width:
                      "220px",
                    minWidth:
                      "220px",
                    padding:
                      "14px",
                    background:
                      "#15803d",
                    color:
                      "#ffffff",
                    textAlign:
                      "left",
                    fontSize:
                      "13px",
                    fontWeight:
                      "800",
                    position:
                      "sticky",
                    left: 0,
                    zIndex: 5,
                    borderRight:
                      "1px solid #166534",
                    boxSizing:
                      "border-box",

                    WebkitPrintColorAdjust:
                      "exact",
                    printColorAdjust:
                      "exact",
                  }}
                >
                  🏭 Terminal
                </th>

                {dagen.map(
                  (
                    dag,
                    index
                  ) => {
                    const datum =
                      datumVanDag(
                        index
                      );

                    const vandaag =
                      datumSleutel(
                        datum
                      ) ===
                      datumSleutel(
                        new Date()
                      );

                    const weekend =
                      index >= 5;

                    return (
                      <th
                        key={dag}
                        style={{
                          minWidth:
                            "150px",
                          padding:
                            "11px 8px",
                          background:
                            vandaag
                              ? "#16a34a"
                              : weekend
                              ? "#dcfce7"
                              : "#f0fdf4",
                          color:
                            vandaag
                              ? "#ffffff"
                              : "#166534",
                          textAlign:
                            "center",
                          borderLeft:
                            "1px solid #d1fae5",
                          boxSizing:
                            "border-box",

                          WebkitPrintColorAdjust:
                            "exact",
                          printColorAdjust:
                            "exact",
                        }}
                      >
                        <div
                          style={{
                            fontWeight:
                              "800",
                            fontSize:
                              "13px",
                          }}
                        >
                          {dag}
                        </div>

                        <div
                          style={{
                            marginTop:
                              "4px",
                            fontSize:
                              "12px",
                            fontWeight:
                              "600",
                            opacity:
                              vandaag
                                ? 1
                                : 0.8,
                          }}
                        >
                          {format(
                            datum,
                            "dd-MM-yyyy"
                          )}
                        </div>

                        {vandaag && (
                          <div
                            style={{
                              display:
                                "inline-block",
                              marginTop:
                                "5px",
                              padding:
                                "2px 7px",
                              borderRadius:
                                "999px",
                              background:
                                "rgba(255,255,255,.2)",
                              fontSize:
                                "9px",
                              fontWeight:
                                "800",
                            }}
                          >
                            VANDAAG
                          </div>
                        )}
                      </th>
                    );
                  }
                )}
              </tr>
            </thead>

            {/* =================================
                BODY
            ================================== */}

            <tbody>
              {terminals.map(
                (terminal) => (
                  <tr
                    key={
                      terminal
                    }
                  >
                    {/* TERMINAL */}

                    <td
                      style={{
                        width:
                          "220px",
                        minWidth:
                          "220px",
                        padding:
                          "14px",
                        background:
                          "#f8fafc",
                        borderBottom:
                          "1px solid #e2e8f0",
                        borderRight:
                          "1px solid #e2e8f0",
                        fontWeight:
                          "800",
                        color:
                          "#0f172a",
                        position:
                          "sticky",
                        left: 0,
                        zIndex: 3,
                        verticalAlign:
                          "top",
                        boxSizing:
                          "border-box",

                        WebkitPrintColorAdjust:
                          "exact",
                        printColorAdjust:
                          "exact",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "flex-start",
                          gap:
                            "7px",
                        }}
                      >
                        <span>
                          🏭
                        </span>

                        <span
                          style={{
                            whiteSpace:
                              "normal",
                            overflowWrap:
                              "anywhere",
                            lineHeight:
                              "1.4",
                          }}
                        >
                          {
                            terminal
                          }
                        </span>
                      </div>
                    </td>

                    {/* DAGEN */}

                    {dagen.map(
                      (
                        dag,
                        index
                      ) => {
                        const diensten =
                          dienstenVoor(
                            terminal,
                            index
                          );

                        const vandaag =
                          datumSleutel(
                            datumVanDag(
                              index
                            )
                          ) ===
                          datumSleutel(
                            new Date()
                          );

                        return (
                          <td
                            key={
                              dag
                            }
                            style={{
                              verticalAlign:
                                "top",
                              padding:
                                "7px",
                              minHeight:
                                "120px",
                              background:
                                vandaag
                                  ? "#fbfffc"
                                  : "#ffffff",
                              borderLeft:
                                "1px solid #e2e8f0",
                              borderBottom:
                                "1px solid #e2e8f0",
                              boxSizing:
                                "border-box",

                              WebkitPrintColorAdjust:
                                "exact",
                              printColorAdjust:
                                "exact",
                            }}
                          >
                            {diensten.length ===
                            0 ? (
                              <div
                                style={{
                                  minHeight:
                                    "105px",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  color:
                                    "#cbd5e1",
                                  fontSize:
                                    "18px",
                                }}
                              >
                                ···
                              </div>
                            ) : (
                              <div
                                style={{
                                  display:
                                    "flex",
                                  flexDirection:
                                    "column",
                                  gap:
                                    "7px",
                                }}
                              >
                                {diensten.map(
                                  (
                                    item
                                  ) => {
                                    const stijl =
                                      kaartStijl(
                                        item
                                      );

                                    return (
                                      <button
                                        key={
                                          item.id
                                        }
                                        type="button"
                                        onClick={() =>
                                          onEdit?.(
                                            item
                                          )
                                        }
                                        title="Klik om deze dienst te bewerken"
                                        style={{
                                          width:
                                            "100%",
                                          border:
                                            `1px solid ${stijl.border}`,
                                          borderLeft:
                                            `4px solid ${stijl.accent}`,
                                          background:
                                            stijl.background,
                                          borderRadius:
                                            "10px",
                                          padding:
                                            "9px",
                                          textAlign:
                                            "left",
                                          cursor:
                                            onEdit
                                              ? "pointer"
                                              : "default",
                                          boxSizing:
                                            "border-box",
                                          boxShadow:
                                            "0 2px 6px rgba(15,23,42,.06)",
                                          transition:
                                            "transform .15s ease, box-shadow .15s ease",

                                          WebkitPrintColorAdjust:
                                            "exact",
                                          printColorAdjust:
                                            "exact",
                                        }}
                                      >
                                        {/* TIJD */}

                                        <div
                                          style={{
                                            color:
                                              "#0f172a",
                                            fontWeight:
                                              "800",
                                            fontSize:
                                              "12px",
                                            lineHeight:
                                              "1.4",
                                          }}
                                        >
                                          🕒{" "}
                                          {dienstTekst(
                                            item
                                          )}
                                        </div>

                                        {/* MEDEWERKER */}

                                        <div
                                          style={{
                                            marginTop:
                                              "6px",
                                            color:
                                              item.medewerker
                                                ? "#166534"
                                                : "#c2410c",
                                            fontSize:
                                              "12px",
                                            fontWeight:
                                              "700",
                                            lineHeight:
                                              "1.35",
                                            overflow:
                                              "hidden",
                                            textOverflow:
                                              "ellipsis",
                                            whiteSpace:
                                              "nowrap",
                                          }}
                                        >
                                          {item.medewerker
                                            ? `👤 ${item.medewerker}`
                                            : "📢 OPEN DIENST"}
                                        </div>

                                        {/* STATUS */}

                                        <div
                                          style={{
                                            marginTop:
                                              "7px",
                                          }}
                                        >
                                          <StatusBadge
                                            status={
                                              item.status
                                            }
                                          />
                                        </div>
                                      </button>
                                    );
                                  }
                                )}
                              </div>
                            )}
                          </td>
                        );
                      }
                    )}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ======================================
          LEGENDA
      ======================================= */}

      {terminals.length >
        0 && (
        <div
          style={{
            display:
              "flex",
            alignItems:
              "center",
            gap:
              "10px",
            flexWrap:
              "wrap",
            marginTop:
              "14px",
            padding:
              "10px 12px",
            background:
              "#f8fafc",
            borderRadius:
              "10px",
            color:
              "#64748b",
            fontSize:
              "12px",

            WebkitPrintColorAdjust:
              "exact",
            printColorAdjust:
              "exact",
          }}
        >
          <strong
            style={{
              color:
                "#475569",
            }}
          >
            Legenda:
          </strong>

          <span>
            📢 Open dienst
          </span>

          <span>
            👤 Ingepland
          </span>

          <span>
            🟢 Goedgekeurd
          </span>

          <span>
            🖱️ Klik op een
            dienst om te
            bewerken
          </span>
        </div>
      )}
    </div>
  );
}