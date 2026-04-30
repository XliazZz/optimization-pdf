# 🏗️ DataExtract AI: Construcción & Leads Dashboard

Plataforma inteligente de extracción de datos para proyectos de construcción, impulsada por **Gemini 1.5 Flash** y **Supabase**.

![Status](https://img.shields.io/badge/Status-Complete-success)
![Stack](https://img.shields.io/badge/Stack-Astro--Supabase--Gemini-blue)

## 🌟 Características Principales

- **Extracción Inteligente**: Convierte informes PDF complejos en datos estructurados (Empresa, Contacto, Valor de Proyecto).
- **Vista Side-by-Side**: Interfaz de verificación humana donde puedes comparar el PDF original con los datos extraídos en tiempo real.
- **Dashboard de Gestión**: Visualiza tu pipeline de ventas, estadísticas de proyectos y actividad reciente.
- **Deduplicación Inteligente**: Sistema de hashing para evitar el re-procesamiento de archivos ya existentes, optimizando costos de API.
- **Exportación**: Descarga tus leads validados en formato CSV para integrarlos con otros CRM.

## 🚀 Tecnologías

- **Frontend**: Astro (Islands Architecture), Tailwind CSS (Material Design 3 system).
- **IA**: Google Gemini 1.5 Flash API.
- **Backend/DB**: Supabase (PostgreSQL) con lógica de Row Level Security (RLS) opcional.
- **Hashing**: SHA-256 para integridad y deduplicación.

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
