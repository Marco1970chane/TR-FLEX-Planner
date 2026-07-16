import StatusBadge from "./StatusBadge";

export default function PlanningRow({
  planning,
  onEdit,
  onDelete,
}) {
  return (
    <tr>
      <td>
        {new Date(planning.datum).toLocaleDateString("nl-NL")}
      </td>

      <td>{planning.terminal}</td>

      <td>{planning.dienst}</td>

      <td>{planning.medewerker || "OPEN"}</td>

      <td>
        <StatusBadge status={planning.status} />
      </td>

      <td>
        <button
          className="new-btn"
          onClick={() => onEdit(planning)}
        >
          ✏️
        </button>

        <button
          className="new-btn"
          style={{
            marginLeft: "10px",
            background: "#dc3545",
          }}
          onClick={() => onDelete(planning.id)}
        >
          🗑️
        </button>
      </td>
    </tr>
  );
}