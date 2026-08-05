export default function ToolboxVraagTabel({
  vragen,
  toolboxen,
  onEdit,
  onDelete,
}) {
  return (
    <table className="medewerker-table">
      <thead>
        <tr>
          <th>Toolbox</th>
          <th>Vraag</th>
          <th>Juist</th>
          <th>Volgorde</th>
          <th>Acties</th>
        </tr>
      </thead>

      <tbody>
        {vragen.length === 0 ? (
          <tr>
            <td
              colSpan="5"
              style={{
                textAlign: "center",
                padding: "30px",
                color: "#64748b",
              }}
            >
              Geen vragen gevonden.
            </td>
          </tr>
        ) : (
          vragen.map((vraag) => {
            const toolbox = toolboxen.find(
              (t) => t.id === vraag.toolbox_id
            );

            return (
              <tr key={vraag.id}>
                <td>{toolbox?.titel || "-"}</td>

                <td>{vraag.vraag}</td>

                <td>{vraag.juist}</td>

                <td>{vraag.volgorde}</td>

                <td
                  style={{
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <button
                    className="new-btn"
                    style={{
                      background: "#2563eb",
                    }}
                    onClick={() => onEdit(vraag)}
                  >
                    ✏️ Bewerken
                  </button>

                  <button
                    className="new-btn"
                    style={{
                      background: "#dc2626",
                    }}
                    onClick={() => onDelete(vraag.id)}
                  >
                    🗑 Verwijderen
                  </button>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}