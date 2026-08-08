import Papa from "papaparse";

export default function CsvImport({ onImport }) {
  function handleFile(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,

      complete(results) {
        console.log(results.data);
        onImport?.(results.data);
      },

      error(error) {
        alert("Fout bij het inlezen van het CSV-bestand.");
        console.error(error);
      },
    });
  }

  return (
    <div
      style={{
        background: "#ffffff",
        padding: "25px",
        borderRadius: "16px",
        border: "2px dashed #16a34a",
        textAlign: "center",
      }}
    >
      <h3
        style={{
          color: "#15803d",
          marginTop: 0,
        }}
      >
        📥 CSV importeren
      </h3>

      <p
        style={{
          color: "#64748b",
        }}
      >
        Kies een CSV-bestand met medewerkers, planning of uren.
      </p>

      <input
        type="file"
        accept=".csv"
        onChange={handleFile}
        style={{
          marginTop: "15px",
        }}
      />
    </div>
  );
}
