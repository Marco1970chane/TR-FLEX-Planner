export default function MedewerkerTable({
  medewerkers,
  onEdit,
  onDelete,
}) {
  return (
    <table>
      <thead>
        <tr>
          <th>Naam</th>
          <th>Functie</th>
          <th>Terminal</th>
          <th>Status</th>
          <th>Acties</th>
        </tr>
      </thead>

      <tbody>
        {medewerkers.map((m) => (
          <tr key={m.id}>
            <td>{m.naam}</td>
            <td>{m.functie}</td>
            <td>{m.terminal}</td>
            <td>{m.status}</td>

            <td>
              <button
                className="new-btn"
                onClick={() => onEdit(m)}
              >
                ✏️
              </button>

              <button
                className="new-btn"
                style={{
                  marginLeft: "10px",
                  background: "#d9534f",
                }}
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