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
  if (t.includes("shell")) return "shell";
  if (t.includes("met")) return "met";

  return "default-terminal";
}

function statusClass(status = "") {
  switch (status.toLowerCase()) {
    case "ingepland":
      return "status-ing";
    case "open":
      return "status-open";
    case "training":
      return "status-training";
    case "ziek":
      return "status-ziek";
    default:
      return "status-default";
  }
}

export default function PlanningCard({
  dienst,
  onClick,
  onWhatsApp,
}) {
  return (
    <div
      className={`dienst-card ${terminalClass(
        dienst.terminal
      )}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(dienst);
      }}
    >
      <div className="dienst-header">
        <strong>{dienst.terminal}</strong>

        {dienst.status && (
          <span
            className={`dienst-status ${statusClass(
              dienst.status
            )}`}
          >
            {dienst.status}
          </span>
        )}
      </div>

      <div className="dienst-medewerker">
        👤{" "}
        <strong>
          {dienst.medewerker || "OPEN DIENST"}
        </strong>
      </div>

      {(dienst.starttijd || dienst.eindtijd) && (
        <div className="dienst-tijd">
          🕒 {dienst.starttijd || "--:--"} -{" "}
          {dienst.eindtijd || "--:--"}
        </div>
      )}

      {dienst.opmerking && (
        <div className="dienst-opmerking">
          💬 {dienst.opmerking}
        </div>
      )}

      {dienst.status?.toLowerCase() === "open" && (
        <button
          className="whatsapp-btn"
          onClick={(e) => {
            e.stopPropagation();
            onWhatsApp?.(dienst);
          }}
        >
          📱 Dienst aanbieden
        </button>
      )}
    </div>
  );
}