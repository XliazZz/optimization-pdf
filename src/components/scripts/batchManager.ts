import Swal from "sweetalert2";
import { showPreview, resetPreview } from "./previewState";

export interface BatchItem {
    file: File;
    status: 'pending' | 'processing' | 'ready' | 'error';
    data: any | null;
    hashExists: boolean;
    pdfBlobUrl: string;
    error: string | null;
    errorCode: string | null;
    hash: string | null;
    _alertShown?: boolean;
}

export let batchQueue: BatchItem[] = [];
export let currentIndex = 0;

export const startBatch = async (files: File[]) => {
    batchQueue = files.map(file => ({
        file,
        status: 'pending',
        data: null,
        hashExists: false,
        pdfBlobUrl: URL.createObjectURL(file),
        error: null,
        errorCode: null,
        hash: null,
        _alertShown: false
    }));
    currentIndex = 0;

    // Procesar el resto en background (fire and forget)
    for (let i = 1; i < batchQueue.length; i++) {
        processItem(i);
    }

    // Esperar a que el primer item termine
    await processItem(0);

    // Si el primero falló, no entramos en el modo revisión (side-by-side)
    if (batchQueue[0].status === 'error') {
        // Limpiamos y volvemos al estado inicial del DropZone
        resetPreview();
        return;
    }

    // Despachar evento para cambiar a la vista de revisión (split screen)
    window.dispatchEvent(
      new CustomEvent("batch-review-started", {
        detail: { pdfBlobUrl: batchQueue[0].pdfBlobUrl },
      }),
    );

    // Mostrar el primero en la UI derecha
    renderCurrentItem();
};

const hashFile = async (buffer: ArrayBuffer): Promise<string> => {
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
};

const processItem = async (index: number) => {
    const item = batchQueue[index];
    item.status = 'processing';
    // Si estamos en este index y YA está en split view, mostramos que está procesando
    if (currentIndex === index && document.getElementById("review-layout")?.style.display === "grid") {
        renderCurrentItem();
    }

    try {
        const arrayBuffer = await item.file.arrayBuffer();
        item.hash = await hashFile(arrayBuffer);

        try {
            const checkRes = await fetch(`/api/check-hash?hash=${item.hash}`);
            const checkData = await checkRes.json();
            if (checkData.exists) {
                const res = await fetch(`/api/get-lead-by-hash?hash=${item.hash}`);
                const result = await res.json();
                if (res.ok) {
                    item.status = 'ready';
                    item.data = result;
                    item.hashExists = true;
                    if (currentIndex === index) renderCurrentItem();
                    return;
                }
            }
        } catch {
            // Error silently ignored for duplicate check
        }

        const formData = new FormData();
        formData.append("pdf", item.file);
        formData.append("fileHash", item.hash);

        const res = await fetch("/api/process-pdf", {
            method: "POST",
            body: formData,
        });
        const result = await res.json();
        
        if (!res.ok) {
            item.status = 'error';
            item.error = result.message || result.error || 'Error desconocido';
            item.errorCode = result.error || 'UNKNOWN';
            
            // Mostrar alerta solo si es el item actual (para no spamear si hay múltiples errores en lote)
            if (currentIndex === index) {
                if (item.errorCode === "QUOTA_EXCEEDED") {
                    Swal.fire("Límite de la IA excedido", item.error, "error");
                } else if (item.errorCode === "INVALID_DOMAIN") {
                    Swal.fire("Documento no válido", item.error, "warning");
                }
            }
        } else {
            item.status = 'ready';
            item.data = result;
        }

    } catch (err: any) {
        item.status = 'error';
        item.error = err.message || 'Error de red';
        item.errorCode = 'NETWORK_ERROR';
    }

    if (currentIndex === index && document.getElementById("review-layout")?.style.display === "grid") {
        renderCurrentItem();
    }
};

export const renderCurrentItem = () => {
    if (batchQueue.length === 0) return;
    const item = batchQueue[currentIndex];

    const empty = document.getElementById("preview-empty");
    const loading = document.getElementById("preview-loading");
    const content = document.getElementById("preview-content");

    // Actualizar el PDF viewer (iframe) para este archivo
    const pdfIframe = document.getElementById("pdf-iframe") as HTMLIFrameElement;
    if (pdfIframe && pdfIframe.src !== item.pdfBlobUrl) {
        pdfIframe.src = item.pdfBlobUrl;
    }

    // Actualizar UI del card
    document.getElementById("pdf-filename-display")!.textContent = item.file.name;
    document.getElementById("batch-counter")!.textContent = `${currentIndex + 1}/${batchQueue.length}`;

    // Volver atrás
    const btnPrev = document.getElementById("btn-prev");
    if (btnPrev) {
        if (currentIndex > 0) btnPrev.classList.remove("hidden");
        else btnPrev.classList.add("hidden");
    }

    // Botón siguiente / confirmar
    const btnNextIcon = document.getElementById("btn-next-confirm-icon");
    const btnNextText = document.getElementById("btn-next-confirm-text");
    if (btnNextIcon && btnNextText) {
        if (currentIndex === batchQueue.length - 1) {
            btnNextIcon.textContent = "save";
            btnNextText.textContent = "Confirmar y Guardar";
        } else {
            btnNextIcon.textContent = "navigate_next";
            btnNextText.textContent = "Siguiente";
        }
    }

    // Warning duplicado
    const dupWarn = document.getElementById("duplicate-warning");
    if (dupWarn) {
        if (item.status === 'ready' && item.hashExists) {
            dupWarn.classList.remove("hidden");
        } else {
            dupWarn.classList.add("hidden");
        }
    }

    if (item.status === 'pending' || item.status === 'processing') {
        empty?.classList.add("hidden");
        content?.classList.add("hidden");
        loading?.classList.remove("hidden");
        loading?.classList.add("flex");
        
        // Asegurar que muestre el spinner y no el icono de error de un item anterior
        const spinner = loading?.querySelector(".material-symbols-outlined.text-error") || loading?.querySelector(".animate-spin");
        if (spinner) {
            spinner.className = "w-16 h-16 rounded-full border-4 border-primary-container border-t-primary animate-spin mb-4";
            spinner.innerHTML = "";
            (spinner as HTMLElement).style.fontSize = "";
        }
        
        document.getElementById("preview-loading-title")!.textContent = "Analizando documento...";
        const loadingText = document.querySelector("#preview-loading p:last-child");
        if (loadingText) loadingText.textContent = "La IA está extrayendo los datos.";

    } else if (item.status === 'ready') {
        empty?.classList.add("hidden");
        loading?.classList.add("hidden");
        loading?.classList.remove("flex");
        // Update the form with item.data
        showPreview(item.data); // Reutilizamos previewState
    } else if (item.status === 'error') {
        empty?.classList.add("hidden");
        content?.classList.add("hidden");
        loading?.classList.remove("hidden");
        loading?.classList.add("flex");
        
        // Cambiar icono del loading a error
        const spinner = loading?.querySelector(".animate-spin");
        if (spinner) {
            spinner.className = "material-symbols-outlined text-error mb-4";
            spinner.innerHTML = "error";
            (spinner as HTMLElement).style.fontSize = "48px";
            (spinner as HTMLElement).style.fontVariationSettings = "'FILL' 1";
        }
        
        document.getElementById("preview-loading-title")!.textContent = "Error al procesar";
        const loadingText = document.querySelector("#preview-loading p:last-child");
        if (loadingText) loadingText.textContent = item.error || "Inténtalo de nuevo";

        // Si navegamos hacia este item y tiene un error específico, mostrar alerta (si no se mostró ya)
        if (!item._alertShown) {
            if (item.errorCode === "QUOTA_EXCEEDED") {
                Swal.fire("Límite de la IA excedido", item.error, "error");
            } else if (item.errorCode === "INVALID_DOMAIN") {
                Swal.fire("Documento no válido", item.error, "warning");
            }
            item._alertShown = true;
        }
    }
};

export const nextItem = async () => {
    // Si la data está mostrada, la guardamos temporalmente en local array
    // (previewState.currentData)
    const { currentData } = await import("./previewState");
    if (currentData && batchQueue[currentIndex].status === 'ready') {
        batchQueue[currentIndex].data = currentData;
    }

    if (currentIndex < batchQueue.length - 1) {
        currentIndex++;
        renderCurrentItem();
    } else {
        // Confirmar y guardar todos!
        saveAllBatch();
    }
};

export const prevItem = async () => {
    const { currentData } = await import("./previewState");
    if (currentData && batchQueue[currentIndex].status === 'ready') {
        batchQueue[currentIndex].data = currentData;
    }

    if (currentIndex > 0) {
        currentIndex--;
        renderCurrentItem();
    }
};

const saveAllBatch = async () => {
    // Collect all valid data
    const validItems = batchQueue.filter(item => item.status === 'ready' && item.data);
    if (validItems.length === 0) {
        Swal.fire("Aviso", "No hay datos válidos para guardar.", "warning");
        return;
    }

    const btnNext = document.getElementById("btn-next-confirm") as HTMLButtonElement;
    let originalHtml = "";
    if (btnNext) {
        originalHtml = btnNext.innerHTML;
        btnNext.disabled = true;
        btnNext.innerHTML = `
          <span class="material-symbols-outlined text-sm animate-spin" style="font-variation-settings:'FILL' 1;">progress_activity</span>
          <span>Guardando...</span>
        `;
    }

    try {
        let successCount = 0;
        // Post them one by one (or modify backend to accept batch). Post one by one is fine for now
        for (const item of validItems) {
            // Solo guarda si NO estaba previamente, o si queremos actualizar
            // (La BD hace upsert en save-lead)
            const response = await fetch("/api/save-lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item.data),
            });
            if (response.ok) successCount++;
        }

        Swal.fire({
            icon: "success",
            title: "Procesamiento Completado",
            text: `Se guardaron ${successCount} documentos correctamente.`,
            confirmButtonColor: "var(--color-primary)",
        }).then(() => {
            // Clear blob URLs
            batchQueue.forEach(item => {
                if (item.pdfBlobUrl) URL.revokeObjectURL(item.pdfBlobUrl);
            });
            resetPreview();
            window.dispatchEvent(
                new CustomEvent("change-view", { detail: { viewId: "view-history" } })
            );
            window.dispatchEvent(new Event("leads-updated"));
        });

    } catch (err) {
        Swal.fire("Error crítico", "No se pudieron guardar los documentos", "error");
    } finally {
        if (btnNext) {
            btnNext.disabled = false;
            btnNext.innerHTML = originalHtml;
        }
    }
};

export const cancelBatch = () => {
    Swal.fire({
      title: "¿Cancelar lote completo?",
      text: "Se descartarán todos los PDFs que subiste.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Seguir revisando",
      confirmButtonColor: "var(--color-error, #B3261E)",
    }).then((result) => {
      if (result.isConfirmed) {
          batchQueue.forEach(item => {
              if (item.pdfBlobUrl) URL.revokeObjectURL(item.pdfBlobUrl);
          });
          resetPreview();
      }
    });
};
