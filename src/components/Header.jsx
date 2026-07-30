import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import useAuth from "../hooks/useAuth";

export default function Header() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  async function logout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <header
      style={{
        height: "70px",
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 25px",
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            color: "#0F4C81",
          }}
        >
          🚢 TR-FLEX Planner
        </h2>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
        }}
      >
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 600 }}>
            {profile?.naam || user?.email}
          </div>

          <div
            style={{
              color: "#666",
              fontSize: "13px",
            }}
          >
            {profile?.rol || "Gebruiker"}
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            background: "#dc2626",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 16px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          🚪 Uitloggen
        </button>
      </div>
    </header>
  );
}