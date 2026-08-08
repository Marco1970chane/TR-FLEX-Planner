import { supabase } from "../services/supabase";
import CsvImport from "../components/import/CsvImport";

export default function ImportExport() {
  async function importMedewerkers(data) {
    if (!data || data.length === 0) {
      alert("Geen gegevens gevonden.");
      return;
    }

    const medewerkers = data
      .filter(
        (row) =>
          row["Voornaam"] &&
          row["Achternaam"]
      )
      .map((row) => {
        // Email netjes uit Markdown of gewone tekst halen
        let email = row["E-mail"] || "";

        const markdownMatch = email.match(/\((mailto:)?(.*?)\)/);

        if (markdownMatch) {
          email = markdownMatch[2];
        }

        email = email
          .replace("[", "")
          .replace("]", "")
          .trim();

        return {
          naam: `${row["Voornaam"]} ${row["Achternaam"]}`.trim(),

          email,

          telefoon:
            row["Telefoonnummer"] || "",

          functie:
            row["Dienstverband"] || "",

          terminal: "",

          status: "Beschikbaar",

          rol: "medewerker",

          actief:
            (row["Uit dienst"] || "")
              .toLowerCase() !== "ja",
        };
      });

    const { error } = await supabase
      .from("medewerkers")
      .insert(medewerkers);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert(
      `✅ ${medewerkers.length} medewerkers geïmporteerd.`
    );
  }

  return (
    <div className="table">
      <h1
        style={{
          color: "#15803d",
          marginBottom: "25px",
        }}
      >
        📥 Import / Export
      </h1>

      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "16px",
          boxShadow: "0 6px 18px rgba(0,0,0,.08)",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            color: "#166534",
          }}
        >
          👷 Medewerkers importeren
        </h3>

        <p
          style={{
            color: "#64748b",
            marginBottom: "20px",
          }}
        >
          Importeer een CSV-bestand vanuit Excel.
        </p>

        <CsvImport
          onImport={importMedewerkers}
        />
      </div>
    </div>
  );
}