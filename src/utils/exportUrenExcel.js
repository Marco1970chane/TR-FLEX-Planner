import * as XLSX from "xlsx";

export function exportUrenExcel(uren) {
  if (!uren || uren.length === 0) {
    alert("Er zijn geen urenregistraties om te exporteren.");
    return;
  }

  const gegevens = uren.map((u) => ({
    Datum: u.datum || "",
    Medewerker: u.medewerker || "",
    Terminal: u.terminal || "",
    Begintijd: u.begintijd || "",
    Eindtijd: u.eindtijd || "",
    "Pauze (min)": Number(u.pauze || 0),
    "Gewerkte uren": Number(u.uren || 0),
    Status: u.status || "Open",
  }));

  const worksheet =
    XLSX.utils.json_to_sheet(gegevens);

  worksheet["!cols"] = [
    { wch: 14 },
    { wch: 25 },
    { wch: 25 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 18 },
    { wch: 16 },
  ];

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Urenregistratie"
  );

  XLSX.writeFile(
    workbook,
    `urenregistratie-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`
  );
}