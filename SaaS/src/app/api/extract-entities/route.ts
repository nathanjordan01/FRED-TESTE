import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { SYSTEM_PROMPT, FILE_SYSTEM_PROMPT, DESCRIPTION_SYSTEM_PROMPT } from "@/lib/ai-config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "");
const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

// FUNÇÃO 1: PROCESSAMENTO DE TEXTO (Códigos Concorrentes)
async function processTextInput(model: any, inputs: string[]) {
  if (inputs.length === 0) return [];
  const prompt = `${SYSTEM_PROMPT}\n\nANALYSE ESTES CODIGOS OU DESCRICOES: ${inputs.join(", ")}`;
  const result = await model.generateContent(prompt);
  const jsonMatch = result.response.text().match(/\{[\s\S]*\}/);
  const data = jsonMatch ? JSON.parse(jsonMatch[0]) : { entities: [] };
  return (data.entities || []).map((e: any) => ({ ...e, origin: 'ai' }));
}

// FUNÇÃO 2: PROCESSAMENTO VISUAL (Arquivos - SCANNER OCR)
async function processVisualInput(model: any, files: File[]) {
  if (files.length === 0) return [];
  const prompt = `SCANNER TECNICO DYNAR - EXTRAIA APENAS CODIGOS E MEDIDAS:\n${FILE_SYSTEM_PROMPT}`;
  
  const parts: any[] = [{ text: prompt }];
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    parts.push({ 
      inlineData: { 
        data: Buffer.from(arrayBuffer).toString("base64"), 
        mimeType: file.type 
      } 
    });
  }
  
  const result = await model.generateContent(parts);
  const jsonMatch = result.response.text().match(/\{[\s\S]*\}/);
  const data = jsonMatch ? JSON.parse(jsonMatch[0]) : { entities: [] };
  
  return (data.entities || []).map((e: any) => {
    const cleanInsight = (e.insight || "")
      .replace(/[\n\r]+/g, " ") 
      .trim();

    return { 
      ...e, 
      origin: 'ai',
      termo: (e.termo || "").replace(/(pressao|tabela|norma|iso|trabalho)/gi, "").trim(), 
      insight: `[SCANNER] ${cleanInsight.slice(0, 150)}${cleanInsight.length > 150 ? "..." : ""}` 
    };
  });
}

// NOVO: FUNÇÃO 3: PROCESSAMENTO EXCLUSIVO DE DESCRIÇÃO (Sem vínculo com outros inputs)
async function processDescriptionInput(model: any, descriptions: string[]) {
  if (descriptions.length === 0) return [];
  const prompt = `${DESCRIPTION_SYSTEM_PROMPT}\n\nANALYSE ESTAS DESCRICOES TECNICAS:\n${descriptions.join("\n- ")}`;
  
  const result = await model.generateContent(prompt);
  const jsonMatch = result.response.text().match(/\{[\s\S]*\}/);
  const data = jsonMatch ? JSON.parse(jsonMatch[0]) : { entities: [] };
  
  return (data.entities || []).map((e: any) => ({ 
    ...e, 
    origin: 'ai',
    insight: `[IA DESCRIÇÃO] ${e.insight || "Analise de descricao concluida."}`
  }));
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.error("ERRO: GEMINI_API_KEY não configurada no ambiente.");
      return NextResponse.json({ 
        success: false, 
        error: "Configuração de IA ausente no servidor (API KEY NULL). Entre em contato com o suporte." 
      }, { status: 401 });
    }

    const formData = await req.formData();
    const model = genAI.getGenerativeModel({ model: modelName });

    const dynarEntries = formData.getAll("dynar").map(q => q.toString().toLowerCase().trim());
    const concurrenteEntries = formData.getAll("concorrentes").map(q => q.toString().trim());
    const descricaoEntries = formData.getAll("descricao").map(q => q.toString().trim());
    
    const fileEntries = Array.from(formData.entries())
      .filter(([name]) => name.startsWith('file_'))
      .map(([, file]) => file as File);

    const finalEntities: any[] = [];

    // 1. CÓDIGOS DIRETOS DYNAR
    dynarEntries.forEach(d => {
      if (d) finalEntities.push({ termo: d, categoria: "TERMINAL", origin: "ai", isDynar: true, insight: "Consulta direta por codigo Dynar." });
    });

    // 2. PROCESSAMENTO PARALELO ISOLADO (Triple Dispatch)
    const [concurrenteResults, visualResults, descriptionResults] = await Promise.all([
      processTextInput(model, concurrenteEntries),
      processVisualInput(model, fileEntries),
      processDescriptionInput(model, descricaoEntries)
    ]);

    finalEntities.push(...concurrenteResults, ...visualResults, ...descriptionResults);

    return NextResponse.json({ success: true, entities: finalEntities });

  } catch (error: any) {
    console.error("ERRO NO MOTOR FRED IA:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Falha na análise técnica pela IA" 
    }, { status: 500 });
  }
}
