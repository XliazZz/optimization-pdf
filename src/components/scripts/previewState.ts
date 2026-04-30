export let currentData: Record<string, any> | null = null;

const setField = (id: string, value: unknown) => {
  const el = document.querySelector(`#${id} .preview-value`);
  if (el) el.textContent = value != null && value !== "" ? String(value) : "—";
};

export const fillFields = (data: Record<string, any>) => {
  setField("field-company-name",    data.company?.name);
  setField("field-company-country", data.company?.country);
  setField("field-company-website", data.company?.website);

  setField("field-project-name",  data.project_lead?.project_name);
  setField(
    "field-project-value",
    data.project_lead?.estimated_value != null
      ? `USD ${Number(data.project_lead.estimated_value).toLocaleString("es-AR")}`
      : null,
  );
  setField("field-project-start", data.project_lead?.estimated_start_date);
  setField("field-project-stage", data.project_lead?.project_stage);

  setField("field-contact-name",  data.contact?.full_name);
  setField("field-contact-email", data.contact?.email);
  setField("field-contact-title", data.contact?.job_title);

  setField("field-task-description", data.follow_up_task?.description);
  setField("field-task-due",         data.follow_up_task?.due_date);
};

const FIELD_MAP: Record<string, (data: Record<string, any>, value: string | null) => void> = {
  "field-company-name":      (d, v) => { d.company.name = v; },
  "field-company-country":   (d, v) => { d.company.country = v; },
  "field-company-website":   (d, v) => { d.company.website = v; },
  "field-project-name":      (d, v) => { d.project_lead.project_name = v; },
  "field-project-value":     (d, v) => {
    if (v === null) { d.project_lead.estimated_value = null; return; }
    const raw = Number(v.replace(/[^0-9.,]/g, "").replace(/\./g, "").replace(",", "."));
    d.project_lead.estimated_value = isNaN(raw) ? null : raw;
  },
  "field-project-start":     (d, v) => { d.project_lead.estimated_start_date = v; },
  "field-project-stage":     (d, v) => { d.project_lead.project_stage = v; },
  "field-contact-name":      (d, v) => { d.contact.full_name = v; },
  "field-contact-email":     (d, v) => { d.contact.email = v; },
  "field-contact-title":     (d, v) => { d.contact.job_title = v; },
  "field-task-description":  (d, v) => { d.follow_up_task.description = v; },
  "field-task-due":          (d, v) => { d.follow_up_task.due_date = v; },
};

export const updateField = (fieldId: string, value: string | null) => {
  if (!currentData) return;
  const updater = FIELD_MAP[fieldId];
  if (updater) updater(currentData, value);
};

export const showConfirmButton = () => {
  const btn = document.getElementById("btn-confirm") as HTMLButtonElement | null;
  if (btn) btn.classList.remove("hidden");
};

export const showPreview = (data: Record<string, any>) => {
  currentData = data;
  fillFields(data);
  document.getElementById("preview-empty")?.classList.add("hidden");
  document.getElementById("preview-content")?.classList.remove("hidden");
  document.getElementById("preview-content")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });

  const btnConfirm = document.getElementById("btn-confirm") as HTMLButtonElement | null;
  if (btnConfirm) {
    if (data.hashExists) {
      btnConfirm.classList.add("hidden");
    } else {
      btnConfirm.classList.remove("hidden");
    }
  }
};

export const resetPreview = () => {
  currentData = null;
  document.getElementById("preview-empty")?.classList.remove("hidden");
  document.getElementById("preview-content")?.classList.add("hidden");

  const btn = document.getElementById("btn-confirm") as HTMLButtonElement | null;
  if (btn) {
    btn.classList.remove("hidden");
    btn.disabled = false;
    btn.innerHTML = `
      <span class="material-symbols-outlined text-sm" style="font-variation-settings:'FILL' 1;">save</span>
      Confirmar y Guardar
    `;
  }

  window.dispatchEvent(new CustomEvent("preview-reset"));
};