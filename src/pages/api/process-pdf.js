import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const POST = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file     = formData.get("pdf");
    const fileHash = formData.get("fileHash");

    if (!file)     return new Response(JSON.stringify({ error: "No PDF" }),      { status: 400, headers: { "Content-Type": "application/json" } });
    if (!fileHash) return new Response(JSON.stringify({ error: "No fileHash" }), { status: 400, headers: { "Content-Type": "application/json" } });

    const arrayBuffer = await file.arrayBuffer();
    const base64Data  = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Actúa como un experto en análisis de datos B2B y un extractor determinista. 
      Analiza el PDF adjunto y devuelve ÚNICAMENTE un objeto JSON estricto sin variaciones creativas.
      
      REGLAS DE FORMATO Y NORMALIZACIÓN CRÍTICAS (PROHIBIDO VARIAR):
      1. NULOS: Si un dato no existe, pon null.
      2. NOMBRES PROPIOS: Extrae solo el nombre y apellido. ELIMINA títulos (Ing., Dr., Lic., etc.), cargos o prefijos.
      3. TAREAS (TASKS): Usa verbos de acción directos. NO incluyas fechas de finalización ni plazos dentro de la descripción.
      4. FECHAS: TODAS en formato ISO 8601 (YYYY-MM-DD).
      5. MONEDAS: Valores numéricos puros, sin símbolos ni puntos de miles. Ejemplo: "USD 2.450.000" → 2450000.
      6. CONSISTENCIA: Usa la versión más completa y formal del nombre de empresa o proyecto.

      7. VALIDACIÓN DE DOMINIO: Evalúa estricta y obligatoriamente si el PDF trata sobre proyectos de construcción, obras, licitaciones o leads relacionados a este rubro. Si el documento NO tiene relación (ej. es un cuento, un currículum, una receta, un manual no relacionado, etc.), debes establecer "is_valid_lead": false y dejar el resto de los campos en null. Si es válido, establece "is_valid_lead": true.

      ESQUEMA REQUERIDO:
      {
        "is_valid_lead": boolean,
        "company": { "name": string, "country": string, "website": string },
        "contact": { "full_name": string, "email": string, "job_title": string },
        "project_lead": { 
          "project_name": string, 
          "estimated_value": number, 
          "estimated_start_date": string, 
          "project_stage": string, 
          "pdf_url": string, 
          "follow_up_status": "Pending" 
        },
        "follow_up_task": { 
          "description": string, 
          "due_date": string, 
          "is_completed": false 
        },
        "confidence_score": number
      }
    `;

    const result   = await model.generateContent([
      { text: prompt },
      { inlineData: { data: base64Data, mimeType: "application/pdf" } },
    ]);

    const response = await result.response;
    const data     = JSON.parse(response.text().replace(/```json|```/g, "").trim());

    if (data.is_valid_lead === false) {
      return new Response(JSON.stringify({ error: "INVALID_DOMAIN", message: "El documento no parece ser un lead de construcción." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("AI processing error:", error);
    
    // Identificar si el error es de tokens/cuota o rate limit
    const errMsg = error.message?.toLowerCase() || "";
    if (errMsg.includes("quota") || errMsg.includes("429") || errMsg.includes("rate limit") || errMsg.includes("tokens")) {
      return new Response(JSON.stringify({ 
        error: "QUOTA_EXCEEDED", 
        message: "La IA se ha quedado sin tokens o se ha excedido el límite de uso gratuito. Por favor, intenta de nuevo más tarde." 
      }), { status: 429, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};