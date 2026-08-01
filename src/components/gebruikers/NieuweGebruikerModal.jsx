export default function NieuweGebruikerModal({
  open,
  onClose,
  onSave,
  naam,
  setNaam,
  email,
  setEmail,
  rol,
  setRol,
}) {
  if (!open) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>👤 Nieuwe gebruiker uitnodigen</h2>

        <label>Naam</label>
        <input
          type="text"
          value={naam}
          onChange={(e) => setNaam(e.target.value)}
          placeholder="Volledige naam"
        />

        <label>E-mailadres</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="naam@bedrijf.nl"
        />

        <label>Rol</label>
        <select
          value={rol}
          onChange={(e) => setRol(e.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="operations">Operations</option>
          <option value="planner">Planner</option>
          <option value="hr">HR</option>
          <option value="medewerker">Medewerker</option>
        </select>

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
            📧 Gebruiker uitnodigen
          </button>
        </div>
      </div>
    </div>
  );
}