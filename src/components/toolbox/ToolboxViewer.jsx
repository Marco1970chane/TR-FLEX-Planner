import { useEffect, useState } from "react";

export default function ToolboxViewer({
  open,
  toolbox,
  onClose,
  onStartQuiz,
}) {
  const [gelezen, setGelezen] = useState(false);

  useEffect(() => {
    if (open) {
      setGelezen(false);
    }
  }, [open]);

  if (!open || !toolbox) return null;

  return (
    <div className="modal">
      <div
        className="modal-content"
        style={{
          width: "90%",
          maxWidth: "1100px",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>
              📦 {toolbox.titel}
            </h2>

            <p
              style={{
                marginTop: "6px",
                color: "#64748b",
              }}
            >
              {toolbox.categorie} • Versie {toolbox.versie}
            </p>
          </div>

          <button
            className="new-btn"
            style={{
              background: "#ef4444",
            }}
            onClick={onClose}
          >
            ✕ Sluiten
          </button>
        </div>

        {/* Omschrijving */}

        {toolbox.omschrijving && (
          <div
            style={{
              marginBottom: "15px",
              padding: "12px",
              background: "#f8fafc",
              borderRadius: "10px",
              color: "#475569",
            }}
          >
            {toolbox.omschrijving}
          </div>
        )}

        {/* PDF */}

        <div
          style={{
            flex: 1,
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            overflow: "hidden",
            background: "#ffffff",
          }}
        >
          {toolbox.pdf_url ? (
            <iframe
              src={toolbox.pdf_url}
              title={toolbox.titel}
              width="100%"
              height="100%"
              style={{
                border: "none",
              }}
            />
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "18px",
                color: "#64748b",
              }}
            >
              📄 Geen PDF beschikbaar.
            </div>
          )}
        </div>

        {/* Footer */}

        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={gelezen}
              onChange={(e) => setGelezen(e.target.checked)}
            />

            Ik heb deze toolbox volledig gelezen.
          </label>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              className="new-btn"
              style={{
                background: "#6b7280",
              }}
              onClick={onClose}
            >
              Sluiten
            </button>

            <button
              className="new-btn"
              disabled={!gelezen}
              style={{
                background: gelezen ? "#2563eb" : "#94a3b8",
                cursor: gelezen ? "pointer" : "not-allowed",
              }}
              onClick={() => {
                if (onStartQuiz) {
                  onStartQuiz(toolbox);
                }
              }}
            >
              📝 Start toets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}