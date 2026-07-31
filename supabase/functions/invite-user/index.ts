import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export default {
  fetch: withSupabase(
    { auth: ["publishable", "secret"] },
    async (req) => {
      try {
        const body = await req.json();

        return Response.json({
          success: true,
          message: "Edge Function werkt!",
          received: body,
        });
      } catch (err) {
        return Response.json(
          {
            success: false,
            error: err instanceof Error ? err.message : "Onbekende fout",
          },
          { status: 400 }
        );
      }
    }
  ),
};