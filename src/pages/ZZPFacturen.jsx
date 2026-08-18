import { useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabase";
import { useAuthContext } from "../contexts/AuthContext";

const leegFormulier = {
  factuurnummer: "",
  zzper: "",
  factuurdatum: "",
  periode_van: "",
  periode_tot: "",
  terminal: "",
  omschrijving: "",
  uren: "",
  uurtarief: "",
  btw_percentage: "21",
  status: "Ter controle",
  opmerking: "",
  bestand: null,
};

export default function ZZPFacturen() {
  const { profile } = useAuthContext();

  const [facturen, setFacturen] = useState([]);
  const [zzpers, setZzpers] = useState([]);
  const [terminals, setTerminals] = useState([]);

  const [laden, setLaden] = useState(true);
  const [opslaanBezig, setOpslaanBezig] = useState(false);

  const [toonForm, setToonForm] = useState(false);
  const [bewerken, setBewerken] = useState(null);

  const [toonControle, setToonControle] = useState(false);
  const [controleBezig, setControleBezig] = useState(false);
  const [controleResultaat, setControleResultaat] = useState(null);

  const [zoekterm, setZoekterm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [terminalFilter, setTerminalFilter] = useState("");

  const [formulier, setFormulier] = useState(leegFormulier);

  // ============================================================
  // LADEN
  // ============================================================

  useEffect(() => {
    laadAlles();
  }, []);

  async function laadAlles() {
    setLaden(true);

    await Promise.all([
      laadFacturen(),
      laadZZPers(),
      laadTerminals(),
    ]);

    setLaden(false);
  }

  async function laadFacturen() {
    const { data, error } = await supabase
      .from("zzp_facturen")
      .select("*")
      .order("factuurdatum", { ascending: false });

    if (error) {
      console.error(error);
      alert("Facturen laden mislukt: " + error.message);
      return;
    }

    setFacturen(data || []);
  }

  async function laadZZPers() {
    const { data, error } = await supabase
      .from("medewerkers")
      .select("id, naam")
      .order("naam");

    if (error) {
      console.error(error);
      return;
    }

    setZzpers(data || []);
  }

  async function laadTerminals() {
    const { data, error } = await supabase
      .from("terminals")
      .select("id, naam")
      .order("naam");

    if (error) {
      console.error(error);
      return;
    }

    setTerminals(data || []);
  }

  // ============================================================
  // BEDRAGEN
  // ============================================================

  function berekenBedragen(uren, tarief, btwPercentage) {
    const u = Number(uren) || 0;
    const t = Number(tarief) || 0;
    const btw = Number(btwPercentage) || 0;

    const excl = u * t;
    const btwBedrag = excl * (btw / 100);
    const incl = excl + btwBedrag;

    return {
      excl: Number(excl.toFixed(2)),
      btw: Number(btwBedrag.toFixed(2)),
      incl: Number(incl.toFixed(2)),
    };
  }

  function wijzig(e) {
    const { name, value, files } = e.target;

    setFormulier((vorig) => {
      const nieuw = {
        ...vorig,
        [name]: name === "bestand" ? files?.[0] || null : value,
      };

      if (
        name === "uren" ||
        name === "uurtarief" ||
        name === "btw_percentage"
      ) {
        const bedragen = berekenBedragen(
          name === "uren" ? value : nieuw.uren,
          name === "uurtarief" ? value : nieuw.uurtarief,
          name === "btw_percentage"
            ? value
            : nieuw.btw_percentage
        );

        nieuw.bedrag_excl_btw = bedragen.excl;
        nieuw.btw_bedrag = bedragen.btw;
        nieuw.bedrag_incl_btw = bedragen.incl;
      }

      return nieuw;
    });
  }

  // ============================================================
  // NIEUWE FACTUUR
  // ============================================================

  function openNieuweFactuur() {
    const vandaag = new Date().toISOString().split("T")[0];

    setBewerken(null);

    setFormulier({
      ...leegFormulier,
      factuurdatum: vandaag,
      btw_percentage: "21",
    });

    setToonForm(true);
  }

  // ============================================================
  // BEWERKEN
  // ============================================================

  function openBewerken(factuur) {
    setBewerken(factuur);

    setFormulier({
      factuurnummer: factuur.factuurnummer || "",
      zzper: factuur.zzper || "",
      factuurdatum: factuur.factuurdatum || "",
      periode_van: factuur.periode_van || "",
      periode_tot: factuur.periode_tot || "",
      terminal: factuur.terminal || "",
      omschrijving: factuur.omschrijving || "",
      uren: factuur.uren ?? "",
      uurtarief: factuur.uurtarief ?? "",
      btw_percentage: factuur.btw_percentage ?? "21",
      status: factuur.status || "Ter controle",
      opmerking: factuur.opmerking || "",
      bestand: null,
    });

    setToonForm(true);
  }

  // ============================================================
  // PDF UPLOAD
  // ============================================================

  async function uploadBestand(bestand) {
    if (!bestand) return null;

    const naam = bestand.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

    const pad = `facturen/${Date.now()}_${naam}`;

    const { error } = await supabase.storage
      .from("zzp-facturen")
      .upload(pad, bestand, {
        cacheControl: "3600",
        upsert: false,
        contentType: bestand.type || "application/pdf",
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from("zzp-facturen")
      .getPublicUrl(pad);

    return data?.publicUrl || null;
  }

  // ============================================================
  // OPSLAAN
  // ============================================================

  async function opslaan(e) {
    e.preventDefault();

    if (opslaanBezig) return;

    if (!formulier.factuurnummer.trim()) {
      alert("Vul een factuurnummer in.");
      return;
    }

    if (!formulier.zzper) {
      alert("Selecteer een ZZP'er.");
      return;
    }

    if (!formulier.factuurdatum) {
      alert("Vul de factuurdatum in.");
      return;
    }

    setOpslaanBezig(true);

    try {
      let bestandUrl = bewerken?.bestand_url || null;

      if (formulier.bestand) {
        bestandUrl = await uploadBestand(formulier.bestand);
      }

      const bedragen = berekenBedragen(
        formulier.uren,
        formulier.uurtarief,
        formulier.btw_percentage
      );

      const gegevens = {
        factuurnummer: formulier.factuurnummer.trim(),
        zzper: formulier.zzper,
        factuurdatum: formulier.factuurdatum,
        periode_van: formulier.periode_van || null,
        periode_tot: formulier.periode_tot || null,
        terminal: formulier.terminal || null,
        omschrijving: formulier.omschrijving.trim() || null,

        uren: Number(formulier.uren) || 0,
        uurtarief: Number(formulier.uurtarief) || 0,

        bedrag_excl_btw: bedragen.excl,
        btw_percentage: Number(formulier.btw_percentage) || 0,
        btw_bedrag: bedragen.btw,
        bedrag_incl_btw: bedragen.incl,

        status: formulier.status || "Ter controle",
        opmerking: formulier.opmerking.trim() || null,
        bestand_url: bestandUrl,
        bijgewerkt_op: new Date().toISOString(),
      };

      if (bewerken?.id) {
        const { error } = await supabase
          .from("zzp_facturen")
          .update(gegevens)
          .eq("id", bewerken.id);

        if (error) throw error;

        alert("✅ Factuur bijgewerkt.");
      } else {
        const { error } = await supabase
          .from("zzp_facturen")
          .insert([
            {
              ...gegevens,
              aangemaakt_op: new Date().toISOString(),
            },
          ]);

        if (error) throw error;

        alert("✅ Factuur opgeslagen.");
      }

      setToonForm(false);
      setBewerken(null);
      setFormulier({ ...leegFormulier });

      await laadFacturen();
    } catch (error) {
      console.error(error);
      alert(
        error.message ||
          "De factuur kon niet worden opgeslagen."
      );
    } finally {
      setOpslaanBezig(false);
    }
  }

  // ============================================================
  // STATUS
  // ============================================================

  async function wijzigStatus(factuur, status) {
    const tekst =
      status === "Goedgekeurd"
        ? "Deze factuur goedkeuren?"
        : status === "Afgekeurd"
        ? "Deze factuur afkeuren?"
        : "Status wijzigen?";

    if (!window.confirm(tekst)) return;

    const { error } = await supabase
      .from("zzp_facturen")
      .update({
        status,
        gecontroleerd_door: profile?.naam || null,
        gecontroleerd_op: new Date().toISOString(),
      })
      .eq("id", factuur.id);

    if (error) {
      alert(error.message);
      return;
    }

    await laadFacturen();
  }

  // ============================================================
  // VERWIJDEREN
  // ============================================================

  async function verwijderFactuur(factuur) {
    if (
      !window.confirm(
        `Weet je zeker dat factuur ${factuur.factuurnummer} verwijderd moet worden?`
      )
    ) {
      return;
    }

    const { error } = await supabase
      .from("zzp_facturen")
      .delete()
      .eq("id", factuur.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("🗑️ Factuur verwijderd.");

    await laadFacturen();
  }

  // ============================================================
  // FACTUURCONTROLE
  // ============================================================

  async function controleerFactuur(factuur) {
    if (!factuur?.id) return;

    setToonControle(true);
    setControleBezig(true);
    setControleResultaat(null);

    try {
      const van =
        factuur.periode_van || factuur.factuurdatum;

      const tot =
        factuur.periode_tot || factuur.factuurdatum;

      let query = supabase
        .from("urenregistratie")
        .select("*")
        .eq("medewerker", factuur.zzper);

      if (van) {
        query = query.gte("datum", van);
      }

      if (tot) {
        query = query.lte("datum", tot);
      }

      const { data, error } = await query;

      if (error) throw error;

      const registraties = data || [];

      const geregistreerdeUren =
        registraties.reduce(
          (totaal, regel) =>
            totaal +
            (Number(regel.gewerkte_uren) || 0),
          0
        );

      const factuurUren =
        Number(factuur.uren) || 0;

      const verschil = Number(
        (factuurUren - geregistreerdeUren).toFixed(2)
      );

      const urenAkkoord =
        Math.abs(verschil) < 0.01;

      const regels = [
        {
          label: "Factuurperiode",
          status:
            van && tot ? "ok" : "letop",
          waarde:
            van && tot
              ? `${van} t/m ${tot}`
              : "Geen periode opgegeven",
          detail:
            `${registraties.length} urenregistratie(s) gevonden.`,
        },
        {
          label: "Uren",
          status:
            urenAkkoord ? "ok" : "fout",
          waarde:
            `${factuurUren.toFixed(2)} uur`,
          detail:
            urenAkkoord
              ? "Factuururen komen overeen met de urenregistratie."
              : `Geregistreerd: ${geregistreerdeUren.toFixed(2)} uur.`,
        },
        {
          label: "ZZP'er",
          status:
            factuur.zzper ? "ok" : "fout",
          waarde:
            factuur.zzper || "-",
          detail:
            "Naam wordt gebruikt voor de urencontrole.",
        },
        {
          label: "Bedrag",
          status: "ok",
          waarde: euro(factuur.bedrag_incl_btw),
          detail:
            `${Number(factuur.uren || 0).toFixed(2)} uur × ${euro(
              factuur.uurtarief
            )} excl. BTW.`,
        },
      ];

      setControleResultaat({
        factuur,
        factuurUren,
        geregistreerdeUren,
        verschil,
        akkoord: urenAkkoord,
        regels,
      });
    } catch (error) {
      console.error(error);

      setControleResultaat({
        factuur,
        fout:
          error.message ||
          "De urenregistratie kon niet worden gecontroleerd.",
      });
    } finally {
      setControleBezig(false);
    }
  }

  // ============================================================
  // FILTERS
  // ============================================================

  const gefilterd = useMemo(() => {
    const zoek = zoekterm.toLowerCase().trim();

    return facturen.filter((factuur) => {
      const tekst = [
        factuur.factuurnummer,
        factuur.zzper,
        factuur.terminal,
        factuur.omschrijving,
        factuur.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!zoek || tekst.includes(zoek)) &&
        (!statusFilter ||
          factuur.status === statusFilter) &&
        (!terminalFilter ||
          factuur.terminal === terminalFilter)
      );
    });
  }, [
    facturen,
    zoekterm,
    statusFilter,
    terminalFilter,
  ]);

  // ============================================================
  // TOTALEN
  // ============================================================

  const totaalExcl = gefilterd.reduce(
    (totaal, f) =>
      totaal + Number(f.bedrag_excl_btw || 0),
    0
  );

  const totaalBtw = gefilterd.reduce(
    (totaal, f) =>
      totaal + Number(f.btw_bedrag || 0),
    0
  );

  const totaalIncl = gefilterd.reduce(
    (totaal, f) =>
      totaal + Number(f.bedrag_incl_btw || 0),
    0
  );

  const openstaand = facturen
    .filter(
      (f) =>
        f.status !== "Goedgekeurd" &&
        f.status !== "Betaald"
    )
    .reduce(
      (totaal, f) =>
        totaal + Number(f.bedrag_incl_btw || 0),
      0
    );

  // ============================================================
  // HULPFUNCTIES
  // ============================================================

  function euro(bedrag) {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
    }).format(Number(bedrag) || 0);
  }

  function statusStyle(status) {
    const styles = {
      "Ter controle": {
        background: "#fef3c7",
        color: "#92400e",
      },
      Goedgekeurd: {
        background: "#dcfce7",
        color: "#166534",
      },
      Afgekeurd: {
        background: "#fee2e2",
        color: "#991b1b",
      },
      Betaald: {
        background: "#dbeafe",
        color: "#1d4ed8",
      },
    };

    return (
      styles[status] || {
        background: "#f1f5f9",
        color: "#475569",
      }
    );
  }

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 11px",
    border: "1px solid #cbd5e1",
    borderRadius: "9px",
    fontSize: "14px",
    background: "#ffffff",
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "25px",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          background: "#ffffff",
          borderRadius: "18px",
          padding: "22px",
          marginBottom: "20px",
          border: "1px solid #dcfce7",
          boxShadow: "0 8px 24px rgba(0,0,0,.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: "#15803d",
                fontSize: "28px",
              }}
            >
              💶 ZZP Facturen
            </h1>

            <p
              style={{
                margin: "6px 0 0",
                color: "#64748b",
              }}
            >
              Facturen registreren, controleren en goedkeuren
            </p>
          </div>

          <button
            type="button"
            className="new-btn"
            onClick={openNieuweFactuur}
            style={{
              background: "#16a34a",
            }}
          >
            + Nieuwe factuur
          </button>
        </div>
      </div>

      {/* STATISTIEKEN */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <DashboardCard
          titel="Facturen"
          waarde={gefilterd.length}
          icoon="🧾"
          kleur="#2563eb"
        />

        <DashboardCard
          titel="Excl. BTW"
          waarde={euro(totaalExcl)}
          icoon="💰"
          kleur="#16a34a"
        />

        <DashboardCard
          titel="BTW"
          waarde={euro(totaalBtw)}
          icoon="🧮"
          kleur="#7c3aed"
        />

        <DashboardCard
          titel="Incl. BTW"
          waarde={euro(totaalIncl)}
          icoon="💶"
          kleur="#0891b2"
        />

        <DashboardCard
          titel="Openstaand"
          waarde={euro(openstaand)}
          icoon="⏳"
          kleur="#ea580c"
        />
      </div>

      {/* FILTERS */}

      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "18px",
          marginBottom: "20px",
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: "12px",
          }}
        >
          <input
            value={zoekterm}
            onChange={(e) =>
              setZoekterm(e.target.value)
            }
            placeholder="🔎 Zoek factuur, ZZP'er, terminal..."
            style={inputStyle}
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            style={inputStyle}
          >
            <option value="">Alle statussen</option>
            <option value="Ter controle">
              Ter controle
            </option>
            <option value="Goedgekeurd">
              Goedgekeurd
            </option>
            <option value="Afgekeurd">
              Afgekeurd
            </option>
            <option value="Betaald">
              Betaald
            </option>
          </select>

          <select
            value={terminalFilter}
            onChange={(e) =>
              setTerminalFilter(e.target.value)
            }
            style={inputStyle}
          >
            <option value="">
              Alle terminals
            </option>

            {terminals.map((terminal) => (
              <option
                key={terminal.id}
                value={terminal.naam}
              >
                {terminal.naam}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABEL */}

      <div
        style={{
          background: "#ffffff",
          borderRadius: "18px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        {laden ? (
          <div
            style={{
              padding: "60px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            ⏳ Facturen laden...
          </div>
        ) : gefilterd.length === 0 ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            <div
              style={{
                fontSize: "45px",
                marginBottom: "10px",
              }}
            >
              🧾
            </div>

            <strong
              style={{
                display: "block",
                color: "#334155",
                fontSize: "18px",
              }}
            >
              Geen facturen gevonden
            </strong>

            <div style={{ marginTop: "5px" }}>
              Voeg een nieuwe ZZP-factuur toe.
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: "1200px",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#15803d",
                    color: "#ffffff",
                  }}
                >
                  <th style={thStyle}>
                    Factuur
                  </th>

                  <th style={thStyle}>
                    ZZP'er
                  </th>

                  <th style={thStyle}>
                    Datum
                  </th>

                  <th style={thStyle}>
                    Periode
                  </th>

                  <th style={thStyle}>
                    Terminal
                  </th>

                  <th style={thStyle}>
                    Uren
                  </th>

                  <th style={thStyle}>
                    Bedrag
                  </th>

                  <th style={thStyle}>
                    Status
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      textAlign: "center",
                    }}
                  >
                    Acties
                  </th>
                </tr>
              </thead>

              <tbody>
                {gefilterd.map((factuur) => {
                  const badge =
                    statusStyle(
                      factuur.status
                    );

                  return (
                    <tr
                      key={factuur.id}
                      style={{
                        borderBottom:
                          "1px solid #e2e8f0",
                      }}
                    >
                      <td style={tdStyle}>
                        <strong>
                          {
                            factuur.factuurnummer
                          }
                        </strong>

                        {factuur.bestand_url && (
                          <div
                            style={{
                              marginTop: "4px",
                            }}
                          >
                            <a
                              href={
                                factuur.bestand_url
                              }
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color:
                                  "#2563eb",
                                fontWeight:
                                  "700",
                              }}
                            >
                              📄 PDF
                            </a>
                          </div>
                        )}
                      </td>

                      <td style={tdStyle}>
                        {factuur.zzper || "-"}
                      </td>

                      <td style={tdStyle}>
                        {factuur.factuurdatum || "-"}
                      </td>

                      <td style={tdStyle}>
                        {factuur.periode_van ||
                        factuur.periode_tot
                          ? `${factuur.periode_van || "-"} t/m ${
                              factuur.periode_tot || "-"
                            }`
                          : "-"}
                      </td>

                      <td style={tdStyle}>
                        {factuur.terminal || "-"}
                      </td>

                      <td style={tdStyle}>
                        {Number(
                          factuur.uren || 0
                        ).toFixed(2)}
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          fontWeight: "700",
                        }}
                      >
                        {euro(
                          factuur.bedrag_incl_btw
                        )}
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            ...statusBadgeStyle,
                            background:
                              badge.background,
                            color:
                              badge.color,
                          }}
                        >
                          {factuur.status ||
                            "Ter controle"}
                        </span>
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "center",
                            gap: "6px",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <button
                            type="button"
                            title="Controleren"
                            onClick={() =>
                              controleerFactuur(
                                factuur
                              )
                            }
                            style={{
                              ...actieButton,
                              background:
                                "#2563eb",
                            }}
                          >
                            🔎
                          </button>

                          <button
                            type="button"
                            title="Bewerken"
                            onClick={() =>
                              openBewerken(
                                factuur
                              )
                            }
                            style={{
                              ...actieButton,
                              background:
                                "#16a34a",
                            }}
                          >
                            ✏️
                          </button>

                          {factuur.status !==
                            "Goedgekeurd" && (
                            <button
                              type="button"
                              title="Goedkeuren"
                              onClick={() =>
                                wijzigStatus(
                                  factuur,
                                  "Goedgekeurd"
                                )
                              }
                              style={{
                                ...actieButton,
                                background:
                                  "#15803d",
                              }}
                            >
                              ✅
                            </button>
                          )}

                          {factuur.status !==
                            "Afgekeurd" && (
                            <button
                              type="button"
                              title="Afkeuren"
                              onClick={() =>
                                wijzigStatus(
                                  factuur,
                                  "Afgekeurd"
                                )
                              }
                              style={{
                                ...actieButton,
                                background:
                                  "#dc2626",
                              }}
                            >
                              ❌
                            </button>
                          )}

                          {factuur.status ===
                            "Goedgekeurd" && (
                            <button
                              type="button"
                              title="Betalen"
                              onClick={() =>
                                wijzigStatus(
                                  factuur,
                                  "Betaald"
                                )
                              }
                              style={{
                                ...actieButton,
                                background:
                                  "#0891b2",
                              }}
                            >
                              💶
                            </button>
                          )}

                          <button
                            type="button"
                            title="Verwijderen"
                            onClick={() =>
                              verwijderFactuur(
                                factuur
                              )
                            }
                            style={{
                              ...actieButton,
                              background:
                                "#991b1b",
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================
          CONTROLE MODAL
      ======================================================== */}

      {toonControle && (
        <div style={overlayStyle(1100)}>
          <div style={modalStyle(820)}>
            <div style={modalHeaderStyle}>
              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#334155",
                  }}
                >
                  🔎 Factuurcontrole
                </h2>

                {controleResultaat?.factuur && (
                  <div
                    style={{
                      marginTop: "5px",
                      color: "#64748b",
                    }}
                  >
                    {
                      controleResultaat.factuur
                        .factuurnummer
                    }{" "}
                    —{" "}
                    {
                      controleResultaat.factuur
                        .zzper
                    }
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setToonControle(false)
                }
                style={closeButtonStyle}
              >
                ✕
              </button>
            </div>

            {controleBezig ? (
              <div
                style={{
                  padding: "50px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                <div
                  style={{
                    fontSize: "40px",
                  }}
                >
                  ⏳
                </div>

                Urenregistratie wordt gecontroleerd...
              </div>
            ) : controleResultaat?.fout ? (
              <div
                style={{
                  padding: "16px",
                  background: "#fee2e2",
                  border:
                    "1px solid #fecaca",
                  borderRadius: "12px",
                  color: "#991b1b",
                }}
              >
                <strong>
                  ❌ Controle mislukt
                </strong>

                <div
                  style={{
                    marginTop: "5px",
                  }}
                >
                  {controleResultaat.fout}
                </div>
              </div>
            ) : controleResultaat ? (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit,minmax(180px,1fr))",
                    gap: "12px",
                    marginBottom: "18px",
                  }}
                >
                  <DashboardCard
                    titel="Factuururen"
                    waarde={`${controleResultaat.factuurUren.toFixed(
                      2
                    )} uur`}
                    icoon="🧾"
                    kleur="#2563eb"
                  />

                  <DashboardCard
                    titel="Geregistreerd"
                    waarde={`${controleResultaat.geregistreerdeUren.toFixed(
                      2
                    )} uur`}
                    icoon="⏱"
                    kleur="#7c3aed"
                  />

                  <DashboardCard
                    titel="Verschil"
                    waarde={`${
                      controleResultaat.verschil > 0
                        ? "+"
                        : ""
                    }${controleResultaat.verschil.toFixed(
                      2
                    )} uur`}
                    icoon={
                      controleResultaat.verschil ===
                      0
                        ? "🟢"
                        : "🔴"
                    }
                    kleur={
                      controleResultaat.verschil ===
                      0
                        ? "#16a34a"
                        : "#dc2626"
                    }
                  />
                </div>

                <div
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    marginBottom: "18px",
                    background:
                      controleResultaat.akkoord
                        ? "#dcfce7"
                        : "#fee2e2",
                    color:
                      controleResultaat.akkoord
                        ? "#166534"
                        : "#991b1b",
                    border:
                      `1px solid ${
                        controleResultaat.akkoord
                          ? "#bbf7d0"
                          : "#fecaca"
                      }`,
                  }}
                >
                  <strong
                    style={{
                      fontSize: "17px",
                    }}
                  >
                    {controleResultaat.akkoord
                      ? "🟢 Factuurcontrole akkoord"
                      : "🔴 Factuurcontrole niet akkoord"}
                  </strong>

                  <div
                    style={{
                      marginTop: "5px",
                    }}
                  >
                    {controleResultaat.akkoord
                      ? "De factuur kan worden goedgekeurd."
                      : "Controleer de afwijkingen voordat je goedkeurt."}
                  </div>
                </div>

                <div
                  style={{
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  {controleResultaat.regels.map(
                    (regel, index) => {
                      const ok =
                        regel.status ===
                        "ok";

                      const fout =
                        regel.status ===
                        "fout";

                      return (
                        <div
                          key={`${regel.label}-${index}`}
                          style={{
                            display:
                              "grid",
                            gridTemplateColumns:
                              "170px 150px 1fr",
                            gap: "10px",
                            padding:
                              "13px",
                            borderBottom:
                              index ===
                              controleResultaat
                                .regels
                                .length -
                                1
                                ? "none"
                                : "1px solid #e2e8f0",
                          }}
                        >
                          <strong>
                            {regel.label}
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

                          <div
                            style={{
                              color:
                                "#475569",
                            }}
                          >
                            <strong>
                              {regel.waarde}
                            </strong>

                            {regel.detail && (
                              <div
                                style={{
                                  marginTop:
                                    "3px",
                                }}
                              >
                                {regel.detail}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "flex-end",
                    gap: "10px",
                    marginTop: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  {controleResultaat.factuur
                    ?.bestand_url && (
                    <a
                      href={
                        controleResultaat
                          .factuur
                          .bestand_url
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="new-btn"
                      style={{
                        background:
                          "#2563eb",
                        color:
                          "#ffffff",
                        textDecoration:
                          "none",
                      }}
                    >
                      📄 PDF openen
                    </a>
                  )}

                  <button
                    type="button"
                    className="new-btn"
                    onClick={() =>
                      setToonControle(false)
                    }
                    style={{
                      background:
                        "#64748b",
                    }}
                  >
                    Sluiten
                  </button>

                  <button
                    type="button"
                    className="new-btn"
                    disabled={
                      !controleResultaat.akkoord
                    }
                    onClick={() => {
                      setToonControle(false);

                      wijzigStatus(
                        controleResultaat.factuur,
                        "Goedgekeurd"
                      );
                    }}
                    style={{
                      background:
                        controleResultaat.akkoord
                          ? "#16a34a"
                          : "#94a3b8",
                      cursor:
                        controleResultaat.akkoord
                          ? "pointer"
                          : "not-allowed",
                    }}
                  >
                    🟢 Goedkeuren
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* ========================================================
          FACTUUR FORMULIER
      ======================================================== */}

      {toonForm && (
        <div style={overlayStyle(1000)}>
          <div style={modalStyle(720)}>
            <div style={modalHeaderStyle}>
              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#334155",
                  }}
                >
                  {bewerken
                    ? "✏️ Factuur bewerken"
                    : "➕ Nieuwe ZZP-factuur"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setToonForm(false);
                  setBewerken(null);
                }}
                style={closeButtonStyle}
              >
                ✕
              </button>
            </div>

            <form onSubmit={opslaan}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(220px,1fr))",
                  gap: "12px",
                }}
              >
                <FormField
                  label="Factuurnummer"
                  required
                >
                  <input
                    name="factuurnummer"
                    value={
                      formulier.factuurnummer
                    }
                    onChange={wijzig}
                    style={inputStyle}
                  />
                </FormField>

                <FormField
                  label="ZZP'er"
                  required
                >
                  <select
                    name="zzper"
                    value={formulier.zzper}
                    onChange={wijzig}
                    style={inputStyle}
                  >
                    <option value="">
                      Selecteer ZZP'er
                    </option>

                    {zzpers.map((zzp) => (
                      <option
                        key={zzp.id}
                        value={zzp.naam}
                      >
                        {zzp.naam}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label="Factuurdatum"
                  required
                >
                  <input
                    type="date"
                    name="factuurdatum"
                    value={
                      formulier.factuurdatum
                    }
                    onChange={wijzig}
                    style={inputStyle}
                  />
                </FormField>

                <FormField label="Terminal">
                  <select
                    name="terminal"
                    value={
                      formulier.terminal
                    }
                    onChange={wijzig}
                    style={inputStyle}
                  >
                    <option value="">
                      Selecteer terminal
                    </option>

                    {terminals.map(
                      (terminal) => (
                        <option
                          key={terminal.id}
                          value={terminal.naam}
                        >
                          {terminal.naam}
                        </option>
                      )
                    )}
                  </select>
                </FormField>

                <FormField label="Periode van">
                  <input
                    type="date"
                    name="periode_van"
                    value={
                      formulier.periode_van
                    }
                    onChange={wijzig}
                    style={inputStyle}
                  />
                </FormField>

                <FormField label="Periode tot">
                  <input
                    type="date"
                    name="periode_tot"
                    value={
                      formulier.periode_tot
                    }
                    onChange={wijzig}
                    style={inputStyle}
                  />
                </FormField>

                <FormField label="Uren">
                  <input
                    type="number"
                    step="0.01"
                    name="uren"
                    value={formulier.uren}
                    onChange={wijzig}
                    style={inputStyle}
                  />
                </FormField>

                <FormField label="Uurtarief">
                  <input
                    type="number"
                    step="0.01"
                    name="uurtarief"
                    value={
                      formulier.uurtarief
                    }
                    onChange={wijzig}
                    style={inputStyle}
                  />
                </FormField>

                <FormField label="BTW %">
                  <input
                    type="number"
                    step="0.01"
                    name="btw_percentage"
                    value={
                      formulier.btw_percentage
                    }
                    onChange={wijzig}
                    style={inputStyle}
                  />
                </FormField>

                <FormField label="Status">
                  <select
                    name="status"
                    value={
                      formulier.status
                    }
                    onChange={wijzig}
                    style={inputStyle}
                  >
                    <option value="Ter controle">
                      Ter controle
                    </option>
                    <option value="Goedgekeurd">
                      Goedgekeurd
                    </option>
                    <option value="Afgekeurd">
                      Afgekeurd
                    </option>
                    <option value="Betaald">
                      Betaald
                    </option>
                  </select>
                </FormField>
              </div>

              <FormField label="Omschrijving">
                <textarea
                  name="omschrijving"
                  value={
                    formulier.omschrijving
                  }
                  onChange={wijzig}
                  rows={3}
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Opmerking">
                <textarea
                  name="opmerking"
                  value={
                    formulier.opmerking
                  }
                  onChange={wijzig}
                  rows={3}
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Factuur PDF">
                <input
                  type="file"
                  name="bestand"
                  accept=".pdf,application/pdf"
                  onChange={wijzig}
                  style={inputStyle}
                />

                {bewerken?.bestand_url && (
                  <div
                    style={{
                      marginTop: "7px",
                    }}
                  >
                    <a
                      href={
                        bewerken.bestand_url
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      📄 Huidige PDF openen
                    </a>
                  </div>
                )}
              </FormField>

              {/* BEDRAGEN */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3,1fr)",
                  gap: "10px",
                  marginTop: "15px",
                  marginBottom: "20px",
                }}
              >
                <DashboardCard
                  titel="Excl. BTW"
                  waarde={euro(
                    berekenBedragen(
                      formulier.uren,
                      formulier.uurtarief,
                      formulier.btw_percentage
                    ).excl
                  )}
                  icoon="💰"
                  kleur="#16a34a"
                />

                <DashboardCard
                  titel="BTW"
                  waarde={euro(
                    berekenBedragen(
                      formulier.uren,
                      formulier.uurtarief,
                      formulier.btw_percentage
                    ).btw
                  )}
                  icoon="🧮"
                  kleur="#7c3aed"
                />

                <DashboardCard
                  titel="Incl. BTW"
                  waarde={euro(
                    berekenBedragen(
                      formulier.uren,
                      formulier.uurtarief,
                      formulier.btw_percentage
                    ).incl
                  )}
                  icoon="💶"
                  kleur="#2563eb"
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  className="new-btn"
                  onClick={() => {
                    setToonForm(false);
                    setBewerken(null);
                  }}
                  style={{
                    background:
                      "#64748b",
                  }}
                >
                  Annuleren
                </button>

                <button
                  type="submit"
                  className="new-btn"
                  disabled={opslaanBezig}
                  style={{
                    background:
                      "#16a34a",
                  }}
                >
                  {opslaanBezig
                    ? "⏳ Opslaan..."
                    : "💾 Factuur opslaan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPONENTEN
// ============================================================

function DashboardCard({
  titel,
  waarde,
  icoon,
  kleur,
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "14px",
        padding: "16px",
        border: `1px solid ${kleur}33`,
        borderLeft: `4px solid ${kleur}`,
        boxShadow:
          "0 4px 12px rgba(0,0,0,.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: "#64748b",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          {titel}
        </span>

        <span style={{ fontSize: "21px" }}>
          {icoon}
        </span>
      </div>

      <strong
        style={{
          display: "block",
          marginTop: "7px",
          fontSize: "21px",
          color: kleur,
        }}
      >
        {waarde}
      </strong>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label
        style={{
          display: "block",
          marginBottom: "6px",
          fontSize: "13px",
          fontWeight: "700",
          color: "#374151",
        }}
      >
        {label}

        {required && (
          <span style={{ color: "#dc2626" }}>
            {" "}
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

// ============================================================
// STIJLEN
// ============================================================

const thStyle = {
  padding: "13px 9px",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "12px 9px",
  whiteSpace: "nowrap",
};

const statusBadgeStyle = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  fontWeight: "700",
  fontSize: "11px",
  whiteSpace: "nowrap",
};

const actieButton = {
  width: "34px",
  height: "34px",
  border: "none",
  borderRadius: "7px",
  color: "#ffffff",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "700",
};

const closeButtonStyle = {
  border: "none",
  background: "#f1f5f9",
  width: "38px",
  height: "38px",
  borderRadius: "8px",
  fontSize: "18px",
  cursor: "pointer",
};

const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

function overlayStyle(zIndex) {
  return {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,.60)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex,
  };
}

function modalStyle(maxWidth) {
  return {
    width: "100%",
    maxWidth: `${maxWidth}px`,
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "25px",
    boxSizing: "border-box",
    boxShadow:
      "0 20px 50px rgba(0,0,0,.25)",
  };
}