// src/components/planning/PlanningTable.jsx

import PlanningRow from "./PlanningRow";

export default function PlanningTable({
  planning = [],
  onEdit,
  onDelete,
}) {
  // ==========================================
  // GEEN PLANNING
  // ==========================================

  if (!planning.length) {
    return (
      <div
        style={{
          padding: "50px 20px",
          textAlign: "center",
          color: "#64748b",
        }}
      >
        <div
          style={{
            fontSize: "40px",
            marginBottom: "10px",
          }}
        >
          📅
        </div>

        <strong
          style={{
            display: "block",
            fontSize: "18px",
            color: "#334155",
            marginBottom: "6px",
          }}
        >
          Geen planning gevonden
        </strong>

        <div>
          Er zijn geen diensten die aan
          de huidige filters voldoen.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
      }}
    >
      <table
        style={{
          width: "100%",
          minWidth: "1050px",
          borderCollapse: "collapse",
          fontSize: "14px",
        }}
      >
        {/* ====================================
            HEADER
        ===================================== */}

        <thead>
          <tr
            style={{
              background: "#f0fdf4",
              color: "#166534",
              borderBottom:
                "2px solid #bbf7d0",
            }}
          >
            <th
              style={thStyle}
            >
              Datum
            </th>

            <th
              style={thStyle}
            >
              Terminal
            </th>

            <th
              style={thStyle}
            >
              Dienst
            </th>

            <th
              style={thStyle}
            >
              Operator
            </th>

            <th
              style={{
                ...thStyle,
                textAlign: "center",
              }}
            >
              Planning
            </th>

            {/* NIEUW */}

            <th
              style={{
                ...thStyle,
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              Uren
            </th>

            <th
              style={{
                width: "180px",
                padding: "13px 10px",
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              Acties
            </th>
          </tr>
        </thead>

        {/* ====================================
            RIJEN
        ===================================== */}

        <tbody>
          {planning.map((p) => (
            <PlanningRow
              key={p.id}
              planning={p}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// STIJL
// ============================================================

const thStyle = {
  padding: "13px 10px",
  textAlign: "left",
  whiteSpace: "nowrap",
};