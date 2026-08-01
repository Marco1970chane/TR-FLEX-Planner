import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import useAuth from "../hooks/useAuth";

export default function Header() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const [tijd, setTijd] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTijd(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  const initial =
    (profile?.naam || user?.email || "?")
      .charAt(0)
      .toUpperCase();

  return (
    <header className="header-bar">
      <div>
        <h1>🚢 TR-FLEX Planner</h1>

        <p>
          {tijd.toLocaleDateString("nl-NL", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          {" • "}
          {tijd.toLocaleTimeString("nl-NL")}
        </p>
      </div>

      <div className="header-right">
        <button className="icon-btn">🔔</button>

        <div className="user-card">
          <div className="avatar">
            {initial}
          </div>

          <div>
            <strong>
              {profile?.naam || user?.email}
            </strong>

            <div className="user-role">
              {profile?.rol || "Gebruiker"}
            </div>
          </div>
        </div>

        <button
          className="new-btn"
          onClick={logout}
        >
          🚪 Uitloggen
        </button>
      </div>
    </header>
  );
}