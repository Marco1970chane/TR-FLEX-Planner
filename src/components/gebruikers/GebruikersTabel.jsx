export default function GebruikersTabel({
  gebruikers,
  wijzigRol,
  wijzigStatus,
  onResetPassword,
}) {
  return (
    <table className="medewerker-table">
      <thead>
        <tr>
          <th>Naam</th>
          <th>E-mail</th>
          <th>Rol</th>
          <th>Status</th>
          <th>Acties</th>
        </tr>
      </thead>

      <tbody>
        {gebruikers.map((g) => (
          <tr key={g.id}>
            <td>{g.naam}</td>

            <td>{g.email}</td>

            <td>
              <select
                value={g.rol}
                onChange={(e) =>
                  wijzigRol(g.id, e.target.value)
                }
              >
                <option value="admin">Admin</option>
                <option value="operations">Operations</option>
                <option value="planner">Planner</option>
                <option value="hr">HR</option>
                <option value="medewerker">Medewerker</option>
              </select>
            </td>

            <td>
              {g.actief ? (
                <span className="badge-active">
                  🟢 Actief
                </span>
              ) : (
                <span className="badge-inactive">
                  ⚫ Inactief
                </span>
              )}
            </td>

            <td>
              <button
                className="new-btn"
                style={{
                  background: g.actief
                    ? "#dc2626"
                    : "#16a34a",
                }}
                onClick={() =>
                  wijzigStatus(g.id, !g.actief)
                }
              >
                {g.actief
                  ? "Deactiveren"
                  : "Activeren"}
              </button>
              <button
  className="new-btn"
  style={{
    marginLeft: "8px",
    background: "#2563eb",
  }}
  onClick={() => onResetPassword(g.email)}
>
  🔑 Reset wachtwoord
</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}