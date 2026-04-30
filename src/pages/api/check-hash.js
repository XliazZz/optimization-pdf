import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_ANON_KEY
);

export const GET = async ({ url }) => {
  const hash = url.searchParams.get("hash");

  if (!hash) {
    return new Response(
      JSON.stringify({ error: "Falta el parámetro hash" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { data, error } = await supabase
    .from("project_leads")
    .select("id")
    .eq("file_hash", hash)
    .maybeSingle();

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ exists: data !== null }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};