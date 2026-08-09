// src/pages/ImportExport.jsx

import { supabase } from "../services/supabase";
import CsvImport from "../components/import/CsvImport";

export default function ImportExport() {
  // =========================================================
  // EMAIL OPSCHONEN
  // =========================================================

  function maakEmailSchoon(waarde) {
    if (!waarde) return "";

    let email = String(waarde).trim();

    // Markdown:
    // [naam@email.nl](mailto:naam@email.nl)
    const markdownMatch = email.match(
      /\[([^\]]+)\]\((?:mailto:)?([^)]+)\)/
    );

    if (markdownMatch) {
      email = markdownMatch[2];
    }

    // [naam@email.nl]
    email = email.replace(/^\[/, "");
    email = email.replace(/\]$/, "");

    // mailto:
    email = email.replace(/^mailto:/i, "");

    return email.trim();
  }

  // =========================================================
  // MEDEWERKERS IMPORTEREN
  // =========================================================

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
        return {
          naam:
            `${row["Voornaam"]} ${row["Achternaam"]}`.trim(),

          email: maakEmailSchoon(
            row["E-mail"]
          ),

          telefoon:
            row["Telefoonnummer"] || "",

          functie:
            row["Dienstverband"] || "",

          terminal: "",

          status: "Beschikbaar",

          rol: "medewerker",

          actief:
            String(
              row["Uit dienst"] || ""
            ).toLowerCase() !== "ja",
        };
      });

    if (medewerkers.length === 0) {
      alert(
        "Geen geldige medewerkers gevonden."
      );
      return;
    }

    // Bestaande medewerkers ophalen
    const { data: bestaande, error: laadError } =
      await supabase
        .from("medewerkers")
        .select("naam,email");

    if (laadError) {
      console.error(laadError);
      alert(laadError.message);
      return;
    }

    const bestaandeEmails = new Set(
      (bestaande || [])
        .filter((m) => m.email)
        .map((m) =>
          m.email.toLowerCase().trim()
        )
    );

    const bestaandeNamen = new Set(
      (bestaande || []).map((m) =>
        m.naam.toLowerCase().trim()
      )
    );

    // Dubbele medewerkers voorkomen
    const nieuweMedewerkers =
      medewerkers.filter((medewerker) => {
        const email =
          medewerker.email
            ?.toLowerCase()
            .trim();

        const naam =
          medewerker.naam
            .toLowerCase()
            .trim();

        if (
          email &&
          bestaandeEmails.has(email)
        ) {
          return false;
        }

        if (bestaandeNamen.has(naam)) {
          return false;
        }

        return true;
      });

    if (nieuweMedewerkers.length === 0) {
      alert(
        "ℹ️ Alle medewerkers bestaan al. Er is niets geïmporteerd."
      );
      return;
    }

    const { error } = await supabase
      .from("medewerkers")
      .insert(nieuweMedewerkers);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert(
      `✅ ${nieuweMedewerkers.length} nieuwe medewerkers geïmporteerd.`
    );
  }

  // =========================================================
  // TERMINALS IMPORTEREN
  // =========================================================

  async function importTerminals(data) {
    if (!data || data.length === 0) {
      alert("Geen terminals gevonden.");
      return;
    }

    const terminals = data
      .map((row) => {
        const naam =
          row["naam"] ||
          row["Naam"] ||
          row["Terminal"] ||
          row["terminal"] ||
          "";

        const locatie =
          row["locatie"] ||
          row["Locatie"] ||
          "Rotterdam";

        const status =
          row["status"] ||
          row["Status"] ||
          "Actief";

        return {
          naam: String(naam).trim(),

          locatie:
            String(locatie).trim(),

          status:
            String(status).trim(),
        };
      })
      .filter(
        (terminal) =>
          terminal.naam
      );

    if (terminals.length === 0) {
      alert(
        "Geen geldige terminals gevonden."
      );
      return;
    }

    // Bestaande terminals ophalen
    const {
      data: bestaande,
      error: laadError,
    } = await supabase
      .from("terminals")
      .select("naam");

    if (laadError) {
      console.error(laadError);
      alert(laadError.message);
      return;
    }

    const bestaandeNamen = new Set(
      (bestaande || []).map((terminal) =>
        terminal.naam
          .toLowerCase()
          .trim()
      )
    );

    const nieuweTerminals =
      terminals.filter(
        (terminal) =>
          !bestaandeNamen.has(
            terminal.naam
              .toLowerCase()
              .trim()
          )
      );

    if (nieuweTerminals.length === 0) {
      alert(
        "ℹ️ Alle terminals bestaan al. Er is niets geïmporteerd."
      );
      return;
    }

    const { error } = await supabase
      .from("terminals")
      .insert(nieuweTerminals);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert(
      `✅ ${nieuweTerminals.length} nieuwe terminals geïmporteerd.`
    );
  }

  // =========================================================
  // TIJD OPSCHONEN
  // =========================================================

  function maakTijdSchoon(waarde) {
    if (!waarde) return "";

    let tijd = String(waarde).trim();

    // Bijvoorbeeld 07.00 → 07:00
    tijd = tijd.replace(".", ":");

    // Bijvoorbeeld 7:00 → 07:00
    const match = tijd.match(
      /^(\d{1,2}):(\d{2})$/
    );

    if (match) {
      const uren =
        match[1].padStart(2, "0");

      const minuten = match[2];

      return `${uren}:${minuten}`;
    }

    return tijd;
  }

  // =========================================================
  // UREN BEREKENEN
  // =========================================================

  function berekenUren(
    begintijd,
    eindtijd,
    pauze
  ) {
    if (!begintijd || !eindtijd) {
      return 0;
    }

    const [startUur, startMinuut] =
      begintijd.split(":").map(Number);

    const [eindUur, eindMinuut] =
      eindtijd.split(":").map(Number);

    if (
      Number.isNaN(startUur) ||
      Number.isNaN(startMinuut) ||
      Number.isNaN(eindUur) ||
      Number.isNaN(eindMinuut)
    ) {
      return 0;
    }

    let minuten =
      eindUur * 60 +
      eindMinuut -
      (startUur * 60 + startMinuut);

    // Nachtdienst
    if (minuten < 0) {
      minuten += 24 * 60;
    }

    minuten -= Number(pauze) || 0;

    if (minuten < 0) {
      minuten = 0;
    }

    return Number(
      (minuten / 60).toFixed(2)
    );
  }

  // =========================================================
  // URENREGISTRATIE IMPORTEREN
  // =========================================================

  async function importUrenregistratie(
    data
  ) {
    if (!data || data.length === 0) {
      alert("Geen uren gevonden.");
      return;
    }

    const uren = data
      .map((row) => {
        const datum =
          row["datum"] ||
          row["Datum"] ||
          "";

        const medewerker =
          row["medewerker"] ||
          row["Medewerker"] ||
          "";

        const terminal =
          row["terminal"] ||
          row["Terminal"] ||
          "";

        const begintijd =
          row["begintijd"] ||
          row["Begintijd"] ||
          row["Van"] ||
          "";

        const eindtijd =
          row["eindtijd"] ||
          row["Eindtijd"] ||
          row["Tot"] ||
          "";

        const pauzeWaarde =
          row["pauze"] ??
          row["Pauze"] ??
          0;

        const pauze =
          Number(pauzeWaarde) || 0;

        const netteBegin =
          maakTijdSchoon(begintijd);

        const netteEind =
          maakTijdSchoon(eindtijd);

        let uren =
          row["uren"] ||
          row["Uren"] ||
          "";

        // Als uren niet in CSV staan,
        // automatisch berekenen.
        if (
          !uren &&
          netteBegin &&
          netteEind
        ) {
          uren = berekenUren(
            netteBegin,
            netteEind,
            pauze
          );
        }

        return {
          datum:
            String(datum).trim(),

          medewerker:
            String(
              medewerker
            ).trim(),

          terminal:
            String(
              terminal
            ).trim(),

          begintijd:
            netteBegin,

          eindtijd:
            netteEind,

          pauze,

          uren:
            Number(uren) || 0,

          status:
            row["status"] ||
            row["Status"] ||
            "Open",
        };
      })
      .filter(
        (uur) =>
          uur.datum &&
          uur.medewerker &&
          uur.begintijd &&
          uur.eindtijd
      );

    if (uren.length === 0) {
      alert(
        "Geen geldige urenregistraties gevonden."
      );
      return;
    }

    const { error } = await supabase
      .from("urenregistratie")
      .insert(uren);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert(
      `✅ ${uren.length} urenregistraties geïmporteerd.`
    );
  }

  // =========================================================
  // PAGINA
  // =========================================================

  return (
    <div
      style={{
        background: "#f8fafc",
        minHeight: "100%",
        padding: "5px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "18px",
          padding: "30px",
          boxShadow:
            "0 8px 24px rgba(0,0,0,.08)",
          border:
            "1px solid #dcfce7",
        }}
      >
        <h1
          style={{
            marginTop: 0,
            color: "#15803d",
          }}
        >
          📥 Import / Export
        </h1>

        <p
          style={{
            color: "#64748b",
            marginBottom: "30px",
          }}
        >
          Importeer medewerkers, terminals
          en urenregistraties vanuit
          CSV-bestanden.
        </p>

        {/* =================================================
            MEDEWERKERS
        ================================================= */}

        <div
          style={{
            marginBottom: "30px",
            padding: "25px",
            borderRadius: "16px",
            border:
              "2px dashed #16a34a",
            background: "#f0fdf4",
          }}
        >
          <h2
            style={{
              color: "#15803d",
              marginTop: 0,
            }}
          >
            👷 Medewerkers importeren
          </h2>

          <p
            style={{
              color: "#64748b",
            }}
          >
            CSV met Voornaam, Achternaam,
            E-mail, Telefoonnummer en
            Dienstverband.
          </p>

          <CsvImport
            onImport={
              importMedewerkers
            }
          />
        </div>

        {/* =================================================
            TERMINALS
        ================================================= */}

        <div
          style={{
            marginBottom: "30px",
            padding: "25px",
            borderRadius: "16px",
            border:
              "2px dashed #16a34a",
            background: "#f0fdf4",
          }}
        >
          <h2
            style={{
              color: "#15803d",
              marginTop: 0,
            }}
          >
            🏭 Terminals importeren
          </h2>

          <p
            style={{
              color: "#64748b",
            }}
          >
            CSV met minimaal de kolom{" "}
            <strong>naam</strong>. Locatie
            en status zijn optioneel.
          </p>

          <CsvImport
            onImport={
              importTerminals
            }
          />
        </div>

        {/* =================================================
            URENREGISTRATIE
        ================================================= */}

        <div
          style={{
            padding: "25px",
            borderRadius: "16px",
            border:
              "2px dashed #16a34a",
            background: "#f0fdf4",
          }}
        >
          <h2
            style={{
              color: "#15803d",
              marginTop: 0,
            }}
          >
            ⏱ Urenregistratie importeren
          </h2>

          <p
            style={{
              color: "#64748b",
              lineHeight: 1.6,
            }}
          >
            CSV met datum, medewerker,
            terminal, begintijd, eindtijd
            en pauze.
            <br />
            De gewerkte uren worden
            automatisch berekend wanneer
            deze niet in het CSV-bestand
            staan.
          </p>

          <CsvImport
            onImport={
              importUrenregistratie
            }
          />
        </div>
      </div>
    </div>
  );
}