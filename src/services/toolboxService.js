import { supabase } from "./supabase";

/**
 * Resultaat van een toolbox opslaan of bijwerken
 */
export async function slaToolboxResultaatOp({
  toolboxId,
  gebruikerId,
  score,
  geslaagd,
  geldigMaanden = 12,
}) {
  const afgerondOp = new Date();

  const geldigTot = new Date();
  geldigTot.setMonth(
    geldigTot.getMonth() + Number(geldigMaanden)
  );

  const { data, error } = await supabase
    .from("toolbox_resultaten")
    .upsert(
      {
        toolbox_id: toolboxId,
        gebruiker_id: gebruikerId,
        gelezen: true,
        score,
        geslaagd,
        afgerond_op: afgerondOp.toISOString(),
        geldig_tot: geldigTot.toISOString().split("T")[0],
      },
      {
        onConflict: "toolbox_id,gebruiker_id",
      }
    )
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
}

/**
 * Resultaat van één toolbox ophalen
 */
export async function haalToolboxResultaat(toolboxId, gebruikerId) {
  const { data, error } = await supabase
    .from("toolbox_resultaten")
    .select("*")
    .eq("toolbox_id", toolboxId)
    .eq("gebruiker_id", gebruikerId)
    .maybeSingle();

  if (error) throw error;

  return data;
}

/**
 * Alle resultaten van een medewerker
 */
export async function haalMijnToolboxen(gebruikerId) {
  const { data, error } = await supabase
    .from("toolbox_resultaten")
    .select(
      `
      *,
      toolboxen (
        id,
        titel,
        categorie,
        versie,
        geldig_maanden,
        pdf_url
      )
    `
    )
    .eq("gebruiker_id", gebruikerId)
    .order("afgerond_op", {
      ascending: false,
    });

  if (error) throw error;

  return data || [];
}

/**
 * Alleen geslaagde toolboxen
 */
export async function haalGeslaagdeToolboxen(
  gebruikerId
) {
  const { data, error } = await supabase
    .from("toolbox_resultaten")
    .select("*")
    .eq("gebruiker_id", gebruikerId)
    .eq("geslaagd", true);

  if (error) throw error;

  return data || [];
}

/**
 * Toolbox markeren als gelezen
 */
export async function markeerAlsGelezen(
  toolboxId,
  gebruikerId
) {
  const { error } = await supabase
    .from("toolbox_resultaten")
    .upsert(
      {
        toolbox_id: toolboxId,
        gebruiker_id: gebruikerId,
        gelezen: true,
      },
      {
        onConflict: "toolbox_id,gebruiker_id",
      }
    );

  if (error) throw error;
}

/**
 * Dashboard statistieken
 */
export async function toolboxStatistieken(
  gebruikerId
) {
  const resultaten =
    await haalMijnToolboxen(gebruikerId);

  const totaal = resultaten.length;

  const afgerond = resultaten.filter(
    (r) => r.geslaagd
  ).length;

  const verlopen = resultaten.filter((r) => {
    if (!r.geldig_tot) return false;

    return new Date(r.geldig_tot) < new Date();
  }).length;

  const nogOpen = totaal - afgerond;

  return {
    totaal,
    afgerond,
    verlopen,
    nogOpen,
  };
}