# Arquitectura Técnica: DataExtract AI Dashboard

Esta guía explica el funcionamiento interno del proyecto para que puedas defenderlo técnicamente en cualquier entrevista.

## 1. Stack Tecnológico

- **Astro**: Framework de frontend elegido por su rendimiento y manejo de islas de interactividad.
- **Tailwind CSS**: Para un diseño responsivo y moderno (usando variables de color de Material 3).
- **Supabase**: Backend-as-a-Service para persistencia de datos (SQL).
- **Gemini 1.5 Flash**: Modelo de IA para extracción de datos estructurados desde PDF.

## 2. Flujo de Datos (The Data Lifecycle)

1. **Captura**: El usuario suelta un PDF en `DropZone.astro`.
2. **Hashing**: Se genera un Hash (SHA-256) del archivo antes de subirlo.
3. **Deduplicación**: Se consulta `/api/check-hash`. Si el archivo ya existe en Supabase, se traen los datos guardados. Esto ahorra tokens de IA y dinero.
4. **Extracción (si es nuevo)**: Se envía el PDF a `/api/process-pdf` donde Gemini analiza el documento y devuelve un JSON estricto basado en un prompt técnico.
5. **Verificación (Human-in-the-loop)**: Los datos se muestran en el `split-screen` layout. El usuario puede editar cualquier campo antes de confirmar.
6. **Persistencia**: Al confirmar, se hace un `upsert` en Supabase a través de `/api/save-lead`.

## 3. Manejo de Estado (Client-Side)

- **`previewState.ts`**: Es el "corazón" del estado. Maneja la carga de campos, actualización de valores editados y el cálculo del **Confidence Score**.
- **Eventos Globales**: Usamos `CustomEvent` para comunicar componentes independientes sin necesidad de Redux o librerías pesadas:
  - `pdf-data-ready`: Activa el modo revisión.
  - `preview-reset`: Limpia la UI y vuelve al estado inicial.
  - `change-view`: Cambia entre las pestañas del Dashboard (Sidebar).

## 4. Estructura de Base de Datos

- **Relaciones**: Un Lead pertenece a una `Company` y tiene un `Contact`. Usamos claves foráneas para mantener la integridad referencial.
- **Upsert**: La lógica de guardado está diseñada para que si subís el mismo PDF dos veces con cambios, se actualice el registro existente en lugar de duplicarse.

---

_Este proyecto demuestra habilidades en: Fullstack Web Dev, AI Orchestration, Prompt Engineering y Diseño de Arquitectura Escalable._
