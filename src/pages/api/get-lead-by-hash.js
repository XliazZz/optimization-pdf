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

  try {
    const { data: lead, error: leadError } = await supabase
      .from("project_leads")
      .select(`
        project_name,
        estimated_value,
        estimated_start_date,
        project_stage,
        pdf_url,
        follow_up_status,
        file_hash,
        company:company_id ( name, country, website ),
        contact:contact_id ( full_name, email, job_title ),
        follow_up_tasks ( description, due_date, is_completed )
      `)
      .eq("file_hash", hash)
      .maybeSingle();

    if (leadError) throw leadError;
    if (!lead) {
      return new Response(
        JSON.stringify({ error: "Lead no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const task = lead.follow_up_tasks?.[0] ?? null;

    const response = {
      fileHash: lead.file_hash,
      company: {
        name:    lead.company?.name    ?? null,
        country: lead.company?.country ?? null,
        website: lead.company?.website ?? null,
      },
      contact: {
        full_name: lead.contact?.full_name ?? null,
        email:     lead.contact?.email     ?? null,
        job_title: lead.contact?.job_title ?? null,
      },
      project_lead: {
        project_name:          lead.project_name          ?? null,
        estimated_value:       lead.estimated_value       ?? null,
        estimated_start_date:  lead.estimated_start_date  ?? null,
        project_stage:         lead.project_stage         ?? null,
        pdf_url:               lead.pdf_url               ?? null,
        follow_up_status:      lead.follow_up_status      ?? null,
      },
      follow_up_task: {
        description:  task?.description  ?? null,
        due_date:     task?.due_date     ?? null,
        is_completed: task?.is_completed ?? false,
      },
    };

    return new Response(JSON.stringify(response), {
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
