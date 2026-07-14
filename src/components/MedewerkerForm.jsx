import { useState } from "react";

export default function MedewerkerForm() {
  const [naam, setNaam] = useState("");
  const [functie, setFunctie] = useState("");
  const [terminal, setTerminal] = useState("");

  function opslaan(e) {
    e.preventDefault();

    alert(`Medewerker ${naam} opgeslagen!`);

    setNaam("");
    setFunctie("");
    setTerminal("");
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

      <button className="new-btn">
        Opslaan
      </button>
    </form>
  );
}