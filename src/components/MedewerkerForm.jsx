// src/components/MedewerkerForm.jsx

import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const statussen = [
  "Beschikbaar",
  "Ingepland",
  "Training",
  "Ziek",
  "Verlof",
];

export default function MedewerkerForm({
  medewerker,
  onSaved,
}) {
  const [naam, setNaam] = useState("");
  const [functie, setFunctie] = useState("");
  const [terminal, setTerminal] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] =
    useState("Beschikbaar");
  const [rol, setRol] =
    useState("medewerker");
  const [actief, setActief] =
    useState(true);
  const [opslaanBezig, setOpslaanBezig] =
    useState(false);

  // ==========================================
  // BESTAANDE MEDEWERKER LADEN
  // ==========================================

  useEffect(() => {
    if (!medewerker) {
      setNaam("");
      setFunctie("");
      setTerminal("");
      setTelefoon("");
      setEmail("");
      setStatus("Beschikbaar");
      setRol("medewerker");
      setActief(true);
      return;
    }

    setNaam(
      medewerker.naam || ""
    );

    setFunctie(
      medewerker.functie || ""
    );

    setTerminal(
      medewerker.terminal || ""
    );

    setTelefoon(
      medewerker.telefoon || ""
    );

    setEmail(
      medewerker.email || ""
    );

    setStatus(
      medewerker.status ||
        "Beschikbaar"
    );

    setRol(
      medewerker.rol ||
        "medewerker"
    );

    setActief(
      medewerker.actief ?? true
    );
  }, [medewerker]);

  // ==========================================
  // OPSLAAN
  // ==========================================

  async function opslaan(e) {
    e.preventDefault();

    if (!naam.trim()) {
      alert(
        "Vul de naam van de medewerker in."
      );
      return;
    }

    setOpslaanBezig(true);

    const gegevens = {
      naam: naam.trim(),
      functie: functie.trim(),
      terminal: terminal.trim(),
      telefoon: telefoon.trim(),
      email: email.trim(),
      status,
      rol,
      actief,
    };

    try {
      let error;

      if (medewerker?.id) {
        const result =
          await supabase
            .from("medewerkers")
            .update(gegevens)
            .eq(
              "id",
              medewerker.id
            );

        error = result.error;
      } else {
        const result =
          await supabase
            .from("medewerkers")
            .insert([
              gegevens,
            ]);

        error = result.error;
      }

      if (error) {
        throw error;
      }

      alert(
        medewerker?.id
          ? "✅ Medewerker bijgewerkt."
          : "✅ Medewerker toegevoegd."
      );

      onSaved?.();
    } catch (error) {
      console.error(
        "Fout bij opslaan medewerker:",
        error
      );

      alert(
        error.message ||
          "Er is iets misgegaan bij het opslaan."
      );
    } finally {
      setOpslaanBezig(false);
    }
  }

  // ==========================================
  // STIJLEN
  // ==========================================

  const inputStyle = {
    width: "100%",
    minHeight: "44px",
    padding: "10px 12px",
    border:
      "1px solid #cbd5e1",
    borderRadius: "8px",
    boxSizing: "border-box",
    fontSize: "14px",
    background: "#ffffff",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "5px",
    color: "#334155",
    fontSize: "13px",
    fontWeight: "500",
  };

  const veldStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "0",
  };

  // ==========================================
  // FORMULIER
  // ==========================================

  return (
    <form
      onSubmit={opslaan}
      style={{
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        background: "#ffffff",
        borderRadius: "14px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        overflowX: "hidden",
      }}
    >
      {/* TITEL */}

      <h2
        style={{
          margin: "0 0 2px 0",
          color: "#0f172a",
          fontSize: "19px",
          lineHeight: "1.3",
        }}
      >
        {medewerker
          ? "✏️ Medewerker bewerken"
          : "👷 Nieuwe medewerker"}
      </h2>

      {/* NAAM */}

      <div style={veldStyle}>
        <label style={labelStyle}>
          Naam
        </label>

        <input
          required
          type="text"
          value={naam}
          onChange={(e) =>
            setNaam(e.target.value)
          }
          style={inputStyle}
          autoComplete="name"
        />
      </div>

      {/* FUNCTIE */}

      <div style={veldStyle}>
        <label style={labelStyle}>
          Functie
        </label>

        <input
          type="text"
          value={functie}
          onChange={(e) =>
            setFunctie(
              e.target.value
            )
          }
          style={inputStyle}
        />
      </div>

      {/* TERMINAL */}

      <div style={veldStyle}>
        <label style={labelStyle}>
          Terminal
        </label>

        <input
          type="text"
          placeholder="Bijvoorbeeld Wilmar, Shell"
          value={terminal}
          onChange={(e) =>
            setTerminal(
              e.target.value
            )
          }
          style={inputStyle}
        />
      </div>

      {/* TELEFOON */}

      <div style={veldStyle}>
        <label style={labelStyle}>
          Telefoon
        </label>

        <input
          type="tel"
          value={telefoon}
          onChange={(e) =>
            setTelefoon(
              e.target.value
            )
          }
          style={inputStyle}
          autoComplete="tel"
        />
      </div>

      {/* EMAIL */}

      <div style={veldStyle}>
        <label style={labelStyle}>
          E-mailadres
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          style={inputStyle}
          autoComplete="email"
        />
      </div>

      {/* STATUS */}

      <div style={veldStyle}>
        <label style={labelStyle}>
          Status
        </label>

        <select
          value={status}
          onChange={(e) =>
            setStatus(
              e.target.value
            )
          }
          style={inputStyle}
        >
          {statussen.map((s) => (
            <option
              key={s}
              value={s}
            >
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* ROL */}

      <div style={veldStyle}>
        <label style={labelStyle}>
          Rol
        </label>

        <select
          value={rol}
          onChange={(e) =>
            setRol(
              e.target.value
            )
          }
          style={inputStyle}
        >
          <option value="admin">
            Admin
          </option>

          <option value="operations">
            Operations
          </option>

          <option value="planner">
            Planner
          </option>

          <option value="hr">
            HR
          </option>

          <option value="medewerker">
            Medewerker
          </option>
        </select>
      </div>

      {/* ACTIEF */}

      <label
        htmlFor="actief"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          minHeight: "44px",
          marginTop: "2px",
          padding: "4px 0",
          cursor: "pointer",
          color: "#334155",
          fontSize: "14px",
          fontWeight: "600",
        }}
      >
        <input
          type="checkbox"
          id="actief"
          checked={actief}
          onChange={(e) =>
            setActief(
              e.target.checked
            )
          }
          style={{
            width: "20px",
            height: "20px",
            margin: 0,
            flexShrink: 0,
            accentColor:
              "#2563eb",
            cursor: "pointer",
          }}
        />

        <span>
          Actieve medewerker
        </span>
      </label>

      {/* OPSLAAN */}

      <button
        className="new-btn"
        type="submit"
        disabled={opslaanBezig}
        style={{
          width: "100%",
          minHeight: "46px",
          marginTop: "2px",
          background:
            opslaanBezig
              ? "#94a3b8"
              : "#2563eb",
          color: "#ffffff",
          border: "none",
          borderRadius: "8px",
          fontWeight: "700",
          cursor:
            opslaanBezig
              ? "wait"
              : "pointer",
        }}
      >
        {opslaanBezig
          ? "⏳ Opslaan..."
          : medewerker
          ? "💾 Opslaan"
          : "👷 Medewerker toevoegen"}
      </button>
    </form>
  );
}