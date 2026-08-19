// src/pages/ZZPFacturen.jsx

import { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "../services/supabase";

// ============================================================
// ZZP FACTUREN
// ============================================================

export default function ZZPFacturen() {
  // ============================================================
  // STATE
  // ============================================================

  const [facturen, setFacturen] = useState([]);
  const [regels, setRegels] = useState([]);

  const [laden, setLaden] = useState(true);
  const [actieBezig, setActieBezig] = useState(false);

  const [zoekterm, setZoekterm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [toonForm, setToonForm] = useState(false);
  const [toonImport, setToonImport] = useState(false);
  const [toonDetail, setToonDetail] = useState(false);
  const [toonControle, setToonControle] = useState(false);

  const [geselecteerdeFactuur, setGeselecteerdeFactuur] =
    useState(null);

  const [controleResultaat, setControleResultaat] =
    useState(null);

  const [controleBezig, setControleBezig] = useState(false);

  const fileInputRef = useRef(null);

  // ============================================================
  // NIEUWE FACTUUR
  // ============================================================

  const legeRegel = {
    terminal: "",
    periode_van: "",
    periode_tot: "",
    uren: "",
    uurprijs: "",
    reiskosten: "",
  };

  const legeFormulier = {
    zzp_naam: "",
    factuurnummer: "",
    factuurdatum: "",
    periode_van: "",
    periode_tot: "",
    btw_percentage: 21,
    regels: [{ ...legeRegel }],
  };

  const [formulier, setFormulier] = useState(legeFormulier);

  // ============================================================
  // IMPORT STATE
  // ============================================================

  const [importBestand, setImportBestand] = useState(null);
  const [importRijen, setImportRijen] = useState([]);
  const [importFouten, setImportFouten] = useState([]);
  const [importBezig, setImportBezig] = useState(false);

  // ============================================================
  // LADEN
  // ============================================================

  useEffect(() => {
    laadFacturen();
  }, []);

  async function laadFacturen() {
    setLaden(true);

    try {
      const {
        data: factuurData,
        error: factuurError,
      } = await supabase
        .from("zzp_facturen")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (factuurError) {
        throw factuurError;
      }

      const factuurLijst = factuurData || [];

      let regelLijst = [];

      const {
        data: regelData,
        error: regelError,
      } = await supabase
        .from("zzp_factuur_regels")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (regelError) {
        console.warn(
          "Regels konden niet worden geladen:",
          regelError
        );
      } else {
        regelLijst = regelData || [];
      }

      setFacturen(factuurLijst);
      setRegels(regelLijst);
    } catch (error) {
      console.error(
        "Fout bij laden ZZP-facturen:",
        error
      );

      alert(
        error.message ||
          "De ZZP-facturen konden niet worden geladen."
      );
    } finally {
      setLaden(false);
    }
  }

  // ============================================================
  // REGELS BIJ FACTUUR
  // ============================================================

  function regelsVoorFactuur(factuurId) {
    return regels.filter(
      (regel) =>
        String(regel.factuur_id) ===
        String(factuurId)
    );
  }

  // ============================================================
  // BEREKENINGEN
  // ============================================================

  function berekenRegel(regel) {
    const uren = Number(regel.uren || 0);
    const uurprijs = Number(
      regel.uurprijs || 0
    );
    const reiskosten = Number(
      regel.reiskosten || 0
    );

    const urenBedrag =
      uren * uurprijs;

    const totaalExcl =
      urenBedrag + reiskosten;

    return {
      uren,
      uurprijs,
      reiskosten,
      urenBedrag,
      totaalExcl,
    };
  }

  function berekenFactuur(factuur) {
    const factuurRegels =
      regelsVoorFactuur(factuur.id);

    let uren = 0;
    let urenBedrag = 0;
    let reiskosten = 0;

    factuurRegels.forEach((regel) => {
      const berekend =
        berekenRegel(regel);

      uren += berekend.uren;
      urenBedrag +=
        berekend.urenBedrag;
      reiskosten +=
        berekend.reiskosten;
    });

    // Als er geen regels zijn,
    // gebruiken we de waarden van de factuur zelf.
    if (factuurRegels.length === 0) {
      uren = Number(
        factuur.uren_factuur || 0
      );

      urenBedrag = Number(
        factuur.bedrag_excl_btw || 0
      );

      reiskosten = Number(
        factuur.reiskosten || 0
      );
    }

    const excl =
      urenBedrag + reiskosten;

    const btwPercentage =
      Number(
        factuur.btw_percentage || 21
      );

    const btw =
      excl *
      (btwPercentage / 100);

    const incl =
      excl + btw;

    return {
      uren,
      urenBedrag,
      reiskosten,
      excl,
      btw,
      incl,
    };
  }

  // ============================================================
  // STATUS
  // ============================================================

  function normaleStatus(status) {
    return (
      status || "Nieuw"
    )
      .toString()
      .toLowerCase()
      .trim();
  }

  function statusKleur(status) {
    const waarde =
      normaleStatus(status);

    if (
      waarde === "goedgekeurd" ||
      waarde === "akkoord"
    ) {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    if (
      waarde === "afgekeurd"
    ) {
      return {
        background: "#fee2e2",
        color: "#991b1b",
      };
    }

    if (
      waarde === "betaald"
    ) {
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      };
    }

    return {
      background: "#fef3c7",
      color: "#92400e",
    };
  }

  // ============================================================
  // FILTER
  // ============================================================

  const gefilterd = useMemo(() => {
    const zoek =
      zoekterm
        .toLowerCase()
        .trim();

    return facturen.filter(
      (factuur) => {
        const naam =
          (
            factuur.zzp_naam || ""
          ).toLowerCase();

        const nummer =
          (
            factuur.factuurnummer ||
            ""
          ).toLowerCase();

        const status =
          (
            factuur.status || ""
          ).toLowerCase();

        const komtVoor =
          !zoek ||
          naam.includes(zoek) ||
          nummer.includes(zoek) ||
          status.includes(zoek);

        const statusGoed =
          !statusFilter ||
          normaleStatus(
            factuur.status
          ) ===
            statusFilter
              .toLowerCase();

        return (
          komtVoor &&
          statusGoed
        );
      }
    );
  }, [
    facturen,
    zoekterm,
    statusFilter,
  ]);

  // ============================================================
  // TOTALEN
  // ============================================================

  const totaalFacturen =
    facturen.length;

  const nieuweFacturen =
    facturen.filter(
      (f) =>
        normaleStatus(
          f.status
        ) === "nieuw"
    ).length;

  const goedgekeurdeFacturen =
    facturen.filter(
      (f) =>
        normaleStatus(
          f.status
        ) === "goedgekeurd" ||
        normaleStatus(
          f.status
        ) === "akkoord"
    ).length;

  const afgekeurdeFacturen =
    facturen.filter(
      (f) =>
        normaleStatus(
          f.status
        ) === "afgekeurd"
    ).length;

  const totaalBedrag = facturen.reduce(
    (totaal, factuur) => {
      return (
        totaal +
        Number(
          factuur.bedrag_incl_btw ||
            factuur.totaal_bedrag ||
            factuur.totaal_incl_btw ||
            0
        )
      );
    },
    0
  );

  const totaalReiskosten =
    facturen.reduce(
      (totaal, factuur) => {
        return (
          totaal +
          Number(
            factuur.reiskosten || 0
          )
        );
      },
      0
    );

  // ============================================================
  // NIEUWE FACTUUR OPENEN
  // ============================================================

  function openNieuweFactuur() {
    setFormulier({
      ...legeFormulier,
      regels: [{ ...legeRegel }],
    });

    setGeselecteerdeFactuur(null);
    setToonForm(true);
  }

  // ============================================================
  // FACTUUR BEWERKEN
  // ============================================================

  function openBewerken(factuur) {
    const factuurRegels =
      regelsVoorFactuur(
        factuur.id
      );

    setFormulier({
      zzp_naam:
        factuur.zzp_naam || "",
      factuurnummer:
        factuur.factuurnummer || "",
      factuurdatum:
        factuur.factuurdatum || "",
      periode_van:
        factuur.periode_van || "",
      periode_tot:
        factuur.periode_tot || "",
      btw_percentage:
        Number(
          factuur.btw_percentage || 21
        ),
      regels:
        factuurRegels.length > 0
          ? factuurRegels.map(
              (regel) => ({
                terminal:
                  regel.terminal || "",
                periode_van:
                  regel.periode_van ||
                  "",
                periode_tot:
                  regel.periode_tot ||
                  "",
                uren:
                  regel.uren ?? "",
                uurprijs:
                  regel.uurprijs ??
                  "",
                reiskosten:
                  regel.reiskosten ??
                  "",
              })
            )
          : [
              {
                terminal:
                  factuur.terminal ||
                  "",
                periode_van:
                  factuur.periode_van ||
                  "",
                periode_tot:
                  factuur.periode_tot ||
                  "",
                uren:
                  factuur.uren_factuur ??
                  "",
                uurprijs:
                  factuur.uurtarief ??
                  "",
                reiskosten:
                  factuur.reiskosten ??
                  "",
              },
            ],
    });

    setGeselecteerdeFactuur(
      factuur
    );

    setToonForm(true);
  }

  // ============================================================
  // REGEL TOEVOEGEN
  // ============================================================

  function voegRegelToe() {
    setFormulier(
      (vorige) => ({
        ...vorige,
        regels: [
          ...vorige.regels,
          { ...legeRegel },
        ],
      })
    );
  }

  // ============================================================
  // REGEL VERWIJDEREN
  // ============================================================

  function verwijderRegel(index) {
    if (
      formulier.regels.length === 1
    ) {
      return;
    }

    setFormulier(
      (vorige) => ({
        ...vorige,
        regels:
          vorige.regels.filter(
            (_, i) =>
              i !== index
          ),
      })
    );
  }

  // ============================================================
  // REGEL WIJZIGEN
  // ============================================================

  function wijzigRegel(
    index,
    veld,
    waarde
  ) {
    setFormulier(
      (vorige) => ({
        ...vorige,
        regels:
          vorige.regels.map(
            (regel, i) =>
              i === index
                ? {
                    ...regel,
                    [veld]:
                      waarde,
                  }
                : regel
          ),
      })
    );
  }

  // ============================================================
  // FORMULIER WIJZIGEN
  // ============================================================

  function wijzigFormulier(
    veld,
    waarde
  ) {
    setFormulier(
      (vorige) => ({
        ...vorige,
        [veld]: waarde,
      })
    );
  }

  // ============================================================
  // FORMULIER OPSLAAN
  // ============================================================

  async function slaFactuurOp(
    e
  ) {
    e.preventDefault();

    if (
      !formulier.zzp_naam.trim()
    ) {
      alert(
        "Vul de naam van de ZZP'er in."
      );
      return;
    }

    if (
      !formulier.factuurnummer.trim()
    ) {
      alert(
        "Vul het factuurnummer in."
      );
      return;
    }

    if (
      !formulier.factuurdatum
    ) {
      alert(
        "Vul de factuurdatum in."
      );
      return;
    }

    const geldigeRegels =
      formulier.regels.filter(
        (regel) =>
          regel.terminal ||
          Number(regel.uren) > 0 ||
          Number(
            regel.reiskosten
          ) > 0
      );

    if (
      geldigeRegels.length === 0
    ) {
      alert(
        "Voeg minimaal één terminal/regel toe."
      );
      return;
    }

    setActieBezig(true);

    try {
      // ========================================================
      // TOTALEN
      // ========================================================

      let totaalUren = 0;
      let totaalUrenBedrag = 0;
      let totaalReis = 0;

      geldigeRegels.forEach(
        (regel) => {
          const berekend =
            berekenRegel(
              regel
            );

          totaalUren +=
            berekend.uren;

          totaalUrenBedrag +=
            berekend.urenBedrag;

          totaalReis +=
            berekend.reiskosten;
        }
      );

      const bedragExcl =
        totaalUrenBedrag +
        totaalReis;

      const btwPercentage =
        Number(
          formulier.btw_percentage ||
            21
        );

      const btwBedrag =
        bedragExcl *
        (btwPercentage / 100);

      const bedragIncl =
        bedragExcl +
        btwBedrag;

      // ========================================================
      // DUBBEL FACTUURNUMMER
      // ========================================================

      const bestaand =
        facturen.find(
          (factuur) =>
            factuur.factuurnummer ===
              formulier.factuurnummer &&
            String(
              factuur.id
            ) !==
              String(
                geselecteerdeFactuur?.id
              )
        );

      if (bestaand) {
        const doorgaan =
          window.confirm(
            `Factuurnummer ${formulier.factuurnummer} bestaat al. Toch opslaan?`
          );

        if (!doorgaan) {
          setActieBezig(false);
          return;
        }
      }

      // ========================================================
      // FACTUUR DATA
      // Alleen bestaande kolommen gebruiken
      // ========================================================

      const factuurData = {
        zzp_naam:
          formulier.zzp_naam.trim(),

        factuurnummer:
          formulier.factuurnummer.trim(),

        factuurdatum:
          formulier.factuurdatum,

        periode_van:
          formulier.periode_van ||
          null,

        periode_tot:
          formulier.periode_tot ||
          null,

        uren_factuur:
          totaalUren,

        uren_trflex:
          0,

        uurverschil:
          0,

        uurtarief:
          totaalUren > 0
            ? totaalUrenBedrag /
              totaalUren
            : 0,

        bedrag_excl_btw:
          bedragExcl,

        btw_percentage:
          btwPercentage,

        btw_bedrag:
          btwBedrag,

        bedrag_incl_btw:
          bedragIncl,

        totaal_bedrag:
          bedragIncl,

        reiskosten:
          totaalReis,

        status:
          geselecteerdeFactuur
            ?.status ||
          "Nieuw",

        controle_opmerking:
          geselecteerdeFactuur
            ?.controle_opmerking ||
          null,

        aangemaakt_op:
          geselecteerdeFactuur
            ?.aangemaakt_op ||
          new Date().toISOString(),
      };

      let factuurId;

      // ========================================================
      // BESTAANDE FACTUUR
      // ========================================================

      if (
        geselecteerdeFactuur
      ) {
        const {
          data,
          error,
        } = await supabase
          .from("zzp_facturen")
          .update(
            factuurData
          )
          .eq(
            "id",
            geselecteerdeFactuur.id
          )
          .select()
          .single();

        if (error) {
          throw error;
        }

        factuurId = data.id;

        // Oude regels verwijderen
        const {
          error:
            verwijderError,
        } = await supabase
          .from(
            "zzp_factuur_regels"
          )
          .delete()
          .eq(
            "factuur_id",
            factuurId
          );

        if (verwijderError) {
          throw verwijderError;
        }
      }

      // ========================================================
      // NIEUWE FACTUUR
      // ========================================================

      else {
        const {
          data,
          error,
        } = await supabase
          .from("zzp_facturen")
          .insert(
            factuurData
          )
          .select()
          .single();

        if (error) {
          throw error;
        }

        factuurId = data.id;
      }

      // ========================================================
      // REGELS OPSLAAN
      // ========================================================

      const regelData =
        geldigeRegels.map(
          (regel) => {
            const berekend =
              berekenRegel(
                regel
              );

            return {
              factuur_id:
                factuurId,

              terminal:
                regel.terminal ||
                null,

              periode_van:
                regel.periode_van ||
                formulier.periode_van ||
                null,

              periode_tot:
                regel.periode_tot ||
                formulier.periode_tot ||
                null,

              uren:
                berekend.uren,

              uurprijs:
                berekend.uurprijs,

              uren_bedrag:
                berekend.urenBedrag,

              reiskosten:
                berekend.reiskosten,

              totaal_excl_btw:
                berekend.totaalExcl,
            };
          }
        );

      if (
        regelData.length > 0
      ) {
        const {
          error,
        } = await supabase
          .from(
            "zzp_factuur_regels"
          )
          .insert(
            regelData
          );

        if (error) {
          throw error;
        }
      }

      alert(
        geselecteerdeFactuur
          ? "✅ Factuur bijgewerkt."
          : "✅ Factuur opgeslagen."
      );

      setToonForm(false);
      setGeselecteerdeFactuur(
        null
      );

      await laadFacturen();
    } catch (error) {
      console.error(
        "Fout bij opslaan factuur:",
        error
      );

      alert(
        error.message ||
          "De factuur kon niet worden opgeslagen."
      );
    } finally {
      setActieBezig(false);
    }
  }

  // ============================================================
  // IMPORT BESTAND
  // ============================================================

  function openBestandKiezen() {
    fileInputRef.current?.click();
  }

  async function bestandGekozen(
    e
  ) {
    const bestand =
      e.target.files?.[0];

    if (!bestand) {
      return;
    }

    setImportBestand(
      bestand
    );

    setImportRijen([]);
    setImportFouten([]);

    try {
      const rijen =
        await leesImportBestand(
          bestand
        );

      const resultaat =
        normaliseerImportRijen(
          rijen
        );

      setImportRijen(
        resultaat.rijen
      );

      setImportFouten(
        resultaat.fouten
      );
    } catch (error) {
      console.error(
        "Importfout:",
        error
      );

      setImportFouten([
        error.message ||
          "Bestand kon niet worden gelezen.",
      ]);
    }

    e.target.value = "";
  }

  // ============================================================
  // BESTAND LEZEN
  // ============================================================

  async function leesImportBestand(
    bestand
  ) {
    const naam =
      bestand.name
        .toLowerCase();

    if (
      naam.endsWith(".csv")
    ) {
      const tekst =
        await bestand.text();

      const workbook =
        XLSX.read(
          tekst,
          {
            type: "string",
            raw: false,
          }
        );

      const eersteSheet =
        workbook.Sheets[
          workbook.SheetNames[0]
        ];

      return XLSX.utils.sheet_to_json(
        eersteSheet,
        {
          defval: "",
        }
      );
    }

    if (
      naam.endsWith(".xlsx") ||
      naam.endsWith(".xls")
    ) {
      const buffer =
        await bestand.arrayBuffer();

      const workbook =
        XLSX.read(
          buffer,
          {
            type: "array",
            cellDates: true,
          }
        );

      const eersteSheet =
        workbook.Sheets[
          workbook.SheetNames[0]
        ];

      return XLSX.utils.sheet_to_json(
        eersteSheet,
        {
          defval: "",
        }
      );
    }

    throw new Error(
      "Gebruik een Excel-bestand (.xlsx/.xls) of CSV-bestand."
    );
  }

  // ============================================================
  // KOLOMNAAM NORMALISEREN
  // ============================================================

  function normaliseerKolomNaam(
    waarde
  ) {
    return String(
      waarde || ""
    )
      .toLowerCase()
      .trim()
      .replace(
        /[\s_-]+/g,
        ""
      );
  }

  // ============================================================
  // WAARDE UIT RIJ
  // ============================================================

  function pakWaarde(
    rij,
    mogelijkeKolommen
  ) {
    const sleutels =
      Object.keys(rij);

    for (const kolom of mogelijkeKolommen) {
      const gezocht =
        normaliseerKolomNaam(
          kolom
        );

      const gevonden =
        sleutels.find(
          (sleutel) =>
            normaliseerKolomNaam(
              sleutel
            ) === gezocht
        );

      if (
        gevonden !==
        undefined
      ) {
        return rij[
          gevonden
        ];
      }
    }

    return "";
  }

  // ============================================================
  // GETAL
  // ============================================================

  function getal(
    waarde
  ) {
    if (
      waarde === null ||
      waarde === undefined ||
      waarde === ""
    ) {
      return 0;
    }

    if (
      typeof waarde ===
      "number"
    ) {
      return waarde;
    }

    let tekst =
      String(waarde)
        .replace(
          /€/g,
          ""
        )
        .replace(
          /\s/g,
          ""
        );

    // Nederlandse decimalen
    if (
      tekst.includes(",") &&
      tekst.includes(".")
    ) {
      tekst =
        tekst.replace(
          /\./g,
          ""
        );

      tekst =
        tekst.replace(
          ",",
          "."
        );
    } else if (
      tekst.includes(",")
    ) {
      tekst =
        tekst.replace(
          ",",
          "."
        );
    }

    const resultaat =
      Number(tekst);

    return Number.isFinite(
      resultaat
    )
      ? resultaat
      : 0;
  }

  // ============================================================
  // DATUM
  // ============================================================

  function datumWaarde(
    waarde
  ) {
    if (!waarde) {
      return "";
    }

    if (
      waarde instanceof Date
    ) {
      return waarde
        .toISOString()
        .substring(
          0,
          10
        );
    }

    if (
      typeof waarde ===
      "number"
    ) {
      const datum =
        XLSX.SSF.parse_date_code(
          waarde
        );

      if (datum) {
        return `${datum.y}-${String(
          datum.m
        ).padStart(
          2,
          "0"
        )}-${String(
          datum.d
        ).padStart(
          2,
          "0"
        )}`;
      }
    }

    const tekst =
      String(
        waarde
      ).trim();

    if (
      /^\d{4}-\d{2}-\d{2}$/.test(
        tekst
      )
    ) {
      return tekst;
    }

    const match =
      tekst.match(
        /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/
      );

    if (match) {
      return `${match[3]}-${String(
        match[2]
      ).padStart(
        2,
        "0"
      )}-${String(
        match[1]
      ).padStart(
        2,
        "0"
      )}`;
    }

    return tekst;
  }

  // ============================================================
  // IMPORT NORMALISEREN
  // ============================================================

  function normaliseerImportRijen(
    bronRijen
  ) {
    const rijen = [];
    const fouten = [];

    bronRijen.forEach(
      (rij, index) => {
        const regelnummer =
          index + 2;

        const zzpNaam =
          pakWaarde(
            rij,
            [
              "zzp_naam",
              "zzp naam",
              "zzper",
              "zzp'er",
              "naam",
            ]
          );

        const factuurnummer =
          pakWaarde(
            rij,
            [
              "factuurnummer",
              "factuur nummer",
              "factuur_nr",
              "nummer",
            ]
          );

        const factuurdatum =
          datumWaarde(
            pakWaarde(
              rij,
              [
                "factuurdatum",
                "factuur datum",
                "datum",
              ]
            )
          );

        const periodeVan =
          datumWaarde(
            pakWaarde(
              rij,
              [
                "periode_van",
                "periode van",
                "van",
                "startdatum",
              ]
            )
          );

        const periodeTot =
          datumWaarde(
            pakWaarde(
              rij,
              [
                "periode_tot",
                "periode tot",
                "tot",
                "einddatum",
              ]
            )
          );

        const terminal =
          pakWaarde(
            rij,
            [
              "terminal",
              "terminalnaam",
              "locatie",
            ]
          );

        const uren =
          getal(
            pakWaarde(
              rij,
              [
                "uren",
                "uren_factuur",
                "factuururen",
                "aantal uren",
              ]
            )
          );

        const uurprijs =
          getal(
            pakWaarde(
              rij,
              [
                "uurprijs",
                "uurtarief",
                "tarief",
                "prijs per uur",
              ]
            )
          );

        const reiskosten =
          getal(
            pakWaarde(
              rij,
              [
                "reiskosten",
                "reis kosten",
                "reisvergoeding",
                "kilometerkosten",
              ]
            )
          );

        const btwPercentage =
          getal(
            pakWaarde(
              rij,
              [
                "btw_percentage",
                "btw percentage",
                "btw",
              ]
            )
          ) || 21;

        const bedragExcl =
          getal(
            pakWaarde(
              rij,
              [
                "bedrag_excl_btw",
                "bedrag excl btw",
                "excl btw",
              ]
            )
          );

        if (
          !zzpNaam &&
          !factuurnummer &&
          !terminal &&
          !uren
        ) {
          return;
        }

        if (!zzpNaam) {
          fouten.push(
            `Regel ${regelnummer}: ZZP'er ontbreekt.`
          );
        }

        if (!factuurnummer) {
          fouten.push(
            `Regel ${regelnummer}: factuurnummer ontbreekt.`
          );
        }

        if (!terminal) {
          fouten.push(
            `Regel ${regelnummer}: terminal ontbreekt.`
          );
        }

        if (
          uren <= 0 &&
          bedragExcl <= 0
        ) {
          fouten.push(
            `Regel ${regelnummer}: uren of bedrag ontbreekt.`
          );
        }

        let definitiefBedrag =
          bedragExcl;

        if (
          definitiefBedrag <= 0
        ) {
          definitiefBedrag =
            uren * uurprijs +
            reiskosten;
        }

        rijen.push({
          zzp_naam:
            String(
              zzpNaam
            ).trim(),

          factuurnummer:
            String(
              factuurnummer
            ).trim(),

          factuurdatum,

          periode_van:
            periodeVan,

          periode_tot:
            periodeTot,

          terminal:
            String(
              terminal || ""
            ).trim(),

          uren,

          uurprijs,

          reiskosten,

          bedrag_excl_btw:
            definitiefBedrag,

          btw_percentage:
            btwPercentage,

          bron_regel:
            regelnummer,
        });
      }
    );

    return {
      rijen,
      fouten,
    };
  }

  // ============================================================
  // IMPORT GROEPEREN
  // ============================================================

  const importGroepen =
    useMemo(() => {
      const groepen = {};

      importRijen.forEach(
        (rij) => {
          const sleutel =
            `${rij.zzp_naam}|||${rij.factuurnummer}`;

          if (!groepen[sleutel]) {
            groepen[sleutel] = {
              zzp_naam:
                rij.zzp_naam,
              factuurnummer:
                rij.factuurnummer,
              factuurdatum:
                rij.factuurdatum,
              periode_van:
                rij.periode_van,
              periode_tot:
                rij.periode_tot,
              btw_percentage:
                rij.btw_percentage,
              regels: [],
            };
          }

          groepen[
            sleutel
          ].regels.push(rij);
        }
      );

      return Object.values(
        groepen
      );
    }, [importRijen]);

  // ============================================================
  // IMPORT OPSLAAN
  // ============================================================

  async function importeerFacturen() {
    if (
      importGroepen.length === 0
    ) {
      alert(
        "Er zijn geen geldige facturen gevonden."
      );
      return;
    }

    if (
      importFouten.length > 0
    ) {
      const doorgaan =
        window.confirm(
          `Er zijn ${importFouten.length} waarschuwingen/fouten. Toch importeren?`
        );

      if (!doorgaan) {
        return;
      }
    }

    setImportBezig(true);

    try {
      let aantal =
        0;

      for (
        const groep of importGroepen
      ) {
        // ======================================================
        // BESTAANDE FACTUUR OPZOEKEN
        // ======================================================

        const {
          data:
            bestaandeData,
          error:
            bestaandeError,
        } = await supabase
          .from(
            "zzp_facturen"
          )
          .select("*")
          .eq(
            "factuurnummer",
            groep.factuurnummer
          )
          .maybeSingle();

        if (bestaandeError) {
          throw bestaandeError;
        }

        // ======================================================
        // TOTALEN
        // ======================================================

        let totaalUren = 0;
        let totaalUrenBedrag = 0;
        let totaalReis = 0;

        groep.regels.forEach(
          (regel) => {
            totaalUren +=
              regel.uren;

            totaalUrenBedrag +=
              regel.uren *
              regel.uurprijs;

            totaalReis +=
              regel.reiskosten;
          }
        );

        const excl =
          totaalUrenBedrag +
          totaalReis;

        const btwPercentage =
          Number(
            groep.btw_percentage ||
              21
          );

        const btw =
          excl *
          (btwPercentage / 100);

        const incl =
          excl + btw;

        // ======================================================
        // FACTUUR
        // ======================================================

        const factuurData = {
          zzp_naam:
            groep.zzp_naam,

          factuurnummer:
            groep.factuurnummer,

          factuurdatum:
            groep.factuurdatum ||
            null,

          periode_van:
            groep.periode_van ||
            null,

          periode_tot:
            groep.periode_tot ||
            null,

          uren_factuur:
            totaalUren,

          uren_trflex:
            0,

          uurverschil:
            0,

          uurtarief:
            totaalUren > 0
              ? totaalUrenBedrag /
                totaalUren
              : 0,

          bedrag_excl_btw:
            excl,

          btw_percentage:
            btwPercentage,

          btw_bedrag:
            btw,

          bedrag_incl_btw:
            incl,

          totaal_bedrag:
            incl,

          reiskosten:
            totaalReis,

          status:
            bestaandeData
              ?.status ||
            "Nieuw",

          controle_opmerking:
            null,

          aangemaakt_op:
            bestaandeData
              ?.aangemaakt_op ||
            new Date().toISOString(),
        };

        let factuurId;

        // ======================================================
        // UPDATE
        // ======================================================

        if (
          bestaandeData
        ) {
          const {
            data,
            error,
          } = await supabase
            .from(
              "zzp_facturen"
            )
            .update(
              factuurData
            )
            .eq(
              "id",
              bestaandeData.id
            )
            .select()
            .single();

          if (error) {
            throw error;
          }

          factuurId = data.id;

          // Oude regels verwijderen
          const {
            error:
              deleteError,
          } = await supabase
            .from(
              "zzp_factuur_regels"
            )
            .delete()
            .eq(
              "factuur_id",
              factuurId
            );

          if (deleteError) {
            throw deleteError;
          }
        }

        // ======================================================
        // INSERT
        // ======================================================

        else {
          const {
            data,
            error,
          } = await supabase
            .from(
              "zzp_facturen"
            )
            .insert(
              factuurData
            )
            .select()
            .single();

          if (error) {
            throw error;
          }

          factuurId =
            data.id;
        }

        // ======================================================
        // REGELS
        // ======================================================

        const regelData =
          groep.regels.map(
            (regel) => ({
              factuur_id:
                factuurId,

              terminal:
                regel.terminal ||
                null,

              periode_van:
                regel.periode_van ||
                groep.periode_van ||
                null,

              periode_tot:
                regel.periode_tot ||
                groep.periode_tot ||
                null,

              uren:
                regel.uren,

              uurprijs:
                regel.uurprijs,

              uren_bedrag:
                regel.uren *
                regel.uurprijs,

              reiskosten:
                regel.reiskosten,

              totaal_excl_btw:
                regel.uren *
                  regel.uurprijs +
                regel.reiskosten,
            })
          );

        if (
          regelData.length > 0
        ) {
          const {
            error,
          } = await supabase
            .from(
              "zzp_factuur_regels"
            )
            .insert(
              regelData
            );

          if (error) {
            throw error;
          }
        }

        aantal++;
      }

      alert(
        `✅ ${aantal} factuur/facturen geïmporteerd.`
      );

      setImportBestand(null);
      setImportRijen([]);
      setImportFouten([]);
      setToonImport(false);

      await laadFacturen();
    } catch (error) {
      console.error(
        "Import opslaan fout:",
        error
      );

      alert(
        error.message ||
          "De facturen konden niet worden geïmporteerd."
      );
    } finally {
      setImportBezig(false);
    }
  }

  // ============================================================
  // DETAIL
  // ============================================================

  function openDetail(factuur) {
    setGeselecteerdeFactuur(
      factuur
    );

    setToonDetail(true);
  }

  // ============================================================
  // FACTUUR CONTROLEREN
  // ============================================================

  async function controleerFactuur(
    factuur
  ) {
    setGeselecteerdeFactuur(
      factuur
    );

    setToonControle(true);
    setControleBezig(true);
    setControleResultaat(null);

    try {
      const factuurRegels =
        regelsVoorFactuur(
          factuur.id
        );

      const berekend =
        berekenFactuur(
          factuur
        );

      const regelsControle = [];

     const factuurUren =
        Number(
          factuur.uren_factuur ||
            0
        );

      const verschilUren =
        Math.round(
          (
            berekend.uren -
            factuurUren
          ) * 100
        ) / 100;

      regelsControle.push({
        label:
          "Factuururen",
        waarde:
          `${factuurUren.toFixed(
            2
          )} uur`,
        detail:
          `Regels: ${berekend.uren.toFixed(
            2
          )} uur`,
        status:
          Math.abs(
            verschilUren
          ) < 0.01
            ? "ok"
            : "fout",
      });

      // ========================================================
      // UURTARIEF
      // ========================================================

      const factuurTarief =
        Number(
          factuur.uurtarief ||
            0
        );

      let gemiddeldTarief =
        0;

      if (
        berekend.uren > 0
      ) {
        gemiddeldTarief =
          berekend.urenBedrag /
          berekend.uren;
      }

      const verschilTarief =
        Math.abs(
          gemiddeldTarief -
            factuurTarief
        );

      regelsControle.push({
        label:
          "Uurtarief",
        waarde:
          `€ ${factuurTarief.toFixed(
            2
          )}`,
        detail:
          `Berekend gemiddeld: € ${gemiddeldTarief.toFixed(
            2
          )}`,
        status:
          verschilTarief <
          0.01
            ? "ok"
            : "letop",
      });

      // ========================================================
      // REISKOSTEN
      // ========================================================

      const factuurReis =
        Number(
          factuur.reiskosten ||
            0
        );

      const verschilReis =
        Math.abs(
          factuurReis -
            berekend.reiskosten
        );

      regelsControle.push({
        label:
          "Reiskosten",
        waarde:
          `€ ${factuurReis.toFixed(
            2
          )}`,
        detail:
          `Regels: € ${berekend.reiskosten.toFixed(
            2
          )}`,
        status:
          verschilReis <
          0.01
            ? "ok"
            : "fout",
      });

      // ========================================================
      // EXCL BTW
      // ========================================================

      const factuurExcl =
        Number(
          factuur.bedrag_excl_btw ||
            0
        );

      const verschilExcl =
        Math.abs(
          factuurExcl -
            berekend.excl
        );

      regelsControle.push({
        label:
          "Bedrag excl. BTW",
        waarde:
          `€ ${factuurExcl.toFixed(
            2
          )}`,
        detail:
          `Berekend: € ${berekend.excl.toFixed(
            2
          )}`,
        status:
          verschilExcl <
          0.01
            ? "ok"
            : "fout",
      });

      // ========================================================
      // TERMINALS
      // ========================================================

      regelsControle.push({
        label:
          "Terminalregels",
        waarde:
          `${factuurRegels.length} terminal(s)`,
        detail:
          factuurRegels.length >
          0
            ? factuurRegels
                .map(
                  (r) =>
                    r.terminal
                )
                .filter(Boolean)
                .join(
                  ", "
                )
            : "Geen afzonderlijke regels gevonden.",
        status:
          factuurRegels.length >
          0
            ? "ok"
            : "letop",
      });

      const akkoord =
        regelsControle.every(
          (regel) =>
            regel.status !==
            "fout"
        );

      setControleResultaat({
        factuur,
        factuurUren,
        geregistreerdeUren:
          berekend.uren,
        verschil:
          verschilUren,
        akkoord,
        regels:
          regelsControle,
      });
    } catch (error) {
      console.error(
        "Controle fout:",
        error
      );

      setControleResultaat({
        fout:
          error.message ||
          "Factuurcontrole mislukt.",
      });
    } finally {
      setControleBezig(false);
    }
  }

  // ============================================================
  // STATUS WIJZIGEN
  // ============================================================

  async function wijzigStatus(
    factuur,
    nieuweStatus
  ) {
    if (!factuur?.id) {
      return;
    }

    const melding =
      nieuweStatus ===
      "Goedgekeurd"
        ? "Deze factuur goedkeuren?"
        : "Deze factuur afkeuren?";

    if (
      !window.confirm(
        melding
      )
    ) {
      return;
    }

    setActieBezig(true);

    try {
      const updateData = {
        status:
          nieuweStatus,
      };

      if (
        nieuweStatus ===
        "Goedgekeurd"
      ) {
        updateData.goedgekeurd_op =
          new Date().toISOString();

        updateData.controle_opmerking =
          "Factuur gecontroleerd en goedgekeurd.";
      }

      if (
        nieuweStatus ===
        "Afgekeurd"
      ) {
        updateData.goedgekeurd_op =
          null;

        updateData.goedgekeurd_door =
          null;
      }

      const {
        data,
        error,
      } = await supabase
        .from(
          "zzp_facturen"
        )
        .update(
          updateData
        )
        .eq(
          "id",
          factuur.id
        )
        .select()
        .single();

      if (error) {
        throw error;
      }

      setFacturen(
        (vorige) =>
          vorige.map(
            (item) =>
              item.id ===
              factuur.id
                ? {
                    ...item,
                    ...data,
                  }
                : item
          )
      );

      setGeselecteerdeFactuur(
        (vorige) =>
          vorige
            ? {
                ...vorige,
                ...data,
              }
            : vorige
      );

      setToonControle(
        false
      );

      alert(
        nieuweStatus ===
          "Goedgekeurd"
          ? "✅ Factuur goedgekeurd."
          : "❌ Factuur afgekeurd."
      );
    } catch (error) {
      console.error(
        "Status fout:",
        error
      );

      alert(
        error.message ||
          "Status kon niet worden gewijzigd."
      );
    } finally {
      setActieBezig(false);
    }
  }

  // ============================================================
  // DATUM
  // ============================================================

  function formatDatum(
    datum
  ) {
    if (!datum) {
      return "-";
    }

    try {
      return new Date(
        datum
      ).toLocaleDateString(
        "nl-NL"
      );
    } catch {
      return datum;
    }
  }

  // ============================================================
  // GELD
  // ============================================================

  function euro(
    bedrag
  ) {
    return Number(
      bedrag || 0
    ).toLocaleString(
      "nl-NL",
      {
        style:
          "currency",
        currency:
          "EUR",
      }
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "#f8fafc",
        padding: "25px",
        boxSizing:
          "border-box",
      }}
    >
      {/* ======================================================
          HEADER
      ======================================================= */}

      <div
        style={{
          background:
            "#ffffff",
          borderRadius:
            "18px",
          padding:
            "25px 30px",
          marginBottom:
            "20px",
          boxShadow:
            "0 8px 25px rgba(0,0,0,.08)",
        }}
      >
        <div
          style={{
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            gap: "15px",
            flexWrap:
              "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color:
                  "#0f172a",
                fontSize:
                  "30px",
              }}
            >
              💶 ZZP Facturen
            </h1>

            <p
              style={{
                margin:
                  "6px 0 0",
                color:
                  "#64748b",
              }}
            >
              Facturen importeren,
              controleren en
              goedkeuren
            </p>
          </div>

          <div
            style={{
              display:
                "flex",
              gap: "10px",
              flexWrap:
                "wrap",
            }}
          >
            <button
              className="new-btn"
              type="button"
              onClick={() =>
                setToonImport(
                  true
                )
              }
              style={{
                background:
                  "#2563eb",
              }}
            >
              📥 Factuur importeren
            </button>

            <button
              className="new-btn"
              type="button"
              onClick={
                openNieuweFactuur
              }
              style={{
                background:
                  "#16a34a",
              }}
            >
              ➕ Nieuwe factuur
            </button>

            <button
              className="new-btn"
              type="button"
              onClick={
                laadFacturen
              }
              style={{
                background:
                  "#64748b",
              }}
            >
              🔄 Vernieuwen
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================
          DASHBOARD
      ======================================================= */}

      <div
        style={{
          display:
            "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "15px",
          marginBottom:
            "20px",
        }}
      >
        <DashboardCard
          titel="Totaal facturen"
          waarde={
            totaalFacturen
          }
          icoon="🧾"
          kleur="#2563eb"
        />

        <DashboardCard
          titel="Nieuwe facturen"
          waarde={
            nieuweFacturen
          }
          icoon="🟠"
          kleur="#d97706"
        />

        <DashboardCard
          titel="Goedgekeurd"
          waarde={
            goedgekeurdeFacturen
          }
          icoon="🟢"
          kleur="#16a34a"
        />

        <DashboardCard
          titel="Afgekeurd"
          waarde={
            afgekeurdeFacturen
          }
          icoon="🔴"
          kleur="#dc2626"
        />

        <DashboardCard
          titel="Totaal incl. BTW"
          waarde={
            euro(
              totaalBedrag
            )
          }
          icoon="💰"
          kleur="#7c3aed"
        />

        <DashboardCard
          titel="Reiskosten"
          waarde={
            euro(
              totaalReiskosten
            )
          }
          icoon="🚗"
          kleur="#0891b2"
        />
      </div>

      {/* ======================================================
          FILTER
      ======================================================= */}

      <div
        style={{
          background:
            "#ffffff",
          borderRadius:
            "18px",
          padding:
            "20px",
          marginBottom:
            "20px",
          boxShadow:
            "0 8px 25px rgba(0,0,0,.06)",
        }}
      >
        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "minmax(250px, 1fr) 180px auto",
            gap: "12px",
          }}
        >
          <input
            value={
              zoekterm
            }
            onChange={(e) =>
              setZoekterm(
                e.target.value
              )
            }
            placeholder="🔎 Zoek ZZP'er of factuurnummer..."
            style={
              inputStyle
            }
          />

          <select
            value={
              statusFilter
            }
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            style={
              inputStyle
            }
          >
            <option value="">
              Alle statussen
            </option>

            <option value="nieuw">
              🟠 Nieuw
            </option>

            <option value="goedgekeurd">
              🟢 Goedgekeurd
            </option>

            <option value="afgekeurd">
              🔴 Afgekeurd
            </option>

            <option value="betaald">
              🔵 Betaald
            </option>
          </select>

          <button
            type="button"
            className="new-btn"
            style={{
              background:
                "#64748b",
            }}
            onClick={() => {
              setZoekterm("");
              setStatusFilter(
                ""
              );
            }}
          >
            Wissen
          </button>
        </div>
      </div>

      {/* ======================================================
          TABEL
      ======================================================= */}

      <div
        style={{
          background:
            "#ffffff",
          borderRadius:
            "18px",
          padding:
            "15px",
          boxShadow:
            "0 8px 25px rgba(0,0,0,.08)",
        }}
      >
        {laden ? (
          <div
            style={{
              padding:
                "60px",
              textAlign:
                "center",
              color:
                "#64748b",
            }}
          >
            ⏳ Facturen laden...
          </div>
        ) : gefilterd.length ===
          0 ? (
          <div
            style={{
              padding:
                "60px",
              textAlign:
                "center",
              color:
                "#64748b",
            }}
          >
            <div
              style={{
                fontSize:
                  "45px",
                marginBottom:
                  "10px",
              }}
            >
              🧾
            </div>

            Nog geen
            facturen gevonden.
          </div>
        ) : (
          <div
            style={{
              overflowX:
                "auto",
            }}
          >
            <table
              style={{
                width:
                  "100%",
                borderCollapse:
                  "collapse",
                minWidth:
                  "1250px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#eff6ff",
                    color:
                      "#1e3a8a",
                  }}
                >
                  <th
                    style={
                      thStyle
                    }
                  >
                    ZZP'er
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Factuurnummer
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Factuurdatum
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Periode
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Uren
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Reiskosten
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Excl. BTW
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    BTW
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Incl. BTW
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Status
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Acties
                  </th>
                </tr>
              </thead>

              <tbody>
                {gefilterd.map(
                  (factuur) => {
                    const kleur =
                      statusKleur(
                        factuur.status
                      );

                    const berekend =
                      berekenFactuur(
                        factuur
                      );

                    return (
                      <tr
                        key={
                          factuur.id
                        }
                        style={{
                          borderBottom:
                            "1px solid #e2e8f0",
                        }}
                      >
                        <td
                          style={
                            tdStyle
                          }
                        >
                          <strong>
                            {
                              factuur.zzp_naam
                            }
                          </strong>
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {
                            factuur.factuurnummer
                          }
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {formatDatum(
                            factuur.factuurdatum
                          )}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {formatDatum(
                            factuur.periode_van
                          )}{" "}
                          t/m{" "}
                          {formatDatum(
                            factuur.periode_tot
                          )}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            textAlign:
                              "right",
                          }}
                        >
                          {Number(
                            factuur.uren_factuur ||
                              berekend.uren ||
                              0
                          ).toFixed(
                            2
                          )}{" "}
                          uur
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            textAlign:
                              "right",
                          }}
                        >
                          {euro(
                            factuur.reiskosten
                          )}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            textAlign:
                              "right",
                          }}
                        >
                          {euro(
                            factuur.bedrag_excl_btw
                          )}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            textAlign:
                              "right",
                          }}
                        >
                          {euro(
                            factuur.btw_bedrag
                          )}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            textAlign:
                              "right",
                            fontWeight:
                              "700",
                          }}
                        >
                          {euro(
                            factuur.bedrag_incl_btw ||
                              factuur.totaal_bedrag
                          )}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <span
                            style={{
                              display:
                                "inline-block",
                              padding:
                                "6px 10px",
                              borderRadius:
                                "999px",
                              background:
                                kleur.background,
                              color:
                                kleur.color,
                              fontWeight:
                                "700",
                              fontSize:
                                "11px",
                            }}
                          >
                            {factuur.status ||
                              "Nieuw"}
                          </span>
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              gap:
                                "6px",
                            }}
                          >
                            <IconButton
                              title="Details"
                              kleur="#2563eb"
                              onClick={() =>
                                openDetail(
                                  factuur
                                )
                              }
                            >
                              👁️
                            </IconButton>

                            <IconButton
                              title="Factuur controleren"
                              kleur="#7c3aed"
                              onClick={() =>
                                controleerFactuur(
                                  factuur
                                )
                              }
                            >
                              🔎
                            </IconButton>

                            <IconButton
                              title="Bewerken"
                              kleur="#0891b2"
                              onClick={() =>
                                openBewerken(
                                  factuur
                                )
                              }
                            >
                              ✏️
                            </IconButton>

                            {normaleStatus(
                              factuur.status
                            ) !==
                              "goedgekeurd" && (
                              <IconButton
                                title="Goedkeuren"
                                kleur="#16a34a"
                                onClick={() =>
                                  wijzigStatus(
                                    factuur,
                                    "Goedgekeurd"
                                  )
                                }
                              >
                                ✓
                              </IconButton>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================
          IMPORT MODAL
      ======================================================= */}

      {toonImport && (
        <div
          style={
            overlayStyle
          }
        >
          <div
            style={{
              ...modalStyle,
              maxWidth:
                "1050px",
            }}
          >
            <ModalHeader
              titel="📥 Facturen importeren"
              onClose={() =>
                setToonImport(
                  false
                )
              }
            />

            <input
              ref={
                fileInputRef
              }
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={
                bestandGekozen
              }
              style={{
                display:
                  "none",
              }}
            />

            {!importBestand ? (
              <div
                onClick={
                  openBestandKiezen
                }
                style={{
                  border:
                    "2px dashed #93c5fd",
                  borderRadius:
                    "16px",
                  padding:
                    "55px 25px",
                  textAlign:
                    "center",
                  cursor:
                    "pointer",
                  background:
                    "#eff6ff",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "55px",
                  }}
                >
                  📄
                </div>

                <h3>
                  Factuurbestand
                  kiezen
                </h3>

                <p
                  style={{
                    color:
                      "#64748b",
                  }}
                >
                  Excel (.xlsx /
                  .xls) of CSV
                </p>

                <button
                  type="button"
                  className="new-btn"
                  style={{
                    background:
                      "#2563eb",
                  }}
                >
                  Bestand kiezen
                </button>
              </div>
            ) : (
              <>
                <div
                  style={{
                    background:
                      "#f8fafc",
                    borderRadius:
                      "12px",
                    padding:
                      "14px",
                    marginBottom:
                      "15px",
                  }}
                >
                  📄{" "}
                  <strong>
                    {
                      importBestand.name
                    }
                  </strong>

                  <div
                    style={{
                      fontSize:
                        "13px",
                      color:
                        "#64748b",
                      marginTop:
                        "5px",
                    }}
                  >
                    {
                      importGroepen.length
                    }{" "}
                    factuur/facturen
                    gevonden
                  </div>
                </div>

                {importFouten.length >
                  0 && (
                  <div
                    style={{
                      background:
                        "#fef2f2",
                      border:
                        "1px solid #fecaca",
                      color:
                        "#991b1b",
                      borderRadius:
                        "12px",
                      padding:
                        "14px",
                      marginBottom:
                        "15px",
                    }}
                  >
                    <strong>
                      ⚠️ Controlepunten
                    </strong>

                    <ul
                      style={{
                        marginBottom:
                          0,
                      }}
                    >
                      {importFouten
                        .slice(
                          0,
                          15
                        )
                        .map(
                          (
                            fout,
                            index
                          ) => (
                            <li
                              key={
                                index
                              }
                            >
                              {
                                fout
                              }
                            </li>
                          )
                        )}
                    </ul>
                  </div>
                )}

                {importGroepen.map(
                  (
                    groep,
                    index
                  ) => {
                    const totaal =
                      groep.regels.reduce(
                        (
                          som,
                          regel
                        ) =>
                          som +
                          regel.uren *
                            regel.uurprijs +
                          regel.reiskosten,
                        0
                      );

                    return (
                      <div
                        key={
                          `${groep.factuurnummer}-${index}`
                        }
                        style={{
                          border:
                            "1px solid #e2e8f0",
                          borderRadius:
                            "14px",
                          marginBottom:
                            "15px",
                          overflow:
                            "hidden",
                        }}
                      >
                        <div
                          style={{
                            background:
                              "#eff6ff",
                            padding:
                              "14px",
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            gap:
                              "10px",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <div>
                            <strong>
                              {
                                groep.zzp_naam
                              }
                            </strong>

                            <div
                              style={{
                                color:
                                  "#64748b",
                                fontSize:
                                  "13px",
                              }}
                            >
                              Factuur{" "}
                              {
                                groep.factuurnummer
                              }{" "}
                              —{" "}
                              {formatDatum(
                                groep.factuurdatum
                              )}
                            </div>
                          </div>

                          <strong>
                            {euro(
                              totaal
                            )}{" "}
                            excl. BTW
                          </strong>
                        </div>

                        <div
                          style={{
                            overflowX:
                              "auto",
                          }}
                        >
                          <table
                            style={{
                              width:
                                "100%",
                              borderCollapse:
                                "collapse",
                              fontSize:
                                "13px",
                            }}
                          >
                            <thead>
                              <tr>
                                <th
                                  style={
                                    thStyle
                                  }
                                >
                                  Terminal
                                </th>

                                <th
                                  style={
                                    thStyle
                                  }
                                >
                                  Uren
                                </th>

                                <th
                                  style={
                                    thStyle
                                  }
                                >
                                  Uurprijs
                                </th>

                                <th
                                  style={
                                    thStyle
                                  }
                                >
                                  Reiskosten
                                </th>

                                <th
                                  style={
                                    thStyle
                                  }
                                >
                                  Totaal
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {groep.regels.map(
                                (
                                  regel,
                                  regelIndex
                                ) => (
                                  <tr
                                    key={
                                      regelIndex
                                    }
                                  >
                                    <td
                                      style={
                                        tdStyle
                                      }
                                    >
                                      {
                                        regel.terminal
                                      }
                                    </td>

                                    <td
                                      style={
                                        tdStyle
                                      }
                                    >
                                      {Number(
                                        regel.uren
                                      ).toFixed(
                                        2
                                      )}
                                    </td>

                                    <td
                                      style={
                                        tdStyle
                                      }
                                    >
                                      {euro(
                                        regel.uurprijs
                                      )}
                                    </td>

                                    <td
                                      style={
                                        tdStyle
                                      }
                                    >
                                      {euro(
                                        regel.reiskosten
                                      )}
                                    </td>

                                    <td
                                      style={{
                                        ...tdStyle,
                                        fontWeight:
                                          "700",
                                      }}
                                    >
                                      {euro(
                                        regel.uren *
                                          regel.uurprijs +
                                          regel.reiskosten
                                      )}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  }
                )}

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "flex-end",
                    gap:
                      "10px",
                    marginTop:
                      "20px",
                    flexWrap:
                      "wrap",
                  }}
                >
                  <button
                    type="button"
                    className="new-btn"
                    style={{
                      background:
                        "#64748b",
                    }}
                    onClick={() => {
                      setImportBestand(
                        null
                      );
                      setImportRijen(
                        []
                      );
                      setImportFouten(
                        []
                      );
                    }}
                  >
                    Ander bestand
                  </button>

                  <button
                    type="button"
                    className="new-btn"
                    style={{
                      background:
                        "#64748b",
                    }}
                    onClick={() =>
                      setToonImport(
                        false
                      )
                    }
                  >
                    Annuleren
                  </button>

                  <button
                    type="button"
                    className="new-btn"
                    disabled={
                      importBezig
                    }
                    style={{
                      background:
                        "#16a34a",
                    }}
                    onClick={
                      importeerFacturen
                    }
                  >
                    {importBezig
                      ? "⏳ Importeren..."
                      : "📥 Importeren & opslaan"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ======================================================
          NIEUWE / BEWERKEN MODAL
      ======================================================= */}

      {toonForm && (
        <div
          style={
            overlayStyle
          }
        >
          <div
            style={{
              ...modalStyle,
              maxWidth:
                "1000px",
            }}
          >
            <ModalHeader
              titel={
                geselecteerdeFactuur
                  ? "✏️ Factuur bewerken"
                  : "➕ Nieuwe ZZP-factuur"
              }
              onClose={() =>
                setToonForm(
                  false
                )
              }
            />

            <form
              onSubmit={
                slaFactuurOp
              }
            >
              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap:
                    "15px",
                  marginBottom:
                    "20px",
                }}
              >
                <FormField
                  label="ZZP'er"
                  value={
                    formulier.zzp_naam
                  }
                  onChange={(e) =>
                    wijzigFormulier(
                      "zzp_naam",
                      e.target.value
                    )
                  }
                  required
                />

                <FormField
                  label="Factuurnummer"
                  value={
                    formulier.factuurnummer
                  }
                  onChange={(e) =>
                    wijzigFormulier(
                      "factuurnummer",
                      e.target.value
                    )
                  }
                  required
                />

                <FormField
                  label="Factuurdatum"
                  type="date"
                  value={
                    formulier.factuurdatum
                  }
                  onChange={(e) =>
                    wijzigFormulier(
                      "factuurdatum",
                      e.target.value
                    )
                  }
                  required
                />

                <FormField
                  label="Periode van"
                  type="date"
                  value={
                    formulier.periode_van
                  }
                  onChange={(e) =>
                    wijzigFormulier(
                      "periode_van",
                      e.target.value
                    )
                  }
                />

                <FormField
                  label="Periode tot"
                  type="date"
                  value={
                    formulier.periode_tot
                  }
                  onChange={(e) =>
                    wijzigFormulier(
                      "periode_tot",
                      e.target.value
                    )
                  }
                />

                <FormField
                  label="BTW percentage"
                  type="number"
                  value={
                    formulier.btw_percentage
                  }
                  onChange={(e) =>
                    wijzigFormulier(
                      "btw_percentage",
                      e.target.value
                    )
                  }
                />
              </div>

              {/* ==================================================
                  TERMINALREGELS
              =================================================== */}

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  marginBottom:
                    "10px",
                  gap:
                    "10px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                  }}
                >
                  🏭 Terminalregels
                </h3>

                <button
                  type="button"
                  className="new-btn"
                  style={{
                    background:
                      "#2563eb",
                  }}
                  onClick={
                    voegRegelToe
                  }
                >
                  + Terminal toevoegen
                </button>
              </div>

              <div
                style={{
                  overflowX:
                    "auto",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius:
                    "12px",
                }}
              >
                <table
                  style={{
                    width:
                      "100%",
                    borderCollapse:
                      "collapse",
                    minWidth:
                      "900px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background:
                          "#f8fafc",
                      }}
                    >
                      <th
                        style={
                          thStyle
                        }
                      >
                        Terminal
                      </th>

                      <th
                        style={
                          thStyle
                        }
                      >
                        Periode van
                      </th>

                      <th
                        style={
                          thStyle
                        }
                      >
                        Periode tot
                      </th>

                      <th
                        style={
                          thStyle
                        }
                      >
                        Uren
                      </th>

                      <th
                        style={
                          thStyle
                        }
                      >
                        Uurprijs
                      </th>

                      <th
                        style={
                          thStyle
                        }
                      >
                        Reiskosten
                      </th>

                      <th
                        style={
                          thStyle
                        }
                      >
                        Totaal
                      </th>

                      <th
                        style={
                          thStyle
                        }
                      />
                    </tr>
                  </thead>

                  <tbody>
                    {formulier.regels.map(
                      (
                        regel,
                        index
                      ) => {
                        const berekend =
                          berekenRegel(
                            regel
                          );

                        return (
                          <tr
                            key={
                              index
                            }
                          >
                            <td
                              style={
                                tdStyle
                              }
                            >
                              <input
                                value={
                                  regel.terminal
                                }
                                onChange={(
                                  e
                                ) =>
                                  wijzigRegel(
                                    index,
                                    "terminal",
                                    e.target
                                      .value
                                  )
                                }
                                placeholder="Bijv. Aglobis"
                                style={
                                  tableInputStyle
                                }
                              />
                            </td>

                            <td
                              style={
                                tdStyle
                              }
                            >
                              <input
                                type="date"
                                value={
                                  regel.periode_van
                                }
                                onChange={(
                                  e
                                ) =>
                                  wijzigRegel(
                                    index,
                                    "periode_van",
                                    e.target
                                      .value
                                  )
                                }
                                style={
                                  tableInputStyle
                                }
                              />
                            </td>

                            <td
                              style={
                                tdStyle
                              }
                            >
                              <input
                                type="date"
                                value={
                                  regel.periode_tot
                                }
                                onChange={(
                                  e
                                ) =>
                                  wijzigRegel(
                                    index,
                                    "periode_tot",
                                    e.target
                                      .value
                                  )
                                }
                                style={
                                  tableInputStyle
                                }
                              />
                            </td>

                            <td
                              style={
                                tdStyle
                              }
                            >
                              <input
                                type="number"
                                step="0.01"
                                value={
                                  regel.uren
                                }
                                onChange={(
                                  e
                                ) =>
                                  wijzigRegel(
                                    index,
                                    "uren",
                                    e.target
                                      .value
                                  )
                                }
                                style={
                                  tableInputStyle
                                }
                              />
                            </td>

                            <td
                              style={
                                tdStyle
                              }
                            >
                              <input
                                type="number"
                                step="0.01"
                                value={
                                  regel.uurprijs
                                }
                                onChange={(
                                  e
                                ) =>
                                  wijzigRegel(
                                    index,
                                    "uurprijs",
                                    e.target
                                      .value
                                  )
                                }
                                style={
                                  tableInputStyle
                                }
                              />
                            </td>

                            <td
                              style={
                                tdStyle
                              }
                            >
                              <input
                                type="number"
                                step="0.01"
                                value={
                                  regel.reiskosten
                                }
                                onChange={(
                                  e
                                ) =>
                                  wijzigRegel(
                                    index,
                                    "reiskosten",
                                    e.target
                                      .value
                                  )
                                }
                                style={
                                  tableInputStyle
                                }
                              />
                            </td>

                            <td
                              style={{
                                ...tdStyle,
                                fontWeight:
                                  "700",
                              }}
                            >
                              {euro(
                                berekend.totaalExcl
                              )}
                            </td>

                            <td
                              style={
                                tdStyle
                              }
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  verwijderRegel(
                                    index
                                  )
                                }
                                style={{
                                  border:
                                    "none",
                                  background:
                                    "#fee2e2",
                                  color:
                                    "#b91c1c",
                                  borderRadius:
                                    "7px",
                                  width:
                                    "32px",
                                  height:
                                    "32px",
                                  cursor:
                                    "pointer",
                                }}
                              >
                                🗑
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {/* ==================================================
                  TOTALEN
              =================================================== */}

              <FormulierTotalen
                formulier={
                  formulier
                }
              />

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "flex-end",
                  gap:
                    "10px",
                  marginTop:
                    "20px",
                  flexWrap:
                    "wrap",
                }}
              >
                <button
                  type="button"
                  className="new-btn"
                  style={{
                    background:
                      "#64748b",
                  }}
                  onClick={() =>
                    setToonForm(
                      false
                    )
                  }
                >
                  Annuleren
                </button>

                <button
                  type="submit"
                  className="new-btn"
                  disabled={
                    actieBezig
                  }
                  style={{
                    background:
                      "#16a34a",
                  }}
                >
                  {actieBezig
                    ? "⏳ Opslaan..."
                    : "💾 Factuur opslaan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          DETAIL MODAL
      ======================================================= */}

      {toonDetail &&
        geselecteerdeFactuur && (
          <div
            style={
              overlayStyle
            }
            onClick={(e) => {
              if (
                e.target ===
                e.currentTarget
              ) {
                setToonDetail(
                  false
                );
              }
            }}
          >
            <div
              style={{
                ...modalStyle,
                maxWidth:
                  "850px",
              }}
            >
              <ModalHeader
                titel="🧾 Factuurdetails"
                onClose={() =>
                  setToonDetail(
                    false
                  )
                }
              />

              <DetailFactuur
                factuur={
                  geselecteerdeFactuur
                }
                regels={regelsVoorFactuur(
                  geselecteerdeFactuur.id
                )}
                euro={euro}
                formatDatum={
                  formatDatum
                }
                onEdit={() => {
                  setToonDetail(
                    false
                  );
                  openBewerken(
                    geselecteerdeFactuur
                  );
                }}
                onControl={() => {
                  setToonDetail(
                    false
                  );
                  controleerFactuur(
                    geselecteerdeFactuur
                  );
                }}
                onApprove={() =>
                  wijzigStatus(
                    geselecteerdeFactuur,
                    "Goedgekeurd"
                  )
                }
              />
            </div>
          </div>
        )}

      {/* ======================================================
          CONTROLE MODAL
      ======================================================= */}

      {toonControle && (
        <div
          style={
            overlayStyle
          }
        >
          <div
            style={{
              ...modalStyle,
              maxWidth:
                "900px",
            }}
          >
            <ModalHeader
              titel="🔎 Factuurcontrole"
              onClose={() =>
                setToonControle(
                  false
                )
              }
            />

            {controleBezig ? (
              <div
                style={{
                  padding:
                    "60px",
                  textAlign:
                    "center",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "45px",
                  }}
                >
                  ⏳
                </div>

                Factuur wordt
                gecontroleerd...
              </div>
            ) : controleResultaat?.fout ? (
              <div
                style={{
                  background:
                    "#fee2e2",
                  color:
                    "#991b1b",
                  padding:
                    "18px",
                  borderRadius:
                    "12px",
                }}
              >
                ❌{" "}
                {
                  controleResultaat.fout
                }
              </div>
            ) : (
              <>
                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(180px, 1fr))",
                    gap:
                      "12px",
                    marginBottom:
                      "20px",
                  }}
                >
                  <DashboardCard
                    titel="Factuururen"
                    waarde={`${Number(
                      controleResultaat?.factuurUren ||
                        0
                    ).toFixed(
                      2
                    )} uur`}
                    icoon="🧾"
                    kleur="#2563eb"
                  />

                  <DashboardCard
                    titel="Berekend"
                    waarde={`${Number(
                      controleResultaat?.geregistreerdeUren ||
                        0
                    ).toFixed(
                      2
                    )} uur`}
                    icoon="⏱"
                    kleur="#7c3aed"
                  />

                  <DashboardCard
                    titel="Verschil"
                    waarde={`${Number(
                      controleResultaat?.verschil ||
                        0
                    ).toFixed(
                      2
                    )} uur`}
                    icoon={
                      controleResultaat?.verschil ===
                      0
                        ? "🟢"
                        : "🔴"
                    }
                    kleur={
                      controleResultaat?.verschil ===
                      0
                        ? "#16a34a"
                        : "#dc2626"
                    }
                  />
                </div>

                <div
                  style={{
                    background:
                      controleResultaat?.akkoord
                        ? "#dcfce7"
                        : "#fee2e2",
                    color:
                      controleResultaat?.akkoord
                        ? "#166534"
                        : "#991b1b",
                    padding:
                      "18px",
                    borderRadius:
                      "14px",
                    marginBottom:
                      "20px",
                  }}
                >
                  <strong
                    style={{
                      fontSize:
                        "18px",
                    }}
                  >
                    {controleResultaat?.akkoord
                      ? "🟢 Factuurcontrole akkoord"
                      : "🔴 Factuurcontrole niet akkoord"}
                  </strong>

                  <div
                    style={{
                      marginTop:
                        "5px",
                    }}
                  >
                    {controleResultaat?.akkoord
                      ? "De factuur kan worden goedgekeurd."
                      : "Er zijn afwijkingen gevonden."}
                  </div>
                </div>

                <div
                  style={{
                    border:
                      "1px solid #e2e8f0",
                    borderRadius:
                      "12px",
                    overflow:
                      "hidden",
                  }}
                >
                  {controleResultaat?.regels?.map(
                    (
                      regel,
                      index
                    ) => {
                      const ok =
                        regel.status ===
                        "ok";

                      const fout =
                        regel.status ===
                        "fout";

                      return (
                        <div
                          key={
                            index
                          }
                          style={{
                            display:
                              "grid",
                            gridTemplateColumns:
                              "180px 150px 1fr",
                            gap:
                              "12px",
                            padding:
                              "13px",
                            borderBottom:
                              "1px solid #e2e8f0",
                          }}
                        >
                          <strong>
                            {
                              regel.label
                            }
                          </strong>

                          <strong
                            style={{
                              color:
                                ok
                                  ? "#166534"
                                  : fout
                                  ? "#b91c1c"
                                  : "#92400e",
                            }}
                          >
                            {ok
                              ? "🟢 OK"
                              : fout
                              ? "🔴 AFWIJKING"
                              : "🟠 LET OP"}
                          </strong>

                          <span>
                            <strong>
                              {
                                regel.waarde
                              }
                            </strong>

                            {regel.detail && (
                              <small
                                style={{
                                  display:
                                    "block",
                                  color:
                                    "#64748b",
                                  marginTop:
                                    "3px",
                                }}
                              >
                                {
                                  regel.detail
                                }
                              </small>
                            )}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "flex-end",
                    gap:
                      "10px",
                    marginTop:
                      "20px",
                    flexWrap:
                      "wrap",
                  }}
                >
                  <button
                    type="button"
                    className="new-btn"
                    style={{
                      background:
                        "#64748b",
                    }}
                    onClick={() =>
                      setToonControle(
                        false
                      )
                    }
                  >
                    Sluiten
                  </button>

                  <button
                    type="button"
                    className="new-btn"
                    style={{
                      background:
                        controleResultaat?.akkoord
                          ? "#16a34a"
                          : "#94a3b8",
                    }}
                    disabled={
                      !controleResultaat?.akkoord ||
                      actieBezig
                    }
                    onClick={() =>
                      wijzigStatus(
                        controleResultaat.factuur,
                        "Goedgekeurd"
                      )
                    }
                  >
                    🟢 Goedkeuren
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// DASHBOARD CARD
// ============================================================

function DashboardCard({
  titel,
  waarde,
  icoon,
  kleur = "#2563eb",
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderLeft: `5px solid ${kleur}`,
        borderRadius: "14px",
        padding: "18px",
        boxShadow:
          "0 4px 12px rgba(15,23,42,.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: `${kleur}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
          }}
        >
          {icoon}
        </div>

        <span
          style={{
            color: "#64748b",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          {titel}
        </span>
      </div>

      <div
        style={{
          color: kleur,
          fontSize: "24px",
          fontWeight: "800",
        }}
      >
        {waarde}
      </div>
    </div>
  );
}
// ============================================================
// MODAL HEADER
// ============================================================

function ModalHeader({
  titel,
  onClose,
}) {
  return (
    <div
      style={{
        display:
          "flex",
        justifyContent:
          "space-between",
        alignItems:
          "center",
        marginBottom:
          "20px",
      }}
    >
      <h2
        style={{
          margin: 0,
          color:
            "#0f172a",
        }}
      >
        {titel}
      </h2>

      <button
        type="button"
        onClick={onClose}
        style={{
          width:
            "38px",
          height:
            "38px",
          border:
            "none",
          borderRadius:
            "8px",
          background:
            "#f1f5f9",
          cursor:
            "pointer",
          fontSize:
            "18px",
        }}
      >
        ✕
      </button>
    </div>
  );
}

// ============================================================
// FORM FIELD
// ============================================================

function FormField({
  label,
  type = "text",
  value,
  onChange,
  required = false,
}) {
  return (
    <label
      style={{
        display:
          "flex",
        flexDirection:
          "column",
        gap:
          "6px",
        color:
          "#334155",
        fontWeight:
          "600",
        fontSize:
          "13px",
      }}
    >
      {label}

      <input
        type={type}
        value={value}
        onChange={onChange}
        required={
          required
        }
        style={
          inputStyle
        }
      />
    </label>
  );
}

// ============================================================
// FORMULIER TOTALEN
// ============================================================

function FormulierTotalen({
  formulier,
}) {
  let uren = 0;
  let urenBedrag = 0;
  let reis = 0;

  formulier.regels.forEach(
    (regel) => {
      const u =
        Number(
          regel.uren || 0
        );

      const tarief =
        Number(
          regel.uurprijs || 0
        );

      const r =
        Number(
          regel.reiskosten ||
            0
        );

      uren += u;
      urenBedrag +=
        u * tarief;
      reis += r;
    }
  );

  const excl =
    urenBedrag +
    reis;

  const btw =
    excl *
    (Number(
      formulier.btw_percentage ||
        21
    ) /
      100);

  const incl =
    excl + btw;

  return (
    <div
      style={{
        marginTop:
          "20px",
        display:
          "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(170px, 1fr))",
        gap:
          "12px",
      }}
    >
      <TotalBox
        label="Totaal uren"
        value={`${uren.toFixed(
          2
        )} uur`}
      />

      <TotalBox
        label="Urenbedrag"
        value={euroStatic(
          urenBedrag
        )}
      />

      <TotalBox
        label="Reiskosten"
        value={euroStatic(
          reis
        )}
      />

      <TotalBox
        label="Excl. BTW"
        value={euroStatic(
          excl
        )}
      />

      <TotalBox
        label={`BTW ${Number(
          formulier.btw_percentage ||
            21
        )}%`}
        value={euroStatic(
          btw
        )}
      />

      <TotalBox
        label="Totaal incl. BTW"
        value={euroStatic(
          incl
        )}
        belangrijk
      />
    </div>
  );
}

// ============================================================
// TOTAL BOX
// ============================================================

function TotalBox({
  label,
  value,
  belangrijk = false,
}) {
  return (
    <div
      style={{
        background:
          belangrijk
            ? "#dcfce7"
            : "#f8fafc",
        borderRadius:
          "12px",
        padding:
          "14px",
      }}
    >
      <div
        style={{
          fontSize:
            "12px",
          color:
            "#64748b",
        }}
      >
        {label}
      </div>

      <strong
        style={{
          display:
            "block",
          marginTop:
            "5px",
          fontSize:
            "18px",
          color:
            belangrijk
              ? "#166534"
              : "#0f172a",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

// ============================================================
// DETAIL FACTUUR
// ============================================================

function DetailFactuur({
  factuur,
  regels,
  euro,
  formatDatum,
  onEdit,
  onControl,
  onApprove,
}) {
  const kleur =
    statusKleurStatic(
      factuur.status
    );

  return (
    <>
      <div
        style={{
          display:
            "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(200px, 1fr))",
          gap:
            "12px",
          marginBottom:
            "20px",
        }}
      >
        <DetailBox
          label="ZZP'er"
          value={
            factuur.zzp_naam
          }
        />

        <DetailBox
          label="Factuurnummer"
          value={
            factuur.factuurnummer
          }
        />

        <DetailBox
          label="Factuurdatum"
          value={formatDatum(
            factuur.factuurdatum
          )}
        />

        <DetailBox
          label="Status"
          value={
            <span
              style={{
                color:
                  kleur.color,
                fontWeight:
                  "700",
              }}
            >
              {factuur.status ||
                "Nieuw"}
            </span>
          }
        />
      </div>

      <h3>
        🏭 Terminals
      </h3>

      {regels.length ===
      0 ? (
        <div
          style={{
            padding:
              "20px",
            background:
              "#f8fafc",
            borderRadius:
              "10px",
          }}
        >
          Geen afzonderlijke
          terminalregels.
        </div>
      ) : (
        <div
          style={{
            overflowX:
              "auto",
          }}
        >
          <table
            style={{
              width:
                "100%",
              borderCollapse:
                "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  background:
                    "#eff6ff",
                }}
              >
                <th
                  style={
                    thStyle
                  }
                >
                  Terminal
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  Periode
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  Uren
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  Uurprijs
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  Reiskosten
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  Totaal
                </th>
              </tr>
            </thead>

            <tbody>
              {regels.map(
                (
                  regel
                ) => (
                  <tr
                    key={
                      regel.id
                    }
                  >
                    <td
                      style={
                        tdStyle
                      }
                    >
                      {
                        regel.terminal
                      }
                    </td>

                    <td
                      style={
                        tdStyle
                      }
                    >
                      {formatDatum(
                        regel.periode_van
                      )}{" "}
                      t/m{" "}
                      {formatDatum(
                        regel.periode_tot
                      )}
                    </td>

                    <td
                      style={
                        tdStyle
                      }
                    >
                      {Number(
                        regel.uren ||
                          0
                      ).toFixed(
                        2
                      )}
                    </td>

                    <td
                      style={
                        tdStyle
                      }
                    >
                      {euro(
                        regel.uurprijs
                      )}
                    </td>

                    <td
                      style={
                        tdStyle
                      }
                    >
                      {euro(
                        regel.reiskosten
                      )}
                    </td>

                    <td
                      style={{
                        ...tdStyle,
                        fontWeight:
                          "700",
                      }}
                    >
                      {euro(
                        regel.totaal_excl_btw
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      <div
        style={{
          display:
            "flex",
          justifyContent:
            "flex-end",
          gap:
            "10px",
          marginTop:
            "20px",
          flexWrap:
            "wrap",
        }}
      >
        <button
          type="button"
          className="new-btn"
          style={{
            background:
              "#0891b2",
          }}
          onClick={onEdit}
        >
          ✏️ Bewerken
        </button>

        <button
          type="button"
          className="new-btn"
          style={{
            background:
              "#7c3aed",
          }}
          onClick={onControl}
        >
          🔎 Controleren
        </button>

        {normaleStatusStatic(
          factuur.status
        ) !==
          "goedgekeurd" && (
          <button
            type="button"
            className="new-btn"
            style={{
              background:
                "#16a34a",
            }}
            onClick={
              onApprove
            }
          >
            🟢 Goedkeuren
          </button>
        )}
      </div>
    </>
  );
}

// ============================================================
// DETAIL BOX
// ============================================================

function DetailBox({
  label,
  value,
}) {
  return (
    <div
      style={{
        background:
          "#f8fafc",
        borderRadius:
          "12px",
        padding:
          "14px",
      }}
    >
      <div
        style={{
          color:
            "#64748b",
          fontSize:
            "12px",
        }}
      >
        {label}
      </div>

      <strong
        style={{
          display:
            "block",
          marginTop:
            "5px",
        }}
      >
        {value ||
          "-"}
      </strong>
    </div>
  );
}

// ============================================================
// ICON BUTTON
// ============================================================

function IconButton({
  title,
  kleur,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        width:
          "34px",
        height:
          "34px",
        border:
          "none",
        borderRadius:
          "8px",
        background:
          kleur,
        color:
          "#ffffff",
        cursor:
          "pointer",
        fontSize:
          "15px",
      }}
    >
      {children}
    </button>
  );
}

// ============================================================
// STATIC HELPERS
// ============================================================

function normaleStatusStatic(
  status
) {
  return (
    status || "Nieuw"
  )
    .toString()
    .toLowerCase()
    .trim();
}

function statusKleurStatic(
  status
) {
  const waarde =
    normaleStatusStatic(
      status
    );

  if (
    waarde ===
      "goedgekeurd" ||
    waarde === "akkoord"
  ) {
    return {
      background:
        "#dcfce7",
      color:
        "#166534",
    };
  }

  if (
    waarde ===
    "afgekeurd"
  ) {
    return {
      background:
        "#fee2e2",
      color:
        "#991b1b",
    };
  }

  return {
    background:
      "#fef3c7",
    color:
      "#92400e",
  };
}

function euroStatic(
  bedrag
) {
  return Number(
    bedrag || 0
  ).toLocaleString(
    "nl-NL",
    {
      style:
        "currency",
      currency:
        "EUR",
    }
  );
}

// ============================================================
// STIJLEN
// ============================================================

const overlayStyle = {
  position:
    "fixed",
  inset: 0,
  background:
    "rgba(15,23,42,.60)",
  display:
    "flex",
  alignItems:
    "center",
  justifyContent:
    "center",
  padding:
    "20px",
  zIndex:
    1100,
};

const modalStyle = {
  width:
    "100%",
  maxHeight:
    "92vh",
  overflowY:
    "auto",
  background:
    "#ffffff",
  borderRadius:
    "18px",
  padding:
    "25px",
  boxSizing:
    "border-box",
  boxShadow:
    "0 25px 70px rgba(0,0,0,.30)",
};

const inputStyle = {
  width:
    "100%",
  boxSizing:
    "border-box",
  padding:
    "11px 12px",
  border:
    "1px solid #cbd5e1",
  borderRadius:
    "8px",
  background:
    "#ffffff",
  color:
    "#0f172a",
  outline:
    "none",
};

const tableInputStyle = {
  width:
    "100%",
  boxSizing:
    "border-box",
  padding:
    "8px",
  border:
    "1px solid #cbd5e1",
  borderRadius:
    "6px",
};

const thStyle = {
  padding:
    "12px 9px",
  textAlign:
    "left",
  whiteSpace:
    "nowrap",
  fontSize:
    "12px",
};

const tdStyle = {
  padding:
    "11px 9px",
  whiteSpace:
    "nowrap",
  fontSize:
    "13px",
};