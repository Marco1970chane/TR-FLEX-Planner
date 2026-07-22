import "./WeekPlanner.css";

function terminalClass(terminal = "") {
  const t = terminal.toLowerCase();

  if (t.includes("wilmar")) return "wilmar";
  if (t.includes("chane")) return "chane";
  if (t.includes("lbc")) return "lbc";
  if (t.includes("standic")) return "standic";
  if (t.includes("exolum")) return "exolum";
  if (t.includes("aglobis")) return "aglobis";
  if (t.includes("tepsa")) return "tepsa";

  return "";
}

export default function PlanningCard({
  dienst,
  onClick,
  onWhatsApp,
}) {
  return (
    <div
      className={`dienst-card ${terminalClass(dienst.terminal)}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
    >
      <div className="dienst-header">
        <strong>{dienst.terminal || "Geen terminal"}</strong>

        {dienst.status && (
          <span className="dienst-status">
            {dienst.status}
          </span>
        )}
      </div>

      <div style={{ marginTop: 8 }}>
        👤 <strong>{dienst.medewerker}</strong>
      </div>

      {(dienst.starttijd || dienst.eindtijd) && (
        <div className="dienst-tijd">
          🕒 {dienst.starttijd || "--:--"} - {dienst.eindtijd || "--:--"}
        </div>
      )}

      {dienst.opmerking && (
        <div className="dienst-opmerking">
          {dienst.opmerking}
        </div>
      )}

      <button
        className="new-btn"
        style={{
          marginTop: 12,
          width: "100%",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onWhatsApp?.(dienst);
        }}
      >
        📱 Verstuur via WhatsApp
      </button>
    </div>
  );
}