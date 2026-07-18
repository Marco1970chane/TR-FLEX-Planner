export default function PlanningCard({ dienst, onClick }) {
  function getClassName() {
    const terminal = (dienst.terminal || "").toLowerCase();

    if (terminal.includes("wilmar")) return "dienst-card wilmar";
    if (terminal.includes("chane")) return "dienst-card chane";
    if (terminal.includes("lbc")) return "dienst-card lbc";
    if (terminal.includes("standic")) return "dienst-card standic";
    if (terminal.includes("exolum")) return "dienst-card exolum";
    if (terminal.includes("aglobis")) return "dienst-card aglobis";
    if (terminal.includes("tepsa")) return "dienst-card tepsa";

    return "dienst-card";
  }

  return (
    <div className={getClassName()} onClick={onClick}>
      <strong>🚢 {dienst.terminal}</strong>

      <div>🕒 {dienst.dienst}</div>

      <small>{dienst.status || "Ingepland"}</small>
    </div>
  );
}