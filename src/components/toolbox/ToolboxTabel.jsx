export default function ToolboxTabel({
  toolboxen,
  onEdit,
  onDelete,
}) {
  return (
    <table className="medewerker-table">
      <thead>
        <tr>
          <th>Titel</th>
          <th>Categorie</th>
          <th>Versie</th>
          <th>Geldig</th>
          <th>Status</th>
          <th>PDF</th>
          <th>Acties</th>
        </tr>
      </thead>

      <tbody>
        {toolboxen.map((t) => (
          <tr key={t.id}>
            <td>{t.titel}</td>

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
                <a
                  href={t.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="new-btn"
                  style={{
                    background: "#16a34a",
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  📄 Open PDF
                </a>
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
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}