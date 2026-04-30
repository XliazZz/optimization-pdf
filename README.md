# 🏗️ DataExtract AI: Construcción & Leads Dashboard

Plataforma inteligente de extracción de datos para proyectos de construcción, impulsada por **Gemini 2.5 Flash** y **Supabase**.

![Status](https://img.shields.io/badge/Status-Complete-success)
![Stack](https://img.shields.io/badge/Stack-Astro--Supabase--Gemini-blue)

## 🌟 Características Principales

- **Procesamiento por Lotes**: Sube hasta 10 PDFs simultáneamente para procesamiento paralelo.
- **Asistente de Revisión (Wizard)**: Flujo secuencial interactivo para verificar y editar cada documento antes del guardado final.
- **Extracción Inteligente**: Convierte informes PDF complejos en datos estructurados (Empresa, Contacto, Valor de Proyecto).
- **Validación de Dominio**: Filtro por IA para asegurar que solo se procesen leads relacionados al rubro de construcción.
- **Vista Side-by-Side**: Interfaz de verificación humana para comparar el PDF original con los datos extraídos.
- **Deduplicación Inteligente**: Sistema de hashing SHA-256 para evitar el re-procesamiento de archivos existentes.
- **Dashboard de Gestión**: Visualización de pipeline de ventas, estadísticas y exportación CSV.

## 🚀 Tecnologías

- **Frontend**: Astro (Islands Architecture), Tailwind CSS (Material Design 3 system).
- **IA**: Google Gemini 2.0/2.5 Flash.
- **Backend/DB**: Supabase (PostgreSQL).
- **Seguridad**: Manejo de errores de cuota de IA y validación de integridad de documentos.

## 🛠️ Instalación y Uso

1. Clona el repositorio.
2. Instala dependencias: `pnpm install`.
3. Configura tus variables de entorno en `.env`:
   ```bash
   SUPABASE_URL=tu_url
   SUPABASE_ANON_KEY=tu_key
   GEMINI_API_KEY=tu_gemini_key
   ```
4. Inicia el servidor de desarrollo: `pnpm run dev`.

## 📖 Documentación técnica

Para una explicación profunda del funcionamiento del sistema, revisa el archivo [ARCHITECTURE.md](./ARCHITECTURE.md).

---

_Desarrollado como proyecto de portfolio para demostrar la integración de IA Generativa en flujos de trabajo profesionales._
