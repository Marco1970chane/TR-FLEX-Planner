// src/components/certificaten/InzetbaarheidTerminal.jsx

import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";

export default function InzetbaarheidTerminal() {
  const [terminals, setTerminals] = useState([]);
  const [medewerkers, setMedewerkers] = useState([]);
  const [vereisteCertificaten, setVereisteCertificaten] =
    useState([]);
  const [certificaten, setCertificaten] = useState([]);

  const [terminalId, setTerminalId] = useState("");
  const [laden, setLaden] = useState(false);

  useEffect(() => {
    laadBasisgegevens();
  }, []);

  async function laadBasisgegevens() {
    const [
      terminalsResult,
      medewerkersResult,
      certificatenResult,
    ] = await Promise.all([
      supabase
        .from("terminals")
        .select("*")
        .order("naam"),

      supabase
        .from("medewerkers")
        .select("id, naam")
        .order("naam"),

      supabase
        .from("certificaten")
        .select("*"),
    ]);

    if (terminalsResult.error) {
      console.error(
        "Fout terminals:",
        terminalsResult.error
      );
    }

    if (medewerkersResult.error) {
      console.error(
        "Fout medewerkers:",
        medewerkersResult.error
      );
    }

    if (certificatenResult.error) {
      console.error(
        "Fout certificaten:",
        certificatenResult.error
      );
    }

    setTerminals(
      terminalsResult.data || []
    );

    setMedewerkers(
      medewerkersResult.data || []
    );

    setCertificaten(
      certificatenResult.data || []
    );
  }

  useEffect(() => {
    if (!terminalId) {
      setVereisteCertificaten([]);
      return;
    }

    laadVereisteCertificaten();
  }, [terminalId]);

  async function laadVereisteCertificaten() {
    setLaden(true);

    const { data, error } = await supabase
      .from("terminal_certificaten")
      .select("*")
      .eq("terminal_id", terminalId)
      .eq("verplicht", true)
      .order("certificaat");

    if (error) {
      console.error(
        "Fout verplichte certificaten:",
        error
      );

      setVereisteCertificaten([]);
    } else {
      setVereisteCertificaten(
        data || []
      );
    }

    setLaden(false);
  }

  function bepaalStatus(
    medewerkerId
  ) {
    // Geen eisen ingesteld
    if (
      vereisteCertificaten.length === 0
    ) {
      return {
        status: "geen_eisen",
        reden:
          "Geen verplichte certificaten ingesteld.",
      };
    }

    const eigenCertificaten =
      certificaten.filter(
        (certificaat) =>
          String(
            certificaat.medewerker_id
          ) ===
          String(medewerkerId)
      );

    const ontbrekend = [];
    const verlopen = [];
    const bijnaVerlopen = [];

    const vandaag = new Date();

    vandaag.setHours(
      0,
      0,
      0,
      0
    );

    vereisteCertificaten.forEach(
      (verplicht) => {
        const verplichtNaam =
          (
            verplicht.certificaat ||
            ""
          )
            .trim()
            .toLowerCase();

        const gevonden =
          eigenCertificaten.find(
            (certificaat) =>
              (
                certificaat.certificaat ||
                ""
              )
                .trim()
                .toLowerCase() ===
              verplichtNaam
          );

        if (!gevonden) {
          ontbrekend.push(
            verplicht.certificaat
          );
          return;
        }

        if (!gevonden.geldig_tot) {
          verlopen.push(
            gevonden
          );
          return;
        }

        const geldigTot =
          new Date(
            `${gevonden.geldig_tot}T00:00:00`
          );

        const dagen =
          Math.ceil(
            (geldigTot - vandaag) /
              (1000 * 60 * 60 * 24)
          );

        if (dagen < 0) {
          verlopen.push(
            gevonden
          );
          return;
        }

        if (dagen <= 30) {
          bijnaVerlopen.push(
            gevonden
          );
        }
      }
    );

    if (ontbrekend.length > 0) {
      return {
        status: "niet_inzetbaar",
        reden:
          "Certificaat ontbreekt.",
        ontbrekend,
        verlopen,
        bijnaVerlopen,
      };
    }

    if (verlopen.length > 0) {
      return {
        status: "niet_inzetbaar",
        reden:
          "Certificaat verlopen.",
        ontbrekend,
        verlopen,
        bijnaVerlopen,
      };
    }

    if (
      bijnaVerlopen.length > 0
    ) {
      return {
        status: "bijna",
        reden:
          "Certificaat verloopt binnenkort.",
        ontbrekend,
        verlopen,
        bijnaVerlopen,
      };
    }

    return {
      status: "inzetbaar",
      reden:
        "Alle vereiste certificaten zijn geldig.",
      ontbrekend,
      verlopen,
      bijnaVerlopen,
    };
  }

  function statusWeergave(
    resultaat
  ) {
    if (
      resultaat.status ===
      "inzetbaar"
    ) {
      return {
        icoon: "🟢",
        tekst: "Inzetbaar",
        achtergrond:
          "#dcfce7",
        kleur: "#166534",
      };
    }

    if (
      resultaat.status ===
      "bijna"
    ) {
      return {
        icoon: "🟠",
        tekst: "Let op",
        achtergrond:
          "#fef3c7",
        kleur: "#92400e",
      };
    }

    if (
      resultaat.status ===
      "niet_inzetbaar"
    ) {
      return {
        icoon: "🔴",
        tekst:
          "Niet inzetbaar",
        achtergrond:
          "#fee2e2",
        kleur: "#b91c1c",
      };
    }

    return {
      icoon: "ℹ️",
      tekst:
        "Geen eisen",
      achtergrond:
        "#f1f5f9",
      kleur: "#475569",
    };
  }

  const gekozenTerminal =
    terminals.find(
      (terminal) =>
        String(terminal.id) ===
        String(terminalId)
    );

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "18px",
        padding: "25px",
        marginTop: "25px",
        marginBottom: "25px",
        boxShadow:
          "0 8px 24px rgba(0,0,0,.08)",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#15803d",
          }}
        >
          🏭 Inzetbaarheid per terminal
        </h2>

        <p
          style={{
            color: "#64748b",
            marginBottom: 0,
          }}
        >
          Controleer welke medewerkers
          inzetbaar zijn op een terminal
          op basis van hun certificaten.
        </p>
      </div>

      {/* TERMINAL SELECTIE */}

      <label
        style={{
          display: "block",
          marginBottom: "8px",
          fontWeight: "600",
        }}
      >
        Terminal
      </label>

      <select
        value={terminalId}
        onChange={(e) =>
          setTerminalId(
            e.target.value
          )
        }
        style={{
          width: "100%",
          maxWidth: "500px",
          boxSizing: "border-box",
          marginBottom: "20px",
        }}
      >
        <option value="">
          Kies een terminal...
        </option>

        {terminals.map(
          (terminal) => (
            <option
              key={terminal.id}
              value={terminal.id}
            >
              {terminal.naam}
            </option>
          )
        )}
      </select>

      {/* GEEN TERMINAL */}

      {!terminalId && (
        <div
          style={{
            padding: "20px",
            background:
              "#f8fafc",
            borderRadius: "12px",
            color: "#64748b",
          }}
        >
          ℹ️ Kies een terminal om de
          inzetbaarheid te bekijken.
        </div>
      )}

      {/* LADEN */}

      {terminalId && laden && (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          ⏳ Certificaten controleren...
        </div>
      )}

      {/* GEKOZEN TERMINAL */}

      {terminalId &&
        !laden && (
          <>
            <div
              style={{
                padding: "15px",
                marginBottom: "20px",
                background:
                  "#f0fdf4",
                border:
                  "1px solid #bbf7d0",
                borderRadius:
                  "12px",
              }}
            >
              <strong
                style={{
                  color:
                    "#166534",
                }}
              >
                🏭{" "}
                {gekozenTerminal?.naam}
              </strong>

              <div
                style={{
                  marginTop:
                    "5px",
                  color:
                    "#64748b",
                }}
              >
                {vereisteCertificaten.length ===
                0
                  ? "Geen verplichte certificaten ingesteld."
                  : `${vereisteCertificaten.length} verplichte certificaat${vereisteCertificaten.length === 1 ? "" : "en"}`}
              </div>
            </div>

            {/* GEEN EISEN */}

            {vereisteCertificaten.length ===
            0 ? (
              <div
                style={{
                  padding:
                    "20px",
                  background:
                    "#f1f5f9",
                  borderRadius:
                    "12px",
                  color:
                    "#475569",
                }}
              >
                ℹ️ Voor deze terminal
                zijn nog geen
                verplichte certificaten
                ingesteld.
              </div>
            ) : (
              <>
                {/* VEREISTE CERTIFICATEN */}

                <div
                  style={{
                    marginBottom:
                      "20px",
                  }}
                >
                  <strong>
                    🏅 Vereiste
                    certificaten
                  </strong>

                  <div
                    style={{
                      display:
                        "flex",
                      gap: "8px",
                      flexWrap:
                        "wrap",
                      marginTop:
                        "10px",
                    }}
                  >
                    {vereisteCertificaten.map(
                      (certificaat) => (
                        <span
                          key={
                            certificaat.id
                          }
                          style={{
                            padding:
                              "6px 10px",
                            borderRadius:
                              "999px",
                            background:
                              "#dcfce7",
                            color:
                              "#166534",
                            fontWeight:
                              "600",
                            fontSize:
                              "13px",
                          }}
                        >
                          🏅{" "}
                          {
                            certificaat.certificaat
                          }
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* MEDEWERKERS */}

                <div
                  style={{
                    display:
                      "flex",
                      flexDirection:
                        "column",
                      gap:
                        "10px",
                    }}
                >
                  {medewerkers.map(
                    (medewerker) => {
                      const resultaat =
                        bepaalStatus(
                          medewerker.id
                        );

                      const weergave =
                        statusWeergave(
                          resultaat
                        );

                      return (
                        <div
                          key={
                            medewerker.id
                          }
                          style={{
                            border:
                              "1px solid #e2e8f0",
                            borderRadius:
                              "12px",
                            padding:
                              "15px",
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "center",
                            gap:
                              "15px",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <div>
                            <strong
                              style={{
                                fontSize:
                                  "16px",
                                color:
                                  "#334155",
                              }}
                            >
                              👷{" "}
                              {
                                medewerker.naam
                              }
                            </strong>

                            {resultaat.ontbrekend
                              ?.length >
                              0 && (
                              <div
                                style={{
                                  marginTop:
                                    "6px",
                                  color:
                                    "#b91c1c",
                                  fontSize:
                                    "13px",
                                }}
                              >
                                Ontbreekt:{" "}
                                {resultaat.ontbrekend.join(
                                  ", "
                                )}
                              </div>
                            )}

                            {resultaat.verlopen
                              ?.length >
                              0 && (
                              <div
                                style={{
                                  marginTop:
                                    "6px",
                                  color:
                                    "#b91c1c",
                                  fontSize:
                                    "13px",
                                }}
                              >
                                Verlopen:
                                {" "}
                                {resultaat.verlopen
                                  .map(
                                    (
                                      cert
                                    ) =>
                                      cert.certificaat
                                  )
                                  .join(
                                    ", "
                                  )}
                              </div>
                            )}

                            {resultaat.bijnaVerlopen
                              ?.length >
                              0 && (
                              <div
                                style={{
                                  marginTop:
                                    "6px",
                                  color:
                                    "#92400e",
                                  fontSize:
                                    "13px",
                                }}
                              >
                                Bijna
                                verlopen:
                                {" "}
                                {resultaat.bijnaVerlopen
                                  .map(
                                    (
                                      cert
                                    ) =>
                                      cert.certificaat
                                  )
                                  .join(
                                    ", "
                                  )}
                              </div>
                            )}
                          </div>

                          <span
                            style={{
                              padding:
                                "8px 14px",
                              borderRadius:
                                "999px",
                              background:
                                weergave.achtergrond,
                              color:
                                weergave.kleur,
                              fontWeight:
                                "700",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {
                              weergave.icoon
                            }{" "}
                            {
                              weergave.tekst
                            }
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </>
            )}
          </>
        )}
    </div>
  );
}