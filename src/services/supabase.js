import { createClient } from "@supabase/supabase-js";

console.log("URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
export async function inviteUser({ naam, email, rol }) {
  const { data, error } = await supabase.functions.invoke("invite-user", {
    body: {
      naam,
      email,
      rol,
    },
  });

  if (error) throw error;

  return data;
}
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:5173/reset-password",
  });

  if (error) throw error;

  return {
    message: `Resetmail verzonden naar ${email}`,
  };
}
export async function uploadToolboxPdf(file) {
  const fileName = `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("toolbox-pdf")
    .upload(fileName, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("toolbox-pdf")
    .getPublicUrl(fileName);

  return data.publicUrl;
}