export default function DienstModal({
  open,
  onClose,
  onSave,
  dienst,
  setDienst,
  terminal,
  setTerminal,
}) {
  if (!open) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>📅 Dienst plannen</h2>

        <label>Dienst</label>

        <select
          value={dienst}
          onChange={(e) => setDienst(e.target.value)}
        >
          <option value="">Selecteer...</option>
          <option value="Ochtend">🌅 Ochtend</option>
          <option value="Middag">🌇 Middag</option>
          <option value="Nacht">🌙 Nacht</option>
          <option value="Vrij">⛔ Vrij</option>
          <option value="Vakantie">🌴 Vakantie</option>
          <option value="Ziek">🤒 Ziek</option>
          <option value="Toolbox">📦 Toolbox</option>
        </select>

        <label>Terminal</label>

        <input
          type="text"
          placeholder="Bijv. MET"
          value={terminal}
          onChange={(e) => setTerminal(e.target.value)}
        />

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