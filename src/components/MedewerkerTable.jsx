function statusClass(status = "") {
  switch (status.toLowerCase()) {
    case "beschikbaar":
      return "status-green";

    case "ingepland":
      return "status-blue";

    case "training":
      return "status-orange";

    case "ziek":
      return "status-red";

    case "verlof":
      return "status-purple";

    default:
      return "status-gray";
  }
}

export default function MedewerkerTable({
  medewerkers,
  onEdit,
  onDelete,
}) {
  if (medewerkers.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          color: "#64748b",
        }}
      >
        Geen medewerkers gevonden.
      </div>
    );
  }

  return (
    <table className="medewerker-table">
      <thead>
        <tr>
          <th>Medewerker</th>
          <th>Functie</th>
          <th>Terminal</th>
          <th>Status</th>
          <th>Telefoon</th>
          <th>Acties</th>
        </tr>
      </thead>

      <tbody>
        {medewerkers.map((m) => (
          <tr key={m.id}>
            <td>
              <div className="employee-cell">
                <div className="employee-avatar">
                  {m.naam?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <strong>{m.naam}</strong>

                  {m.email && (
                    <div className="employee-email">
                      {m.email}
                    </div>
                  )}
                </div>
              </div>
            </td>

            <td>{m.functie || "-"}</td>

            <td>{m.terminal || "-"}</td>

            <td>
              <span
                className={`status-badge ${statusClass(
                  m.status || ""
                )}`}
              >
                {m.status || "-"}
              </span>
            </td>

            <td>
              {m.telefoon ? (
                <a href={`tel:${m.telefoon}`}>
                  {m.telefoon}
                </a>
              ) : (
                "-"
              )}
            </td>

            <td>
              <button
                className="new-btn"
                onClick={() => onEdit(m)}
              >
                ✏️
              </button>

              <button
                className="delete-btn"
                onClick={() => onDelete(m.id)}
              >
                🗑️
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}