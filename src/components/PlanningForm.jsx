import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function PlanningForm({ onSaved, planning }) {
  const [datum, setDatum] = useState("");
  const [dienst, setDienst] = useState("");
  const [terminal, setTerminal] = useState("");
  const [medewerker, setMedewerker] = useState("");

  const [medewerkers, setMedewerkers] = useState([]);
  const [terminals, setTerminals] = useState([]);

  useEffect(() => {
    laadMedewerkers();
    laadTerminals();
  }, []);

  useEffect(() => {
    if (planning) {
      setDatum(planning.datum);
      setDienst(planning.dienst);
      setTerminal(planning.terminal);
      setMedewerker(planning.medewerker);
    }
  }, [planning]);

  async function laadMedewerkers() {
    const { data, error } = await supabase
      .from("medewerkers")
      .select("*")
      .order("naam");

    if (!error) {
      setMedewerkers(data);
    }
  }

  async function laadTerminals() {
    const { data, error } = await supabase
      .from("terminals")
      .select("*")
      .order("naam");

    if (!error) {
      setTerminals(data);
    }
  }

  async function opslaan(e) {
    e.preventDefault();

    let error;

    if (planning) {
      const result = await supabase
        .from("planning")
        .update({
          datum,
          dienst,
          terminal,
          medewerker,
        })
        .eq("id", planning.id);

      error = result.error;
    } else {
      const result = await supabase
        .from("planning")
        .insert([
          {
            datum,
            dienst,
            terminal,
            medewerker,
            status: "Ingepland",
          },
        ]);

      error = result.error;
    }

    if (error) {
      alert(error.message);
      return;
    }

    alert(
      planning
        ? "✅ Dienst bijgewerkt!"
        : "✅ Dienst opgeslagen!"
    );

    setDatum("");
    setDienst("");
    setTerminal("");
    setMedewerker("");

    if (onSaved) {
      onSaved();
    }
  }

  return (
    <form onSubmit={opslaan}>
      <h2>
        {planning
          ? "✏️ Dienst bewerken"
          : "📅 Nieuwe dienst"}
      </h2>

      <label>Datum</label>

      <input
        type="date"
        value={datum}
        onChange={(e) => setDatum(e.target.value)}
        required
      />

      <label>Dienst</label>

      <select
        value={dienst}
        onChange={(e) => setDienst(e.target.value)}
        required
      >
        <option value="">Kies een dienst...</option>
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

      <label>Terminal</label>

      <select
        value={terminal}
        onChange={(e) => setTerminal(e.target.value)}
        required
      >
        <option value="">
          Kies terminal...
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

      <label>Medewerker</label>

      <select
        value={medewerker}
        onChange={(e) =>
          setMedewerker(e.target.value)
        }
        required
      >
        <option value="">
          Kies medewerker...
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

      <button
        className="new-btn"
        type="submit"
      >
        {planning
          ? "💾 Wijzigen"
          : "💾 Opslaan"}
      </button>
    </form>
  );
}