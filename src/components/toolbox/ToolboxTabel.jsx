export default function ToolboxTabel({
  toolboxen,
  onView,
  onEdit,
  onDelete,
}) {
  if (!toolboxen.length) {
    return (
      <div className="table-empty">
        <h3>📦 Geen toolboxen gevonden</h3>
        <p>Er zijn geen toolboxen die aan de huidige filters voldoen.</p>
      </div>
    );
  }

  return (
    <table className="medewerker-table">
      <thead>
        <tr>
          <th>Titel</th>
          <th>Categorie</th>
          <th>Versie</th>
          <th>Geldig</th>
          <th>Status</th>
          <th>Document</th>
          <th>Acties</th>
        </tr>
      </thead>

      <tbody>
        {toolboxen.map((t) => (
          <tr key={t.id}>
            <td>
              <strong>{t.titel}</strong>
            </td>

            <td>{t.categorie}</td>

            <td>{t.versie}</td>

            <td>{t.geldig_maanden} maanden</td>

            <td>
              {t.actief ? (
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
              {t.pdf_url ? (
                <button
                  className="new-btn"
                  style={{
                    background: "#16a34a",
                  }}
                  onClick={() => onView(t)}
                >
                  📄 Bekijken
                </button>
              ) : (
                <span
                  style={{
                    color: "#9ca3af",
                    fontSize: "14px",
                  }}
                >
                  Geen PDF
                </span>
              )}
            </td>

            <td>
              {onEdit ? (
                <div
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
                    onClick={() => onEdit(t)}
                  >
                    ✏️ Bewerken
                  </button>

                  <button
                    className="new-btn"
                    style={{
                      background: "#dc2626",
                    }}
                    onClick={() => onDelete(t.id)}
                  >
                    🗑 Verwijderen
                  </button>
                </div>
              ) : (
                <span
                  style={{
                    color: "#9ca3af",
                    fontStyle: "italic",
                  }}
                >
                  Alleen bekijken
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}