// src/components/planning/PlanningRow.jsx

import StatusBadge from "./StatusBadge";
import { useAuthContext } from "../../contexts/AuthContext";

export default function PlanningRow({
  planning,
  onEdit,
  onDelete,
}) {
  const { profile } =
    useAuthContext();

  // ==========================================
  // DATUM
  // ==========================================

  const datum = planning.datum
    ? new Date(
        `${planning.datum}T00:00:00`
      ).toLocaleDateString(
        "nl-NL",
        {
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }
      )
    : "-";

  // ==========================================
  // RECHTEN
  // ==========================================

  const magBewerken = [
    "admin",
    "operations",
    "planner",
  ].includes(profile?.rol);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <tr
      style={{
        borderBottom:
          "1px solid #e2e8f0",
      }}
    >
      {/* DATUM */}

      <td
        style={{
          padding: "13px 10px",
          whiteSpace: "nowrap",
          color: "#334155",
        }}
      >
        {datum}
      </td>

      {/* TERMINAL */}

      <td
        style={{
          padding: "13px 10px",
        }}
      >
        <span
          style={{
            display:
              "inline-block",
            padding:
              "6px 10px",
            borderRadius:
              "999px",
            background:
              "#eff6ff",
            color:
              "#1d4ed8",
            fontWeight:
              "600",
            whiteSpace:
              "nowrap",
          }}
        >
          🏭{" "}
          {planning.terminal ||
            "-"}
        </span>
      </td>

      {/* DIENST */}

      <td
        style={{
          padding: "13px 10px",
        }}
      >
        <strong
          style={{
            color: "#0f172a",
          }}
        >
          {planning.dienst ||
            "-"}
        </strong>
      </td>

      {/* OPERATOR */}

      <td
        style={{
          padding: "13px 10px",
        }}
      >
        {planning.medewerker ? (
          <strong>
            {planning.medewerker}
          </strong>
        ) : (
          <span
            style={{
              display:
                "inline-block",
              padding:
                "6px 10px",
              borderRadius:
                "999px",
              background:
                "#fef3c7",
              color:
                "#92400e",
              fontWeight:
                "700",
              fontSize:
                "12px",
              whiteSpace:
                "nowrap",
            }}
          >
            🟠 OPEN DIENST
          </span>
        )}
      </td>

      {/* STATUS */}

      <td
        style={{
          padding: "13px 10px",
          textAlign:
            "center",
        }}
      >
        <StatusBadge
          status={
            planning.status
          }
        />
      </td>

      {/* ACTIES */}

      <td
        style={{
          padding: "13px 10px",
          textAlign:
            "center",
        }}
      >
        {magBewerken ? (
          <div
            style={{
              display:
                "flex",
              justifyContent:
                "center",
              alignItems:
                "center",
              gap: "7px",
            }}
          >
            {/* BEWERKEN */}

            {onEdit && (
              <button
                type="button"
                onClick={() =>
                  onEdit(
                    planning
                  )
                }
                title="Bewerken"
                style={{
                  width: "36px",
                  height: "36px",
                  border: "none",
                  borderRadius:
                    "8px",
                  background:
                    "#22c55e",
                  color:
                    "#ffffff",
                  cursor:
                    "pointer",
                  fontSize:
                    "16px",
                }}
              >
                ✏️
              </button>
            )}

            {/* VERWIJDEREN */}

            {onDelete && (
              <button
                type="button"
                onClick={() =>
                  onDelete(
                    planning.id
                  )
                }
                title="Verwijderen"
                style={{
                  width: "36px",
                  height: "36px",
                  border: "none",
                  borderRadius:
                    "8px",
                  background:
                    "#dc2626",
                  color:
                    "#ffffff",
                  cursor:
                    "pointer",
                  fontSize:
                    "16px",
                }}
              >
                🗑️
              </button>
            )}
          </div>
        ) : (
          <span
            style={{
              color:
                "#94a3b8",
            }}
          >
            —
          </span>
        )}
      </td>
    </tr>
  );
}