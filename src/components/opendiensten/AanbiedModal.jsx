import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";

export default function AanbiedModal({
  open,
  dienst,
  onClose,
  onVerzonden,
}) {
  const [medewerkers, setMedewerkers] = useState([]);
  const [geselecteerd, setGeselecteerd] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setGeselecteerd([]);
    laadMedewerkers();
  }, [open]);

  async function laadMedewerkers() {
    const { data, error } = await supabase
      .from("medewerkers")
      .select("*")
      .order("naam");

    if (error) {
      console.error(error);
      return;
    }

    setMedewerkers(data || []);
  }

  function toggle(id) {
    setGeselecteerd((huidig) =>
      huidig.includes(id)
        ? huidig.filter((x) => x !== id)
        : [...huidig, id]
    );
  }

  async function versturen() {
    if (geselecteerd.length === 0) {
      alert("Selecteer minimaal één medewerker.");
      return;
    }

    setLoading(true);

    const geselecteerdeMedewerkers = medewerkers.filter((m) =>
      geselecteerd.includes(m.id)
    );

    const records = geselecteerdeMedewerkers.map((m) => ({
      planning_id: dienst.id,
      medewerker: m.naam,
      telefoon: m.telefoon || null,
      status: "Verzonden",
    }));

    const { error } = await supabase
      .from("dienst_aanbiedingen")
      .insert(records);

    setLoading(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert(`${records.length} medewerker(s) toegevoegd.`);

    onVerzonden?.();
    onClose();
  }

  if (!open || !dienst) return null;

  return (
    <div className="open-modal-overlay">
      <div className="open-modal">
        <h2>📢 Dienst aanbieden</h2>

        <div className="open-info">
          <p>
            <strong>Datum:</strong> {dienst.datum}
          </p>

          <p>
            <strong>Dienst:</strong> {dienst.dienst}
          </p>

          <p>
            <strong>Terminal:</strong> {dienst.terminal}
          </p>
        </div>

        <div className="open-medewerker-lijst">
          {medewerkers.map((m) => (
            <label
              key={m.id}
              className="open-checkbox-row"
            >
              <input
                type="checkbox"
                checked={geselecteerd.includes(m.id)}
                onChange={() => toggle(m.id)}
              />

              <span>{m.naam}</span>
            </label>
          ))}
        </div>

        <div className="open-modal-buttons">
          <button
            type="button"
            onClick={onClose}
          >
            Annuleren
          </button>

          <button
            type="button"
            className="new-btn"
            disabled={loading}
            onClick={versturen}
          >
            {loading ? "Opslaan..." : "Versturen"}
          </button>
        </div>
      </div>
    </div>
  );
}