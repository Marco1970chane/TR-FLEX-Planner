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

    const { data, error } = await supabase
      .from("dienst_aanbiedingen")
      .insert(records)
      .select();

    setLoading(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    onVerzonden?.();

    const links = data.map((aanbieding) => {
      const medewerker = geselecteerdeMedewerkers.find(
        (m) => m.naam === aanbieding.medewerker
      );

      if (!medewerker?.telefoon) return null;

      const bericht = encodeURIComponent(
`Hallo ${aanbieding.medewerker},

Er staat een open dienst voor je klaar.

📅 Datum: ${dienst.datum}
🕒 Dienst: ${dienst.dienst}
📍 Terminal: ${dienst.terminal}

Accepteren of weigeren?

Klik op onderstaande link:

https://tr-flex-planner.vercel.app/reageren/${aanbieding.token}`
      );

      return {
        naam: aanbieding.medewerker,
        telefoon: medewerker.telefoon,
        url: `https://wa.me/${medewerker.telefoon}?text=${bericht}`,
      };
    }).filter(Boolean);

    const popup = window.open("", "_blank");

    if (popup) {
      popup.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>WhatsApp berichten</title>
          <style>
            body{
              font-family:Arial,sans-serif;
              padding:30px;
              background:#f5f5f5;
            }

            h2{
              margin-bottom:25px;
            }

            .persoon{
              background:white;
              padding:15px;
              margin-bottom:15px;
              border-radius:8px;
              box-shadow:0 2px 6px rgba(0,0,0,.1);
            }

            a{
              display:inline-block;
              margin-top:10px;
              padding:10px 16px;
              background:#25D366;
              color:white;
              text-decoration:none;
              border-radius:6px;
              font-weight:bold;
            }

            a:hover{
              background:#1faa52;
            }
          </style>
        </head>

        <body>

          <h2>📱 WhatsApp berichten</h2>

          ${links
            .map(
              (l) => `
                <div class="persoon">
                  <strong>${l.naam}</strong><br>
                  <a href="${l.url}" target="_blank">
                    📱 Open WhatsApp
                  </a>
                </div>
              `
            )
            .join("")}

        </body>
        </html>
      `);

      popup.document.close();
    }

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

              <span>
                {m.naam}
                {!m.telefoon && " ⚠️ (geen telefoonnummer)"}
              </span>
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
            {loading ? "Versturen..." : "Versturen"}
          </button>
        </div>
      </div>
    </div>
  );
}