export default function StatusBadge({ status }) {
  let achtergrond = "#6b7280";

  switch (status) {
    case "Ingepland":
      achtergrond = "#16a34a";
      break;

    case "Open":
      achtergrond = "#dc2626";
      break;

    case "Ziek":
      achtergrond = "#f59e0b";
      break;

    case "Vakantie":
      achtergrond = "#2563eb";
      break;

    default:
      achtergrond = "#6b7280";
  }

  return (
    <span
      style={{
        background: achtergrond,
        color: "white",
        padding: "5px 10px",
        borderRadius: "15px",
        fontSize: "13px",
        fontWeight: "bold",
      }}
    >
      {status}
    </span>
  );
}