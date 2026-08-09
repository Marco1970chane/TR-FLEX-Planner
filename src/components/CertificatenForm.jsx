import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function CertificatenForm({
  certificaat = null,
  onSaved,
  onCancel,
}) {
  const [medewerkers, setMedewerkers] =
    useState([]);

  const [formulier, setFormulier] = useState({
    medewerker_id: "",
    medewerker: "",
    certificaat: "",
    certificaatnummer: "",
    behaald_op: "",
    geldig_tot: "",
    opmerking: "",
  });

  const [bestand, setBestand] =
    useState(null);

  const [opslaanBezig, setOpslaanBezig] =
    useState(false);

  useEffect(() => {
    laadMedewerkers();
  }, []);

  useEffect(() => {
    if (certificaat) {
      setFormulier({
        medewerker_id:
          certificaat.medewerker_id || "",

        medewerker:
          certificaat.medewerker || "",

        certificaat:
          certificaat.certificaat || "",

        certificaatnummer:
          certificaat.certificaatnummer || "",

        behaald_op:
          certificaat.behaald_op || "",

        geldig_tot:
          certificaat.geldig_tot || "",

        opmerking:
          certificaat.opmerking || "",
      });
    } else {
      setFormulier({
        medewerker_id: "",
        medewerker: "",
        certificaat: "",
        certificaatnummer: "",
        behaald_op: "",
        geldig_tot: "",
        opmerking: "",
      });

      setBestand(null);
    }
  }, [certificaat]);

  async function laadMedewerkers() {
    const { data, error } =
      await supabase
        .from("medewerkers")
        .select("id, naam")
        .order("naam");

    if (error) {
      console.error(error);
      return;
    }

    setMedewerkers(data || []);
  }

  function wijzig(e) {
    const { name, value } = e.target;

    setFormulier((vorig) => ({
      ...vorig,
      [name]: value,
    }));
  }

  function kiesMedewerker(e) {
    const id = e.target.value;

    const medewerker =
      medewerkers.find(
        (m) => String(m.id) === String(id)
      );

    setFormulier((vorig) => ({
      ...vorig,

      medewerker_id:
        medewerker?.id || "",

      medewerker:
        medewerker?.naam || "",
    }));
  }

  function statusVanDatum(datum) {
    if (!datum) {
      return "Geen datum";
    }

    const vandaag = new Date();

    vandaag.setHours(0, 0, 0, 0);

    const geldigTot = new Date(
      `${datum}T00:00:00`
    );

    const verschil =
      Math.ceil(
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

  async function uploadBestand() {
    if (!bestand) {
      return {
        url: null,
        naam: null,
      };
    }

    const extensie =
      bestand.name.split(".").pop();

    const bestandsnaam =
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${extensie}`;

    const pad =
      `certificaten/${bestandsnaam}`;

    const { error } =
      await supabase.storage
        .from("certificaten")
        .upload(pad, bestand, {
          cacheControl: "3600",
          upsert: false,
        });

    if (error) {
      throw error;
    }

    const { data } =
      supabase.storage
        .from("certificaten")
        .getPublicUrl(pad);

    return {
      url: data.publicUrl,
      naam: bestand.name,
    };
  }

  async function opslaan(e) {
    e.preventDefault();

    if (!formulier.medewerker_id) {
      alert(
        "Selecteer eerst een medewerker."
      );
      return;
    }

    if (!formulier.certificaat) {
      alert(
        "Vul het certificaat in."
      );
      return;
    }

    setOpslaanBezig(true);

    try {
      let documentUrl =
        certificaat?.document_url || null;

      let documentNaam =
        certificaat?.document_naam || null;

      if (bestand) {
        const upload =
          await uploadBestand();

        documentUrl = upload.url;
        documentNaam = upload.naam;
      }

      const gegevens = {
        medewerker_id:
          formulier.medewerker_id,

        medewerker:
          formulier.medewerker,

        certificaat:
          formulier.certificaat,

        certificaatnummer:
          formulier.certificaatnummer,

        behaald_op:
          formulier.behaald_op || null,

        geldig_tot:
          formulier.geldig_tot || null,

        document_url:
          documentUrl,

        document_naam:
          documentNaam,

        opmerking:
          formulier.opmerking,
      };

      let error;

      if (certificaat?.id) {
        const result =
          await supabase
            .from("certificaten")
            .update(gegevens)
            .eq("id", certificaat.id);

        error = result.error;
      } else {
        const result =
          await supabase
            .from("certificaten")
            .insert([gegevens]);

        error = result.error;
      }

      if (error) {
        throw error;
      }

      alert(
        certificaat?.id
          ? "✅ Certificaat bijgewerkt!"
          : "✅ Certificaat toegevoegd!"
      );

      onSaved?.();
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Er is iets misgegaan."
      );
    } finally {
      setOpslaanBezig(false);
    }
  }

  const status =
    statusVanDatum(
      formulier.geldig_tot
    );

  return (
    <form
      onSubmit={opslaan}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          color: "#15803d",
        }}
      >
        {certificaat?.id
          ? "✏️ Certificaat bewerken"
          : "🏅 Nieuw certificaat"}
      </h2>

      <label>Medewerker</label>

      <select
        value={formulier.medewerker_id}
        onChange={kiesMedewerker}
        required
      >
        <option value="">
          Kies medewerker...
        </option>

        {medewerkers.map((m) => (
          <option
            key={m.id}
            value={m.id}
          >
            {m.naam}
          </option>
        ))}
      </select>

      <label>Certificaat</label>

      <input
        type="text"
        name="certificaat"
        value={formulier.certificaat}
        onChange={wijzig}
        placeholder="Bijvoorbeeld VCA"
        required
      />

      <label>
        Certificaatnummer
      </label>

      <input
        type="text"
        name="certificaatnummer"
        value={
          formulier.certificaatnummer
        }
        onChange={wijzig}
        placeholder="Optioneel"
      />

      <label>Behaald op</label>

      <input
        type="date"
        name="behaald_op"
        value={
          formulier.behaald_op
        }
        onChange={wijzig}
      />

      <label>Geldig tot</label>

      <input
        type="date"
        name="geldig_tot"
        value={
          formulier.geldig_tot
        }
        onChange={wijzig}
      />

      {formulier.geldig_tot && (
        <div
          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            background:
              status === "Verlopen"
                ? "#fee2e2"
                : status ===
                  "Bijna verlopen"
                ? "#fef3c7"
                : "#dcfce7",

            color:
              status === "Verlopen"
                ? "#b91c1c"
                : status ===
                  "Bijna verlopen"
                ? "#92400e"
                : "#166534",

            fontWeight: "700",
          }}
        >
          {status === "Verlopen" &&
            "🔴 Certificaat verlopen"}

          {status ===
            "Bijna verlopen" &&
            "🟠 Certificaat verloopt binnenkort"}

          {status === "Geldig" &&
            "🟢 Certificaat geldig"}
        </div>
      )}

      <label>Document</label>

      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) =>
          setBestand(
            e.target.files?.[0] ||
              null
          )
        }
      />

      {certificaat?.document_url && (
        <a
          href={
            certificaat.document_url
          }
          target="_blank"
          rel="noreferrer"
          style={{
            color: "#15803d",
            fontWeight: "600",
          }}
        >
          📄 Bestaand document openen
        </a>
      )}

      <label>Opmerking</label>

      <textarea
        name="opmerking"
        value={
          formulier.opmerking
        }
        onChange={wijzig}
        rows="4"
        placeholder="Eventuele opmerkingen..."
      />

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "15px",
        }}
      >
        <button
          className="new-btn"
          type="submit"
          disabled={opslaanBezig}
          style={{
            background: "#16a34a",
            flex: 1,
          }}
        >
          {opslaanBezig
            ? "⏳ Opslaan..."
            : certificaat?.id
            ? "💾 Wijzigen"
            : "💾 Opslaan"}
        </button>

        {onCancel && (
          <button
            className="new-btn"
            type="button"
            onClick={onCancel}
            style={{
              background: "#64748b",
            }}
          >
            Annuleren
          </button>
        )}
      </div>
    </form>
  );
}