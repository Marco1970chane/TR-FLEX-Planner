// src/pages/Urenregistratie.jsx

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabase";

import UrenregistratieForm from "../components/UrenregistratieForm";
import UrenDashboard from "../components/uren/UrenDashboard";

export default function Urenregistratie() {
  const [uren, setUren] = useState([]);

  const [zoekterm, setZoekterm] = useState("");
  const [datumFilter, setDatumFilter] = useState("");

  const [toonForm, setToonForm] = useState(false);
  const [geselecteerd, setGeselecteerd] =
    useState(null);

  const [laden, setLaden] = useState(true);
  const [actieBezig, setActieBezig] =
    useState(null);

  // ==========================================
  // UREN LADEN
  // ==========================================

  useEffect(() => {
    laadUren();
  }, []);

  async function laadUren() {
    setLaden(true);

    const { data, error } = await supabase
      .from("urenregistratie")
      .select("*")
      .order("datum", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Fout bij laden uren:",
        error
      );

      alert(error.message);
      setLaden(false);
      return;
    }

    setUren(data || []);
    setLaden(false);
  }

  // ==========================================
  // STATUS FUNCTIES
  // ==========================================

  function normaleStatus(status) {
    return (
      status || "Open"
    )
      .toString()
      .toLowerCase()
      .trim();
  }

  function isOpen(status) {
    return (
      normaleStatus(status) ===
      "open"
    );
  }

  function isGoedgekeurd(status) {
    const waarde =
      normaleStatus(status);

    return (
      waarde === "goedgekeurd" ||
      waarde === "akkoord" ||
      waarde === "voltooid"
    );
  }

  function isAfgekeurd(status) {
    return (
      normaleStatus(status) ===
      "afgekeurd"
    );
  }

  // ==========================================
  // STATUS KLEUR
  // ==========================================

  function statusKleur(status) {
    if (
      isGoedgekeurd(status)
    ) {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    if (
      isAfgekeurd(status)
    ) {
      return {
        background: "#fee2e2",
        color: "#b91c1c",
      };
    }

    if (
      isOpen(status)
    ) {
      return {
        background: "#fef3c7",
        color: "#92400e",
      };
    }

    return {
      background: "#f1f5f9",
      color: "#475569",
    };
  }

  // ==========================================
  // STATUS WIJZIGEN
  // ==========================================

  async function wijzigStatus(
    id,
    nieuweStatus
  ) {
    if (!id) {
      return;
    }

    const melding =
      nieuweStatus ===
      "Goedgekeurd"
        ? "Deze urenregistratie goedkeuren?"
        : "Deze urenregistratie afkeuren?";

    if (
      !window.confirm(melding)
    ) {
      return;
    }

    setActieBezig(id);

    try {
      const { error } =
        await supabase
          .from("urenregistratie")
          .update({
            status:
              nieuweStatus,
          })
          .eq("id", id);

      if (error) {
        throw error;
      }

      setUren((vorige) =>
        vorige.map((u) =>
          u.id === id
            ? {
                ...u,
                status:
                  nieuweStatus,
              }
            : u
        )
      );

      alert(
        nieuweStatus ===
          "Goedgekeurd"
          ? "✅ Uren goedgekeurd."
          : "❌ Uren afgekeurd."
      );
    } catch (error) {
      console.error(
        "Fout bij wijzigen status:",
        error
      );

      alert(
        error.message ||
          "Status kon niet worden gewijzigd."
      );
    } finally {
      setActieBezig(null);
    }
  }

  // ==========================================
  // NIEUWE REGISTRATIE
  // ==========================================

  function openNieuw() {
    setGeselecteerd(null);
    setToonForm(true);
  }

  // ==========================================
  // BEWERKEN
  // ==========================================

  function openBewerken(registratie) {
    setGeselecteerd(registratie);
    setToonForm(true);
  }

  // ==========================================
  // VERWIJDEREN
  // ==========================================

  async function verwijderUren(id) {
    if (!id) {
      return;
    }

    const akkoord =
      window.confirm(
        "Weet je zeker dat je deze urenregistratie wilt verwijderen?"
      );

    if (!akkoord) {
      return;
    }

    setActieBezig(id);

    try {
      const { error } =
        await supabase
          .from("urenregistratie")
          .delete()
          .eq("id", id);

      if (error) {
        throw error;
      }

      setUren((vorige) =>
        vorige.filter(
          (u) => u.id !== id
        )
      );

      alert(
        "🗑️ Urenregistratie verwijderd."
      );
    } catch (error) {
      console.error(
        "Fout bij verwijderen:",
        error
      );

      alert(
        error.message ||
          "Urenregistratie kon niet worden verwijderd."
      );
    } finally {
      setActieBezig(null);
    }
  }

  // ==========================================
  // FILTER
  // ==========================================

  const gefilterd = useMemo(() => {
    const zoek =
      zoekterm
        .toLowerCase()
        .trim();

    return uren.filter((u) => {
      const medewerker =
        (
          u.medewerker || ""
        ).toLowerCase();

      const terminal =
        (
          u.terminal || ""
        ).toLowerCase();

      const status =
        (
          u.status || ""
        ).toLowerCase();

      const komtVoor =
        !zoek ||
        medewerker.includes(zoek) ||
        terminal.includes(zoek) ||
        status.includes(zoek);

      const datumGoed =
        !datumFilter ||
        u.datum === datumFilter;

      return (
        komtVoor &&
        datumGoed
      );
    });
  }, [
    uren,
    zoekterm,
    datumFilter,
  ]);

  // ==========================================
  // TOTALEN
  // ==========================================

  const totaalUren = useMemo(() => {
    return uren.reduce(
      (totaal, u) =>
        totaal +
        Number(u.uren || 0),
      0
    );
  }, [uren]);

  const totaalMedewerkers =
    useMemo(() => {
      return new Set(
        uren
          .map(
            (u) =>
              u.medewerker
          )
          .filter(Boolean)
      ).size;
    }, [uren]);

  const totaalTerminals =
    useMemo(() => {
      return new Set(
        uren
          .map(
            (u) =>
              u.terminal
          )
          .filter(Boolean)
      ).size;
    }, [uren]);

  const totaalRegistraties =
    uren.length;

  // ==========================================
  // GEFILTERDE UREN
  // ==========================================

  const gefilterdeUren =
    useMemo(() => {
      return gefilterd.reduce(
        (totaal, u) =>
          totaal +
          Number(u.uren || 0),
        0
      );
    }, [gefilterd]);

  // ==========================================
  // STATUS TOTALEN
  // ==========================================

  const openAantal =
    useMemo(() => {
      return uren.filter(
        (u) =>
          isOpen(u.status)
      ).length;
    }, [uren]);

  const goedgekeurdAantal =
    useMemo(() => {
      return uren.filter(
        (u) =>
          isGoedgekeurd(
            u.status
          )
      ).length;
    }, [uren]);

  const afgekeurdAantal =
    useMemo(() => {
      return uren.filter(
        (u) =>
          isAfgekeurd(
            u.status
          )
      ).length;
    }, [uren]);

  const goedgekeurdeUren =
    useMemo(() => {
      return uren
        .filter((u) =>
          isGoedgekeurd(
            u.status
          )
        )
        .reduce(
          (totaal, u) =>
            totaal +
            Number(
              u.uren || 0
            ),
          0
        );
    }, [uren]);

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

        <div
          style={{
            background: "#ffffff",
            padding: "25px 30px",
            borderRadius: "18px",
            marginBottom: "20px",
            boxShadow:
              "0 8px 20px rgba(0,0,0,.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  color: "#15803d",
                  fontSize: "30px",
                }}
              >
                🕒 Urenregistratie
              </h1>

              <p
                style={{
                  color: "#64748b",
                  marginBottom: 0,
                }}
              >
                Registratie en
                goedkeuring van
                gewerkte uren
              </p>
            </div>

            <button
              className="new-btn"
              type="button"
              style={{
                background: "#16a34a",
              }}
              onClick={openNieuw}
            >
              + Nieuwe registratie
            </button>
          </div>
        </div>

        {/* ====================================
            DASHBOARD
        ===================================== */}

        <UrenDashboard
          totaalUren={totaalUren.toFixed(1)}
          medewerkers={
            totaalMedewerkers
          }
          registraties={
            totaalRegistraties
          }
          terminals={
            totaalTerminals
          }
        />

        {/* ====================================
            STATUS KAARTEN
        ===================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              background: "#fef3c7",
              borderRadius: "14px",
              padding: "18px",
            }}
          >
            <div
              style={{
                color: "#92400e",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              🟡 Open
            </div>

            <strong
              style={{
                display: "block",
                marginTop: "5px",
                fontSize: "26px",
                color: "#92400e",
              }}
            >
              {openAantal}
            </strong>
          </div>

          <div
            style={{
              background: "#dcfce7",
              borderRadius: "14px",
              padding: "18px",
            }}
          >
            <div
              style={{
                color: "#166534",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              🟢 Goedgekeurd
            </div>

            <strong
              style={{
                display: "block",
                marginTop: "5px",
                fontSize: "26px",
                color: "#166534",
              }}
            >
              {goedgekeurdAantal}
            </strong>
          </div>

          <div
            style={{
              background: "#fee2e2",
              borderRadius: "14px",
              padding: "18px",
            }}
          >
            <div
              style={{
                color: "#b91c1c",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              🔴 Afgekeurd
            </div>

            <strong
              style={{
                display: "block",
                marginTop: "5px",
                fontSize: "26px",
                color: "#b91c1c",
              }}
            >
              {afgekeurdAantal}
            </strong>
          </div>

          <div
            style={{
              background: "#eff6ff",
              borderRadius: "14px",
              padding: "18px",
            }}
          >
            <div
              style={{
                color: "#1d4ed8",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              🧮 Goedgekeurde uren
            </div>

            <strong
              style={{
                display: "block",
                marginTop: "5px",
                fontSize: "26px",
                color: "#1d4ed8",
              }}
            >
              {goedgekeurdeUren.toFixed(
                2
              )}{" "}
              uur
            </strong>
          </div>
        </div>

        {/* ====================================
            TOTALEN
        ===================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              padding: "18px",
              border:
                "1px solid #dcfce7",
            }}
          >
            <div
              style={{
                color: "#64748b",
              }}
            >
              🧮 Totaal geregistreerd
            </div>

            <strong
              style={{
                display: "block",
                marginTop: "5px",
                fontSize: "24px",
                color: "#15803d",
              }}
            >
              {totaalUren.toFixed(
                1
              )}{" "}
              uur
            </strong>
          </div>

          <div
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              padding: "18px",
              border:
                "1px solid #dbeafe",
            }}
          >
            <div
              style={{
                color: "#64748b",
              }}
            >
              🔎 Gefilterd
            </div>

            <strong
              style={{
                display: "block",
                marginTop: "5px",
                fontSize: "24px",
                color: "#1d4ed8",
              }}
            >
              {gefilterdeUren.toFixed(
                1
              )}{" "}
              uur
            </strong>
          </div>
        </div>

        {/* ====================================
            FILTERS
        ===================================== */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            padding: "20px",
            marginBottom: "20px",
            boxShadow:
              "0 8px 20px rgba(0,0,0,.08)",
          }}
        >
          <div
            className="uren-filters"
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(250px, 1fr) 200px auto",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              placeholder="🔍 Zoek medewerker, terminal of status..."
              value={zoekterm}
              onChange={(e) =>
                setZoekterm(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                boxSizing:
                  "border-box",
              }}
            />

            <input
              type="date"
              value={datumFilter}
              onChange={(e) =>
                setDatumFilter(
                  e.target.value
                )
              }
            />

            <button
              type="button"
              className="new-btn"
              style={{
                background: "#64748b",
              }}
              onClick={() => {
                setZoekterm("");
                setDatumFilter("");
              }}
            >
              🔄 Wissen
            </button>
          </div>

          <div
            style={{
              marginTop: "12px",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            {gefilterd.length} van{" "}
            {uren.length} registraties
            zichtbaar
          </div>
        </div>

        {/* ====================================
            URENOVERZICHT
        ===================================== */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            padding: "14px",
            boxShadow:
              "0 8px 20px rgba(0,0,0,.08)",
          }}
        >
          {laden ? (
            <div
              style={{
                padding: "50px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              ⏳ Urenregistraties
              laden...
            </div>
          ) : gefilterd.length ===
            0 ? (
            <div
              style={{
                padding:
                  "50px 20px",
                textAlign:
                  "center",
                color:
                  "#64748b",
              }}
            >
              🕒 Geen
              urenregistraties
              gevonden.
            </div>
          ) : (
            <>
              {/* =================================
                  DESKTOP TABEL
              ================================== */}

              <div
                className="uren-tabel-desktop"
                style={{
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse:
                      "collapse",
                    tableLayout:
                      "fixed",
                    fontSize: "13px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background:
                          "#eff6ff",
                        color: "#1e3a8a",
                      }}
                    >
                      <th
                        style={{
                          width: "9%",
                          padding:
                            "12px 6px",
                          textAlign:
                            "left",
                        }}
                      >
                        Datum
                      </th>

                      <th
                        style={{
                          width: "15%",
                          padding:
                            "12px 6px",
                          textAlign:
                            "left",
                        }}
                      >
                        Medewerker
                      </th>

                      <th
                        style={{
                          width: "15%",
                          padding:
                            "12px 6px",
                          textAlign:
                            "left",
                        }}
                      >
                        Terminal
                      </th>

                      <th
                        style={{
                          width: "8%",
                          padding:
                            "12px 4px",
                          textAlign:
                            "center",
                        }}
                      >
                        Van
                      </th>

                      <th
                        style={{
                          width: "8%",
                          padding:
                            "12px 4px",
                          textAlign:
                            "center",
                        }}
                      >
                        Tot
                      </th>

                      <th
                        style={{
                          width: "8%",
                          padding:
                            "12px 4px",
                          textAlign:
                            "center",
                        }}
                      >
                        Pauze
                      </th>

                      <th
                        style={{
                          width: "8%",
                          padding:
                            "12px 4px",
                          textAlign:
                            "center",
                        }}
                      >
                        Uren
                      </th>

                      <th
                        style={{
                          width: "12%",
                          padding:
                            "12px 4px",
                          textAlign:
                            "center",
                        }}
                      >
                        Status
                      </th>

                      <th
                        style={{
                          width: "17%",
                          padding:
                            "12px 4px",
                          textAlign:
                            "center",
                        }}
                      >
                        Acties
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {gefilterd.map(
                      (u) => {
                        const kleur =
                          statusKleur(
                            u.status
                          );

                        const bezig =
                          actieBezig ===
                          u.id;

                        return (
                          <tr
                            key={u.id}
                            style={{
                              borderBottom:
                                "1px solid #e2e8f0",
                            }}
                          >
                            <td
                              style={{
                                padding:
                                  "13px 6px",
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {u.datum ||
                                "-"}
                            </td>

                            <td
                              style={{
                                padding:
                                  "13px 6px",
                                overflow:
                                  "hidden",
                              }}
                            >
                              <strong
                                style={{
                                  display:
                                    "block",
                                  overflow:
                                    "hidden",
                                  textOverflow:
                                    "ellipsis",
                                }}
                              >
                                {u.medewerker ||
                                  "-"}
                              </strong>
                            </td>

                            <td
                              style={{
                                padding:
                                  "13px 6px",
                                overflow:
                                  "hidden",
                              }}
                            >
                              <span
                                style={{
                                  display:
                                    "block",
                                  overflow:
                                    "hidden",
                                  textOverflow:
                                    "ellipsis",
                                }}
                              >
                                {u.terminal ||
                                  "-"}
                              </span>
                            </td>

                            <td
                              style={{
                                padding:
                                  "13px 2px",
                                textAlign:
                                  "center",
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {u.begintijd ||
                                "-"}
                            </td>

                            <td
                              style={{
                                padding:
                                  "13px 2px",
                                textAlign:
                                  "center",
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {u.eindtijd ||
                                "-"}
                            </td>

                            <td
                              style={{
                                padding:
                                  "13px 2px",
                                textAlign:
                                  "center",
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {u.pauze !=
                              null
                                ? `${u.pauze} min`
                                : "-"}
                            </td>

                            <td
                              style={{
                                padding:
                                  "13px 2px",
                                textAlign:
                                  "center",
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              <strong
                                style={{
                                  color:
                                    "#15803d",
                                }}
                              >
                                {u.uren !=
                                null
                                  ? `${u.uren} uur`
                                  : "-"}
                              </strong>
                            </td>

                            <td
                              style={{
                                padding:
                                  "13px 2px",
                                textAlign:
                                  "center",
                              }}
                            >
                              <span
                                style={{
                                  display:
                                    "inline-block",
                                  padding:
                                    "5px 7px",
                                  borderRadius:
                                    "999px",
                                  background:
                                    kleur.background,
                                  color:
                                    kleur.color,
                                  fontWeight:
                                    "700",
                                  fontSize:
                                    "11px",
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {u.status ||
                                  "Open"}
                              </span>
                            </td>

                            {/* ACTIES */}

                            <td
                              style={{
                                padding:
                                  "10px 3px",
                              }}
                            >
                              <div
                                style={{
                                  display:
                                    "flex",
                                  justifyContent:
                                    "center",
                                  alignItems:
                                    "center",
                                  gap:
                                    "4px",
                                  flexWrap:
                                    "wrap",
                                }}
                              >
                                {/* BEWERKEN */}

                                <button
                                  type="button"
                                  title="Bewerken"
                                  disabled={
                                    bezig
                                  }
                                  onClick={() =>
                                    openBewerken(
                                      u
                                    )
                                  }
                                  style={{
                                    width:
                                      "34px",
                                    height:
                                      "34px",
                                    border:
                                      "none",
                                    borderRadius:
                                      "8px",
                                    background:
                                      "#2563eb",
                                    color:
                                      "#ffffff",
                                    cursor:
                                      "pointer",
                                    fontSize:
                                      "15px",
                                  }}
                                >
                                  ✏️
                                </button>

                                {/* GOEDKEUREN */}

                                {!isGoedgekeurd(
                                  u.status
                                ) && (
                                  <button
                                    type="button"
                                    title="Goedkeuren"
                                    disabled={
                                      bezig
                                    }
                                    onClick={() =>
                                      wijzigStatus(
                                        u.id,
                                        "Goedgekeurd"
                                      )
                                    }
                                    style={{
                                      width:
                                        "34px",
                                      height:
                                        "34px",
                                      border:
                                        "none",
                                      borderRadius:
                                        "8px",
                                      background:
                                        "#16a34a",
                                      color:
                                        "#ffffff",
                                      cursor:
                                        "pointer",
                                      fontSize:
                                        "15px",
                                    }}
                                  >
                                    {bezig
                                      ? "⏳"
                                      : "✓"}
                                  </button>
                                )}

                                {/* AFKEUREN */}

                                {!isAfgekeurd(
                                  u.status
                                ) && (
                                  <button
                                    type="button"
                                    title="Afkeuren"
                                    disabled={
                                      bezig
                                    }
                                    onClick={() =>
                                      wijzigStatus(
                                        u.id,
                                        "Afgekeurd"
                                      )
                                    }
                                    style={{
                                      width:
                                        "34px",
                                      height:
                                        "34px",
                                      border:
                                        "none",
                                      borderRadius:
                                        "8px",
                                      background:
                                        "#f97316",
                                      color:
                                        "#ffffff",
                                      cursor:
                                        "pointer",
                                      fontSize:
                                        "15px",
                                    }}
                                  >
                                    {bezig
                                      ? "⏳"
                                      : "✕"}
                                  </button>
                                )}

                                {/* VERWIJDEREN */}

                                <button
                                  type="button"
                                  title="Verwijderen"
                                  disabled={
                                    bezig
                                  }
                                  onClick={() =>
                                    verwijderUren(
                                      u.id
                                    )
                                  }
                                  style={{
                                    width:
                                      "34px",
                                    height:
                                      "34px",
                                    border:
                                      "none",
                                    borderRadius:
                                      "8px",
                                    background:
                                      "#dc2626",
                                    color:
                                      "#ffffff",
                                    cursor:
                                      "pointer",
                                    fontSize:
                                      "15px",
                                  }}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {/* =================================
                  MOBIELE KAARTEN
              ================================== */}

              <div
                className="uren-kaarten-mobiel"
                style={{
                  display: "none",
                }}
              >
                {gefilterd.map(
                  (u) => {
                    const kleur =
                      statusKleur(
                        u.status
                      );

                    const bezig =
                      actieBezig ===
                      u.id;

                    return (
                      <div
                        key={u.id}
                        style={{
                          border:
                            "1px solid #e2e8f0",
                          borderRadius:
                            "14px",
                          padding:
                            "16px",
                          marginBottom:
                            "12px",
                          background:
                            "#ffffff",
                        }}
                      >
                        {/* NAAM + STATUS */}

                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "flex-start",
                            gap:
                              "10px",
                            marginBottom:
                              "12px",
                          }}
                        >
                          <div
                            style={{
                              minWidth: 0,
                            }}
                          >
                            <strong
                              style={{
                                fontSize:
                                  "17px",
                                color:
                                  "#0f172a",
                              }}
                            >
                              👤{" "}
                              {u.medewerker ||
                                "-"}
                            </strong>

                            <div
                              style={{
                                color:
                                  "#64748b",
                                marginTop:
                                  "5px",
                              }}
                            >
                              🏭{" "}
                              {u.terminal ||
                                "-"}
                            </div>
                          </div>

                          <span
                            style={{
                              padding:
                                "6px 9px",
                              borderRadius:
                                "999px",
                              background:
                                kleur.background,
                              color:
                                kleur.color,
                              fontWeight:
                                "700",
                              fontSize:
                                "11px",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {u.status ||
                              "Open"}
                          </span>
                        </div>

                        {/* DETAILS */}

                        <div
                          style={{
                            display:
                              "grid",
                            gridTemplateColumns:
                              "repeat(2, 1fr)",
                            gap:
                              "10px",
                            background:
                              "#f8fafc",
                            borderRadius:
                              "10px",
                            padding:
                              "12px",
                          }}
                        >
                          <div>
                            <small
                              style={{
                                color:
                                  "#64748b",
                              }}
                            >
                              Datum
                            </small>

                            <div>
                              {u.datum ||
                                "-"}
                            </div>
                          </div>

                          <div>
                            <small
                              style={{
                                color:
                                  "#64748b",
                              }}
                            >
                              Uren
                            </small>

                            <div
                              style={{
                                color:
                                  "#15803d",
                                fontWeight:
                                  "700",
                              }}
                            >
                              {u.uren !=
                              null
                                ? `${u.uren} uur`
                                : "-"}
                            </div>
                          </div>

                          <div>
                            <small
                              style={{
                                color:
                                  "#64748b",
                              }}
                            >
                              Werktijd
                            </small>

                            <div>
                              {u.begintijd ||
                                "-"}{" "}
                              →{" "}
                              {u.eindtijd ||
                                "-"}
                            </div>
                          </div>

                          <div>
                            <small
                              style={{
                                color:
                                  "#64748b",
                              }}
                            >
                              Pauze
                            </small>

                            <div>
                              {u.pauze !=
                              null
                                ? `${u.pauze} min`
                                : "-"}
                            </div>
                          </div>
                        </div>

                        {/* MOBIELE ACTIES */}

                        <div
                          style={{
                            display:
                              "grid",
                            gridTemplateColumns:
                              "repeat(2, 1fr)",
                            gap:
                              "8px",
                            marginTop:
                              "12px",
                          }}
                        >
                          {/* BEWERKEN */}

                          <button
                            type="button"
                            disabled={
                              bezig
                            }
                            onClick={() =>
                              openBewerken(
                                u
                              )
                            }
                            style={{
                              border:
                                "none",
                              borderRadius:
                                "9px",
                              padding:
                                "10px",
                              background:
                                "#2563eb",
                              color:
                                "#ffffff",
                              fontWeight:
                                "700",
                            }}
                          >
                            ✏️ Bewerken
                          </button>

                          {/* VERWIJDEREN */}

                          <button
                            type="button"
                            disabled={
                              bezig
                            }
                            onClick={() =>
                              verwijderUren(
                                u.id
                              )
                            }
                            style={{
                              border:
                                "none",
                              borderRadius:
                                "9px",
                              padding:
                                "10px",
                              background:
                                "#dc2626",
                              color:
                                "#ffffff",
                              fontWeight:
                                "700",
                            }}
                          >
                            🗑️ Verwijderen
                          </button>

                          {/* GOEDKEUREN */}

                          {!isGoedgekeurd(
                            u.status
                          ) && (
                            <button
                              type="button"
                              disabled={
                                bezig
                              }
                              onClick={() =>
                                wijzigStatus(
                                  u.id,
                                  "Goedgekeurd"
                                )
                              }
                              style={{
                                border:
                                  "none",
                                borderRadius:
                                  "9px",
                                padding:
                                  "10px",
                                background:
                                  "#16a34a",
                                color:
                                  "#ffffff",
                                fontWeight:
                                  "700",
                              }}
                            >
                              {bezig
                                ? "⏳"
                                : "✅ Goedkeuren"}
                            </button>
                          )}

                          {/* AFKEUREN */}

                          {!isAfgekeurd(
                            u.status
                          ) && (
                            <button
                              type="button"
                              disabled={
                                bezig
                              }
                              onClick={() =>
                                wijzigStatus(
                                  u.id,
                                  "Afgekeurd"
                                )
                              }
                              style={{
                                border:
                                  "none",
                                borderRadius:
                                  "9px",
                                padding:
                                  "10px",
                                background:
                                  "#f97316",
                                color:
                                  "#ffffff",
                                fontWeight:
                                  "700",
                              }}
                            >
                              {bezig
                                ? "⏳"
                                : "❌ Afkeuren"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ====================================
          NIEUW / BEWERKEN MODAL
      ===================================== */}

      {toonForm && (
        <div
          className="modal"
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15,23,42,.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            style={{
              width: "100%",
              maxWidth: "700px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "18px",
              padding: "25px",
              boxSizing: "border-box",
            }}
          >
            <UrenregistratieForm
              registratie={
                geselecteerd
              }
              onSaved={() => {
                laadUren();
                setToonForm(false);
                setGeselecteerd(
                  null
                );
              }}
              onCancel={() => {
                setToonForm(false);
                setGeselecteerd(
                  null
                );
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}