import { useState } from "react";
import { supabase } from "../services/supabase";

export default function TerminalForm({ onSaved }) {
  const [naam, setNaam] = useState("");
  const [locatie, setLocatie] = useState("");
  const [status, setStatus] = useState("Actief");

  async function opslaan(e) {
    e.preventDefault();

    const { error } = await supabase
      .from("terminals")
      .insert([
        {
          naam,
          locatie,
          status,
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    alert("✅ Terminal opgeslagen!");

    // Formulier leegmaken
    setNaam("");
    setLocatie("");
    setStatus("Actief");

    // Pagina verversen en popup sluiten
    if (onSaved) {
      onSaved();
    }
  }

  return (
    <form onSubmit={opslaan}>
      <h2>🚢 Nieuwe terminal</h2>

      <label>Naam</label>
      <input
        type="text"
        value={naam}
        onChange={(e) => setNaam(e.target.value)}
        placeholder="Bijvoorbeeld Wilmar Truck Loading"
        required
      />

      <label>Locatie</label>
      <input
        type="text"
        value={locatie}
        onChange={(e) => setLocatie(e.target.value)}
        placeholder="Bijvoorbeeld Rotterdam"
        required
      />

      <label>Status</label>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="Actief">Actief</option>
        <option value="Inactief">Inactief</option>
      </select>

      <button className="new-btn" type="submit">
        💾 Opslaan
      </button>
    </form>
  );
}