import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const statussen = [
  "Beschikbaar",
  "Ingepland",
  "Training",
  "Ziek",
  "Verlof",
];

export default function MedewerkerForm({
  medewerker,
  onSaved,
}) {
  const [naam, setNaam] = useState("");
  const [functie, setFunctie] = useState("");
  const [terminal, setTerminal] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("Beschikbaar");

  useEffect(() => {
    if (!medewerker) return;

    setNaam(medewerker.naam || "");
    setFunctie(medewerker.functie || "");
    setTerminal(medewerker.terminal || "");
    setTelefoon(medewerker.telefoon || "");
    setEmail(medewerker.email || "");
    setStatus(medewerker.status || "Beschikbaar");
  }, [medewerker]);

  async function opslaan(e) {
    e.preventDefault();

    const gegevens = {
      naam,
      functie,
      terminal,
      telefoon,
      email,
      status,
    };

    let error;

    if (medewerker?.id) {
      ({ error } = await supabase
        .from("medewerkers")
        .update(gegevens)
        .eq("id", medewerker.id));
    } else {
      ({ error } = await supabase
        .from("medewerkers")
        .insert([gegevens]));
    }

    if (error) {
      alert(error.message);
      return;
    }

    onSaved?.();
  }

  return (
    <form onSubmit={opslaan} className="table">

      <h2>
        {medewerker ? "✏️ Medewerker bewerken" : "👷 Nieuwe medewerker"}
      </h2>

      <label>Naam</label>
      <input
        required
        value={naam}
        onChange={(e) => setNaam(e.target.value)}
      />

      <label>Functie</label>
      <input
        value={functie}
        onChange={(e) => setFunctie(e.target.value)}
      />

      <label>Terminal</label>
      <input
        placeholder="Bijvoorbeeld Wilmar, Shell"
        value={terminal}
        onChange={(e) => setTerminal(e.target.value)}
      />

      <label>Telefoon</label>
      <input
        value={telefoon}
        onChange={(e) => setTelefoon(e.target.value)}
      />

      <label>E-mailadres</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label>Status</label>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        {statussen.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <button className="new-btn" type="submit">
        {medewerker ? "Opslaan" : "Medewerker toevoegen"}
      </button>

    </form>
  );
}