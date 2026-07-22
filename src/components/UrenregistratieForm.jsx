import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function UrenregistratieForm({ onSaved }) {
  const [medewerkers, setMedewerkers] = useState([]);

  const [formulier, setFormulier] = useState({
    datum: new Date().toISOString().split("T")[0],
    medewerker: "",
    terminal: "",
    begintijd: "",
    eindtijd: "",
    pauze: 30,
    uren: 0,
    status: "Open",
  });

  useEffect(() => {
    laadMedewerkers();
  }, []);

  async function laadMedewerkers() {
    const { data } = await supabase
      .from("medewerkers")
      .select("naam")
      .order("naam");

    setMedewerkers(data || []);
  }

  function wijzig(e) {
    const { name, value } = e.target;

    const nieuw = {
      ...formulier,
      [name]: value,
    };

    if (
      nieuw.begintijd &&
      nieuw.eindtijd
    ) {
      const uren = berekenUren(
        nieuw.begintijd,
        nieuw.eindtijd,
        Number(nieuw.pauze)
      );

      nieuw.uren = uren;
    }

    setFormulier(nieuw);
  }

  function berekenUren(van, tot, pauze) {
    const start = new Date(`2000-01-01T${van}`);
    const einde = new Date(`2000-01-01T${tot}`);

    let minuten =
      (einde - start) / 1000 / 60;

    minuten -= pauze;

    if (minuten < 0) minuten = 0;

    return (minuten / 60).toFixed(2);
  }

  async function opslaan(e) {
    e.preventDefault();

    const { error } = await supabase
      .from("urenregistratie")
      .insert([formulier]);

    if (error) {
      alert(error.message);
      return;
    }

    setFormulier({
      datum: new Date().toISOString().split("T")[0],
      medewerker: "",
      terminal: "",
      begintijd: "",
      eindtijd: "",
      pauze: 30,
      uren: 0,
      status: "Open",
    });

    onSaved?.();
  }

  return (
    <div className="table">
      <h2>Nieuwe urenregistratie</h2>

      <form onSubmit={opslaan}>

        <label>Datum</label>

        <input
          type="date"
          name="datum"
          value={formulier.datum}
          onChange={wijzig}
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
              key={m.naam}
              value={m.naam}
            >
              {m.naam}
            </option>
          ))}
        </select>

        <label>Terminal</label>

        <input
          type="text"
          name="terminal"
          value={formulier.terminal}
          onChange={wijzig}
          placeholder="Terminal"
        />

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
          Opslaan
        </button>

      </form>
    </div>
  );
}