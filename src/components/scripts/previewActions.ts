import Swal from "sweetalert2";
import { currentData, resetPreview } from "./previewState";

const CONFIRM_BTN_DEFAULT_HTML = `
  <span class="material-symbols-outlined text-sm" style="font-variation-settings:'FILL' 1;">save</span>
  Confirmar y Guardar
`;

export const initCancelButton = () => {
  document.getElementById("btn-cancel")?.addEventListener("click", () => {
    Swal.fire({
      title: "¿Cancelar carga?",
      text: "Los datos extraídos se descartarán.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Seguir revisando",
      confirmButtonColor: "var(--color-error, #B3261E)",
    }).then((result) => {
      if (result.isConfirmed) resetPreview();
    });
  });
};

export const initConfirmButton = () => {
  document.getElementById("btn-confirm")?.addEventListener("click", async () => {
    if (!currentData) return;

    const btn = document.getElementById("btn-confirm") as HTMLButtonElement;
    btn.disabled = true;
    btn.innerHTML = `
      <span class="material-symbols-outlined text-sm animate-spin" style="font-variation-settings:'FILL' 1;">progress_activity</span>
      Guardando...
    `;

    try {
      const response = await fetch("/api/save-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentData),
      });

      const result = await response.json();

      if (response.ok) {
        const wasUpdate = result.updated === true;

        Swal.fire({
          icon: "success",
          title: wasUpdate ? "¡Datos actualizados!" : "¡Guardado!",
          text: wasUpdate
            ? "Los cambios del lead existente se guardaron correctamente."
            : "El lead se registró correctamente en Supabase.",
          confirmButtonColor: "var(--color-primary)",
        }).then(() => resetPreview());

      } else {
        Swal.fire({
          icon: "warning",
          title: "Aviso",
          text: result.error || "Hubo un problema al guardar.",
        });
        btn.disabled = false;
        btn.innerHTML = CONFIRM_BTN_DEFAULT_HTML;
      }

    } catch {
      Swal.fire("Error crítico", "No se pudo conectar con el servidor", "error");
      btn.disabled = false;
      btn.innerHTML = CONFIRM_BTN_DEFAULT_HTML;
    }
  });
};