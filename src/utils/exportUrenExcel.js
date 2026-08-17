// src/utils/exportUrenExcel.js

import * as XLSX from "xlsx";

export function exportUrenExcel(uren) {
  if (!uren || uren.length === 0) {
    alert(
      "Er zijn geen urenregistraties om te exporteren."
    );
    return;
  }

  // ==========================================
  // STATUS
  // ==========================================

  function isGoedgekeurd(status) {
    const waarde =
      (status || "")
        .toLowerCase()
        .trim();

    return (
      waarde === "goedgekeurd" ||
      waarde === "akkoord" ||
      waarde === "voltooid"
    );
  }

  function isOpen(status) {
    return (
      (status || "")
        .toLowerCase()
        .trim() === "open"
    );
  }

  function isAfgekeurd(status) {
    return (
      (status || "")
        .toLowerCase()
        .trim() === "afgekeurd"
    );
  }

  // ==========================================
  // TOTALEN
  // ==========================================

  const totaalUren = uren.reduce(
    (totaal, u) =>
      totaal + Number(u.uren || 0),
    0
  );

  const goedgekeurdeUren =
    uren
      .filter((u) =>
        isGoedgekeurd(u.status)
      )
      .reduce(
        (totaal, u) =>
          totaal +
          Number(u.uren || 0),
        0
      );

  const openUren =
    uren
      .filter((u) =>
        isOpen(u.status)
      )
      .reduce(
        (totaal, u) =>
          totaal +
          Number(u.uren || 0),
        0
      );

  const afgekeurdeUren =
    uren
      .filter((u) =>
        isAfgekeurd(u.status)
      )
      .reduce(
        (totaal, u) =>
          totaal +
          Number(u.uren || 0),
        0
      );

  const medewerkers = [
    ...new Set(
      uren
        .map((u) => u.medewerker)
        .filter(Boolean)
    ),
  ];

  const terminals = [
    ...new Set(
      uren
        .map((u) => u.terminal)
        .filter(Boolean)
    ),
  ];

  // ==========================================
  // TABBLAD 1 - SAMENVATTING
  // ==========================================

  const samenvatting = [
    {
      Onderdeel: "Totaal uren",
      Waarde: Number(
        totaalUren.toFixed(2)
      ),
    },
    {
      Onderdeel: "Goedgekeurde uren",
      Waarde: Number(
        goedgekeurdeUren.toFixed(2)
      ),
    },
    {
      Onderdeel: "Open uren",
      Waarde: Number(
        openUren.toFixed(2)
      ),
    },
    {
      Onderdeel: "Afgekeurde uren",
      Waarde: Number(
        afgekeurdeUren.toFixed(2)
      ),
    },
    {
      Onderdeel: "Aantal registraties",
      Waarde: uren.length,
    },
    {
      Onderdeel: "Aantal medewerkers",
      Waarde: medewerkers.length,
    },
    {
      Onderdeel: "Aantal terminals",
      Waarde: terminals.length,
    },
    {
      Onderdeel: "Exportdatum",
      Waarde:
        new Date().toLocaleDateString(
          "nl-NL"
        ),
    },
  ];

  // ==========================================
  // TABBLAD 2 - PER MEDEWERKER
  // ==========================================

  const perMedewerker = {};

  uren.forEach((u) => {
    const naam =
      u.medewerker || "Onbekend";

    if (!perMedewerker[naam]) {
      perMedewerker[naam] = {
        Medewerker: naam,
        Registraties: 0,
        "Totaal uren": 0,
        "Goedgekeurde uren": 0,
        "Open uren": 0,
        "Afgekeurde uren": 0,
      };
    }

    perMedewerker[naam].Registraties +=
      1;

    const aantalUren =
      Number(u.uren || 0);

    perMedewerker[naam][
      "Totaal uren"
    ] += aantalUren;

    if (isGoedgekeurd(u.status)) {
      perMedewerker[naam][
        "Goedgekeurde uren"
      ] += aantalUren;
    }

    if (isOpen(u.status)) {
      perMedewerker[naam][
        "Open uren"
      ] += aantalUren;
    }

    if (isAfgekeurd(u.status)) {
      perMedewerker[naam][
        "Afgekeurde uren"
      ] += aantalUren;
    }
  });

  const medewerkerGegevens =
    Object.values(
      perMedewerker
    )
      .sort(
        (a, b) =>
          b["Totaal uren"] -
          a["Totaal uren"]
      )
      .map((item) => ({
        ...item,
        "Totaal uren": Number(
          item["Totaal uren"].toFixed(
            2
          )
        ),
        "Goedgekeurde uren":
          Number(
            item[
              "Goedgekeurde uren"
            ].toFixed(2)
          ),
        "Open uren": Number(
          item[
            "Open uren"
          ].toFixed(2)
        ),
        "Afgekeurde uren":
          Number(
            item[
              "Afgekeurde uren"
            ].toFixed(2)
          ),
      }));

  // ==========================================
  // TABBLAD 3 - DETAIL
  // ==========================================

  const detail = uren.map((u) => ({
    Datum: u.datum || "",
    Medewerker:
      u.medewerker || "",
    Terminal:
      u.terminal || "",
    Begintijd:
      u.begintijd || "",
    Eindtijd:
      u.eindtijd || "",
    "Pauze (min)": Number(
      u.pauze || 0
    ),
    "Gewerkte uren": Number(
      u.uren || 0
    ),
    Status:
      u.status || "Open",
  }));

  // ==========================================
  // WORKSHEETS
  // ==========================================

  const wsSamenvatting =
    XLSX.utils.json_to_sheet(
      samenvatting
    );

  const wsMedewerkers =
    XLSX.utils.json_to_sheet(
      medewerkerGegevens
    );

  const wsDetail =
    XLSX.utils.json_to_sheet(
      detail
    );

  // ==========================================
  // KOLOMBREEDTES
  // ==========================================

  wsSamenvatting["!cols"] = [
    {
      wch: 28,
    },
    {
      wch: 20,
    },
  ];

  wsMedewerkers["!cols"] = [
    {
      wch: 25,
    },
    {
      wch: 15,
    },
    {
      wch: 16,
    },
    {
      wch: 20,
    },
    {
      wch: 15,
    },
    {
      wch: 20,
    },
  ];

  wsDetail["!cols"] = [
    {
      wch: 14,
    },
    {
      wch: 25,
    },
    {
      wch: 25,
    },
    {
      wch: 12,
    },
    {
      wch: 12,
    },
    {
      wch: 14,
    },
    {
      wch: 18,
    },
    {
      wch: 16,
    },
  ];

  // ==========================================
  // WORKBOOK
  // ==========================================

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    wsSamenvatting,
    "Samenvatting"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    wsMedewerkers,
    "Per medewerker"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    wsDetail,
    "Detail"
  );

  // ==========================================
  // BESTANDSNAAM
  // ==========================================

  const datum =
    new Date()
      .toISOString()
      .slice(0, 10);

  XLSX.writeFile(
    workbook,
    `urenrapportage-${datum}.xlsx`
  );
}