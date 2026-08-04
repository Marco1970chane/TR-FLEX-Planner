import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";

export default function SetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("Geen geldige uitnodiging of sessie gevonden.");
        navigate("/login");
      }
    }

    checkSession();
  }, [navigate]);

  async function opslaan(e) {
    e.preventDefault();

    if (password.length < 8) {
      alert("Gebruik minimaal 8 tekens.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("✅ Je wachtwoord is ingesteld.");

    navigate("/");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f7fa",
      }}
    >
      <div
        style={{
          width: 420,
          background: "#fff",
          padding: 40,
          borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,.1)",
        }}
      >
        <h1>Welkom bij TR-FLEX Planner</h1>

        <p>Kies hieronder je eigen wachtwoord.</p>

        <form onSubmit={opslaan}>
          <input
            type="password"
            placeholder="Nieuw wachtwoord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: 12,
              marginTop: 20,
              marginBottom: 20,
            }}
          />

          <button
            className="new-btn"
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading ? "Opslaan..." : "Wachtwoord instellen"}
          </button>
        </form>
      </div>
    </div>
  );
}