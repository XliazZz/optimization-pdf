# Arquitectura Técnica: DataExtract AI Dashboard

Esta guía explica el funcionamiento interno del proyecto para que puedas defenderlo técnicamente en cualquier entrevista.

## 1. Stack Tecnológico

- **Astro**: Framework de frontend elegido por su rendimiento y manejo de islas de interactividad.
- **Tailwind CSS**: Para un diseño responsivo y moderno (usando variables de color de Material 3).
- **Supabase**: Backend-as-a-Service para persistencia de datos y gestión de leads.
- **Gemini 2.0/2.5 Flash**: Orquestación de IA para extracción y validación de datos.

## 2. Flujo de Datos (The Data Lifecycle)

1. **Captura por Lotes**: El usuario suelta hasta 10 PDFs en `DropZone.astro`.
2. **Hashing & Deduplicación**: Se genera un Hash (SHA-256) por archivo. Si el hash existe, se recuperan datos históricos para evitar costos de API.
3. **Procesamiento Paralelo**: Los archivos nuevos se envían en paralelo a `/api/process-pdf`.
4. **Validación de Dominio**: Gemini valida si el documento es un lead de construcción legítimo. Si no lo es, se rechaza con un error `INVALID_DOMAIN`.
5. **Asistente Secuencial (Wizard)**: El `batchManager.ts` coordina la navegación paso a paso. El usuario verifica y edita cada documento.
6. **Persistencia Final**: Solo al confirmar el lote completo, se realiza un `upsert` masivo en Supabase.

## 3. Manejo de Estado (Client-Side)

- **`batchManager.ts`**: El orquestador principal. Gestiona la cola de archivos (`batchQueue`), el índice actual y la lógica de guardado en lote.
- **`previewState.ts`**: Motor de sincronización UI-Data. Maneja el rellenado de campos, la edición en tiempo real y el Confidence Score.
- **Eventos Globales**:
  - `batch-review-started`: Cambia a modo revisión una vez que el primer PDF está listo.
  - `preview-reset`: Limpia el estado y regresa al DropZone idle.
  - `leads-updated`: Refresca las tablas de datos tras un guardado.

## 4. Estructura de Base de Datos

- **Relaciones**: Un Lead pertenece a una `Company` y tiene un `Contact`. Usamos claves foráneas para mantener la integridad referencial.
- **Upsert**: La lógica de guardado está diseñada para que si subís el mismo PDF dos veces con cambios, se actualice el registro existente en lugar de duplicarse.

---

_Este proyecto demuestra habilidades en: Fullstack Web Dev, AI Orchestration, Prompt Engineering y Diseño de Arquitectura Escalable._
