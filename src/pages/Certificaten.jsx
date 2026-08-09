import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import CertificatenForm from "../components/CertificatenForm";

export default function Certificaten() {
  const [certificaten, setCertificaten] =
    useState([]);

  const [zoekterm, setZoekterm] =
    useState("");

  const [filterStatus, setFilterStatus] =
    useState("Alle");

  const [toonForm, setToonForm] =
    useState(false);

  const [geselecteerd, setGeselecteerd] =
    useState(null);

  const [laden, setLaden] =
    useState(true);

  useEffect(() => {
    laadCertificaten();
  }, []);

  async function laadCertificaten() {
    setLaden(true);

    const { data, error } =
      await supabase
        .from("certificaten")
        .select("*")
        .order("geldig_tot", {
          ascending: true,
        });

    if (error) {
      console.error(error);
      alert(error.message);
      setLaden(false);
      return;
    }

    setCertificaten(data || []);
    setLaden(false);
  }

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

    if (
      status === "Bijna verlopen"
    ) {
      return {
        background: "#fef3c7",
        color: "#92400e",
      };
    }

    return {
      background: "#dcfce7",
      color: "#166534",
    };
  }

  async function verwijder(id) {
    if (
      !window.confirm(
        "Weet je zeker dat je dit certificaat wilt verwijderen?"
      )
    ) {
      return;
    }

    const { error } =
      await supabase
        .from("certificaten")
        .delete()
        .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await laadCertificaten();
  }

  function openNieuw() {
    setGeselecteerd(null);
    setToonForm(true);
  }

  function openBewerken(certificaat) {
    setGeselecteerd(certificaat);
    setToonForm(true);
  }

  const gefilterd =
    certificaten.filter((item) => {
      const zoek =
        zoekterm.toLowerCase();

      const komtVoor =
        (item.medewerker || "")
          .toLowerCase()
          .includes(zoek) ||
        (item.certificaat || "")
          .toLowerCase()
          .includes(zoek) ||
        (item.certificaatnummer || "")
          .toLowerCase()
          .includes(zoek);

      const status =
        bepaalStatus(
          item.geldig_tot
        );

      const statusGoed =
        filterStatus === "Alle" ||
        filterStatus === status;

      return (
        komtVoor && statusGoed
      );
    });

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

  return (
    <>
      <div>
        {/* HEADER */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            padding: "25px 30px",
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
              alignItems: "center",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  color: "#15803d",
                  fontSize: "32px",
                }}
              >
                🏅 Certificaten
              </h1>

              <p
                style={{
                  color: "#64748b",
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
                background: "#16a34a",
              }}
            >
              + Nieuw certificaat
            </button>
          </div>
        </div>

        {/* STATISTIEKEN */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              padding: "20px",
              borderRadius: "14px",
              border:
                "1px solid #dcfce7",
            }}
          >
            <div
              style={{
                color: "#64748b",
              }}
            >
              Totaal
            </div>

            <strong
              style={{
                fontSize: "28px",
                color: "#15803d",
              }}
            >
              {certificaten.length}
            </strong>
          </div>

          <div
            style={{
              background: "#dcfce7",
              padding: "20px",
              borderRadius: "14px",
            }}
          >
            <div
              style={{
                color: "#166534",
              }}
            >
              🟢 Geldig
            </div>

            <strong
              style={{
                fontSize: "28px",
                color: "#166534",
              }}
            >
              {aantalGeldig}
            </strong>
          </div>

          <div
            style={{
              background: "#fef3c7",
              padding: "20px",
              borderRadius: "14px",
            }}
          >
            <div
              style={{
                color: "#92400e",
              }}
            >
              🟠 Bijna verlopen
            </div>

            <strong
              style={{
                fontSize: "28px",
                color: "#92400e",
              }}
            >
              {aantalBijna}
            </strong>
          </div>

          <div
            style={{
              background: "#fee2e2",
              padding: "20px",
              borderRadius: "14px",
            }}
          >
            <div
              style={{
                color: "#b91c1c",
              }}
            >
              🔴 Verlopen
            </div>

            <strong
              style={{
                fontSize: "28px",
                color: "#b91c1c",
              }}
            >
              {aantalVerlopen}
            </strong>
          </div>
        </div>

        {/* FILTERS */}

        <div
          style={{
            background: "#ffffff",
            padding: "20px",
            borderRadius: "16px",
            marginBottom: "20px",
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="🔍 Zoek medewerker of certificaat..."
            value={zoekterm}
            onChange={(e) =>
              setZoekterm(
                e.target.value
              )
            }
            style={{
              flex: 1,
              minWidth: "250px",
            }}
          />

          <select
            value={filterStatus}
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
          </select>
        </div>

        {/* TABEL */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            padding: "20px",
            boxShadow:
              "0 8px 24px rgba(0,0,0,.08)",
            overflowX: "auto",
          }}
        >
          {laden ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
              }}
            >
              ⏳ Certificaten laden...
            </div>
          ) : (
            <table
              style={{
                width: "100%",
                minWidth: "950px",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr>
                  <th>Medewerker</th>
                  <th>Certificaat</th>
                  <th>Nummer</th>
                  <th>Behaald</th>
                  <th>Geldig tot</th>
                  <th>Status</th>
                  <th>Document</th>
                  <th>Acties</th>
                </tr>
              </thead>

              <tbody>
                {gefilterd.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        padding: "40px",
                        textAlign:
                          "center",
                        color:
                          "#64748b",
                      }}
                    >
                      Geen certificaten
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
                          key={item.id}
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
                            {item.certificaatnummer ||
                              "-"}
                          </td>

                          <td>
                            {item.behaald_op ||
                              "-"}
                          </td>

                          <td>
                            {item.geldig_tot ||
                              "-"}
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
                              {status}
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
                                gap: "8px",
                              }}
                            >
                              <button
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
      </div>

      {/* MODAL */}

      {toonForm && (
        <div
          className="modal"
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15,23,42,.55)",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "650px",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: "18px",
              padding: "25px",
            }}
          >
            <CertificatenForm
              certificaat={
                geselecteerd
              }
              onSaved={() => {
                setToonForm(false);
                setGeselecteerd(
                  null
                );
                laadCertificaten();
              }}
              onCancel={() => {
                setToonForm(false);
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