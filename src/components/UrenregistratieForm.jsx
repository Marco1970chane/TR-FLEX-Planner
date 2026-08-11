// src/components/UrenregistratieForm.jsx

import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function UrenregistratieForm({
  onSaved,
  registratie = null,
  onCancel,
}) {
  const [medewerkers, setMedewerkers] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [opslaanBezig, setOpslaanBezig] =
    useState(false);

  const vandaag = new Date()
    .toISOString()
    .split("T")[0];

  const leegFormulier = {
    datum: vandaag,
    medewerker: "",
    terminal: "",
    begintijd: "",
    eindtijd: "",
    pauze: 30,
    uren: 0,
    status: "Open",
  };

  const [formulier, setFormulier] =
    useState(leegFormulier);

  // ==========================================
  // MEDEWERKERS + TERMINALS
  // ==========================================

  useEffect(() => {
    laadMedewerkers();
    laadTerminals();
  }, []);

  // ==========================================
  // BESTAANDE REGISTRATIE INLADEN
  // ==========================================

  useEffect(() => {
    if (registratie?.id) {
      setFormulier({
        datum:
          registratie.datum ||
          vandaag,

        medewerker:
          registratie.medewerker ||
          "",

        terminal:
          registratie.terminal ||
          "",

        begintijd:
          registratie.begintijd ||
          "",

        eindtijd:
          registratie.eindtijd ||
          "",

        pauze:
          Number(
            registratie.pauze || 0
          ),

        uren:
          Number(
            registratie.uren || 0
          ),

        status:
          registratie.status ||
          "Open",
      });
    } else {
      setFormulier({
        ...leegFormulier,
        datum: vandaag,
      });
    }
  }, [registratie]);

  // ==========================================
  // MEDEWERKERS
  // ==========================================

  async function laadMedewerkers() {
    const { data, error } =
      await supabase
        .from("medewerkers")
        .select("id, naam")
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
    const { data, error } =
      await supabase
        .from("terminals")
        .select("id, naam")
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
  // UREN BEREKENEN
  // ==========================================

  function berekenUren(
    van,
    tot,
    pauze
  ) {
    if (!van || !tot) {
      return 0;
    }

    const [startUur, startMinuut] =
      van.split(":").map(Number);

    const [eindUur, eindMinuut] =
      tot.split(":").map(Number);

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

    let totaalMinuten =
      einde - start;

    totaalMinuten -=
      Number(pauze) || 0;

    if (totaalMinuten < 0) {
      totaalMinuten = 0;
    }

    return Number(
      (totaalMinuten / 60).toFixed(2)
    );
  }

  // ==========================================
  // DUUR ZONDER PAUZE
  // ==========================================

  function berekenDuurMinuten(
    van,
    tot
  ) {
    if (!van || !tot) {
      return 0;
    }

    const [startUur, startMinuut] =
      van.split(":").map(Number);

    const [eindUur, eindMinuut] =
      tot.split(":").map(Number);

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

  // ==========================================
  // FORMULIER WIJZIGEN
  // ==========================================

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
          name === "pauze"
        ) {
          nieuw.pauze =
            Math.max(
              0,
              Number(value) || 0
            );
        }

        nieuw.uren =
          berekenUren(
            nieuw.begintijd,
            nieuw.eindtijd,
            nieuw.pauze
          );

        return nieuw;
      }
    );
  }

  // ==========================================
  // OPSLAAN / BIJWERKEN
  // ==========================================

  async function opslaan(e) {
    e.preventDefault();

    if (
      !formulier.medewerker
    ) {
      alert(
        "Selecteer een medewerker."
      );
      return;
    }

    if (
      !formulier.terminal
    ) {
      alert(
        "Selecteer een terminal."
      );
      return;
    }

    if (
      !formulier.begintijd ||
      !formulier.eindtijd
    ) {
      alert(
        "Vul de begin- en eindtijd in."
      );
      return;
    }

    const duurMinuten =
      berekenDuurMinuten(
        formulier.begintijd,
        formulier.eindtijd
      );

    const pauzeMinuten =
      Number(
        formulier.pauze
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

    const berekendeUren =
      berekenUren(
        formulier.begintijd,
        formulier.eindtijd,
        formulier.pauze
      );

    if (berekendeUren <= 0) {
      alert(
        "Het aantal gewerkte uren moet groter zijn dan 0."
      );
      return;
    }

    setOpslaanBezig(true);

    try {
      const gegevens = {
        datum:
          formulier.datum,

        medewerker:
          formulier.medewerker,

        terminal:
          formulier.terminal,

        begintijd:
          formulier.begintijd,

        eindtijd:
          formulier.eindtijd,

        pauze:
          pauzeMinuten,

        uren:
          berekendeUren,

        // Bij bewerken bestaande status behouden.
        // Bij nieuwe registratie wordt het Open.
        status:
          registratie?.id
            ? formulier.status ||
              "Open"
            : "Open",
      };

      let error = null;

      // ======================================
      // BESTAANDE REGISTRATIE BIJWERKEN
      // ======================================

      if (registratie?.id) {
        const result =
          await supabase
            .from(
              "urenregistratie"
            )
            .update(gegevens)
            .eq(
              "id",
              registratie.id
            );

        error =
          result.error;
      }

      // ======================================
      // NIEUWE REGISTRATIE
      // ======================================

      else {
        const result =
          await supabase
            .from(
              "urenregistratie"
            )
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
        registratie?.id
          ? "✅ Urenregistratie bijgewerkt."
          : "✅ Urenregistratie opgeslagen."
      );

      onSaved?.();

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

  // ==========================================
  // BEREKENDE UREN
  // ==========================================

  const berekendeUren =
    berekenUren(
      formulier.begintijd,
      formulier.eindtijd,
      formulier.pauze
    );

  // ==========================================
  // WEERGAVE
  // ==========================================

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

      <form
        onSubmit={opslaan}
        style={{
          display: "flex",
          flexDirection:
            "column",
          gap: "10px",
        }}
      >
        {/* DATUM */}

        <label>
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
        />

        {/* MEDEWERKER */}

        <label>
          Medewerker
        </label>

        <select
          name="medewerker"
          value={
            formulier.medewerker
          }
          onChange={wijzig}
          required
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

        {/* TERMINAL */}

        <label>
          Terminal
        </label>

        <select
          name="terminal"
          value={
            formulier.terminal
          }
          onChange={wijzig}
          required
        >
          <option value="">
            Kies terminal...
          </option>

          {terminals.map(
            (t) => (
              <option
                key={t.id}
                value={t.naam}
              >
                {t.naam}
              </option>
            )
          )}
        </select>

        {/* BEGINTIJD */}

        <label>
          Begintijd
        </label>

        <input
          type="time"
          name="begintijd"
          value={
            formulier.begintijd
          }
          onChange={wijzig}
          required
        />

        {/* EINDTIJD */}

        <label>
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
        />

        {/* PAUZE */}

        <label>
          Pauze (minuten)
        </label>

        <input
          type="number"
          name="pauze"
          min="0"
          step="1"
          value={
            formulier.pauze
          }
          onChange={wijzig}
        />

        {/* BEREKENING */}

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
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            🧮 Automatisch
            berekende gewerkte
            uren
          </div>

          <strong
            style={{
              display: "block",
              marginTop: "5px",
              fontSize: "28px",
              color: "#15803d",
            }}
          >
            {Number(
              berekendeUren
            ).toFixed(2)}{" "}
            uur
          </strong>

          {formulier.begintijd &&
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
                {formulier.begintijd}
                {" → "}
                {
                  formulier.eindtijd
                }
                {" • "}
                {
                  formulier.pauze
                }{" "}
                minuten pauze
              </div>
            )}
        </div>

        {/* OPSLAAN */}

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
            : "💾 Opslaan"}
        </button>

        {/* ANNULEREN */}

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
    </div>
  );
}