import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_ANON_KEY
);

export const GET = async () => {
  try {
    const { data: leads, error } = await supabase
      .from("project_leads")
      .select(`
        id,
        project_name,
        estimated_value,
        project_stage,
        created_at,
        company:company_id ( name ),
        contact:contact_id ( full_name )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify(leads), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
