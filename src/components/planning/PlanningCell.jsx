export default function PlanningCell({
  waarde,
  onClick,
}) {
  let achtergrond = "#ffffff";
  let kleur = "#2563eb";

  switch (waarde) {
    case "Dagdienst":
    case "Ochtend":
      achtergrond = "#16a34a";
      kleur = "#ffffff";
      break;

    case "Avonddienst":
    case "Middag":
      achtergrond = "#f59e0b";
      kleur = "#ffffff";
      break;

    case "Nachtdienst":
    case "Nacht":
      achtergrond = "#2563eb";
      kleur = "#ffffff";
      break;

    case "Vakantie":
      achtergrond = "#9333ea";
      kleur = "#ffffff";
      break;

    case "Ziek":
      achtergrond = "#dc2626";
      kleur = "#ffffff";
      break;

    case "Toolbox":
      achtergrond = "#eab308";
      kleur = "#000000";
      break;

    case "Vrij":
      achtergrond = "#9ca3af";
      kleur = "#ffffff";
      break;

    default:
      achtergrond = "#ffffff";
      kleur = "#2563eb";
  }

  return (
    <td
      onClick={onClick}
      style={{
        cursor: "pointer",
        textAlign: "center",
        fontWeight: "bold",
        background: achtergrond,
        color: kleur,
        borderRadius: "6px",
        transition: "0.2s",
      }}
    >
      {waarde || "+"}
    </td>
  );
}