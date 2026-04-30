import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_ANON_KEY
);

export const POST = async ({ request }) => {
  try {
    const data = await request.json();

    const { data: company, error: errorCo } = await supabase
      .from("companies")
      .upsert(data.company, { onConflict: "name" })
      .select()
      .single();
    if (errorCo) throw errorCo;

    const { data: contact, error: errorCon } = await supabase
      .from("contacts")
      .upsert({ ...data.contact, company_id: company.id }, { onConflict: "email" })
      .select()
      .single();
    if (errorCon) throw errorCon;

    const { data: existing } = await supabase
      .from("project_leads")
      .select("id")
      .eq("file_hash", data.fileHash)
      .maybeSingle();

    const isUpdate = existing !== null;


    const { data: lead, error: errorLead } = await supabase
      .from("project_leads")
      .upsert(
        {
          ...data.project_lead,
          company_id: company.id,
          contact_id: contact.id,
          file_hash:  data.fileHash,
        },
        { onConflict: "file_hash" }
      )
      .select()
      .single();
    if (errorLead) throw errorLead;

    if (!isUpdate) {
      const { error: errorTask } = await supabase
        .from("follow_up_tasks")
        .insert({ ...data.follow_up_task, project_id: lead.id });
      if (errorTask) throw errorTask;
    }

    return new Response(
      JSON.stringify({ message: "Éxito", leadId: lead.id, updated: isUpdate }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error en save-lead:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};