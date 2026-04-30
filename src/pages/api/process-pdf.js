import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

      ESQUEMA REQUERIDO:
      {
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

    return new Response(JSON.stringify({ ...data, fileHash }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};