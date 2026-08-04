import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../services/supabase";
import { useAuthContext } from "../../contexts/AuthContext";
import "../../styles/opendiensten.css";

export default function AanbiedModal({
  open,
  onClose,
  dienst,
  onVerzonden,
}) {
  const { profile } = useAuthContext();

  const isMedewerker = profile?.rol === "medewerker";

  const [medewerkers, setMedewerkers] = useState([]);
  const [geselecteerd, setGeselecteerd] = useState([]);
  const [zoekterm, setZoekterm] = useState("");

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [melding, setMelding] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  async function laadMedewerkers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("medewerkers")
      .select("*")
      .eq("status", "Beschikbaar")
      .order("naam");

    if (error) {
      console.error(error);
      setError("Medewerkers konden niet worden geladen.");
    } else {
      setMedewerkers(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (!open) return;

    setZoekterm("");
    setGeselecteerd([]);
    setProgress(0);
    setError("");
    setMelding("");

    if (!isMedewerker) {
      laadMedewerkers();
    }
  }, [open]);

  const filteredMedewerkers = useMemo(() => {
    return medewerkers.filter((m) => {
      if (!zoekterm) return true;

      const zoek = zoekterm.toLowerCase();

      return (
        m.naam?.toLowerCase().includes(zoek) ||
        m.functie?.toLowerCase().includes(zoek) ||
        m.terminal?.toLowerCase().includes(zoek)
      );
    });
  }, [medewerkers, zoekterm]);

  if (!open || !dienst) return null;

  const toggleMedewerker = (id) => {
    setGeselecteerd((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const allesSelecteren = () => {
    setGeselecteerd(filteredMedewerkers.map((m) => m.id));
  };

  const allesWissen = () => {
    setGeselecteerd([]);
  };

  const geselecteerdeMedewerkers = medewerkers.filter((m) =>
    geselecteerd.includes(m.id)
  );

  const controleerDubbeleAanbieding = async (
    planningId,
    medewerkerNaam
  ) => {
    const { data } = await supabase
      .from("dienst_aanbiedingen")
      .select("id")
      .eq("planning_id", planningId)
      .eq("medewerker", medewerkerNaam)
      .maybeSingle();

    return !!data;
  };

  const openWhatsapp = (telefoon, bericht) => {
    const nummer = (telefoon || "").replace(/\D/g, "");

    if (!nummer) return;

    window.open(
      `https://wa.me/${nummer}?text=${encodeURIComponent(bericht)}`,
      "_blank"
    );
  };

  const versturen = async () => {
    if (!dienst) return;

    // Medewerker neemt dienst direct aan
    if (isMedewerker) {
      const bevestigen = window.confirm(
        "Wil je deze open dienst aannemen?"
      );

      if (!bevestigen) return;

      const { error } = await supabase
        .from("planning")
        .update({
          medewerker: profile.naam,
          status: "Ingepland",
        })
        .eq("id", dienst.id);

      if (error) {
        alert(error.message);
        return;
      }

      onVerzonden?.();
      onClose();
      return;
    }

    if (geselecteerdeMedewerkers.length === 0) {
      setError("Selecteer minimaal één medewerker.");
      return;
    }

    setSending(true);
    setError("");
    setMelding("");
    setProgress(0);

    let verwerkt = 0;

    for (const medewerker of geselecteerdeMedewerkers) {
      const bestaat = await controleerDubbeleAanbieding(
        dienst.id,
        medewerker.naam
      );

      if (bestaat) {
        verwerkt++;
        continue;
      }

      const token = crypto.randomUUID();

      const { data, error } = await supabase
        .from("dienst_aanbiedingen")
        .insert({
          planning_id: dienst.id,
          medewerker: medewerker.naam,
          telefoon: medewerker.telefoon,
          token,
          status: "Verzonden",
          verzonden_op: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) continue;

      const link = `https://tr-flex-planner.vercel.app/reageren/${data.token}`;

      const bericht = `Hallo ${medewerker.naam},

Er is een open dienst beschikbaar.

📅 Datum: ${dienst.datum}
🕒 Dienst: ${dienst.dienst}
📍 Terminal: ${dienst.terminal}

Klik hieronder om direct te reageren:

${link}

Terminal Recruiters`;

      openWhatsapp(medewerker.telefoon, bericht);

      verwerkt++;

      setProgress(
        Math.round(
          (verwerkt / geselecteerdeMedewerkers.length) * 100
        )
      );
    }

    setSending(false);
    setMelding(`${verwerkt} aanbieding(en) verzonden.`);

    onVerzonden?.();

    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="modal-overlay">
      <div className="aanbied-modal">
        <div className="modal-header">
          <h2>Dienst aanbieden</h2>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="dienst-info">
          <div>
            <strong>Datum</strong>
            <span>{dienst.datum}</span>
          </div>

          <div>
            <strong>Dienst</strong>
            <span>{dienst.dienst}</span>
          </div>

          <div>
            <strong>Terminal</strong>
            <span>{dienst.terminal}</span>
          </div>
        </div>

        {!isMedewerker && (
          <>
            <input
              className="zoek-input"
              placeholder="Zoek medewerker..."
              value={zoekterm}
              onChange={(e) => setZoekterm(e.target.value)}
            />

            <div className="toolbar">
              <button onClick={allesSelecteren}>
                Alles selecteren
              </button>

              <button onClick={allesWissen}>
                Alles wissen
              </button>

              <span>
                {geselecteerdeMedewerkers.length} geselecteerd
              </span>
            </div>

            {loading ? (
              <div className="loading">
                Medewerkers laden...
              </div>
            ) : (
              <div className="medewerker-list">
                {filteredMedewerkers.map((m) => (
                  <label
                    key={m.id}
                    className="medewerker-item"
                  >
                    <input
                      type="checkbox"
                      checked={geselecteerd.includes(m.id)}
                      onChange={() => toggleMedewerker(m.id)}
                    />

                    <div className="medewerker-info">
                      <strong>{m.naam}</strong>
                      <small>{m.functie || "Operator"}</small>
                      <small>{m.telefoon}</small>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </>
        )}

        {sending && (
          <div className="progress-wrapper">
            <div
              className="progress-bar"
              style={{ width: `${progress}%` }}
            />
            <span>{progress}%</span>
          </div>
        )}

        {melding && (
          <div className="success-box">
            {melding}
          </div>
        )}

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        <div className="footer">
          <button
            className="cancel-btn"
            onClick={onClose}
            disabled={sending}
          >
            Sluiten
          </button>

          <button
            className="send-btn"
            onClick={versturen}
            disabled={
              sending ||
              (!isMedewerker &&
                geselecteerdeMedewerkers.length === 0)
            }
          >
            {isMedewerker
              ? "✅ Dienst aannemen"
              : sending
              ? "Verzenden..."
              : `WhatsApp versturen (${geselecteerdeMedewerkers.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}