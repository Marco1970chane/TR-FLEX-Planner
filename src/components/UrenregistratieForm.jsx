// src/components/UrenregistratieForm.jsx

import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function UrenregistratieForm({
  onSaved,
  registratie = null,
  onCancel,
}) {
  const [medewerkers, setMedewerkers] = useState([]);
  const [planningen, setPlanningen] = useState([]);

  const [opslaanBezig, setOpslaanBezig] =
    useState(false);

  const [laden, setLaden] =
    useState(true);

  const vandaag = new Date()
    .toISOString()
    .split("T")[0];

  const leegFormulier = {
    planning_id: "",
    datum: vandaag,
    medewerker: "",
    starttijd: "",
    eindtijd: "",
    pauze_minuten: 30,
    gewerkte_uren: 0,
    opmerking: "",
    status: "Ingediend",
  };

  const [formulier, setFormulier] =
    useState(leegFormulier);

  // ============================================================
  // INIT
  // ============================================================

  useEffect(() => {
    laadGegevens();
  }, []);

  // ============================================================
  // BESTAANDE REGISTRATIE LADEN
  // ============================================================

  useEffect(() => {
    if (registratie?.id) {
      setFormulier({
        planning_id:
          registratie.planning_id || "",

        datum:
          registratie.datum ||
          vandaag,

        medewerker:
          registratie.medewerker ||
          "",

        starttijd:
          formatTijd(
            registratie.starttijd
          ),

        eindtijd:
          formatTijd(
            registratie.eindtijd
          ),

        pauze_minuten:
          Number(
            registratie.pauze_minuten || 0
          ),

        gewerkte_uren:
          Number(
            registratie.gewerkte_uren || 0
          ),

        opmerking:
          registratie.opmerking ||
          "",

        status:
          registratie.status ||
          "Ingediend",
      });
    } else {
      setFormulier({
        ...leegFormulier,
        datum: vandaag,
      });
    }
  }, [registratie]);

  // ============================================================
  // GEGEVENS LADEN
  // ============================================================

  async function laadGegevens() {
    setLaden(true);

    try {
      const [
        medewerkersResult,
        planningResult,
      ] = await Promise.all([
        supabase
          .from("medewerkers")
          .select("id, naam")
          .order("naam"),

        supabase
          .from("planning")
          .select("*")
          .order("datum", {
            ascending: false,
          }),
      ]);

      if (medewerkersResult.error) {
        console.error(
          "Fout medewerkers:",
          medewerkersResult.error
        );
      } else {
        setMedewerkers(
          medewerkersResult.data || []
        );
      }

      if (planningResult.error) {
        console.error(
          "Fout planning:",
          planningResult.error
        );
      } else {
        setPlanningen(
          planningResult.data || []
        );
      }
    } catch (error) {
      console.error(
        "Fout bij laden gegevens:",
        error
      );
    } finally {
      setLaden(false);
    }
  }

  // ============================================================
  // UREN BEREKENEN
  // ============================================================

  function berekenUren(
    van,
    tot,
    pauze
  ) {
    if (!van || !tot) {
      return 0;
    }

    const [
      startUur,
      startMinuut,
    ] = van
      .split(":")
      .map(Number);

    const [
      eindUur,
      eindMinuut,
    ] = tot
      .split(":")
      .map(Number);

    let start =
      startUur * 60 +
      startMinuut;

    let einde =
      eindUur * 60 +
      eindMinuut;

    // Nachtdienst
    if (einde <= start) {
      einde += 24 * 60;
    }

    const pauzeMinuten =
      Number(pauze) || 0;

    const totaalMinuten =
      einde -
      start -
      pauzeMinuten;

    if (totaalMinuten <= 0) {
      return 0;
    }

    return Number(
      (
        totaalMinuten / 60
      ).toFixed(2)
    );
  }

  // ============================================================
  // TOTALE DUUR
  // ============================================================

  function berekenDuurMinuten(
    van,
    tot
  ) {
    if (!van || !tot) {
      return 0;
    }

    const [
      startUur,
      startMinuut,
    ] = van
      .split(":")
      .map(Number);

    const [
      eindUur,
      eindMinuut,
    ] = tot
      .split(":")
      .map(Number);

    let start =
      startUur * 60 +
      startMinuut;

    let einde =
      eindUur * 60 +
      eindMinuut;

    if (einde <= start) {
      einde += 24 * 60;
    }

    return einde - start;
  }

  // ============================================================
  // FORMULIER WIJZIGEN
  // ============================================================

  function wijzig(e) {
    const {
      name,
      value,
    } = e.target;

    setFormulier(
      (vorig) => {
        const nieuw = {
          ...vorig,
          [name]: value,
        };

        if (
          name === "pauze_minuten"
        ) {
          nieuw.pauze_minuten =
            Math.max(
              0,
              Number(value) || 0
            );
        }

        if (
          name === "planning_id"
        ) {
          const gekozenPlanning =
            planningen.find(
              (p) =>
                String(p.id) ===
                String(value)
            );

          if (gekozenPlanning) {
            nieuw.datum =
              gekozenPlanning.datum ||
              nieuw.datum;

            if (
              gekozenPlanning.medewerker
            ) {
              nieuw.medewerker =
                gekozenPlanning.medewerker;
            }
          }
        }

        nieuw.gewerkte_uren =
          berekenUren(
            nieuw.starttijd,
            nieuw.eindtijd,
            nieuw.pauze_minuten
          );

        return nieuw;
      }
    );
  }

  // ============================================================
  // OPSLAAN
  // ============================================================

  async function opslaan(e) {
    e.preventDefault();

    if (!formulier.planning_id) {
      alert(
        "Selecteer eerst een planning/dienst."
      );
      return;
    }

    if (!formulier.medewerker) {
      alert(
        "Selecteer een medewerker."
      );
      return;
    }

    if (
      !formulier.starttijd ||
      !formulier.eindtijd
    ) {
      alert(
        "Vul de starttijd en eindtijd in."
      );
      return;
    }

    const duurMinuten =
      berekenDuurMinuten(
        formulier.starttijd,
        formulier.eindtijd
      );

    const pauzeMinuten =
      Number(
        formulier.pauze_minuten
      ) || 0;

    if (duurMinuten <= 0) {
      alert(
        "De werktijd kan niet 0 uur zijn."
      );
      return;
    }

    if (
      pauzeMinuten >=
      duurMinuten
    ) {
      alert(
        "De pauze moet korter zijn dan de totale werktijd."
      );
      return;
    }

    const gewerkteUren =
      berekenUren(
        formulier.starttijd,
        formulier.eindtijd,
        pauzeMinuten
      );

    if (gewerkteUren <= 0) {
      alert(
        "Het aantal gewerkte uren moet groter zijn dan 0."
      );
      return;
    }

    setOpslaanBezig(true);

    try {
      const gegevens = {
        planning_id:
          formulier.planning_id,

        datum:
          formulier.datum,

        medewerker:
          formulier.medewerker,

        starttijd:
          formulier.starttijd,

        eindtijd:
          formulier.eindtijd,

        pauze_minuten:
          pauzeMinuten,

        gewerkte_uren:
          gewerkteUren,

        opmerking:
          formulier.opmerking.trim() ||
          null,

        status:
          registratie?.id
            ? formulier.status ||
              "Ingediend"
            : "Ingediend",

        ingediend_op:
          new Date().toISOString(),
      };

      // ========================================================
      // BESTAANDE REGISTRATIE
      // ========================================================

      if (registratie?.id) {
        const {
          error,
        } = await supabase
          .from(
            "urenregistratie"
          )
          .update(gegevens)
          .eq(
            "id",
            registratie.id
          );

        if (error) {
          throw error;
        }

        alert(
          "✅ Urenregistratie bijgewerkt."
        );
      }

      // ========================================================
      // NIEUWE REGISTRATIE
      // ========================================================

      else {
        const {
          error,
        } = await supabase
          .from(
            "urenregistratie"
          )
          .insert(gegevens);

        if (error) {
          throw error;
        }

        alert(
          "✅ Urenregistratie opgeslagen."
        );
      }

      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      console.error(
        "Fout bij opslaan:",
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

  // ============================================================
  // GEKOZEN PLANNING
  // ============================================================

  const gekozenPlanning =
    planningen.find(
      (p) =>
        String(p.id) ===
        String(
          formulier.planning_id
        )
    );

  // ============================================================
  // BEREKENDE UREN
  // ============================================================

  const berekendeUren =
    berekenUren(
      formulier.starttijd,
      formulier.eindtijd,
      formulier.pauze_minuten
    );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div>
      <h2
        style={{
          marginTop: 0,
          color: "#15803d",
        }}
      >
        {registratie?.id
          ? "✏️ Urenregistratie bewerken"
          : "🕒 Nieuwe urenregistratie"}
      </h2>

      {laden ? (
        <div
          style={{
            padding: "30px",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          ⏳ Gegevens laden...
        </div>
      ) : (
        <form
          onSubmit={opslaan}
          style={{
            display: "flex",
            flexDirection:
              "column",
            gap: "10px",
          }}
        >
          {/* ==================================================
              PLANNING
          =================================================== */}

          <label
            style={labelStyle}
          >
            Planning / dienst
          </label>

          <select
            name="planning_id"
            value={
              formulier.planning_id
            }
            onChange={wijzig}
            required
            style={inputStyle}
          >
            <option value="">
              Kies planning...
            </option>

            {planningen.map(
              (p) => (
                <option
                  key={p.id}
                  value={p.id}
                >
                  {p.datum || "-"} —{" "}
                  {p.dienst || "-"} —{" "}
                  {p.terminal || "-"}{" "}
                  {p.medewerker
                    ? `— ${p.medewerker}`
                    : ""}
                </option>
              )
            )}
          </select>

          {/* ==================================================
              PLANNING INFO
          =================================================== */}

          {gekozenPlanning && (
            <div
              style={{
                background:
                  "#eff6ff",
                border:
                  "1px solid #bfdbfe",
                borderRadius:
                  "12px",
                padding:
                  "15px",
                marginBottom:
                  "8px",
              }}
            >
              <div
                style={{
                  fontSize:
                    "13px",
                  color:
                    "#64748b",
                  marginBottom:
                    "5px",
                }}
              >
                Geselecteerde dienst
              </div>

              <strong
                style={{
                  color:
                    "#1e40af",
                  fontSize:
                    "16px",
                }}
              >
                {gekozenPlanning.datum ||
                  "-"}
              </strong>

              <div
                style={{
                  marginTop:
                    "5px",
                  color:
                    "#334155",
                }}
              >
                🕒{" "}
                {gekozenPlanning.dienst ||
                  "-"}
              </div>

              <div
                style={{
                  marginTop:
                    "3px",
                  color:
                    "#334155",
                }}
              >
                📍{" "}
                {gekozenPlanning.terminal ||
                  "-"}
              </div>
            </div>
          )}

          {/* ==================================================
              DATUM
          =================================================== */}

          <label
            style={labelStyle}
          >
            Datum
          </label>

          <input
            type="date"
            name="datum"
            value={
              formulier.datum
            }
            onChange={wijzig}
            required
            style={inputStyle}
          />

          {/* ==================================================
              MEDEWERKER
          =================================================== */}

          <label
            style={labelStyle}
          >
            Medewerker
          </label>

          <select
            name="medewerker"
            value={
              formulier.medewerker
            }
            onChange={wijzig}
            required
            style={inputStyle}
          >
            <option value="">
              Kies medewerker...
            </option>

            {medewerkers.map(
              (m) => (
                <option
                  key={m.id}
                  value={m.naam}
                >
                  {m.naam}
                </option>
              )
            )}
          </select>

          {/* ==================================================
              START / EINDE
          =================================================== */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "12px",
            }}
          >
            <div>
              <label
                style={labelStyle}
              >
                Starttijd
              </label>

              <input
                type="time"
                name="starttijd"
                value={
                  formulier.starttijd
                }
                onChange={wijzig}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label
                style={labelStyle}
              >
                Eindtijd
              </label>

              <input
                type="time"
                name="eindtijd"
                value={
                  formulier.eindtijd
                }
                onChange={wijzig}
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* ==================================================
              PAUZE
          =================================================== */}

          <label
            style={labelStyle}
          >
            Pauze (minuten)
          </label>

          <input
            type="number"
            name="pauze_minuten"
            min="0"
            step="5"
            value={
              formulier.pauze_minuten
            }
            onChange={wijzig}
            style={inputStyle}
          />

          {/* ==================================================
              BEREKENING
          =================================================== */}

          <div
            style={{
              marginTop: "8px",
              padding: "18px",
              borderRadius: "12px",
              background:
                "#f0fdf4",
              border:
                "1px solid #bbf7d0",
            }}
          >
            <div
              style={{
                color:
                  "#64748b",
                fontSize:
                  "14px",
              }}
            >
              🧮 Automatisch
              berekende gewerkte
              uren
            </div>

            <strong
              style={{
                display: "block",
                marginTop:
                  "5px",
                fontSize:
                  "28px",
                color:
                  "#15803d",
              }}
            >
              {Number(
                berekendeUren
              ).toFixed(2)}{" "}
              uur
            </strong>

            {formulier.starttijd &&
              formulier.eindtijd && (
                <div
                  style={{
                    marginTop:
                      "6px",
                    color:
                      "#64748b",
                    fontSize:
                      "13px",
                  }}
                >
                  {
                    formulier.starttijd
                  }
                  {" → "}
                  {
                    formulier.eindtijd
                  }
                  {" • "}
                  {
                    formulier.pauze_minuten
                  }{" "}
                  minuten pauze
                </div>
              )}
          </div>

          {/* ==================================================
              OPMERKING
          =================================================== */}

          <label
            style={labelStyle}
          >
            Opmerking
          </label>

          <textarea
            name="opmerking"
            value={
              formulier.opmerking
            }
            onChange={wijzig}
            rows="3"
            placeholder="Eventuele bijzonderheden..."
            style={{
              ...inputStyle,
              resize: "vertical",
              fontFamily:
                "Arial, Helvetica, sans-serif",
            }}
          />

          {/* ==================================================
              STATUS BIJ BEWERKEN
          =================================================== */}

          {registratie?.id && (
            <>
              <label
                style={labelStyle}
              >
                Status
              </label>

              <select
                name="status"
                value={
                  formulier.status
                }
                onChange={wijzig}
                style={inputStyle}
              >
                <option value="Ingediend">
                  🟠 Ingediend
                </option>

                <option value="Goedgekeurd">
                  🟢 Goedgekeurd
                </option>

                <option value="Afgekeurd">
                  🔴 Afgekeurd
                </option>
              </select>
            </>
          )}

          {/* ==================================================
              OPSLAAN
          =================================================== */}

          <button
            className="new-btn"
            type="submit"
            disabled={
              opslaanBezig
            }
            style={{
              marginTop: "10px",
              background:
                "#2563eb",
              width: "100%",
            }}
          >
            {opslaanBezig
              ? "⏳ Opslaan..."
              : registratie?.id
              ? "💾 Wijzigingen opslaan"
              : "💾 Uren indienen"}
          </button>

          {/* ==================================================
              ANNULEREN
          =================================================== */}

          {onCancel && (
            <button
              type="button"
              className="new-btn"
              onClick={onCancel}
              disabled={
                opslaanBezig
              }
              style={{
                background:
                  "#64748b",
                width: "100%",
              }}
            >
              Annuleren
            </button>
          )}
        </form>
      )}
    </div>
  );
}

// ============================================================
// HULPFUNCTIES
// ============================================================

function formatTijd(tijd) {
  if (!tijd) {
    return "";
  }

  return String(tijd).substring(
    0,
    5
  );
}

const labelStyle = {
  fontWeight: "600",
  color: "#374151",
  fontSize: "14px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px",
  border:
    "1px solid #cbd5e1",
  borderRadius: "8px",
  fontSize: "15px",
  background: "#ffffff",
};