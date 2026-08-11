// src/pages/Certificaten.jsx

import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import CertificatenForm from "../components/CertificatenForm";
import TerminalCertificaten from "../components/certificaten/TerminalCertificaten";

export default function Certificaten() {
  const [certificaten, setCertificaten] = useState([]);
  const [medewerkers, setMedewerkers] = useState([]);

  const [zoekterm, setZoekterm] = useState("");

  const [filterStatus, setFilterStatus] =
    useState("Alle");

  const [toonForm, setToonForm] =
    useState(false);

  const [geselecteerd, setGeselecteerd] =
    useState(null);

  const [laden, setLaden] =
    useState(true);

  const [weergave, setWeergave] =
    useState("lijst");

  // ==========================================
  // LADEN
  // ==========================================

  useEffect(() => {
    laadGegevens();
  }, []);

  async function laadGegevens() {
    setLaden(true);

    await Promise.all([
      laadCertificaten(),
      laadMedewerkers(),
    ]);

    setLaden(false);
  }

  async function laadCertificaten() {
    const { data, error } = await supabase
      .from("certificaten")
      .select("*")
      .order("geldig_tot", {
        ascending: true,
      });

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setCertificaten(data || []);
  }

  async function laadMedewerkers() {
    const { data, error } = await supabase
      .from("medewerkers")
      .select("id, naam")
      .order("naam");

    if (error) {
      console.error(error);
      return;
    }

    setMedewerkers(data || []);
  }

  // ==========================================
  // STATUS
  // ==========================================

  function bepaalStatus(datum) {
    if (!datum) {
      return "Geen datum";
    }

    const vandaag = new Date();

    vandaag.setHours(0, 0, 0, 0);

    const geldigTot = new Date(
      `${datum}T00:00:00`
    );

    const verschil = Math.ceil(
      (geldigTot - vandaag) /
        (1000 * 60 * 60 * 24)
    );

    if (verschil < 0) {
      return "Verlopen";
    }

    if (verschil <= 30) {
      return "Bijna verlopen";
    }

    return "Geldig";
  }

  function statusKleur(status) {
    if (status === "Verlopen") {
      return {
        background: "#fee2e2",
        color: "#b91c1c",
      };
    }

    if (status === "Bijna verlopen") {
      return {
        background: "#fef3c7",
        color: "#92400e",
      };
    }

    if (status === "Geen datum") {
      return {
        background: "#f1f5f9",
        color: "#475569",
      };
    }

    return {
      background: "#dcfce7",
      color: "#166534",
    };
  }

  // ==========================================
  // CERTIFICAAT VERWIJDEREN
  // ==========================================

  async function verwijder(id) {
    if (
      !window.confirm(
        "Weet je zeker dat je dit certificaat wilt verwijderen?"
      )
    ) {
      return;
    }

    const { error } = await supabase
      .from("certificaten")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await laadCertificaten();
  }

  // ==========================================
  // NIEUW CERTIFICAAT
  // ==========================================

  function openNieuw() {
    setGeselecteerd(null);
    setToonForm(true);
  }

  // ==========================================
  // BEWERKEN
  // ==========================================

  function openBewerken(certificaat) {
    setGeselecteerd(certificaat);
    setToonForm(true);
  }

  // ==========================================
  // GEFILTERDE LIJST
  // ==========================================

  const gefilterd = certificaten.filter(
    (item) => {
      const zoek =
        zoekterm
          .toLowerCase()
          .trim();

      const komtVoor =
        !zoek ||
        (item.medewerker || "")
          .toLowerCase()
          .includes(zoek) ||
        (item.certificaat || "")
          .toLowerCase()
          .includes(zoek) ||
        (item.certificaatnummer || "")
          .toLowerCase()
          .includes(zoek);

      const status = bepaalStatus(
        item.geldig_tot
      );

      const statusGoed =
        filterStatus === "Alle" ||
        filterStatus === status;

      return (
        komtVoor &&
        statusGoed
      );
    }
  );

  // ==========================================
  // STATISTIEKEN
  // ==========================================

  const aantalGeldig =
    certificaten.filter(
      (c) =>
        bepaalStatus(c.geldig_tot) ===
        "Geldig"
    ).length;

  const aantalBijna =
    certificaten.filter(
      (c) =>
        bepaalStatus(c.geldig_tot) ===
        "Bijna verlopen"
    ).length;

  const aantalVerlopen =
    certificaten.filter(
      (c) =>
        bepaalStatus(c.geldig_tot) ===
        "Verlopen"
    ).length;

  const aantalZonderDatum =
    certificaten.filter(
      (c) =>
        bepaalStatus(c.geldig_tot) ===
        "Geen datum"
    ).length;

  // ==========================================
  // MEDEWERKERS MET CERTIFICATEN
  // ==========================================

  const medewerkerOverzicht =
    medewerkers
      .map((medewerker) => {
        const eigenCertificaten =
          certificaten.filter(
            (certificaat) =>
              String(
                certificaat.medewerker_id
              ) ===
              String(
                medewerker.id
              )
          );

        return {
          ...medewerker,
          certificaten:
            eigenCertificaten,
        };
      })
      .filter((medewerker) => {
        const zoek =
          zoekterm
            .toLowerCase()
            .trim();

        if (!zoek) {
          return true;
        }

        const naamMatch =
          medewerker.naam
            ?.toLowerCase()
            .includes(zoek);

        const certificaatMatch =
          medewerker.certificaten.some(
            (certificaat) =>
              (
                certificaat.certificaat ||
                ""
              )
                .toLowerCase()
                .includes(zoek)
          );

        return (
          naamMatch ||
          certificaatMatch
        );
      });

  // ==========================================
  // MEDEWERKER STATUS
  // ==========================================

  function bepaalMedewerkerStatus(
    certificatenVanMedewerker
  ) {
    if (
      certificatenVanMedewerker.length ===
      0
    ) {
      return "Geen certificaten";
    }

    const heeftVerlopen =
      certificatenVanMedewerker.some(
        (certificaat) =>
          bepaalStatus(
            certificaat.geldig_tot
          ) === "Verlopen"
      );

    if (heeftVerlopen) {
      return "Verlopen";
    }

    const heeftBijna =
      certificatenVanMedewerker.some(
        (certificaat) =>
          bepaalStatus(
            certificaat.geldig_tot
          ) ===
          "Bijna verlopen"
      );

    if (heeftBijna) {
      return "Bijna verlopen";
    }

    const heeftGeenDatum =
      certificatenVanMedewerker.some(
        (certificaat) =>
          bepaalStatus(
            certificaat.geldig_tot
          ) === "Geen datum"
      );

    if (heeftGeenDatum) {
      return "Geen datum";
    }

    return "Geldig";
  }

  // ==========================================
  // RETURN
  // ==========================================

  return (
    <>
      {/* ======================================
          HEADER
      ======================================= */}

      <div
        style={{
          background: "#ffffff",
          borderRadius: "18px",
          padding:
            "25px 30px",
          marginBottom: "20px",
          boxShadow:
            "0 8px 20px rgba(0,0,0,.08)",
          border:
            "1px solid #dcfce7",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            flexWrap:
              "wrap",
            gap: "15px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: "#15803d",
                fontSize:
                  "32px",
              }}
            >
              🏅 Certificaten
            </h1>

            <p
              style={{
                color:
                  "#64748b",
                marginBottom: 0,
              }}
            >
              Certificaten en
              geldigheid van
              medewerkers
            </p>
          </div>

          <button
            className="new-btn"
            onClick={openNieuw}
            style={{
              background:
                "#16a34a",
            }}
          >
            + Nieuw certificaat
          </button>
        </div>
      </div>

      {/* ======================================
          STATISTIEKEN
      ======================================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "15px",
          marginBottom:
            "20px",
        }}
      >
        {/* TOTAAL */}

        <div
          style={{
            background:
              "#ffffff",
            padding:
              "20px",
            borderRadius:
              "14px",
            border:
              "1px solid #dcfce7",
          }}
        >
          <div
            style={{
              color:
                "#64748b",
            }}
          >
            Totaal
          </div>

          <strong
            style={{
              fontSize:
                "28px",
              color:
                "#15803d",
            }}
          >
            {
              certificaten.length
            }
          </strong>
        </div>

        {/* GELDIG */}

        <div
          style={{
            background:
              "#dcfce7",
            padding:
              "20px",
            borderRadius:
              "14px",
          }}
        >
          <div
            style={{
              color:
                "#166534",
            }}
          >
            🟢 Geldig
          </div>

          <strong
            style={{
              fontSize:
                "28px",
              color:
                "#166534",
            }}
          >
            {aantalGeldig}
          </strong>
        </div>

        {/* BIJNA */}

        <div
          style={{
            background:
              "#fef3c7",
            padding:
              "20px",
            borderRadius:
              "14px",
          }}
        >
          <div
            style={{
              color:
                "#92400e",
            }}
          >
            🟠 Bijna verlopen
          </div>

          <strong
            style={{
              fontSize:
                "28px",
              color:
                "#92400e",
            }}
          >
            {aantalBijna}
          </strong>
        </div>

        {/* VERLOPEN */}

        <div
          style={{
            background:
              "#fee2e2",
            padding:
              "20px",
            borderRadius:
              "14px",
          }}
        >
          <div
            style={{
              color:
                "#b91c1c",
            }}
          >
            🔴 Verlopen
          </div>

          <strong
            style={{
              fontSize:
                "28px",
              color:
                "#b91c1c",
            }}
          >
            {
              aantalVerlopen
            }
          </strong>
        </div>

        {/* GEEN DATUM */}

        <div
          style={{
            background:
              "#f1f5f9",
            padding:
              "20px",
            borderRadius:
              "14px",
          }}
        >
          <div
            style={{
              color:
                "#475569",
            }}
          >
            ⚪ Geen datum
          </div>

          <strong
            style={{
              fontSize:
                "28px",
              color:
                "#475569",
            }}
          >
            {
              aantalZonderDatum
            }
          </strong>
        </div>
      </div>

      {/* ======================================
          ZOEKEN
      ======================================= */}

      <div
        style={{
          background:
            "#ffffff",
          padding:
            "20px",
          borderRadius:
            "16px",
          marginBottom:
            "20px",
          display:
            "flex",
          gap: "15px",
          flexWrap:
            "wrap",
        }}
      >
        <input
          type="text"
          placeholder="🔍 Zoek medewerker of certificaat..."
          value={
            zoekterm
          }
          onChange={(e) =>
            setZoekterm(
              e.target.value
            )
          }
          style={{
            flex: 1,
            minWidth:
              "250px",
            boxSizing:
              "border-box",
          }}
        />

        <select
          value={
            filterStatus
          }
          onChange={(e) =>
            setFilterStatus(
              e.target.value
            )
          }
        >
          <option value="Alle">
            Alle statussen
          </option>

          <option value="Geldig">
            🟢 Geldig
          </option>

          <option value="Bijna verlopen">
            🟠 Bijna verlopen
          </option>

          <option value="Verlopen">
            🔴 Verlopen
          </option>

          <option value="Geen datum">
            ⚪ Geen datum
          </option>
        </select>
      </div>

      {/* ======================================
          WEERGAVE
      ======================================= */}

      <div
        style={{
          background:
            "#ffffff",
          padding:
            "15px",
          borderRadius:
            "14px",
          marginBottom:
            "20px",
          display:
            "flex",
          gap: "10px",
          flexWrap:
            "wrap",
        }}
      >
        <button
          className="new-btn"
          onClick={() =>
            setWeergave(
              "lijst"
            )
          }
          style={{
            background:
              weergave ===
              "lijst"
                ? "#16a34a"
                : "#64748b",
          }}
        >
          📋 Certificatenlijst
        </button>

        <button
          className="new-btn"
          onClick={() =>
            setWeergave(
              "medewerkers"
            )
          }
          style={{
            background:
              weergave ===
              "medewerkers"
                ? "#16a34a"
                : "#64748b",
          }}
        >
          👷 Per medewerker
        </button>
      </div>

      {/* ======================================
          CERTIFICATENLIJST
      ======================================= */}

      {weergave ===
        "lijst" && (
        <div
          style={{
            background:
              "#ffffff",
            borderRadius:
              "18px",
            padding:
              "20px",
            marginBottom:
              "25px",
            boxShadow:
              "0 8px 24px rgba(0,0,0,.08)",
            overflowX:
              "auto",
          }}
        >
          {laden ? (
            <div
              style={{
                padding:
                  "40px",
                textAlign:
                  "center",
              }}
            >
              ⏳ Certificaten
              laden...
            </div>
          ) : (
            <table
              style={{
                width:
                  "100%",
                minWidth:
                  "950px",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr>
                  <th>
                    Medewerker
                  </th>
                  <th>
                    Certificaat
                  </th>
                  <th>
                    Nummer
                  </th>
                  <th>
                    Behaald
                  </th>
                  <th>
                    Geldig tot
                  </th>
                  <th>
                    Status
                  </th>
                  <th>
                    Document
                  </th>
                  <th>
                    Acties
                  </th>
                </tr>
              </thead>

              <tbody>
                {gefilterd.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        padding:
                          "40px",
                        textAlign:
                          "center",
                        color:
                          "#64748b",
                      }}
                    >
                      Geen
                      certificaten
                      gevonden.
                    </td>
                  </tr>
                ) : (
                  gefilterd.map(
                    (item) => {
                      const status =
                        bepaalStatus(
                          item.geldig_tot
                        );

                      const kleur =
                        statusKleur(
                          status
                        );

                      return (
                        <tr
                          key={
                            item.id
                          }
                        >
                          <td>
                            <strong>
                              {
                                item.medewerker
                              }
                            </strong>
                          </td>

                          <td>
                            {
                              item.certificaat
                            }
                          </td>

                          <td>
                            {
                              item.certificaatnummer ||
                              "-"
                            }
                          </td>

                          <td>
                            {
                              item.behaald_op ||
                              "-"
                            }
                          </td>

                          <td>
                            {
                              item.geldig_tot ||
                              "-"
                            }
                          </td>

                          <td>
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
                                  "13px",
                              }}
                            >
                              {
                                status
                              }
                            </span>
                          </td>

                          <td>
                            {item.document_url ? (
                              <a
                                href={
                                  item.document_url
                                }
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  color:
                                    "#15803d",
                                  fontWeight:
                                    "600",
                                }}
                              >
                                📄 Openen
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>

                          <td>
                            <div
                              style={{
                                display:
                                  "flex",
                                gap:
                                  "8px",
                              }}
                            >
                              <button
                                type="button"
                                className="new-btn"
                                onClick={() =>
                                  openBewerken(
                                    item
                                  )
                                }
                                style={{
                                  background:
                                    "#22c55e",
                                }}
                              >
                                ✏️
                              </button>

                              <button
                                type="button"
                                className="new-btn"
                                onClick={() =>
                                  verwijder(
                                    item.id
                                  )
                                }
                                style={{
                                  background:
                                    "#dc2626",
                                }}
                              >
                                🗑
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ======================================
          PER MEDEWERKER
      ======================================= */}

      {weergave ===
        "medewerkers" && (
        <div
          style={{
            display:
              "flex",
            flexDirection:
              "column",
            gap: "15px",
            marginBottom:
              "25px",
          }}
        >
          {laden ? (
            <div
              style={{
                background:
                  "#ffffff",
                padding:
                  "40px",
                borderRadius:
                  "18px",
                textAlign:
                  "center",
              }}
            >
              ⏳ Medewerkers
              laden...
            </div>
          ) : medewerkerOverzicht.length ===
            0 ? (
            <div
              style={{
                background:
                  "#ffffff",
                padding:
                  "40px",
                borderRadius:
                  "18px",
                textAlign:
                  "center",
                color:
                  "#64748b",
              }}
            >
              Geen
              medewerkers
              gevonden.
            </div>
          ) : (
            medewerkerOverzicht.map(
              (medewerker) => {
                const status =
                  bepaalMedewerkerStatus(
                    medewerker.certificaten
                  );

                const kleur =
                  statusKleur(
                    status
                  );

                return (
                  <div
                    key={
                      medewerker.id
                    }
                    style={{
                      background:
                        "#ffffff",
                      borderRadius:
                        "18px",
                      padding:
                        "20px",
                      boxShadow:
                        "0 5px 18px rgba(0,0,0,.07)",
                      border:
                        "1px solid #e2e8f0",
                    }}
                  >
                    {/* MEDEWERKER HEADER */}

                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        gap:
                          "15px",
                        flexWrap:
                          "wrap",
                        marginBottom:
                          "15px",
                      }}
                    >
                      <div>
                        <h2
                          style={{
                            margin:
                              0,
                            color:
                              "#15803d",
                            fontSize:
                              "20px",
                          }}
                        >
                          👷{" "}
                          {
                            medewerker.naam
                          }
                        </h2>

                        <div
                          style={{
                            color:
                              "#64748b",
                            marginTop:
                              "5px",
                          }}
                        >
                          {
                            medewerker
                              .certificaten
                              .length
                          }{" "}
                          certificaat
                          {medewerker
                            .certificaten
                            .length ===
                          1
                            ? ""
                            : "en"}
                        </div>
                      </div>

                      <span
                        style={{
                          padding:
                            "7px 12px",
                          borderRadius:
                            "999px",
                          background:
                            kleur.background,
                          color:
                            kleur.color,
                          fontWeight:
                            "700",
                          fontSize:
                            "13px",
                        }}
                      >
                        {status ===
                        "Geldig"
                          ? "🟢 "
                          : status ===
                            "Bijna verlopen"
                          ? "🟠 "
                          : status ===
                            "Verlopen"
                          ? "🔴 "
                          : status ===
                            "Geen certificaten"
                          ? "⚪ "
                          : "⚠️ "}
                        {status}
                      </span>
                    </div>

                    {/* GEEN CERTIFICATEN */}

                    {medewerker
                      .certificaten
                      .length ===
                    0 ? (
                      <div
                        style={{
                          padding:
                            "15px",
                          borderRadius:
                            "10px",
                          background:
                            "#f8fafc",
                          color:
                            "#64748b",
                          border:
                            "1px dashed #cbd5e1",
                        }}
                      >
                        ⚪ Deze
                        medewerker
                        heeft nog
                        geen
                        certificaten
                        geregistreerd.
                      </div>
                    ) : (
                      <div
                        style={{
                          display:
                            "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(260px, 1fr))",
                          gap:
                            "12px",
                        }}
                      >
                        {medewerker.certificaten.map(
                          (
                            item
                          ) => {
                            const itemStatus =
                              bepaalStatus(
                                item.geldig_tot
                              );

                            const itemKleur =
                              statusKleur(
                                itemStatus
                              );

                            return (
                              <div
                                key={
                                  item.id
                                }
                                style={{
                                  border:
                                    "1px solid #e2e8f0",
                                  borderRadius:
                                    "12px",
                                  padding:
                                    "15px",
                                  background:
                                    "#f8fafc",
                                }}
                              >
                                <div
                                  style={{
                                    display:
                                      "flex",
                                    justifyContent:
                                      "space-between",
                                    alignItems:
                                      "flex-start",
                                    gap:
                                      "10px",
                                  }}
                                >
                                  <strong
                                    style={{
                                      color:
                                        "#334155",
                                      fontSize:
                                        "16px",
                                    }}
                                  >
                                    🏅{" "}
                                    {
                                      item.certificaat
                                    }
                                  </strong>

                                  <span
                                    style={{
                                      padding:
                                        "4px 8px",
                                      borderRadius:
                                        "999px",
                                      background:
                                        itemKleur.background,
                                      color:
                                        itemKleur.color,
                                      fontSize:
                                        "11px",
                                      fontWeight:
                                        "700",
                                    }}
                                  >
                                    {itemStatus}
                                  </span>
                                </div>

                                <div
                                  style={{
                                    marginTop:
                                      "12px",
                                    color:
                                      "#64748b",
                                    fontSize:
                                      "14px",
                                    lineHeight:
                                      "1.7",
                                  }}
                                >
                                  <div>
                                    <strong>
                                      Nummer:
                                    </strong>{" "}
                                    {item.certificaatnummer ||
                                      "-"}
                                  </div>

                                  <div>
                                    <strong>
                                      Behaald:
                                    </strong>{" "}
                                    {item.behaald_op ||
                                      "-"}
                                  </div>

                                  <div>
                                    <strong>
                                      Geldig tot:
                                    </strong>{" "}
                                    {item.geldig_tot ||
                                      "-"}
                                  </div>
                                </div>

                                {item.document_url && (
                                  <div
                                    style={{
                                      marginTop:
                                        "12px",
                                    }}
                                  >
                                    <a
                                      href={
                                        item.document_url
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        color:
                                          "#15803d",
                                        fontWeight:
                                          "600",
                                        textDecoration:
                                          "none",
                                      }}
                                    >
                                      📄 Document
                                      openen
                                    </a>
                                  </div>
                                )}

                                {item.opmerking && (
                                  <div
                                    style={{
                                      marginTop:
                                        "10px",
                                      padding:
                                        "8px",
                                      background:
                                        "#ffffff",
                                      borderRadius:
                                        "8px",
                                      color:
                                        "#64748b",
                                      fontSize:
                                        "13px",
                                    }}
                                  >
                                    💬{" "}
                                    {
                                      item.opmerking
                                    }
                                  </div>
                                )}

                                <div
                                  style={{
                                    display:
                                      "flex",
                                    gap:
                                      "8px",
                                    marginTop:
                                      "12px",
                                  }}
                                >
                                  <button
                                    type="button"
                                    className="new-btn"
                                    onClick={() =>
                                      openBewerken(
                                        item
                                      )
                                    }
                                    style={{
                                      background:
                                        "#22c55e",
                                      fontSize:
                                        "13px",
                                    }}
                                  >
                                    ✏️ Bewerken
                                  </button>

                                  <button
                                    type="button"
                                    className="new-btn"
                                    onClick={() =>
                                      verwijder(
                                        item.id
                                      )
                                    }
                                    style={{
                                      background:
                                        "#dc2626",
                                      fontSize:
                                        "13px",
                                    }}
                                  >
                                    🗑
                                  </button>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                );
              }
            )
          )}
        </div>
      )}

      {/* ======================================
          VERPLICHTE CERTIFICATEN PER TERMINAL
      ======================================= */}

      <TerminalCertificaten />

      {/* ======================================
          MODAL NIEUW / BEWERKEN
      ======================================= */}

      {toonForm && (
        <div
          className="modal"
          style={{
            position:
              "fixed",
            inset: 0,
            background:
              "rgba(15,23,42,.55)",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding:
              "20px",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            style={{
              background:
                "#ffffff",
              width:
                "100%",
              maxWidth:
                "650px",
              maxHeight:
                "90vh",
              overflowY:
                "auto",
              overflowX:
                "hidden",
              borderRadius:
                "18px",
              padding:
                "25px",
              boxSizing:
                "border-box",
            }}
          >
            <CertificatenForm
              certificaat={
                geselecteerd
              }
              onSaved={() => {
                setToonForm(
                  false
                );

                setGeselecteerd(
                  null
                );

                laadCertificaten();
              }}
              onCancel={() => {
                setToonForm(
                  false
                );

                setGeselecteerd(
                  null
                );
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}