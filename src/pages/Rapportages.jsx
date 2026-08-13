// src/pages/Rapportages.jsx

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabase";
import { exportUrenExcel } from "../utils/exportUrenExcel";

export default function Rapportages() {
  const [uren, setUren] = useState([]);
  const [laden, setLaden] = useState(true);

  const [vanDatum, setVanDatum] = useState("");
  const [totDatum, setTotDatum] = useState("");
  const [medewerkerFilter, setMedewerkerFilter] =
    useState("");
  const [terminalFilter, setTerminalFilter] =
    useState("");

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
        "Fout bij laden rapportage:",
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
  // FILTEROPTIES
  // ==========================================

  const medewerkers = useMemo(() => {
    return [
      ...new Set(
        uren
          .map((u) => u.medewerker)
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      a.localeCompare(b, "nl")
    );
  }, [uren]);

  const terminals = useMemo(() => {
    return [
      ...new Set(
        uren
          .map((u) => u.terminal)
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      a.localeCompare(b, "nl")
    );
  }, [uren]);

  // ==========================================
  // GEFILTERDE UREN
  // ==========================================

  const gefilterdeUren = useMemo(() => {
    return uren.filter((u) => {
      const datum = u.datum || "";

      const datumVanaf =
        !vanDatum ||
        datum >= vanDatum;

      const datumTot =
        !totDatum ||
        datum <= totDatum;

      const medewerkerGoed =
        !medewerkerFilter ||
        u.medewerker ===
          medewerkerFilter;

      const terminalGoed =
        !terminalFilter ||
        u.terminal ===
          terminalFilter;

      return (
        datumVanaf &&
        datumTot &&
        medewerkerGoed &&
        terminalGoed
      );
    });
  }, [
    uren,
    vanDatum,
    totDatum,
    medewerkerFilter,
    terminalFilter,
  ]);

  // ==========================================
  // TOTALEN
  // ==========================================

  const totaalUren = useMemo(() => {
    return gefilterdeUren.reduce(
      (totaal, u) =>
        totaal +
        Number(u.uren || 0),
      0
    );
  }, [gefilterdeUren]);

  const totaalRegistraties =
    gefilterdeUren.length;

  const totaalMedewerkers =
    new Set(
      gefilterdeUren
        .map((u) => u.medewerker)
        .filter(Boolean)
    ).size;

  const totaalTerminals =
    new Set(
      gefilterdeUren
        .map((u) => u.terminal)
        .filter(Boolean)
    ).size;

  // ==========================================
  // STATUS
  // ==========================================

  const isGoedgekeurd = (status) => {
    const waarde =
      (status || "")
        .toLowerCase()
        .trim();

    return (
      waarde === "goedgekeurd" ||
      waarde === "akkoord" ||
      waarde === "voltooid"
    );
  };

  const isOpen = (status) => {
    return (
      (status || "")
        .toLowerCase()
        .trim() === "open"
    );
  };

  const isAfgekeurd = (status) => {
    return (
      (status || "")
        .toLowerCase()
        .trim() === "afgekeurd"
    );
  };

  const goedgekeurd = useMemo(() => {
    return gefilterdeUren.filter((u) =>
      isGoedgekeurd(u.status)
    );
  }, [gefilterdeUren]);

  const open = useMemo(() => {
    return gefilterdeUren.filter((u) =>
      isOpen(u.status)
    );
  }, [gefilterdeUren]);

  const afgekeurd = useMemo(() => {
    return gefilterdeUren.filter((u) =>
      isAfgekeurd(u.status)
    );
  }, [gefilterdeUren]);

  const goedgekeurdeUren =
    goedgekeurd.reduce(
      (totaal, u) =>
        totaal +
        Number(u.uren || 0),
      0
    );

  const openUren = open.reduce(
    (totaal, u) =>
      totaal +
      Number(u.uren || 0),
    0
  );

  const afgekeurdeUren =
    afgekeurd.reduce(
      (totaal, u) =>
        totaal +
        Number(u.uren || 0),
      0
    );

  // ==========================================
  // PER MEDEWERKER
  // ==========================================

  const rapportMedewerkers = useMemo(() => {
    const resultaat = {};

    gefilterdeUren.forEach((u) => {
      const naam =
        u.medewerker ||
        "Onbekend";

      if (!resultaat[naam]) {
        resultaat[naam] = {
          naam,
          registraties: 0,
          uren: 0,
          goedgekeurd: 0,
          open: 0,
          afgekeurd: 0,
        };
      }

      resultaat[naam].registraties += 1;

      resultaat[naam].uren +=
        Number(u.uren || 0);

      if (isGoedgekeurd(u.status)) {
        resultaat[naam].goedgekeurd +=
          Number(u.uren || 0);
      } else if (isOpen(u.status)) {
        resultaat[naam].open +=
          Number(u.uren || 0);
      } else if (
        isAfgekeurd(u.status)
      ) {
        resultaat[naam].afgekeurd +=
          Number(u.uren || 0);
      }
    });

    return Object.values(
      resultaat
    ).sort(
      (a, b) =>
        b.uren - a.uren
    );
  }, [gefilterdeUren]);

  // ==========================================
  // PER TERMINAL
  // ==========================================

  const rapportTerminals = useMemo(() => {
    const resultaat = {};

    gefilterdeUren.forEach((u) => {
      const naam =
        u.terminal ||
        "Onbekend";

      if (!resultaat[naam]) {
        resultaat[naam] = {
          naam,
          registraties: 0,
          uren: 0,
        };
      }

      resultaat[naam].registraties += 1;

      resultaat[naam].uren +=
        Number(u.uren || 0);
    });

    return Object.values(
      resultaat
    ).sort(
      (a, b) =>
        b.uren - a.uren
    );
  }, [gefilterdeUren]);

  // ==========================================
  // FILTERS WISSEN
  // ==========================================

  function wisFilters() {
    setVanDatum("");
    setTotDatum("");
    setMedewerkerFilter("");
    setTerminalFilter("");
  }

  // ==========================================
  // PRINT
  // ==========================================

  function printRapportage() {
    window.print();
  }

  // ==========================================
  // EXCEL
  // ==========================================

  function exportExcel() {
    exportUrenExcel(
      gefilterdeUren
    );
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div
      style={{
        background: "#f8fafc",
        minHeight: "100vh",
        padding: "25px",
        boxSizing: "border-box",
      }}
    >
      {/* ======================================
          HEADER
      ======================================= */}

      <div
        className="rapportage-print-header"
        style={{
          background: "#ffffff",
          borderRadius: "18px",
          padding: "25px 30px",
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
            gap: "15px",
            flexWrap: "wrap",
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
              📊 Rapportages
            </h1>

            <p
              style={{
                marginBottom: 0,
                color: "#64748b",
              }}
            >
              Overzicht van
              geregistreerde uren
            </p>
          </div>

          <div
            className="rapportage-print-buttons"
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              className="new-btn"
              onClick={exportExcel}
              style={{
                background:
                  "#16a34a",
              }}
            >
              📊 Excel
            </button>

            <button
              type="button"
              className="new-btn"
              onClick={printRapportage}
              style={{
                background:
                  "#2563eb",
              }}
            >
              🖨️ Printen
            </button>
          </div>
        </div>
      </div>

      {/* ======================================
          FILTERS
      ======================================= */}

      <div
        className="rapportage-print-hide"
        style={{
          background: "#ffffff",
          borderRadius: "18px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow:
            "0 8px 20px rgba(0,0,0,.08)",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            color: "#334155",
          }}
        >
          🔎 Rapportage filteren
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
          }}
        >
          <div>
            <label>Vanaf</label>

            <input
              type="date"
              value={vanDatum}
              onChange={(e) =>
                setVanDatum(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                boxSizing:
                  "border-box",
              }}
            />
          </div>

          <div>
            <label>Tot en met</label>

            <input
              type="date"
              value={totDatum}
              onChange={(e) =>
                setTotDatum(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                boxSizing:
                  "border-box",
              }}
            />
          </div>

          <div>
            <label>
              Medewerker
            </label>

            <select
              value={
                medewerkerFilter
              }
              onChange={(e) =>
                setMedewerkerFilter(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                boxSizing:
                  "border-box",
              }}
            >
              <option value="">
                Alle medewerkers
              </option>

              {medewerkers.map(
                (naam) => (
                  <option
                    key={naam}
                    value={naam}
                  >
                    {naam}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label>
              Terminal
            </label>

            <select
              value={
                terminalFilter
              }
              onChange={(e) =>
                setTerminalFilter(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                boxSizing:
                  "border-box",
              }}
            >
              <option value="">
                Alle terminals
              </option>

              {terminals.map(
                (naam) => (
                  <option
                    key={naam}
                    value={naam}
                  >
                    {naam}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <button
          type="button"
          className="new-btn"
          onClick={wisFilters}
          style={{
            marginTop: "15px",
            background: "#64748b",
          }}
        >
          🔄 Filters wissen
        </button>
      </div>

      {/* ======================================
          PRINT TITEL
      ======================================= */}

      <div
        className="rapportage-print-only"
        style={{
          display: "none",
          marginBottom: "20px",
        }}
      >
        <h1>
          Rapportage
          urenregistratie
        </h1>

        <p>
          Gegenereerd op{" "}
          {new Date().toLocaleDateString(
            "nl-NL"
          )}
        </p>
      </div>

      {/* ======================================
          LADEN
      ======================================= */}

      {laden ? (
        <div
          style={{
            background: "#ffffff",
            padding: "50px",
            borderRadius: "18px",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          ⏳ Rapportage laden...
        </div>
      ) : (
        <>
          {/* ==================================
              HOOFDTOTALEN
          =================================== */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            <StatKaart
              icoon="🕒"
              titel="Totaal uren"
              waarde={`${totaalUren.toFixed(
                2
              )} uur`}
              kleur="#15803d"
              achtergrond="#dcfce7"
            />

            <StatKaart
              icoon="📋"
              titel="Registraties"
              waarde={
                totaalRegistraties
              }
              kleur="#1d4ed8"
              achtergrond="#dbeafe"
            />

            <StatKaart
              icoon="👷"
              titel="Medewerkers"
              waarde={
                totaalMedewerkers
              }
              kleur="#7c3aed"
              achtergrond="#ede9fe"
            />

            <StatKaart
              icoon="🏭"
              titel="Terminals"
              waarde={
                totaalTerminals
              }
              kleur="#0f766e"
              achtergrond="#ccfbf1"
            />
          </div>

          {/* ==================================
              STATUS TOTALEN
          =================================== */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            <StatKaart
              icoon="🟢"
              titel="Goedgekeurde uren"
              waarde={`${goedgekeurdeUren.toFixed(
                2
              )} uur`}
              kleur="#166534"
              achtergrond="#dcfce7"
            />

            <StatKaart
              icoon="🟡"
              titel="Open uren"
              waarde={`${openUren.toFixed(
                2
              )} uur`}
              kleur="#92400e"
              achtergrond="#fef3c7"
            />

            <StatKaart
              icoon="🔴"
              titel="Afgekeurde uren"
              waarde={`${afgekeurdeUren.toFixed(
                2
              )} uur`}
              kleur="#b91c1c"
              achtergrond="#fee2e2"
            />
          </div>

          {/* ==================================
              PER MEDEWERKER
          =================================== */}

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
            <h2
              style={{
                marginTop: 0,
                color: "#15803d",
              }}
            >
              👷 Uren per medewerker
            </h2>

            {rapportMedewerkers.length ===
            0 ? (
              <GeenData />
            ) : (
              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse:
                      "collapse",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background:
                          "#f0fdf4",
                      }}
                    >
                      <Th>
                        Medewerker
                      </Th>

                      <Th>
                        Registraties
                      </Th>

                      <Th>
                        Totaal uren
                      </Th>

                      <Th>
                        Goedgekeurd
                      </Th>

                      <Th>
                        Open
                      </Th>

                      <Th>
                        Afgekeurd
                      </Th>
                    </tr>
                  </thead>

                  <tbody>
                    {rapportMedewerkers.map(
                      (item) => (
                        <tr
                          key={
                            item.naam
                          }
                          style={{
                            borderBottom:
                              "1px solid #e2e8f0",
                          }}
                        >
                          <Td>
                            <strong>
                              {
                                item.naam
                              }
                            </strong>
                          </Td>

                          <Td>
                            {
                              item.registraties
                            }
                          </Td>

                          <Td>
                            <strong
                              style={{
                                color:
                                  "#15803d",
                              }}
                            >
                              {item.uren.toFixed(
                                2
                              )}{" "}
                              uur
                            </strong>
                          </Td>

                          <Td>
                            {item.goedgekeurd.toFixed(
                              2
                            )}{" "}
                            uur
                          </Td>

                          <Td>
                            {item.open.toFixed(
                              2
                            )}{" "}
                            uur
                          </Td>

                          <Td>
                            {item.afgekeurd.toFixed(
                              2
                            )}{" "}
                            uur
                          </Td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ==================================
              PER TERMINAL
          =================================== */}

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
            <h2
              style={{
                marginTop: 0,
                color: "#15803d",
              }}
            >
              🏭 Uren per terminal
            </h2>

            {rapportTerminals.length ===
            0 ? (
              <GeenData />
            ) : (
              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse:
                      "collapse",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background:
                          "#eff6ff",
                      }}
                    >
                      <Th>
                        Terminal
                      </Th>

                      <Th>
                        Registraties
                      </Th>

                      <Th>
                        Totaal uren
                      </Th>
                    </tr>
                  </thead>

                  <tbody>
                    {rapportTerminals.map(
                      (item) => (
                        <tr
                          key={
                            item.naam
                          }
                          style={{
                            borderBottom:
                              "1px solid #e2e8f0",
                          }}
                        >
                          <Td>
                            <strong>
                              🏭{" "}
                              {
                                item.naam
                              }
                            </strong>
                          </Td>

                          <Td>
                            {
                              item.registraties
                            }
                          </Td>

                          <Td>
                            <strong
                              style={{
                                color:
                                  "#15803d",
                              }}
                            >
                              {item.uren.toFixed(
                                2
                              )}{" "}
                              uur
                            </strong>
                          </Td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ==================================
              DETAIL
          =================================== */}

          <div
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              padding: "20px",
              boxShadow:
                "0 8px 20px rgba(0,0,0,.08)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: "#15803d",
              }}
            >
              📋 Detailregistraties
            </h2>

            {gefilterdeUren.length ===
            0 ? (
              <GeenData />
            ) : (
              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse:
                      "collapse",
                    minWidth:
                      "850px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background:
                          "#f8fafc",
                      }}
                    >
                      <Th>Datum</Th>
                      <Th>
                        Medewerker
                      </Th>
                      <Th>
                        Terminal
                      </Th>
                      <Th>
                        Begintijd
                      </Th>
                      <Th>
                        Eindtijd
                      </Th>
                      <Th>
                        Pauze
                      </Th>
                      <Th>
                        Uren
                      </Th>
                      <Th>
                        Status
                      </Th>
                    </tr>
                  </thead>

                  <tbody>
                    {gefilterdeUren.map(
                      (u) => (
                        <tr
                          key={u.id}
                          style={{
                            borderBottom:
                              "1px solid #e2e8f0",
                          }}
                        >
                          <Td>
                            {u.datum ||
                              "-"}
                          </Td>

                          <Td>
                            {u.medewerker ||
                              "-"}
                          </Td>

                          <Td>
                            {u.terminal ||
                              "-"}
                          </Td>

                          <Td>
                            {u.begintijd ||
                              "-"}
                          </Td>

                          <Td>
                            {u.eindtijd ||
                              "-"}
                          </Td>

                          <Td>
                            {u.pauze !=
                            null
                              ? `${u.pauze} min`
                              : "-"}
                          </Td>

                          <Td>
                            <strong
                              style={{
                                color:
                                  "#15803d",
                              }}
                            >
                              {Number(
                                u.uren ||
                                  0
                              ).toFixed(
                                2
                              )}{" "}
                              uur
                            </strong>
                          </Td>

                          <Td>
                            <Status
                              status={
                                u.status
                              }
                            />
                          </Td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ======================================
          PRINT CSS
      ======================================= */}

      <style>
        {`
          @media print {
            body {
              background: #ffffff !important;
            }

            .rapportage-print-hide,
            .rapportage-print-buttons {
              display: none !important;
            }

            .rapportage-print-header {
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
            }

            .rapportage-print-only {
              display: block !important;
            }

            table {
              page-break-inside: auto;
            }

            tr {
              page-break-inside: avoid;
            }

            @page {
              size: A4 landscape;
              margin: 10mm;
            }
          }
        `}
      </style>
    </div>
  );
}

// ==========================================
// STATISTIEK KAART
// ==========================================

function StatKaart({
  icoon,
  titel,
  waarde,
  kleur,
  achtergrond,
}) {
  return (
    <div
      style={{
        background:
          achtergrond,
        borderRadius: "14px",
        padding: "18px",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          color: kleur,
          fontWeight: "600",
        }}
      >
        {icoon} {titel}
      </div>

      <strong
        style={{
          display: "block",
          marginTop: "6px",
          fontSize: "25px",
          color: kleur,
        }}
      >
        {waarde}
      </strong>
    </div>
  );
}

// ==========================================
// TABEL HEADER
// ==========================================

function Th({ children }) {
  return (
    <th
      style={{
        padding: "11px 8px",
        textAlign: "left",
        color: "#334155",
        fontSize: "13px",
        borderBottom:
          "1px solid #dbe5e1",
      }}
    >
      {children}
    </th>
  );
}

// ==========================================
// TABEL CEL
// ==========================================

function Td({ children }) {
  return (
    <td
      style={{
        padding: "11px 8px",
        color: "#334155",
        fontSize: "13px",
      }}
    >
      {children}
    </td>
  );
}

// ==========================================
// STATUS BADGE
// ==========================================

function Status({ status }) {
  const waarde =
    (status || "Open")
      .toLowerCase()
      .trim();

  let achtergrond = "#fef3c7";
  let kleur = "#92400e";

  if (
    waarde === "goedgekeurd" ||
    waarde === "akkoord" ||
    waarde === "voltooid"
  ) {
    achtergrond = "#dcfce7";
    kleur = "#166534";
  }

  if (waarde === "afgekeurd") {
    achtergrond = "#fee2e2";
    kleur = "#b91c1c";
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "5px 9px",
        borderRadius: "999px",
        background: achtergrond,
        color: kleur,
        fontWeight: "700",
        fontSize: "11px",
        whiteSpace: "nowrap",
      }}
    >
      {status || "Open"}
    </span>
  );
}

// ==========================================
// GEEN DATA
// ==========================================

function GeenData() {
  return (
    <div
      style={{
        padding: "35px",
        textAlign: "center",
        color: "#64748b",
      }}
    >
      📊 Geen gegevens
      gevonden voor de
      geselecteerde filters.
    </div>
  );
}