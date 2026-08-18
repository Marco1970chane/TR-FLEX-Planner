// src/components/planning/WeekPlanner.jsx

import {
  addDays,
  startOfWeek,
  format,
} from "date-fns";

import { useEffect, useState } from "react";

import { nl } from "date-fns/locale";

import { supabase } from "../../services/supabase";

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
  // URENREGISTRATIES
  // ==========================================

  const [urenregistraties, setUrenregistraties] =
    useState([]);

  const [urenLaden, setUrenLaden] =
    useState(false);

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
  // UREN LADEN
  // ==========================================

  useEffect(() => {
    laadUrenregistraties();
  }, [planning]);

  async function laadUrenregistraties() {
    const planningIds = planning
      .map((item) => item.id)
      .filter(Boolean);

    if (planningIds.length === 0) {
      setUrenregistraties([]);
      return;
    }

    setUrenLaden(true);

    try {
      const {
        data,
        error,
      } = await supabase
        .from("urenregistratie")
        .select(
          `
            id,
            planning_id,
            medewerker,
            starttijd,
            eindtijd,
            pauze_minuten,
            gewerkte_uren,
            status,
            ingediend_op
          `
        )
        .in(
          "planning_id",
          planningIds
        )
        .order(
          "ingediend_op",
          {
            ascending: false,
          }
        );

      if (error) {
        console.error(
          "Fout bij laden urenregistraties:",
          error
        );

        setUrenregistraties([]);
        return;
      }

      setUrenregistraties(
        data || []
      );
    } catch (error) {
      console.error(
        "Onverwachte fout bij laden uren:",
        error
      );

      setUrenregistraties([]);
    } finally {
      setUrenLaden(false);
    }
  }

  // ==========================================
  // UREN BIJ DIENST ZOEKEN
  // ==========================================

  function urenVoorDienst(item) {
    const resultaten =
      urenregistraties.filter(
        (uren) =>
          String(
            uren.planning_id
          ) ===
          String(item.id)
      );

    if (
      resultaten.length === 0
    ) {
      return null;
    }

    // Nieuwste registratie gebruiken
    return resultaten[0];
  }

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
      return `${formatTijd(
        item.starttijd
      )} - ${formatTijd(
        item.eindtijd
      )}`;
    }

    return item.dienst || "-";
  }

  // ==========================================
  // STATUS PLANNING
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
  // STATUS UREN
  // ==========================================

  function normaleUrenStatus(
    status
  ) {
    return (
      status || ""
    )
      .toString()
      .toLowerCase()
      .trim();
  }

  function isUrenIngediend(
    uren
  ) {
    if (!uren) {
      return false;
    }

    return (
      normaleUrenStatus(
        uren.status
      ) === "ingediend"
    );
  }

  function isUrenGoedgekeurd(
    uren
  ) {
    if (!uren) {
      return false;
    }

    const status =
      normaleUrenStatus(
        uren.status
      );

    return (
      status ===
        "goedgekeurd" ||
      status === "akkoord" ||
      status === "voltooid"
    );
  }

  function isUrenAfgekeurd(
    uren
  ) {
    if (!uren) {
      return false;
    }

    return (
      normaleUrenStatus(
        uren.status
      ) === "afgekeurd"
    );
  }

  // ==========================================
  // UREN STATUS TEKST
  // ==========================================

  function urenStatusInfo(
    uren
  ) {
    if (!uren) {
      return {
        tekst: "Nog geen uren",
        icon: "⚪",
        background: "#f1f5f9",
        color: "#64748b",
        border: "#cbd5e1",
      };
    }

    if (
      isUrenGoedgekeurd(
        uren
      )
    ) {
      return {
        tekst: "Uren goedgekeurd",
        icon: "🟢",
        background: "#dcfce7",
        color: "#166534",
        border: "#86efac",
      };
    }

    if (
      isUrenAfgekeurd(
        uren
      )
    ) {
      return {
        tekst: "Uren afgekeurd",
        icon: "🔴",
        background: "#fee2e2",
        color: "#b91c1c",
        border: "#fca5a5",
      };
    }

    if (
      isUrenIngediend(
        uren
      )
    ) {
      return {
        tekst: "Uren ingediend",
        icon: "🟠",
        background: "#fef3c7",
        color: "#92400e",
        border: "#fcd34d",
      };
    }

    return {
      tekst:
        uren.status ||
        "Uren geregistreerd",
      icon: "🔵",
      background: "#dbeafe",
      color: "#1d4ed8",
      border: "#93c5fd",
    };
  }

  // ==========================================
  // KAART STIJL
  // ==========================================

  function kaartStijl(item) {
    const uren =
      urenVoorDienst(item);

    // Eerst urenstatus controleren
    if (
      isUrenGoedgekeurd(
        uren
      )
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

    if (
      isUrenAfgekeurd(
        uren
      )
    ) {
      return {
        background:
          "#fef2f2",
        border:
          "#fca5a5",
        accent:
          "#dc2626",
      };
    }

    if (
      isUrenIngediend(
        uren
      )
    ) {
      return {
        background:
          "#fffbeb",
        border:
          "#fcd34d",
        accent:
          "#d97706",
      };
    }

    // Daarna planningstatus
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
  // TIJD FORMATTEREN
  // ==========================================

  function formatTijd(tijd) {
    if (!tijd) {
      return "";
    }

    return String(tijd).substring(
      0,
      5
    );
  }

  // ==========================================
  // UREN WEERGAVE
  // ==========================================

  function urenTekst(uren) {
    if (!uren) {
      return null;
    }

    const aantal =
      Number(
        uren.gewerkte_uren
      );

    if (
      Number.isNaN(aantal) ||
      aantal <= 0
    ) {
      return null;
    }

    return `${aantal.toFixed(
      2
    )} uur`;
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
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {urenLaden && (
            <span
              style={{
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              ⏳ Uren laden...
            </span>
          )}

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

                                    const uren =
                                      urenVoorDienst(
                                        item
                                      );

                                    const urenInfo =
                                      urenStatusInfo(
                                        uren
                                      );

                                    const urenAantal =
                                      urenTekst(
                                        uren
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

                                        {/* PLANNING STATUS */}

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

                                        {/* UREN */}

                                        <div
                                          style={{
                                            marginTop:
                                              "8px",
                                            paddingTop:
                                              "7px",
                                            borderTop:
                                              "1px solid rgba(148,163,184,.25)",
                                          }}
                                        >
                                          <div
                                            style={{
                                              display:
                                                "flex",
                                              justifyContent:
                                                "space-between",
                                              alignItems:
                                                "center",
                                              gap:
                                                "5px",
                                            }}
                                          >
                                            <span
                                              style={{
                                                fontSize:
                                                  "11px",
                                                fontWeight:
                                                  "700",
                                                color:
                                                  "#475569",
                                              }}
                                            >
                                              ⏱️ Uren
                                            </span>

                                            <span
                                              style={{
                                                fontSize:
                                                  "11px",
                                                fontWeight:
                                                  "800",
                                                color:
                                                  urenAantal
                                                    ? "#0f172a"
                                                    : "#94a3b8",
                                              }}
                                            >
                                              {urenAantal ||
                                                "—"}
                                            </span>
                                          </div>

                                          {uren && (
                                            <div
                                              style={{
                                                marginTop:
                                                  "5px",
                                                fontSize:
                                                  "10px",
                                                color:
                                                  "#64748b",
                                              }}
                                            >
                                              {formatTijd(
                                                uren.starttijd
                                              )}{" "}
                                              →{" "}
                                              {formatTijd(
                                                uren.eindtijd
                                              )}

                                              {uren.pauze_minuten !=
                                                null &&
                                                ` • ${uren.pauze_minuten} min pauze`}
                                            </div>
                                          )}

                                          <div
                                            style={{
                                              display:
                                                "inline-flex",
                                              alignItems:
                                                "center",
                                              gap:
                                                "4px",
                                              marginTop:
                                                "5px",
                                              padding:
                                                "3px 6px",
                                              borderRadius:
                                                "999px",
                                              background:
                                                urenInfo.background,
                                              color:
                                                urenInfo.color,
                                              border:
                                                `1px solid ${urenInfo.border}`,
                                              fontSize:
                                                "9px",
                                              fontWeight:
                                                "800",
                                              whiteSpace:
                                                "nowrap",
                                            }}
                                          >
                                            {
                                              urenInfo.icon
                                            }{" "}
                                            {
                                              urenInfo.tekst
                                            }
                                          </div>
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
            ⚪ Geen uren
          </span>

          <span>
            🟠 Uren ingediend
          </span>

          <span>
            🟢 Uren goedgekeurd
          </span>

          <span>
            🔴 Uren afgekeurd
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