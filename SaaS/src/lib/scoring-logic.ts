import { Produto, ScoredProduct, SearchInput } from "../types/product";

const AI_PREDICTED_BONUS = 100000;
const EXACT_MATCH_POINTS = 50000;
const CATEGORY_BONUS = 1000;
const BITOLA_BONUS = 2000;

const BITOLA_MAP: Record<string, string> = {
  "1/4": "04", "3/8": "06", "1/2": "08", "5/8": "10", "3/4": "12", "1": "16", "1.1/4": "20", "1.1/2": "24", "2": "32"
};

const STOP_WORDS = new Set(['um', 'uma', 'de', 'para', 'com', 'o', 'a', 'os', 'as', 'procurando', 'buscando', 'queria', 'preciso']);
const MATERIAL_BONUS = 3000;

function normalizeData(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[çÇ]/g, 'c')
    .toLowerCase()
    .trim();
}

export function scoreProducts(base: Produto[], inputs: SearchInput[]): ScoredProduct[] {
  if (!base || base.length === 0 || !inputs || inputs.length === 0) return [];

  return base.map(p => {
    let score = 0;
    const desc = p.DESCRICAO || "";
    const descRica = p.DESCRICAO_RICA || "";
    const fullText = normalizeData(`${desc} ${descRica}`);
    const codRaw = (p.COD_LEGADO || "").toLowerCase();
    const codClean = codRaw.replace(/[^a-z0-9]/g, "");
    const tipo = (p.TIPO_PRODUTO || "").toUpperCase();

    for (const input of inputs) {
      let term = normalizeData(input.termo || "");
      if (!term) continue;

      // A. TESTE DE CÓDIGO GLOBAL
      const cleanTerm = term.replace(/[^a-z0-9]/g, "");
      if (cleanTerm.length >= 4) {
        if (cleanTerm === codClean) score += EXACT_MATCH_POINTS;
        else if (codClean.includes(cleanTerm)) score += 5000;
      }

      // B. TESTE POR PALAVRAS
      const words = term.split(/[\s,.;]+/).filter(w => w.length > 0 && !STOP_WORDS.has(w));
      
      // 1. PRIORIDADE IA
      if (input.origin === 'ai') {
        const cleanT = term.replace(/[^a-z0-9]/g, "");
        if (cleanT && codClean === cleanT) score += AI_PREDICTED_BONUS;
      }

      // 2. BUSCA POR PALAVRA
      words.forEach(word => {
        const wordClean = word.replace(/[^a-z0-9]/g, "");
        
        // Match Exato de código
        if (wordClean.length > 3 && (wordClean === codClean || codClean === wordClean)) {
          score += EXACT_MATCH_POINTS;
        } 
        else if (wordClean.length >= 4 && codClean.includes(wordClean)) {
          score += 5000;
        }

        // Match de Bitola
        for (const [frac, dash] of Object.entries(BITOLA_MAP)) {
          if ((word.includes(frac) || word === dash) && (codRaw.includes(frac) || codClean.includes(dash))) {
            score += BITOLA_BONUS;
          }
        }

        // Bônus Material
        if (["inox", "latao", "carbono"].includes(word)) {
          if (fullText.includes(word)) score += MATERIAL_BONUS;
        }

        // Match na Descrição (PESO ELEVADO PARA SPRINT 50)
        if (fullText.includes(word)) score += 2000;
      });

      // 3. BONUS DE CATEGORIA
      if (input.categoria && tipo.includes(input.categoria)) score += CATEGORY_BONUS;
    }

    return { ...p, score };
  })
  .filter(p => p.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 80);
}
