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
  const [zoekterm, setZoekterm] = useState("");
  const [loading, setLoading] = useState(false);
  const [versturenLoading, setVersturenLoading] = useState(false);

  useEffect(() => {
    if (open) {
      laadMedewerkers();
      setGeselecteerd([]);
      setZoekterm("");
    }
  }, [open]);

  async function laadMedewerkers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("medewerkers")
      .select("*")
      .eq("status", "Beschikbaar")
      .order("naam");

    if (error) {
      console.error("Fout bij laden medewerkers:", error);
      alert("Medewerkers konden niet worden geladen.");
      setMedewerkers([]);
    } else {
      setMedewerkers(data || []);
    }

    setLoading(false);
  }

  function toggleMedewerker(naam) {
    setGeselecteerd((vorig) => {
      if (vorig.includes(naam)) {
        return vorig.filter((m) => m !== naam);
      }

      return [...vorig, naam];
    });
  }

  function allesSelecteren() {
    setGeselecteerd(
      gefilterdeMedewerkers.map((m) => m.naam)
    );
  }

  function allesDeselecteren() {
    setGeselecteerd([]);
  }

  const gefilterdeMedewerkers = medewerkers.filter((medewerker) =>
    (medewerker.naam || "")
      .toLowerCase()
      .includes(zoekterm.toLowerCase())
  );

  async function versturen() {
    if (!dienst) return;

    if (geselecteerd.length === 0) {
      alert("Selecteer minimaal één medewerker.");
      return;
    }

    setVersturenLoading(true);

    let aantalVerzonden = 0;

    try {
      for (const medewerker of medewerkers.filter((m) =>
        geselecteerd.includes(m.naam)
      )) {
        /*
         * Controleer eerst of deze medewerker
         * deze dienst al aangeboden heeft gekregen.
         */
        const { data: bestaande, error: controleError } =
          await supabase
            .from("dienst_aanbiedingen")
            .select("id, status")
            .eq("planning_id", dienst.id)
            .eq("medewerker", medewerker.naam)
            .maybeSingle();

        if (controleError) {
          console.error(
            "Fout bij controleren bestaande aanbieding:",
            controleError
          );
        }

        /*
         * Bestaat er al een aanbieding?
         * Dan slaan we deze medewerker over.
         */
        if (bestaande) {
          console.log(
            `Dienst is al aangeboden aan ${medewerker.naam}`
          );
          continue;
        }

        const token = crypto.randomUUID();

        const { error } = await supabase
          .from("dienst_aanbiedingen")
          .insert({
            planning_id: dienst.id,
            medewerker: medewerker.naam,
            telefoon: medewerker.telefoon || "",
            token,
            status: "Verzonden",
            verzonden_op: new Date().toISOString(),
          });

        if (error) {
          console.error(
            `Fout bij aanbieden aan ${medewerker.naam}:`,
            error
          );
          continue;
        }

        const link =
          `https://tr-flex-planner.vercel.app/reageren/${token}`;

        const bericht = `Hallo ${medewerker.naam},

Er is een open dienst beschikbaar.

📅 Datum: ${dienst.datum}
🕒 Dienst: ${dienst.dienst}
📍 Terminal: ${dienst.terminal}

Klik hieronder om direct te reageren:

${link}

Terminal Recruiters`;

        const telefoon =
          (medewerker.telefoon || "").replace(/\D/g, "");

        if (telefoon) {
          window.open(
            `https://wa.me/${telefoon}?text=${encodeURIComponent(
              bericht
            )}`,
            "_blank"
          );
        }

        aantalVerzonden++;
      }

      if (aantalVerzonden === 0) {
        alert(
          "Geen nieuwe aanbiedingen verzonden. Mogelijk waren deze medewerkers al aangeboden."
        );
      } else {
        alert(
          `${aantalVerzonden} dienstaanbieding(en) verzonden.`
        );
      }

      if (onVerzonden) {
        onVerzonden();
      }

      onClose();
    } catch (error) {
      console.error("Onverwachte fout:", error);
      alert(
        "Er is een onverwachte fout opgetreden bij het aanbieden van de dienst."
      );
    } finally {
      setVersturenLoading(false);
    }
  }

  if (!open || !dienst) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal">

        {/* HEADER */}
        <div className="modal-header">
          <div>
            <h2>📢 Dienst aanbieden</h2>
            <p className="modal-subtitle">
              Selecteer de medewerkers aan wie je deze dienst wilt aanbieden.
            </p>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        {/* DIENST INFORMATIE */}
        <div className="modal-info">

          <div className="info-item">
            <span>📅</span>
            <div>
              <small>Datum</small>
              <strong>{dienst.datum || "-"}</strong>
            </div>
          </div>

          <div className="info-item">
            <span>🕒</span>
            <div>
              <small>Dienst</small>
              <strong>{dienst.dienst || "-"}</strong>
            </div>
          </div>

          <div className="info-item">
            <span>📍</span>
            <div>
              <small>Terminal</small>
              <strong>{dienst.terminal || "-"}</strong>
            </div>
          </div>

        </div>

        <hr />

        {/* ZOEKEN */}
        <div className="modal-search">
          <input
            type="text"
            placeholder="🔎 Zoek medewerker..."
            value={zoekterm}
            onChange={(e) => setZoekterm(e.target.value)}
          />
        </div>

        {/* SELECTIE KNOPPEN */}
        <div className="select-buttons">
          <button
            type="button"
            onClick={allesSelecteren}
          >
            ☑ Alles selecteren
          </button>

          <button
            type="button"
            onClick={allesDeselecteren}
          >
            ☐ Alles wissen
          </button>
        </div>

        {/* MEDEWERKERS */}
        {loading ? (
          <div className="modal-loading">
            <p>⏳ Medewerkers laden...</p>
          </div>
        ) : (
          <>
            <div className="modal-list">

              {gefilterdeMedewerkers.length === 0 && (
                <div className="empty-state">
                  <span>👤</span>
                  <p>
                    {zoekterm
                      ? "Geen medewerkers gevonden."
                      : "Geen beschikbare medewerkers."}
                  </p>
                </div>
              )}

              {gefilterdeMedewerkers.map((medewerker) => {
                const geselecteerdDeze =
                  geselecteerd.includes(medewerker.naam);

                return (
                  <label
                    key={medewerker.id}
                    className={`modal-medewerker ${
                      geselecteerdDeze
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={geselecteerdDeze}
                      onChange={() =>
                        toggleMedewerker(
                          medewerker.naam
                        )
                      }
                    />

                    <span className="medewerker-status">
                      ●
                    </span>

                    <span className="medewerker-naam">
                      {medewerker.naam}
                    </span>

                    {medewerker.telefoon && (
                      <span className="medewerker-telefoon">
                        {medewerker.telefoon}
                      </span>
                    )}
                  </label>
                );
              })}

            </div>

            {/* SELECTIE TELLER */}
            <div className="selection-counter">
              <strong>
                {geselecteerd.length}
              </strong>{" "}
              medewerker
              {geselecteerd.length !== 1
                ? "s"
                : ""}{" "}
              geselecteerd
            </div>

            {/* ACTIES */}
            <div className="modal-buttons">

              <button
                type="button"
                onClick={onClose}
                disabled={versturenLoading}
              >
                Sluiten
              </button>

              <button
                type="button"
                className="new-btn"
                onClick={versturen}
                disabled={
                  versturenLoading ||
                  geselecteerd.length === 0
                }
              >
                {versturenLoading
                  ? "⏳ Bezig..."
                  : `📱 WhatsApp openen (${geselecteerd.length})`}
              </button>

            </div>
          </>
        )}

      </div>
    </div>
  );
}