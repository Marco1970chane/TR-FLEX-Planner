import { useState } from "react";
import { supabase } from "../services/supabase";

export default function MedewerkerForm({ onSaved }) {
  const [naam, setNaam] = useState("");
  const [functie, setFunctie] = useState("");
  const [terminal, setTerminal] = useState("");

  async function opslaan(e) {
    e.preventDefault();

    const { error } = await supabase
      .from("medewerkers")
      .insert([
        {
          naam,
          functie,
          terminal,
          status: "Beschikbaar",
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Medewerker opgeslagen!");

    setNaam("");
    setFunctie("");
    setTerminal("");

    if (onSaved) {
      onSaved();
    }
  }

  return (
    <form onSubmit={opslaan} className="table">
      <h2>👷 Nieuwe medewerker</h2>

      <label>Naam</label>
      <input
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
        value={terminal}
        onChange={(e) => setTerminal(e.target.value)}
      />

      <button className="new-btn" type="submit">
        Opslaan
      </button>
    </form>
  );
}