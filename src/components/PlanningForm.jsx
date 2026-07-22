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
  const [medewerker, setMedewerker] = useState("");
  const [openDienst, setOpenDienst] = useState(false);

  const [medewerkers, setMedewerkers] = useState([]);
  const [terminals, setTerminals] = useState([]);

  useEffect(() => {
    laadMedewerkers();
    laadTerminals();
  }, []);

  useEffect(() => {
    if (!planning?.id) {
      setDatum(defaultDatum || "");
      setMedewerker(defaultMedewerker || "");
    }
  }, [defaultDatum, defaultMedewerker, planning]);

  useEffect(() => {
    if (planning?.id) {
      setDatum(planning.datum || "");
      setDienst(planning.dienst || "");
      setTerminal(planning.terminal || "");
      setMedewerker(planning.medewerker || "");
      setOpenDienst(planning.status === "Open");
    }
  }, [planning]);

  async function laadMedewerkers() {
    const { data, error } = await supabase
      .from("medewerkers")
      .select("*")
      .order("naam");

    if (!error) {
      setMedewerkers(data || []);
    }
  }

  async function laadTerminals() {
    const { data, error } = await supabase
      .from("terminals")
      .select("*")
      .order("naam");

    if (!error) {
      setTerminals(data || []);
    }
  }

  async function opslaan(e) {
    e.preventDefault();

    const gegevens = {
      datum,
      dienst,
      terminal,
      medewerker: openDienst ? null : medewerker,
      status: openDienst ? "Open" : "Ingepland",
    };

    let error;

    if (planning?.id) {
      const result = await supabase
        .from("planning")
        .update(gegevens)
        .eq("id", planning.id);

      error = result.error;
    } else {
      const result = await supabase
        .from("planning")
        .insert([gegevens]);

      error = result.error;
    }

    if (error) {
      alert(error.message);
      return;
    }

    alert(
      planning?.id
        ? "✅ Dienst bijgewerkt!"
        : "✅ Dienst opgeslagen!"
    );

    setDatum("");
    setDienst("");
    setTerminal("");
    setMedewerker("");
    setOpenDienst(false);

    onSaved?.();
  }

  return (
    <form onSubmit={opslaan}>
      <h2>
        {planning?.id
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
        <option value="06:00-14:00">06:00-14:00</option>
        <option value="07:00-15:00">07:00-15:00</option>
        <option value="10:00-18:00">10:00-18:00</option>
        <option value="14:00-22:00">14:00-22:00</option>
        <option value="22:00-06:00">22:00-06:00</option>
      </select>

      <label>Terminal</label>

      <select
        value={terminal}
        onChange={(e) => setTerminal(e.target.value)}
        required
      >
        <option value="">Kies terminal...</option>

        {terminals.map((t) => (
          <option key={t.id} value={t.naam}>
            {t.naam}
          </option>
        ))}
      </select>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          margin: "15px 0",
        }}
      >
        <input
          type="checkbox"
          checked={openDienst}
          onChange={(e) => {
            setOpenDienst(e.target.checked);

            if (e.target.checked) {
              setMedewerker("");
            }
          }}
        />

        📢 Open dienst (nog geen medewerker)
      </label>

      <label>Medewerker</label>

      <select
        value={medewerker}
        disabled={openDienst}
        required={!openDienst}
        onChange={(e) => setMedewerker(e.target.value)}
      >
        <option value="">
          {openDienst
            ? "Open dienst"
            : "Kies medewerker..."}
        </option>

        {medewerkers.map((m) => (
          <option key={m.id} value={m.naam}>
            {m.naam}
          </option>
        ))}
      </select>

      <button
        className="new-btn"
        type="submit"
      >
        {planning?.id
          ? "💾 Wijzigen"
          : "💾 Opslaan"}
      </button>
    </form>
  );
}