// src/pages/Urenregistratie.jsx

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabase";

import UrenregistratieForm from "../components/UrenregistratieForm";
import UrenDashboard from "../components/uren/UrenDashboard";

import { exportUrenExcel } from "../utils/exportUrenExcel";

export default function Urenregistratie() {
  const [uren, setUren] = useState([]);

  const [zoekterm, setZoekterm] = useState("");
  const [datumFilter, setDatumFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [toonForm, setToonForm] = useState(false);
  const [toonDetail, setToonDetail] = useState(false);

  const [geselecteerdeRegistratie, setGeselecteerdeRegistratie] =
    useState(null);

  const [laden, setLaden] = useState(true);
  const [actieBezig, setActieBezig] = useState(null);

  // ============================================================
  // UREN LADEN
  // ============================================================

  useEffect(() => {
    laadUren();
  }, []);

  async function laadUren() {
    setLaden(true);

    try {
      const {
        data: urenData,
        error: urenError,
      } = await supabase
        .from("urenregistratie")
        .select("*")
        .order("datum", {
          ascending: false,
        });

      if (urenError) {
        throw urenError;
      }

      const registraties = urenData || [];

      // ========================================================
      // PLANNINGEN OPHALEN
      // ========================================================

      const planningIds = [
        ...new Set(
          registraties
            .map((u) => u.planning_id)
            .filter(Boolean)
        ),
      ];

      let planningen = [];

      if (planningIds.length > 0) {
        const {
          data: planningData,
          error: planningError,
        } = await supabase
          .from("planning")
          .select("*")
          .in("id", planningIds);

        if (planningError) {
          console.error(
            "Fout bij laden planning:",
            planningError
          );
        } else {
          planningen = planningData || [];
        }
      }

      // ========================================================
      // UREN + PLANNING COMBINEREN
      // ========================================================

      const compleet = registraties.map((u) => {
        const planning = planningen.find(
          (p) =>
            String(p.id) ===
            String(u.planning_id)
        );

        return {
          ...u,

          terminal:
            planning?.terminal || "",

          dienst:
            planning?.dienst || "",

          planning_medewerker:
            planning?.medewerker || "",

          planning_status:
            planning?.status || "",
        };
      });

      setUren(compleet);
    } catch (error) {
      console.error(
        "Fout bij laden uren:",
        error
      );

      alert(
        error.message ||
          "De urenregistraties konden niet worden geladen."
      );
    } finally {
      setLaden(false);
    }
  }

  // ============================================================
  // DETAIL OPENEN
  // ============================================================

  function openDetail(registratie) {
    setGeselecteerdeRegistratie(
      registratie
    );

    setToonDetail(true);
  }

  // ============================================================
  // DETAIL SLUITEN
  // ============================================================

  function sluitDetail() {
    setToonDetail(false);
    setGeselecteerdeRegistratie(null);
  }

  // ============================================================
  // BEWERKEN
  // ============================================================

  function bewerkenRegistratie() {
    setToonDetail(false);
    setToonForm(true);
  }

  // ============================================================
  // STATUS
  // ============================================================

  function normaleStatus(status) {
    return (
      status || "Ingediend"
    )
      .toString()
      .toLowerCase()
      .trim();
  }

  function isIngediend(status) {
    return (
      normaleStatus(status) ===
      "ingediend"
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

  // ============================================================
  // STATUS KLEUR
  // ============================================================

  function statusKleur(status) {
    if (isGoedgekeurd(status)) {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    if (isAfgekeurd(status)) {
      return {
        background: "#fee2e2",
        color: "#b91c1c",
      };
    }

    if (isIngediend(status)) {
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

  // ============================================================
  // STATUS WIJZIGEN
  // ============================================================

  async function wijzigStatus(
    id,
    nieuweStatus
  ) {
    if (!id) {
      return;
    }

    const melding =
      nieuweStatus === "Goedgekeurd"
        ? "Deze urenregistratie goedkeuren?"
        : "Deze urenregistratie afkeuren?";

    if (!window.confirm(melding)) {
      return;
    }

    setActieBezig(id);

    try {
      const updateData = {
        status: nieuweStatus,
      };

      if (
        nieuweStatus === "Goedgekeurd"
      ) {
        updateData.goedgekeurd_op =
          new Date().toISOString();
      }

      if (
        nieuweStatus === "Afgekeurd"
      ) {
        updateData.goedgekeurd_op = null;
        updateData.goedgekeurd_door = null;
      }

      const {
        data,
        error,
      } = await supabase
        .from("urenregistratie")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setUren((vorige) =>
        vorige.map((u) =>
          u.id === id
            ? {
                ...u,
                ...data,
              }
            : u
        )
      );

      setGeselecteerdeRegistratie(
        (vorige) =>
          vorige &&
          vorige.id === id
            ? {
                ...vorige,
                ...data,
              }
            : vorige
      );

      alert(
        nieuweStatus === "Goedgekeurd"
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

  // ============================================================
  // FILTER
  // ============================================================

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

      const dienst =
        (
          u.dienst || ""
        ).toLowerCase();

      const status =
        (
          u.status || ""
        ).toLowerCase();

      const komtVoor =
        !zoek ||
        medewerker.includes(zoek) ||
        terminal.includes(zoek) ||
        dienst.includes(zoek) ||
        status.includes(zoek);

      const datumGoed =
        !datumFilter ||
        u.datum === datumFilter;

      const statusGoed =
        !statusFilter ||
        normaleStatus(u.status) ===
          statusFilter.toLowerCase();

      return (
        komtVoor &&
        datumGoed &&
        statusGoed
      );
    });
  }, [
    uren,
    zoekterm,
    datumFilter,
    statusFilter,
  ]);

  // ============================================================
  // TOTALEN
  // ============================================================

  const totaalUren = useMemo(() => {
    return uren.reduce(
      (totaal, u) =>
        totaal +
        Number(
          u.gewerkte_uren || 0
        ),
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

  const gefilterdeUren =
    useMemo(() => {
      return gefilterd.reduce(
        (totaal, u) =>
          totaal +
          Number(
            u.gewerkte_uren || 0
          ),
        0
      );
    }, [gefilterd]);

  // ============================================================
  // STATUS TOTALEN
  // ============================================================

  const ingediendAantal =
    useMemo(() => {
      return uren.filter(
        (u) =>
          isIngediend(u.status)
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
              u.gewerkte_uren || 0
            ),
          0
        );
    }, [uren]);

  const ingediendeUren =
    useMemo(() => {
      return uren
        .filter((u) =>
          isIngediend(u.status)
        )
        .reduce(
          (totaal, u) =>
            totaal +
            Number(
              u.gewerkte_uren || 0
            ),
          0
        );
    }, [uren]);

  // ============================================================
  // EXCEL
  // ============================================================

  function exporteerExcel() {
    exportUrenExcel(gefilterd);
  }

  // ============================================================
  // NIEUWE REGISTRATIE
  // ============================================================

  function openNieuw() {
    setGeselecteerdeRegistratie(null);
    setToonForm(true);
  }

  // ============================================================
  // RENDER
  // ============================================================

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
        {/* =====================================================
            HEADER
        ====================================================== */}

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
                Gewerkte uren van
                medewerkers controleren
                en goedkeuren
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <button
                className="new-btn"
                type="button"
                onClick={
                  exporteerExcel
                }
                style={{
                  background:
                    "#15803d",
                }}
              >
                📊 Excel
              </button>

              <button
                className="new-btn"
                type="button"
                style={{
                  background:
                    "#16a34a",
                }}
                onClick={
                  openNieuw
                }
              >
                + Nieuwe registratie
              </button>

              <button
                className="new-btn"
                type="button"
                style={{
                  background:
                    "#475569",
                }}
                onClick={
                  laadUren
                }
              >
                🔄 Vernieuwen
              </button>
            </div>
          </div>
        </div>

        {/* =====================================================
            DASHBOARD
        ====================================================== */}

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

        {/* =====================================================
            STATUS KAARTEN
        ====================================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <StatusCard
            icon="🟠"
            titel="Ingediend"
            aantal={
              ingediendAantal
            }
            uren={
              ingediendeUren
            }
            background="#fef3c7"
            color="#92400e"
          />

          <StatusCard
            icon="🟢"
            titel="Goedgekeurd"
            aantal={
              goedgekeurdAantal
            }
            uren={
              goedgekeurdeUren
            }
            background="#dcfce7"
            color="#166534"
          />

          <StatusCard
            icon="🔴"
            titel="Afgekeurd"
            aantal={
              afgekeurdAantal
            }
            uren={null}
            background="#fee2e2"
            color="#b91c1c"
          />

          <StatusCard
            icon="🕒"
            titel="Totaal uren"
            aantal={null}
            uren={
              totaalUren
            }
            background="#eff6ff"
            color="#1d4ed8"
          />
        </div>

        {/* =====================================================
            TOTALEN
        ====================================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <InfoCard
            titel="🧮 Totaal geregistreerd"
            waarde={`${totaalUren.toFixed(
              2
            )} uur`}
            kleur="#15803d"
          />

          <InfoCard
            titel="🔎 Gefilterd"
            waarde={`${gefilterdeUren.toFixed(
              2
            )} uur`}
            kleur="#1d4ed8"
          />

          <InfoCard
            titel="⏳ Wacht op goedkeuring"
            waarde={`${ingediendeUren.toFixed(
              2
            )} uur`}
            kleur="#d97706"
          />
        </div>

        {/* =====================================================
            FILTERS
        ====================================================== */}

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
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(250px, 1fr) 180px 180px auto",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              placeholder="🔍 Zoek medewerker, terminal of dienst..."
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
                padding: "11px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "8px",
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
              style={{
                padding: "11px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "8px",
              }}
            />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              style={{
                padding: "11px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "8px",
              }}
            >
              <option value="">
                Alle statussen
              </option>

              <option value="ingediend">
                🟠 Ingediend
              </option>

              <option value="goedgekeurd">
                🟢 Goedgekeurd
              </option>

              <option value="afgekeurd">
                🔴 Afgekeurd
              </option>
            </select>

            <button
              type="button"
              className="new-btn"
              style={{
                background:
                  "#64748b",
              }}
              onClick={() => {
                setZoekterm("");
                setDatumFilter("");
                setStatusFilter("");
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

        {/* =====================================================
            TABEL
        ====================================================== */}

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
            <div
              style={{
                overflowX:
                  "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse:
                    "collapse",
                  minWidth:
                    "1200px",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background:
                        "#eff6ff",
                      color:
                        "#1e3a8a",
                    }}
                  >
                    <th style={thStyle}>
                      Datum
                    </th>

                    <th style={thStyle}>
                      Medewerker
                    </th>

                    <th style={thStyle}>
                      Terminal
                    </th>

                    <th style={thStyle}>
                      Dienst
                    </th>

                    <th style={thStyle}>
                      Start
                    </th>

                    <th style={thStyle}>
                      Einde
                    </th>

                    <th style={thStyle}>
                      Pauze
                    </th>

                    <th style={thStyle}>
                      Uren
                    </th>

                    <th style={thStyle}>
                      Status
                    </th>

                    <th style={thStyle}>
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
                          <td style={tdStyle}>
                            {u.datum ||
                              "-"}
                          </td>

                          <td style={tdStyle}>
                            <strong>
                              {u.medewerker ||
                                "-"}
                            </strong>
                          </td>

                          <td style={tdStyle}>
                            {u.terminal ||
                              "-"}
                          </td>

                          <td style={tdStyle}>
                            {u.dienst ||
                              "-"}
                          </td>

                          <td
                            style={{
                              ...tdStyle,
                              textAlign:
                                "center",
                            }}
                          >
                            {formatTijd(
                              u.starttijd
                            )}
                          </td>

                          <td
                            style={{
                              ...tdStyle,
                              textAlign:
                                "center",
                            }}
                          >
                            {formatTijd(
                              u.eindtijd
                            )}
                          </td>

                          <td
                            style={{
                              ...tdStyle,
                              textAlign:
                                "center",
                            }}
                          >
                            {u.pauze_minuten ??
                              0}{" "}
                            min
                          </td>

                          <td
                            style={{
                              ...tdStyle,
                              textAlign:
                                "center",
                            }}
                          >
                            <strong
                              style={{
                                color:
                                  "#15803d",
                              }}
                            >
                              {Number(
                                u.gewerkte_uren ||
                                  0
                              ).toFixed(
                                2
                              )}{" "}
                              uur
                            </strong>
                          </td>

                          <td
                            style={{
                              ...tdStyle,
                              textAlign:
                                "center",
                            }}
                          >
                            <span
                              style={{
                                display:
                                  "inline-block",
                                padding:
                                  "6px 10px",
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
                                "Ingediend"}
                            </span>
                          </td>

                          {/* ACTIES */}

                          <td
                            style={{
                              ...tdStyle,
                              textAlign:
                                "center",
                            }}
                          >
                            <div
                              style={{
                                display:
                                  "flex",
                                justifyContent:
                                  "center",
                                gap:
                                  "6px",
                              }}
                            >
                              {/* BEKIJKEN */}

                              <button
                                type="button"
                                title="Details bekijken"
                                onClick={() =>
                                  openDetail(
                                    u
                                  )
                                }
                                style={{
                                  width:
                                    "36px",
                                  height:
                                    "36px",
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
                                    "16px",
                                }}
                              >
                                👁️
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
                                  title="Goedkeuren"
                                  style={{
                                    width:
                                      "36px",
                                    height:
                                      "36px",
                                    border:
                                      "none",
                                    borderRadius:
                                      "8px",
                                    background:
                                      "#16a34a",
                                    color:
                                      "#ffffff",
                                    cursor:
                                      bezig
                                        ? "wait"
                                        : "pointer",
                                    fontSize:
                                      "16px",
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
                                  disabled={
                                    bezig
                                  }
                                  onClick={() =>
                                    wijzigStatus(
                                      u.id,
                                      "Afgekeurd"
                                    )
                                  }
                                  title="Afkeuren"
                                  style={{
                                    width:
                                      "36px",
                                    height:
                                      "36px",
                                    border:
                                      "none",
                                    borderRadius:
                                      "8px",
                                    background:
                                      "#dc2626",
                                    color:
                                      "#ffffff",
                                    cursor:
                                      bezig
                                        ? "wait"
                                        : "pointer",
                                    fontSize:
                                      "16px",
                                  }}
                                >
                                  {bezig
                                    ? "⏳"
                                    : "✕"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* =======================================================
          NIEUWE / BEWERKEN REGISTRATIE
      ======================================================== */}

      {toonForm && (
        <div
          style={overlayStyle}
        >
          <div
            style={{
              ...modalStyle,
              maxWidth: "700px",
            }}
          >
            <UrenregistratieForm
              registratie={
                geselecteerdeRegistratie
              }
              onSaved={() => {
                laadUren();
                setToonForm(false);
                setGeselecteerdeRegistratie(
                  null
                );
              }}
              onCancel={() => {
                setToonForm(false);
                setGeselecteerdeRegistratie(
                  null
                );
              }}
            />
          </div>
        </div>
      )}

      {/* =======================================================
          DETAIL MODAL
      ======================================================== */}

      {toonDetail &&
        geselecteerdeRegistratie && (
          <div
            style={overlayStyle}
            onClick={(e) => {
              if (
                e.target ===
                e.currentTarget
              ) {
                sluitDetail();
              }
            }}
          >
            <div
              style={{
                ...modalStyle,
                maxWidth: "650px",
              }}
            >
              <DetailRegistratie
                registratie={
                  geselecteerdeRegistratie
                }
                statusKleur={
                  statusKleur
                }
                isGoedgekeurd={
                  isGoedgekeurd
                }
                isAfgekeurd={
                  isAfgekeurd
                }
                bezig={
                  actieBezig ===
                  geselecteerdeRegistratie.id
                }
                onClose={
                  sluitDetail
                }
                onEdit={
                  bewerkenRegistratie
                }
                onApprove={() =>
                  wijzigStatus(
                    geselecteerdeRegistratie.id,
                    "Goedgekeurd"
                  )
                }
                onReject={() =>
                  wijzigStatus(
                    geselecteerdeRegistratie.id,
                    "Afgekeurd"
                  )
                }
              />
            </div>
          </div>
        )}
    </>
  );
}

// ============================================================
// DETAIL COMPONENT
// ============================================================

function DetailRegistratie({
  registratie,
  statusKleur,
  isGoedgekeurd,
  isAfgekeurd,
  bezig,
  onClose,
  onEdit,
  onApprove,
  onReject,
}) {
  const kleur =
    statusKleur(
      registratie.status
    );

  return (
    <div>
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "flex-start",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: "#15803d",
            }}
          >
            🕒 Urenregistratie
          </h2>

          <div
            style={{
              marginTop: "5px",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Details van de gewerkte
            uren
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={closeButtonStyle}
        >
          ✕
        </button>
      </div>

      {/* STATUS */}

      <div
        style={{
          background:
            kleur.background,
          color: kleur.color,
          borderRadius: "12px",
          padding: "12px 15px",
          marginBottom: "18px",
          fontWeight: "700",
          textAlign: "center",
        }}
      >
        {registratie.status ||
          "Ingediend"}
      </div>

      {/* MEDEWERKER */}

      <DetailSection titel="👤 Medewerker">
        <DetailRow
          label="Naam"
          value={
            registratie.medewerker ||
            "-"
          }
        />
      </DetailSection>

      {/* DIENST */}

      <DetailSection titel="📅 Dienst">
        <DetailRow
          label="Datum"
          value={
            registratie.datum ||
            "-"
          }
        />

        <DetailRow
          label="Terminal"
          value={
            registratie.terminal ||
            "-"
          }
        />

        <DetailRow
          label="Dienst"
          value={
            registratie.dienst ||
            "-"
          }
        />

        <DetailRow
          label="Planning ID"
          value={
            registratie.planning_id ||
            "-"
          }
        />
      </DetailSection>

      {/* UREN */}

      <DetailSection titel="🕒 Gewerkte uren">
        <DetailRow
          label="Starttijd"
          value={formatTijd(
            registratie.starttijd
          )}
        />

        <DetailRow
          label="Eindtijd"
          value={formatTijd(
            registratie.eindtijd
          )}
        />

        <DetailRow
          label="Pauze"
          value={`${registratie.pauze_minuten ?? 0} minuten`}
        />

        <DetailRow
          label="Gewerkte uren"
          value={`${Number(
            registratie.gewerkte_uren ||
              0
          ).toFixed(2)} uur`}
          sterk
        />
      </DetailSection>

      {/* OPMERKING */}

      <DetailSection titel="📝 Opmerking">
        <div
          style={{
            background:
              "#f8fafc",
            borderRadius: "10px",
            padding: "12px",
            color: "#334155",
            minHeight: "45px",
            whiteSpace:
              "pre-wrap",
          }}
        >
          {registratie.opmerking ||
            "Geen opmerking toegevoegd."}
        </div>
      </DetailSection>

      {/* GOEDGEKEURD */}

      {registratie.goedgekeurd_op && (
        <DetailSection titel="✅ Goedkeuring">
          <DetailRow
            label="Goedgekeurd op"
            value={formatDatumTijd(
              registratie.goedgekeurd_op
            )}
          />

          {registratie.goedgekeurd_door && (
            <DetailRow
              label="Goedgekeurd door"
              value={
                registratie.goedgekeurd_door
              }
            />
          )}
        </DetailSection>
      )}

      {/* KNOPPEN */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={onEdit}
          style={{
            ...actieButtonStyle,
            background:
              "#2563eb",
          }}
        >
          ✏️ Bewerken
        </button>

        {!isGoedgekeurd(
          registratie.status
        ) && (
          <button
            type="button"
            disabled={bezig}
            onClick={onApprove}
            style={{
              ...actieButtonStyle,
              background:
                "#16a34a",
            }}
          >
            {bezig
              ? "⏳"
              : "✅ Goedkeuren"}
          </button>
        )}

        {!isAfgekeurd(
          registratie.status
        ) && (
          <button
            type="button"
            disabled={bezig}
            onClick={onReject}
            style={{
              ...actieButtonStyle,
              background:
                "#dc2626",
            }}
          >
            {bezig
              ? "⏳"
              : "❌ Afkeuren"}
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          style={{
            ...actieButtonStyle,
            background:
              "#64748b",
          }}
        >
          Sluiten
        </button>
      </div>
    </div>
  );
}

// ============================================================
// DETAIL HULPCOMPONENTEN
// ============================================================

function DetailSection({
  titel,
  children,
}) {
  return (
    <div
      style={{
        marginBottom: "15px",
      }}
    >
      <div
        style={{
          fontWeight: "700",
          color: "#334155",
          marginBottom: "8px",
        }}
      >
        {titel}
      </div>

      <div
        style={{
          border:
            "1px solid #e2e8f0",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  sterk = false,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        gap: "15px",
        padding: "10px 12px",
        borderBottom:
          "1px solid #f1f5f9",
      }}
    >
      <span
        style={{
          color: "#64748b",
        }}
      >
        {label}
      </span>

      <strong
        style={{
          color: sterk
            ? "#15803d"
            : "#0f172a",
          textAlign: "right",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

// ============================================================
// DATUM / TIJD
// ============================================================

function formatTijd(tijd) {
  if (!tijd) {
    return "-";
  }

  return String(tijd).substring(
    0,
    5
  );
}

function formatDatumTijd(waarde) {
  if (!waarde) {
    return "-";
  }

  try {
    return new Date(
      waarde
    ).toLocaleString(
      "nl-NL",
      {
        dateStyle: "short",
        timeStyle: "short",
      }
    );
  } catch {
    return waarde;
  }
}

// ============================================================
// STIJLEN
// ============================================================

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background:
    "rgba(15,23,42,.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  zIndex: 1000,
};

const modalStyle = {
  width: "100%",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#ffffff",
  borderRadius: "18px",
  padding: "25px",
  boxSizing: "border-box",
  boxShadow:
    "0 25px 60px rgba(0,0,0,.25)",
};

const closeButtonStyle = {
  width: "36px",
  height: "36px",
  border: "none",
  borderRadius: "8px",
  background: "#f1f5f9",
  color: "#475569",
  cursor: "pointer",
  fontSize: "18px",
};

const actieButtonStyle = {
  flex: "1 1 140px",
  border: "none",
  borderRadius: "9px",
  padding: "11px 14px",
  color: "#ffffff",
  fontWeight: "700",
  cursor: "pointer",
};

function StatusCard({
  icon,
  titel,
  aantal,
  uren,
  background,
  color,
}) {
  return (
    <div
      style={{
        background,
        borderRadius: "14px",
        padding: "18px",
      }}
    >
      <div
        style={{
          color,
          fontSize: "14px",
          fontWeight: "600",
        }}
      >
        {icon} {titel}
      </div>

      {aantal !== null &&
        aantal !== undefined && (
          <strong
            style={{
              display: "block",
              marginTop: "5px",
              fontSize: "26px",
              color,
            }}
          >
            {aantal}
          </strong>
        )}

      {uren !== null &&
        uren !== undefined && (
          <div
            style={{
              marginTop: "6px",
              fontSize: "14px",
              color,
              fontWeight: "600",
            }}
          >
            {Number(
              uren
            ).toFixed(2)}{" "}
            uur
          </div>
        )}
    </div>
  );
}

function InfoCard({
  titel,
  waarde,
  kleur,
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "14px",
        padding: "18px",
        border:
          "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          color: "#64748b",
        }}
      >
        {titel}
      </div>

      <strong
        style={{
          display: "block",
          marginTop: "5px",
          fontSize: "24px",
          color: kleur,
        }}
      >
        {waarde}
      </strong>
    </div>
  );
}

const thStyle = {
  padding: "13px 8px",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "13px 8px",
  whiteSpace: "nowrap",
};