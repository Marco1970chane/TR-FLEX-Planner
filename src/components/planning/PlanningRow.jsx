import StatusBadge from "./StatusBadge";
import { useAuthContext } from "../../contexts/AuthContext";

export default function PlanningRow({
  planning,
  onEdit,
  onDelete,
}) {
  const { profile } = useAuthContext();


  const datum = new Date(planning.datum).toLocaleDateString("nl-NL", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const magBewerken = [
    "admin",
    "operations",
    "planner",
  ].includes(profile?.rol);

  return (
    <tr>
      <td>
        <strong>{datum}</strong>
      </td>

      <td>
        <span className="terminal-badge">
          🏭 {planning.terminal}
        </span>
      </td>

      <td>
        <strong>{planning.dienst}</strong>
      </td>

      <td>
        {planning.medewerker ? (
          planning.medewerker
        ) : (
          <span className="open-dienst">
            🟠 OPEN DIENST
          </span>
        )}
      </td>

      <td>
        <StatusBadge status={planning.status} />
      </td>

      <td>
        {magBewerken ? (
          <div className="actie-buttons">
            <button
              className="edit-btn"
              onClick={() => onEdit(planning)}
              title="Bewerken"
            >
              ✏️
            </button>

            <button
              className="delete-btn"
              onClick={() => onDelete(planning.id)}
              title="Verwijderen"
            >
              🗑️
            </button>
          </div>
        ) : (
          <span style={{ color: "#999" }}>—</span>
        )}
      </td>
    </tr>
  );
}