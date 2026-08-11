// src/components/PlanningForm.jsx

import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function PlanningForm({
  onSaved,
  planning,
  defaultDatum = "",
  defaultMedewerker = "",
}) {
  const [datum, setDatum] = useState("");
  const [dienst, setDienst] = useState("");

  const [terminal, setTerminal] = useState("");
  const [terminalId, setTerminalId] = useState(null);

  const [medewerker, setMedewerker] = useState("");
  const [medewerkerId, setMedewerkerId] =
    useState(null);

  const [starttijd, setStarttijd] = useState("");
  const [eindtijd, setEindtijd] = useState("");

  const [openDienst, setOpenDienst] =
    useState(false);

  const [medewerkers, setMedewerkers] =
    useState([]);

  const [terminals, setTerminals] =
    useState([]);

  // ==========================================
  // CERTIFICATEN
  // ==========================================

  const [
    vereisteCertificaten,
    setVereisteCertificaten,
  ] = useState([]);

  const [
    certificaatControle,
    setCertificaatControle,
  ] = useState(null);

  const [controleBezig, setControleBezig] =
    useState(false);

  const [opslaanBezig, setOpslaanBezig] =
    useState(false);

  // ==========================================
  // DATA LADEN
  // ==========================================

  useEffect(() => {
    laadMedewerkers();
    laadTerminals();
  }, []);

  // ==========================================
  // DEFAULT DATUM / MEDEWERKER
  // ==========================================

  useEffect(() => {
    if (!planning?.id) {
      setDatum(defaultDatum || "");

      if (defaultMedewerker) {
        const gevonden =
          medewerkers.find(
            (m) =>
              m.naam ===
              defaultMedewerker
          );

        setMedewerker(
          defaultMedewerker
        );

        setMedewerkerId(
          gevonden?.id ?? null
        );
      }
    }
  }, [
    defaultDatum,
    defaultMedewerker,
    planning,
    medewerkers,
  ]);

  // ==========================================
  // BESTAANDE PLANNING LADEN
  // ==========================================

  useEffect(() => {
    if (planning?.id) {
      setDatum(
        planning.datum || ""
      );

      setDienst(
        planning.dienst || ""
      );

      setTerminal(
        planning.terminal || ""
      );

      setTerminalId(
        planning.terminal_id || null
      );

      setMedewerker(
        planning.medewerker || ""
      );

      setMedewerkerId(
        planning.medewerker_id || null
      );

      setStarttijd(
        planning.starttijd || ""
      );

      setEindtijd(
        planning.eindtijd || ""
      );

      setOpenDienst(
        planning.status === "Open"
      );
    }
  }, [planning]);

  // ==========================================
  // TERMINAL GEKOZEN
  // ==========================================

  useEffect(() => {
    if (!terminalId) {
      setVereisteCertificaten([]);
      setCertificaatControle(null);
      return;
    }

    laadVereisteCertificaten(
      terminalId
    );
  }, [terminalId]);

  // ==========================================
  // MEDEWERKER + TERMINAL CONTROLEREN
  // ==========================================

  useEffect(() => {
    if (
      medewerkerId &&
      terminalId &&
      !openDienst
    ) {
      controleerCertificaten(
        medewerkerId,
        terminalId
      );
    } else {
      setCertificaatControle(null);
    }
  }, [
    medewerkerId,
    terminalId,
    openDienst,
  ]);

  // ==========================================
  // MEDEWERKERS
  // ==========================================

  async function laadMedewerkers() {
    const {
      data,
      error,
    } = await supabase
      .from("medewerkers")
      .select("*")
      .order("naam");

    if (error) {
      console.error(
        "Fout bij laden medewerkers:",
        error
      );
      return;
    }

    setMedewerkers(data || []);
  }

  // ==========================================
  // TERMINALS
  // ==========================================

  async function laadTerminals() {
    const {
      data,
      error,
    } = await supabase
      .from("terminals")
      .select("*")
      .order("naam");

    if (error) {
      console.error(
        "Fout bij laden terminals:",
        error
      );
      return;
    }

    setTerminals(data || []);
  }

  // ==========================================
  // VEREISTE CERTIFICATEN LADEN
  // ==========================================

  async function laadVereisteCertificaten(
    id
  ) {
    const {
      data,
      error,
    } = await supabase
      .from("terminal_certificaten")
      .select("*")
      .eq("terminal_id", id)
      .eq("verplicht", true)
      .order("certificaat");

    if (error) {
      console.error(
        "Fout bij laden vereiste certificaten:",
        error
      );

      setVereisteCertificaten([]);
      return;
    }

    setVereisteCertificaten(
      data || []
    );
  }

  // ==========================================
  // CERTIFICATEN CONTROLEREN
  // ==========================================

  async function controleerCertificaten(
    medewerkerId,
    gekozenTerminalId
  ) {
    setControleBezig(true);
    setCertificaatControle(null);

    try {
      // ----------------------------------------
      // VEREISTE CERTIFICATEN
      // ----------------------------------------

      const {
        data: vereistData,
        error: vereistError,
      } = await supabase
        .from("terminal_certificaten")
        .select("*")
        .eq(
          "terminal_id",
          gekozenTerminalId
        )
        .eq("verplicht", true)
        .order("certificaat");

      if (vereistError) {
        throw vereistError;
      }

      const vereist =
        vereistData || [];

      setVereisteCertificaten(
        vereist
      );

      // ----------------------------------------
      // GEEN EISEN
      // ----------------------------------------

      if (vereist.length === 0) {
        setCertificaatControle({
          status: "geen_eisen",
          ontbrekend: [],
          verlopen: [],
          bijnaVerlopen: [],
        });

        return;
      }

      // ----------------------------------------
      // CERTIFICATEN MEDEWERKER
      // ----------------------------------------

      const {
        data: medewerkerData,
        error: medewerkerError,
      } = await supabase
        .from("certificaten")
        .select("*")
        .eq(
          "medewerker_id",
          medewerkerId
        );

      if (medewerkerError) {
        throw medewerkerError;
      }

      const medewerkerCertificaten =
        medewerkerData || [];

      const vandaag =
        new Date();

      vandaag.setHours(
        0,
        0,
        0,
        0
      );

      const ontbrekend = [];
      const verlopen = [];
      const bijnaVerlopen = [];

      // ----------------------------------------
      // ELK CERTIFICAAT CONTROLEREN
      // ----------------------------------------

      vereist.forEach(
        (verplichtCertificaat) => {
          const naam =
            verplichtCertificaat.certificaat
              ?.trim()
              .toLowerCase();

          const gevonden =
            medewerkerCertificaten.find(
              (certificaat) => {
                const certificaatNaam =
                  certificaat.certificaat
                    ?.trim()
                    .toLowerCase();

                return (
                  certificaatNaam ===
                  naam
                );
              }
            );

          // Ontbreekt
          if (!gevonden) {
            ontbrekend.push(
              verplichtCertificaat
            );
            return;
          }

          // Geen geldigheidsdatum
          if (
            !gevonden.geldig_tot
          ) {
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
              (geldigTot -
                vandaag) /
                (1000 *
                  60 *
                  60 *
                  24)
            );

          // Verlopen
          if (dagen < 0) {
            verlopen.push(
              gevonden
            );
            return;
          }

          // Binnen 30 dagen
          if (dagen <= 30) {
            bijnaVerlopen.push(
              gevonden
            );
          }
        }
      );

      // ----------------------------------------
      // STATUS
      // ----------------------------------------

      let status = "geldig";

      if (
        ontbrekend.length > 0
      ) {
        status = "ontbrekend";
      } else if (
        verlopen.length > 0
      ) {
        status = "verlopen";
      } else if (
        bijnaVerlopen.length > 0
      ) {
        status = "bijna";
      }

      setCertificaatControle({
        status,
        ontbrekend,
        verlopen,
        bijnaVerlopen,
      });
    } catch (error) {
      console.error(
        "Fout bij certificaatcontrole:",
        error
      );

      setCertificaatControle({
        status: "fout",
        ontbrekend: [],
        verlopen: [],
        bijnaVerlopen: [],
      });
    } finally {
      setControleBezig(false);
    }
  }

  // ==========================================
  // OPSLAAN
  // ==========================================

  async function opslaan(e) {
    e.preventDefault();

    if (opslaanBezig) {
      return;
    }

    // ----------------------------------------
    // DATUM
    // ----------------------------------------

    if (!datum) {
      alert(
        "Selecteer een datum."
      );
      return;
    }

    // ----------------------------------------
    // TERMINAL
    // ----------------------------------------

    if (!terminalId) {
      alert(
        "Selecteer eerst een terminal."
      );
      return;
    }

    // ----------------------------------------
    // MEDEWERKER
    // ----------------------------------------

    if (!openDienst && !medewerkerId) {
      alert(
        "Selecteer eerst een medewerker."
      );
      return;
    }

    // ----------------------------------------
    // TIJDEN
    // ----------------------------------------

    if (
      !starttijd ||
      !eindtijd
    ) {
      alert(
        "Vul de starttijd en eindtijd in."
      );
      return;
    }

    // ----------------------------------------
    // CERTIFICATEN
    // ----------------------------------------

    if (!openDienst) {
      // Controle mag nog niet bezig zijn
      if (controleBezig) {
        alert(
          "⏳ Wacht totdat de certificatencontrole klaar is."
        );
        return;
      }

      // Controle moet uitgevoerd zijn
      if (
        certificaatControle ===
        null
      ) {
        alert(
          "⚠️ De certificaten zijn nog niet gecontroleerd."
        );
        return;
      }

      // Ontbrekend
      if (
        certificaatControle.status ===
        "ontbrekend"
      ) {
        alert(
          "❌ Deze medewerker heeft niet alle vereiste certificaten voor deze terminal."
        );
        return;
      }

      // Verlopen
      if (
        certificaatControle.status ===
        "verlopen"
      ) {
        alert(
          "❌ Deze medewerker heeft een verlopen vereist certificaat voor deze terminal."
        );
        return;
      }

      // Fout
      if (
        certificaatControle.status ===
        "fout"
      ) {
        alert(
          "⚠️ De certificaten konden niet worden gecontroleerd."
        );
        return;
      }
    }

    // ----------------------------------------
    // DIENSTTEKST
    // ----------------------------------------

    const dienstTekst =
      starttijd && eindtijd
        ? `${starttijd}-${eindtijd}`
        : dienst;

    if (!dienstTekst) {
      alert(
        "Vul een dienst in."
      );
      return;
    }

    // ----------------------------------------
    // GEGEVENS
    // ----------------------------------------

    const gegevens = {
      datum,

      dienst:
        dienstTekst,

      terminal,
      terminal_id:
        terminalId,

      medewerker:
        openDienst
          ? null
          : medewerker,

      medewerker_id:
        openDienst
          ? null
          : medewerkerId,

      starttijd:
        starttijd || null,

      eindtijd:
        eindtijd || null,

      status:
        openDienst
          ? "Open"
          : "Ingepland",
    };

    setOpslaanBezig(true);

    try {
      let error = null;

      // --------------------------------------
      // BEWERKEN
      // --------------------------------------

      if (planning?.id) {
        const result =
          await supabase
            .from("planning")
            .update(
              gegevens
            )
            .eq(
              "id",
              planning.id
            );

        error =
          result.error;
      }

      // --------------------------------------
      // NIEUW
      // --------------------------------------

      else {
        const result =
          await supabase
            .from("planning")
            .insert([
              gegevens,
            ]);

        error =
          result.error;
      }

      if (error) {
        throw error;
      }

      alert(
        planning?.id
          ? "✅ Dienst bijgewerkt!"
          : "✅ Dienst opgeslagen!"
      );

      resetForm();

      onSaved?.();
    } catch (error) {
      console.error(
        "Fout bij opslaan planning:",
        error
      );

      alert(
        error.message ||
          "Er is iets misgegaan bij het opslaan."
      );
    } finally {
      setOpslaanBezig(false);
    }
  }

  // ==========================================
  // RESET
  // ==========================================

  function resetForm() {
    setDatum("");
    setDienst("");

    setTerminal("");
    setTerminalId(null);

    setMedewerker("");
    setMedewerkerId(null);

    setStarttijd("");
    setEindtijd("");

    setOpenDienst(false);

    setVereisteCertificaten(
      []
    );

    setCertificaatControle(
      null
    );

    setControleBezig(false);
  }

  // ==========================================
  // TERMINAL SELECTEREN
  // ==========================================

  function terminalGekozen(e) {
    const waarde =
      e.target.value;

    const gekozen =
      terminals.find(
        (t) =>
          String(t.id) ===
          String(waarde)
      );

    setTerminal(
      gekozen?.naam || ""
    );

    setTerminalId(
      gekozen?.id ?? null
    );

    // Oude controle wissen
    setCertificaatControle(
      null
    );
  }

  // ==========================================
  // MEDEWERKER SELECTEREN
  // ==========================================

  function medewerkerGekozen(e) {
    const waarde =
      e.target.value;

    const gekozen =
      medewerkers.find(
        (m) =>
          String(m.id) ===
          String(waarde)
      );

    setMedewerker(
      gekozen?.naam || ""
    );

    setMedewerkerId(
      gekozen?.id ?? null
    );

    // Oude controle wissen
    setCertificaatControle(
      null
    );
  }

  // ==========================================
  // STATUS STIJL
  // ==========================================

  function statusStyle(status) {
    if (
      status ===
        "ontbrekend" ||
      status ===
        "verlopen"
    ) {
      return {
        background:
          "#fee2e2",
        color:
          "#b91c1c",
        border:
          "1px solid #fecaca",
      };
    }

    if (
      status === "bijna"
    ) {
      return {
        background:
          "#fef3c7",
        color:
          "#92400e",
        border:
          "1px solid #fde68a",
      };
    }

    if (
      status === "geldig"
    ) {
      return {
        background:
          "#dcfce7",
        color:
          "#166534",
        border:
          "1px solid #bbf7d0",
      };
    }

    return {
      background:
        "#f1f5f9",
      color:
        "#475569",
      border:
        "1px solid #e2e8f0",
    };
  }

  // ==========================================
  // OPSLAAN GEBLOKKEERD
  // ==========================================

  const opslaanGeblokkeerd =
    opslaanBezig ||
    controleBezig ||
    (
      !openDienst &&
      (
        certificaatControle?.status ===
          "ontbrekend" ||
        certificaatControle?.status ===
          "verlopen" ||
        certificaatControle?.status ===
          "fout"
      )
    );

  // ==========================================
  // WEERGAVE
  // ==========================================

  return (
    <form
      onSubmit={opslaan}
      style={{
        display: "flex",
        flexDirection:
          "column",
        gap: "10px",
        width: "100%",
        maxWidth: "100%",
        maxHeight:
          "calc(100vh - 100px)",
        overflowY: "auto",
        overflowX: "hidden",
        boxSizing:
          "border-box",
        paddingRight: "8px",
        paddingBottom: "10px",
        wordBreak:
          "break-word",
      }}
    >
      {/* TITEL */}

      <h2
        style={{
          color: "#15803d",
          marginTop: 0,
          marginBottom: "5px",
        }}
      >
        {planning?.id
          ? "✏️ Dienst bewerken"
          : "📅 Nieuwe dienst"}
      </h2>

      {/* DATUM */}

      <label>Datum</label>

      <input
        type="date"
        value={datum}
        onChange={(e) =>
          setDatum(
            e.target.value
          )
        }
        required
        style={{
          width: "100%",
          boxSizing:
            "border-box",
        }}
      />

      {/* DIENST */}

      <label>Dienst</label>

      <select
        value={dienst}
        onChange={(e) => {
          const waarde =
            e.target.value;

          setDienst(
            waarde
          );

          if (
            waarde.includes("-")
          ) {
            const [
              start,
              eind,
            ] =
              waarde.split(
                "-"
              );

            setStarttijd(
              start
            );

            setEindtijd(
              eind
            );
          }
        }}
        style={{
          width: "100%",
          boxSizing:
            "border-box",
        }}
      >
        <option value="">
          Kies een standaarddienst...
        </option>

        <option value="06:00-14:00">
          06:00-14:00
        </option>

        <option value="07:00-15:00">
          07:00-15:00
        </option>

        <option value="10:00-18:00">
          10:00-18:00
        </option>

        <option value="14:00-22:00">
          14:00-22:00
        </option>

        <option value="22:00-06:00">
          22:00-06:00
        </option>
      </select>

      {/* STARTTIJD */}

      <label>
        Starttijd
      </label>

      <input
        type="time"
        value={starttijd}
        onChange={(e) =>
          setStarttijd(
            e.target.value
          )
        }
        required
        style={{
          width: "100%",
          boxSizing:
            "border-box",
        }}
      />

      {/* EINDTIJD */}

      <label>
        Eindtijd
      </label>

      <input
        type="time"
        value={eindtijd}
        onChange={(e) =>
          setEindtijd(
            e.target.value
          )
        }
        required
        style={{
          width: "100%",
          boxSizing:
            "border-box",
        }}
      />

      {/* TERMINAL */}

      <label>
        Terminal
      </label>

      <select
        value={
          terminalId || ""
        }
        onChange={
          terminalGekozen
        }
        required
        style={{
          width: "100%",
          boxSizing:
            "border-box",
        }}
      >
        <option value="">
          Kies terminal...
        </option>

        {terminals.map(
          (t) => (
            <option
              key={t.id}
              value={t.id}
            >
              {t.naam}
            </option>
          )
        )}
      </select>

      {/* VEREISTE CERTIFICATEN */}

      {terminalId &&
        vereisteCertificaten.length >
          0 && (
          <div
            style={{
              marginTop: "5px",
              padding: "12px",
              background:
                "#f0fdf4",
              border:
                "1px solid #bbf7d0",
              borderRadius:
                "10px",
            }}
          >
            <strong
              style={{
                color:
                  "#166534",
              }}
            >
              🏅 Vereiste
              certificaten
            </strong>

            <div
              style={{
                marginTop:
                  "8px",
              }}
            >
              {vereisteCertificaten.map(
                (cert) => (
                  <div
                    key={
                      cert.id
                    }
                    style={{
                      color:
                        "#166534",
                      marginBottom:
                        "4px",
                    }}
                  >
                    •{" "}
                    {
                      cert.certificaat
                    }
                  </div>
                )
              )}
            </div>
          </div>
        )}

      {/* GEEN CERTIFICATEN */}

      {terminalId &&
        !controleBezig &&
        vereisteCertificaten.length ===
          0 && (
          <div
            style={{
              padding: "12px",
              background:
                "#f1f5f9",
              color:
                "#475569",
              border:
                "1px solid #e2e8f0",
              borderRadius:
                "10px",
            }}
          >
            ℹ️ Voor deze terminal
            zijn nog geen
            verplichte
            certificaten
            ingesteld.
          </div>
        )}

      {/* OPEN DIENST */}

      <label
        style={{
          display: "flex",
          alignItems:
            "center",
          gap: "10px",
          margin:
            "10px 0",
          cursor:
            "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={
            openDienst
          }
          onChange={(e) => {
            const actief =
              e.target
                .checked;

            setOpenDienst(
              actief
            );

            if (actief) {
              setMedewerker(
                ""
              );

              setMedewerkerId(
                null
              );

              setCertificaatControle(
                null
              );
            }
          }}
        />

        <span>
          📢 Open dienst
          <br />

          <small
            style={{
              color:
                "#64748b",
            }}
          >
            nog geen
            medewerker
          </small>
        </span>
      </label>

      {/* MEDEWERKER */}

      <label>
        Medewerker
      </label>

      <select
        value={
          medewerkerId || ""
        }
        disabled={
          openDienst
        }
        required={
          !openDienst
        }
        onChange={
          medewerkerGekozen
        }
        style={{
          width: "100%",
          boxSizing:
            "border-box",
        }}
      >
        <option value="">
          {openDienst
            ? "Open dienst"
            : "Kies medewerker..."}
        </option>

        {medewerkers.map(
          (m) => (
            <option
              key={m.id}
              value={m.id}
            >
              {m.naam}
            </option>
          )
        )}
      </select>

      {/* CONTROLE BEZIG */}

      {controleBezig && (
        <div
          style={{
            padding:
              "12px",
            borderRadius:
              "10px",
            background:
              "#f1f5f9",
            color:
              "#475569",
            fontWeight:
              "600",
          }}
        >
          ⏳ Certificaten
          controleren...
        </div>
      )}

      {/* GELDIG */}

      {!controleBezig &&
        certificaatControle?.status ===
          "geldig" && (
          <div
            style={{
              padding:
                "12px",
              borderRadius:
                "10px",
              ...statusStyle(
                "geldig"
              ),
              fontWeight:
                "700",
            }}
          >
            🟢 Alle vereiste
            certificaten
            zijn geldig.
          </div>
        )}

      {/* GEEN EISEN */}

      {!controleBezig &&
        certificaatControle?.status ===
          "geen_eisen" && (
          <div
            style={{
              padding:
                "12px",
              borderRadius:
                "10px",
              ...statusStyle(
                "geen_eisen"
              ),
            }}
          >
            ℹ️ Voor deze terminal
            zijn geen
            verplichte
            certificaten
            ingesteld.
          </div>
        )}

      {/* BIJNA VERLOPEN */}

      {!controleBezig &&
        certificaatControle?.status ===
          "bijna" && (
          <div
            style={{
              padding:
                "12px",
              borderRadius:
                "10px",
              ...statusStyle(
                "bijna"
              ),
            }}
          >
            <strong>
              🟠 Let op:
              certificaat
              verloopt
              binnenkort.
            </strong>

            {certificaatControle.bijnaVerlopen.map(
              (cert) => (
                <div
                  key={
                    cert.id
                  }
                  style={{
                    marginTop:
                      "5px",
                  }}
                >
                  •{" "}
                  {
                    cert.certificaat
                  }
                  {" — geldig tot "}
                  {
                    cert.geldig_tot
                  }
                </div>
              )
            )}
          </div>
        )}

      {/* VERLOPEN */}

      {!controleBezig &&
        certificaatControle?.status ===
          "verlopen" && (
          <div
            style={{
              padding:
                "12px",
              borderRadius:
                "10px",
              ...statusStyle(
                "verlopen"
              ),
            }}
          >
            <strong>
              🔴 Verlopen
              certificaat
            </strong>

            {certificaatControle.verlopen.map(
              (cert) => (
                <div
                  key={
                    cert.id
                  }
                  style={{
                    marginTop:
                      "5px",
                  }}
                >
                  •{" "}
                  {
                    cert.certificaat
                  }
                  {" — verlopen op "}
                  {
                    cert.geldig_tot
                  }
                </div>
              )
            )}
          </div>
        )}

      {/* ONTBREKEND */}

      {!controleBezig &&
        certificaatControle?.status ===
          "ontbrekend" && (
          <div
            style={{
              padding:
                "12px",
              borderRadius:
                "10px",
              ...statusStyle(
                "ontbrekend"
              ),
            }}
          >
            <strong>
              ❌ Vereist
              certificaat
              ontbreekt
            </strong>

            {certificaatControle.ontbrekend.map(
              (cert) => (
                <div
                  key={
                    cert.id
                  }
                  style={{
                    marginTop:
                      "5px",
                  }}
                >
                  •{" "}
                  {
                    cert.certificaat
                  }
                </div>
              )
            )}

            <div
              style={{
                marginTop:
                  "8px",
                fontWeight:
                  "600",
              }}
            >
              Deze medewerker
              kan niet voor
              deze terminal
              worden ingepland.
            </div>
          </div>
        )}

      {/* FOUT */}

      {!controleBezig &&
        certificaatControle?.status ===
          "fout" && (
          <div
            style={{
              padding:
                "12px",
              borderRadius:
                "10px",
              background:
                "#fee2e2",
              color:
                "#b91c1c",
              border:
                "1px solid #fecaca",
            }}
          >
            ⚠️ De certificaten
            konden niet
            worden
            gecontroleerd.
          </div>
        )}

      {/* OPSLAAN */}

      <button
        className="new-btn"
        type="submit"
        disabled={
          opslaanGeblokkeerd
        }
        style={{
          width: "100%",
          boxSizing:
            "border-box",
          background:
            opslaanGeblokkeerd
              ? "#94a3b8"
              : "#16a34a",
          color:
            "#ffffff",
          cursor:
            opslaanGeblokkeerd
              ? "not-allowed"
              : "pointer",
          opacity:
            opslaanGeblokkeerd
              ? 0.7
              : 1,
          flexShrink: 0,
        }}
      >
        {opslaanBezig
          ? "⏳ Opslaan..."
          : planning?.id
          ? "💾 Wijzigen"
          : "💾 Opslaan"}
      </button>
    </form>
  );
}