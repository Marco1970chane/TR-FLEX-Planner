// src/components/planning/DagPlanner.jsx

import { useEffect, useState } from "react";

import {
  addDays,
  format,
  isSameDay,
} from "date-fns";

import { nl } from "date-fns/locale";

import { supabase } from "../../services/supabase";

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

  const [
    urenregistraties,
    setUrenregistraties,
  ] = useState([]);

  const [urenLaden, setUrenLaden] =
    useState(false);

  // ==========================================
  // DATUM BIJWERKEN
  // ==========================================

  useEffect(() => {
    setDatum(currentWeek);
  }, [currentWeek]);

  // ==========================================
  // URENREGISTRATIES LADEN
  // ==========================================

  useEffect(() => {
    laadUrenregistraties();
  }, [planning]);

  async function laadUrenregistraties() {
    const planningIds = planning
      .map((item) => item.id)
      .filter(Boolean);

    if (
      planningIds.length === 0
    ) {
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
  // UREN BIJ DIENST
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

    return resultaten[0];
  }

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
  // DIENSTEN VAN GEKOZEN DAG
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

  function formatTijd(tijd) {
    if (!tijd) {
      return "";
    }

    return String(tijd).substring(
      0,
      5
    );
  }

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
  // PLANNING STATUS
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
  // UREN STATUS
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
  // UREN STATUS INFO
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

    // Uren hebben voorrang
    if (
      isUrenGoedgekeurd(
        uren
      )
    ) {
      return {
        achtergrond: "#f0fdf4",
        border: "#86efac",
        accent: "#15803d",
        naam: "#166534",
      };
    }

    if (
      isUrenAfgekeurd(
        uren
      )
    ) {
      return {
        achtergrond: "#fef2f2",
        border: "#fca5a5",
        accent: "#dc2626",
        naam: "#b91c1c",
      };
    }

    if (
      isUrenIngediend(
        uren
      )
    ) {
      return {
        achtergrond: "#fffbeb",
        border: "#fcd34d",
        accent: "#d97706",
        naam: "#92400e",
      };
    }

    // Daarna planningstatus
    if (isOpen(item)) {
      return {
        achtergrond: "#fff7ed",
        border: "#fb923c",
        accent: "#ea580c",
        naam: "#c2410c",
      };
    }

    if (
      isGoedgekeurd(item)
    ) {
      return {
        achtergrond: "#f0fdf4",
        border: "#86efac",
        accent: "#16a34a",
        naam: "#166534",
      };
    }

    return {
      achtergrond: "#eff6ff",
      border: "#93c5fd",
      accent: "#2563eb",
      naam: "#1d4ed8",
    };
  }

  // ==========================================
  // GEWERKTE UREN
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
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div>
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

          {urenLaden && (
            <span
              style={{
                color: "#64748b",
                fontSize: "11px",
              }}
            >
              ⏳ Uren laden...
            </span>
          )}
        </div>
      </div>

      {/* ======================================
          DATUM NAVIGATIE
      ======================================= */}

      <div
        style={{
          background: "#ffffff",
          border:
            "1px solid #dcfce7",
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
            justifyContent:
              "space-between",
            gap: "8px",
          }}
        >
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
            background:
              isSameDay(
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
            Er zijn geen diensten
            gepland voor deze dag.
          </div>
        </div>
      ) : (
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

            const uren =
              urenVoorDienst(item);

            const urenInfo =
              urenStatusInfo(
                uren
              );

            const urenAantal =
              urenTekst(uren);

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
                  boxSizing:
                    "border-box",
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

                {/* PLANNING STATUS */}

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

                {/* ==================================
                    UREN
                =================================== */}

                <div
                  style={{
                    marginTop: "12px",
                    paddingTop: "10px",
                    borderTop:
                      "1px solid rgba(148,163,184,.25)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "800",
                        color: "#475569",
                      }}
                    >
                      ⏱️ Gewerkte uren
                    </span>

                    <strong
                      style={{
                        fontSize: "14px",
                        color:
                          urenAantal
                            ? "#0f172a"
                            : "#94a3b8",
                      }}
                    >
                      {urenAantal ||
                        "Nog niet geregistreerd"}
                    </strong>
                  </div>

                  {/* START / EINDE */}

                  {uren && (
                    <div
                      style={{
                        marginTop: "7px",
                        color: "#64748b",
                        fontSize: "12px",
                      }}
                    >
                      🕒{" "}
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

                  {/* UREN STATUS */}

                  <div
                    style={{
                      display:
                        "inline-flex",
                      alignItems:
                        "center",
                      gap: "5px",
                      marginTop: "8px",
                      padding:
                        "5px 8px",
                      borderRadius:
                        "999px",
                      background:
                        urenInfo.background,
                      color:
                        urenInfo.color,
                      border:
                        `1px solid ${urenInfo.border}`,
                      fontSize: "11px",
                      fontWeight: "800",
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
                    ✏️ Tik om dienst te
                    bewerken
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
          👤 Ingeplande medewerker
        </div>

        <div>
          ⚪ Geen uren
        </div>

        <div>
          🟠 Uren ingediend
        </div>

        <div>
          🟢 Uren goedgekeurd
        </div>

        <div>
          🔴 Uren afgekeurd
        </div>

        <div>
          🖱️ Tik op een dienst om
          deze te openen
        </div>
      </div>
    </div>
  );
}