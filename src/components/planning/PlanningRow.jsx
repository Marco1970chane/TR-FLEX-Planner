// src/components/planning/PlanningRow.jsx

import StatusBadge from "./StatusBadge";
import { useAuthContext } from "../../contexts/AuthContext";

export default function PlanningRow({
  planning,
  onEdit,
  onDelete,
}) {
  const { profile } = useAuthContext();

  // ==========================================
  // DATUM
  // ==========================================

  const datum = planning.datum
    ? new Date(
        `${planning.datum}T00:00:00`
      ).toLocaleDateString("nl-NL", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
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
  // URENSTATUS
  // ==========================================

  const urenStatus = (
    planning.uren_status || ""
  )
    .toString()
    .toLowerCase()
    .trim();

  const gewerkteUren = Number(
    planning.gewerkte_uren || 0
  );

  function urenInfo() {
    // GOEDGEKEURD
    if (
      urenStatus === "goedgekeurd" ||
      urenStatus === "akkoord" ||
      urenStatus === "voltooid"
    ) {
      return {
        icon: "🟢",
        tekst: "Goedgekeurd",
        background: "#dcfce7",
        color: "#166534",
      };
    }

    // AFGEKEURD
    if (urenStatus === "afgekeurd") {
      return {
        icon: "🔴",
        tekst: "Afgekeurd",
        background: "#fee2e2",
        color: "#b91c1c",
      };
    }

    // INGEDIEND
    if (urenStatus === "ingediend") {
      return {
        icon: "🟠",
        tekst: "Ingediend",
        background: "#fef3c7",
        color: "#92400e",
      };
    }

    // GEEN REGISTRATIE
    return {
      icon: "⚪",
      tekst: "Geen uren",
      background: "#f1f5f9",
      color: "#64748b",
    };
  }

  const uren = urenInfo();

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
      {/* =====================================
          DATUM
      ====================================== */}

      <td
        style={{
          padding: "13px 10px",
          whiteSpace: "nowrap",
          color: "#334155",
        }}
      >
        {datum}
      </td>

      {/* =====================================
          TERMINAL
      ====================================== */}

      <td
        style={{
          padding: "13px 10px",
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "6px 10px",
            borderRadius: "999px",
            background: "#eff6ff",
            color: "#1d4ed8",
            fontWeight: "600",
            whiteSpace: "nowrap",
          }}
        >
          🏭 {planning.terminal || "-"}
        </span>
      </td>

      {/* =====================================
          DIENST
      ====================================== */}

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
          {planning.dienst || "-"}
        </strong>
      </td>

      {/* =====================================
          OPERATOR
      ====================================== */}

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
              display: "inline-block",
              padding: "6px 10px",
              borderRadius: "999px",
              background: "#fef3c7",
              color: "#92400e",
              fontWeight: "700",
              fontSize: "12px",
              whiteSpace: "nowrap",
            }}
          >
            🟠 OPEN DIENST
          </span>
        )}
      </td>

      {/* =====================================
          PLANNING STATUS
      ====================================== */}

      <td
        style={{
          padding: "13px 10px",
          textAlign: "center",
        }}
      >
        <StatusBadge
          status={planning.status}
        />
      </td>

      {/* =====================================
          URENSTATUS
      ====================================== */}

      <td
        style={{
          padding: "13px 10px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            minWidth: "105px",
          }}
        >
          <span
            style={{
              display: "inline-block",
              padding: "6px 9px",
              borderRadius: "999px",
              background:
                uren.background,
              color: uren.color,
              fontWeight: "700",
              fontSize: "11px",
              whiteSpace: "nowrap",
            }}
          >
            {uren.icon} {uren.tekst}
          </span>

          {gewerkteUren > 0 && (
            <strong
              style={{
                color: "#15803d",
                fontSize: "13px",
              }}
            >
              {gewerkteUren.toFixed(2)} uur
            </strong>
          )}
        </div>
      </td>

      {/* =====================================
          ACTIES
      ====================================== */}

      <td
        style={{
          padding: "13px 10px",
          textAlign: "center",
        }}
      >
        {magBewerken ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "7px",
            }}
          >
            {/* BEWERKEN */}

            {onEdit && (
              <button
                type="button"
                onClick={() =>
                  onEdit(planning)
                }
                title="Bewerken"
                style={{
                  width: "36px",
                  height: "36px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#22c55e",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontSize: "16px",
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
                  onDelete(planning.id)
                }
                title="Verwijderen"
                style={{
                  width: "36px",
                  height: "36px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#dc2626",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                🗑️
              </button>
            )}
          </div>
        ) : (
          <span
            style={{
              color: "#94a3b8",
            }}
          >
            —
          </span>
        )}
      </td>
    </tr>
  );
}