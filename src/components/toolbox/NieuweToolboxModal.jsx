import { uploadToolboxPdf } from "../../services/supabase";
export default function NieuweToolboxModal({
  open,
  onClose,
  onSave,
  titel,
  setTitel,
  omschrijving,
  setOmschrijving,
  categorie,
  setCategorie,
  pdfUrl,
  setPdfUrl,
  videoUrl,
  setVideoUrl,
  versie,
  setVersie,
  geldigMaanden,
  setGeldigMaanden,
  actief,
  setActief,
}) {
  if (!open) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>📦 Nieuwe Toolbox</h2>

        <label>Titel *</label>
        <input
          type="text"
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
        />

        <label>Omschrijving</label>
        <textarea
          value={omschrijving}
          onChange={(e) => setOmschrijving(e.target.value)}
        />

        <label>Categorie</label>
        <select
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
        >
          <option value="Veiligheid">Veiligheid</option>
          <option value="Werkinstructie">Werkinstructie</option>
          <option value="Kwaliteit">Kwaliteit</option>
          <option value="Milieu">Milieu</option>
          <option value="Overig">Overig</option>
        </select>

        <label>PDF document</label>

<input
  type="file"
  accept="application/pdf"
  onChange={async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadToolboxPdf(file);
      setPdfUrl(url);
      alert("PDF succesvol geüpload.");
    } catch (err) {
      alert(err.message);
    }
  }}
/>

{pdfUrl && (
  <p
    style={{
      color: "#16a34a",
      marginTop: "8px",
      fontSize: "14px",
    }}
  >
    ✅ PDF gekoppeld
  </p>
)}

        <label>Video URL</label>
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />

        <label>Versie</label>
        <input
          type="text"
          value={versie}
          onChange={(e) => setVersie(e.target.value)}
        />

        <label>Geldig (maanden)</label>
        <input
          type="number"
          value={geldigMaanden}
          onChange={(e) => setGeldigMaanden(Number(e.target.value))}
        />

        <label>
          <input
            type="checkbox"
            checked={actief}
            onChange={(e) => setActief(e.target.checked)}
          />
          Actief
        </label>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <button
            className="new-btn"
            style={{ background: "#6b7280" }}
            onClick={onClose}
          >
            Annuleren
          </button>

          <button
            className="new-btn"
            onClick={onSave}
          >
            💾 Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}