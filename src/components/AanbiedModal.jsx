import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function AanbiedModal({
  open,
  onClose,
  dienst,
  onVerzonden,
}) {
  const [medewerkers, setMedewerkers] = useState([]);
  const [geselecteerd, setGeselecteerd] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      laadMedewerkers();
      setGeselecteerd([]);
    }
  }, [open]);

  async function laadMedewerkers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("medewerkers")
      .select("*")
      .eq("status", "Beschikbaar")
      .order("naam");

    if (!error) {
      setMedewerkers(data || []);
    } else {
      console.error(error);
    }

    setLoading(false);
  }

  function toggleMedewerker(naam) {
    if (geselecteerd.includes(naam)) {
      setGeselecteerd(
        geselecteerd.filter((m) => m !== naam)
      );
    } else {
      setGeselecteerd([...geselecteerd, naam]);
    }
  }

  function allesSelecteren() {
    setGeselecteerd(
      medewerkers.map((m) => m.naam)
    );
  }

  function allesDeselecteren() {
    setGeselecteerd([]);
  }

  async function versturen() {
    if (!dienst) return;

    if (geselecteerd.length === 0) {
      alert("Selecteer minimaal één medewerker.");
      return;
    }

    for (const medewerker of medewerkers.filter((m) =>
      geselecteerd.includes(m.naam)
    )) {
      await supabase
        .from("dienst_aanbiedingen")
        .insert({
          planning_id: dienst.id,
          medewerker: medewerker.naam,
          telefoon: medewerker.telefoon,
          status: "Verzonden",
        });

      const bericht = `Hallo ${medewerker.naam},

Er is een open dienst beschikbaar.

📅 Datum: ${dienst.datum}
🕒 Dienst: ${dienst.dienst}
📍 Terminal: ${dienst.terminal}

Heb je interesse? Laat het weten.`;

      const telefoon = (medewerker.telefoon || "").replace(/\D/g, "");

      if (telefoon) {
        window.open(
          `https://wa.me/${telefoon}?text=${encodeURIComponent(
            bericht
          )}`,
          "_blank"
        );
      }
    }

    alert("De dienst is aangeboden.");

    if (onVerzonden) {
      onVerzonden();
    }

    onClose();
  }

  if (!open || !dienst) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>📢 Dienst aanbieden</h2>

        <div className="modal-info">
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

        <hr />

        {loading ? (
          <p>Medewerkers laden...</p>
        ) : (
          <>
            <div className="modal-list">
              {medewerkers.length === 0 && (
                <p>Geen beschikbare medewerkers.</p>
              )}

              {medewerkers.map((m) => (
                <label
                  key={m.id}
                  className="modal-medewerker"
                >
                  <input
                    type="checkbox"
                    checked={geselecteerd.includes(m.naam)}
                    onChange={() =>
                      toggleMedewerker(m.naam)
                    }
                  />

                  <span>{m.naam}</span>
                </label>
              ))}
            </div>

            <p>
              <strong>
                Geselecteerd:
              </strong>{" "}
              {geselecteerd.length}
            </p>

            <div className="modal-buttons">
              <button onClick={allesSelecteren}>
                Alles selecteren
              </button>

              <button onClick={allesDeselecteren}>
                Alles wissen
              </button>

              <button
                className="new-btn"
                onClick={versturen}
              >
                📱 WhatsApp openen
              </button>

              <button onClick={onClose}>
                Sluiten
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}