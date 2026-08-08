import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function UrenregistratieForm({ onSaved }) {
  const [medewerkers, setMedewerkers] = useState([]);
  const [terminals, setTerminals] = useState([]);

  const leegFormulier = {
    datum: new Date().toISOString().split("T")[0],
    medewerker: "",
    terminal: "",
    begintijd: "",
    eindtijd: "",
    pauze: 30,
    uren: 0,
    status: "Open",
  };

  const [formulier, setFormulier] = useState(leegFormulier);

  useEffect(() => {
    laadMedewerkers();
    laadTerminals();
  }, []);

  async function laadMedewerkers() {
    const { data, error } = await supabase
      .from("medewerkers")
      .select("id, naam")
      .order("naam");

    if (!error) {
      setMedewerkers(data || []);
    }
  }

  async function laadTerminals() {
    const { data, error } = await supabase
      .from("terminals")
      .select("id, naam")
      .order("naam");

    if (!error) {
      setTerminals(data || []);
    }
  }

  function berekenUren(van, tot, pauze) {
    if (!van || !tot) return 0;

    const start = new Date(`2000-01-01T${van}`);
    let einde = new Date(`2000-01-01T${tot}`);

    // Nachtdienst
    if (einde < start) {
      einde.setDate(einde.getDate() + 1);
    }

    let minuten =
      (einde - start) / 1000 / 60;

    minuten -= Number(pauze);

    if (minuten < 0) minuten = 0;

    return (minuten / 60).toFixed(2);
  }

  function wijzig(e) {
    const { name, value } = e.target;

    const nieuw = {
      ...formulier,
      [name]: value,
    };

    if (name === "pauze") {
      nieuw.pauze = Number(value);
    }

    if (nieuw.begintijd && nieuw.eindtijd) {
      nieuw.uren = berekenUren(
        nieuw.begintijd,
        nieuw.eindtijd,
        nieuw.pauze
      );
    }

    setFormulier(nieuw);
  }

  async function opslaan(e) {
    e.preventDefault();

    const { error } = await supabase
      .from("urenregistratie")
      .insert([
        {
          ...formulier,
          begintijd: formulier.begintijd || null,
          eindtijd: formulier.eindtijd || null,
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    alert("✅ Urenregistratie opgeslagen.");

    setFormulier({
      ...leegFormulier,
      datum: new Date().toISOString().split("T")[0],
    });

    onSaved?.();
  }

  return (
    <div className="table">
      <h2>🕒 Nieuwe urenregistratie</h2>

      <form onSubmit={opslaan}>

        <label>Datum</label>

        <input
          type="date"
          name="datum"
          value={formulier.datum}
          onChange={wijzig}
          required
        />

        <label>Medewerker</label>

        <select
          name="medewerker"
          value={formulier.medewerker}
          onChange={wijzig}
          required
        >
          <option value="">
            Kies medewerker
          </option>

          {medewerkers.map((m) => (
            <option
              key={m.id}
              value={m.naam}
            >
              {m.naam}
            </option>
          ))}
        </select>

        <label>Terminal</label>

        <select
          name="terminal"
          value={formulier.terminal}
          onChange={wijzig}
          required
        >
          <option value="">
            Kies terminal
          </option>

          {terminals.map((t) => (
            <option
              key={t.id}
              value={t.naam}
            >
              {t.naam}
            </option>
          ))}
        </select>

        <label>Begintijd</label>

        <input
          type="time"
          name="begintijd"
          value={formulier.begintijd}
          onChange={wijzig}
          required
        />

        <label>Eindtijd</label>

        <input
          type="time"
          name="eindtijd"
          value={formulier.eindtijd}
          onChange={wijzig}
          required
        />

        <label>Pauze (minuten)</label>

        <input
          type="number"
          name="pauze"
          min="0"
          value={formulier.pauze}
          onChange={wijzig}
        />

        <label>Gewerkte uren</label>

        <input
          value={formulier.uren}
          readOnly
        />

        <button
          className="new-btn"
          type="submit"
        >
          💾 Opslaan
        </button>

      </form>
    </div>
  );
}