import { Produto, ScoredProduct, SearchInput } from "../types/product";

// Palavras-chave por categoria para filtragem no CSV
const CATEGORIA_KEYWORDS: Record<string, string[]> = {
  "MANGUEIRA": ["mangueira", "mangote", "conjunto de mang", "flexible hose"],
  "TERMINAL": ["terminal", "conector", "plug", "fjx", "giratoria"],
  "ADAPTADOR": ["adaptador", "adaptador", "bushing"],
  "ENGATE": ["engate", "acoplamento", "quick"],
  "VALVULA": ["valvula", "válvula", "valve"],
  "PA": ["produto acabado", "montado", "kit"],
};

// Aliases técnicos para mapear a IA ao banco real
const FAMILIA_ALIASES: Record<string, string[]> = {
  "r2at": ["r2", "sae 100r2", "r2at"],
  "r1at": ["r1", "sae 100r1", "r1at"],
  "r12": ["r12", "sae 100r12"],
  "r13": ["r13", "sae 100r13"],
  "r15": ["r15", "sae 100r15"],
  "r16": ["m2t", "r16", "sae 100r16"],
  "m2t": ["m2t", "r2", "r16"]
};

// NOVO: Aliases de termos técnicos reduzidos (Sprint 14)
const TERMO_ABREVIACOES: Record<string, string> = {
  "f": "femea",
  "m": "macho",
  "gir": "giratoria",
  "term": "terminal",
  "pren": "prensado",
  "adapt": "adaptador",
  "npt": "npt",
  "bsp": "bsp",
  "jic": "jic",
  "unf": "unf",
};

// Tabela de Conversão Universal de Bitolas (DASH <-> Polegada <-> MM)
const BITOLA_MAP: Record<string, string[]> = {
  "04": ["1/4", "04", "06", "6mm", "um quarto", "1/4 polegada"],
  "06": ["3/8", "06", "10", "10mm", "tres oitavos"],
  "08": ["1/2", "08", "13", "12mm", "meia", "meia polegada"],
  "10": ["5/8", "10", "16", "15mm", "cinco oitavos"],
  "12": ["3/4", "12", "19", "20mm", "tres quartos"],
  "16": ["1\"", "16", "25", "25mm", "uma polegada", "1 pol"],
  "20": ["1.1/4", "20", "32", "31mm", "uma e um quarto"],
  "24": ["1.1/2", "24", "38", "40mm", "uma e meia"],
  "32": ["2\"", "32", "50", "50mm", "duas polegadas"],
};

// Palavras que PENALIZAM quando a categoria NÃO combina
const CATEGORIA_PENALIDADES: Record<string, string[]> = {
  "MANGUEIRA": ["conexao", "alavanca", "terminal", "adaptador", "parafuso", "porca", "arruela", "valvula", "reparo", "embolo", "flange", "contraflange", "tubo", "tubo de aco", "calibrador", "mola", "anel", "diafragma"],
  "TERMINAL": ["mangueira", "mangote", "valvula", "alavanca", "flange", "porca", "parafuso", "arruela", "adaptador", "engate"],
  "ADAPTADOR": ["mangueira", "mangote", "terminal", "engate", "valvula"],
  "CONEXAO": ["mangueira", "mangote"],
};

export const scoreProducts = (products: Produto[], searchInput: string | SearchInput | SearchInput[]): ScoredProduct[] => {
  if (!searchInput || !products || products.length === 0) return [];

  // Se for um array de inputs, processamos cada um isoladamente e somamos os scores.
  // SPRINT 20 FIX: Detectamos a categoria dominante do array ANTES de somar,
  // para aplicar uma eliminação final e impedir que insights sem categoria
  // "contrabandeiem" scores para produtos proibidos.
  if (Array.isArray(searchInput)) {
    // --- PASSO 1: Detectar categoria dominante de TODOS os insights ---
    let dominantCategory = "";
    const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    for (const input of searchInput) {
      if (input && typeof input === 'object' && input.insight) {
        const low = normalize(input.insight);
        // Um insight com 'giratoria/femea/fjx' + 'mangueira' = SEMPRE Terminal
        if ((low.includes("giratoria") || low.includes("femea") || low.includes("fjx") || low.includes("terminal")) &&
            (low.includes("mangueira") || low.includes("mangote") || low.includes("jic") || low.includes("prensado"))) {
          dominantCategory = "TERMINAL";
          break; // Terminal tem prioridade máxima, para o loop
        }
        if (low.includes("adaptador") && !dominantCategory) dominantCategory = "ADAPTADOR";
        if ((low.includes("mangueira") || low.includes("mangote")) && !dominantCategory) dominantCategory = "MANGUEIRA";
      }
    }

    // --- PASSO 2: Calcular scores individuais ---
    const allScoredMaps = searchInput.map(input => {
      const results = scoreProducts(products, input);
      const map = new Map<string, number>();
      results.forEach(r => map.set(r.COD_LEGADO || r.COD_INTERNO, r.score));
      return map;
    });

    // --- PASSO 3: Somar scores ---
    const finalMap = new Map<string, ScoredProduct>();
    products.forEach(p => {
      let totalScore = 0;
      const id = p.COD_LEGADO || p.COD_INTERNO;
      allScoredMaps.forEach(m => {
        totalScore += m.get(id) || 0;
      });
      if (totalScore > 0) {
        finalMap.set(id, { ...p, score: totalScore });
      }
    });

    // --- PASSO 4: Eliminação Final por Categoria Dominante ---
    // Este é o passo que faltava: mata scores de produtos proibidos APÓS a soma.
    const PENALIDADES_FINAIS: Record<string, string[]> = {
      "TERMINAL": ["mangueira", "mangote", "adaptador", "conexao de aco", "engate", "tubo"],
      "MANGUEIRA": ["terminal", "adaptador"],
      "ADAPTADOR": ["mangueira", "terminal"],
    };

    let finalResults = Array.from(finalMap.values());

    if (dominantCategory && PENALIDADES_FINAIS[dominantCategory]) {
      const forbidden = PENALIDADES_FINAIS[dominantCategory];
      finalResults = finalResults.filter(p => {
        const desc = normalize(String(p.DESCRICAO || p.DESCRICAO_RICA || ""));
        const cod = normalize(String(p.COD_LEGADO || ""));
        // Mata produtos cuja descrição COMEÇA com palavra proibida (ex: "MANGUEIRA MONTADA")
        // OU cujo código seja literalmente uma palavra proibida
        const isProhibited = forbidden.some(f =>
          desc.startsWith(f) || cod === f
        );
        return !isProhibited;
      });
    }

    return finalResults
      .sort((a, b) => b.score - a.score)
      .slice(0, 40);
  }

  // Lógica para Input Único (Segregado)
  const entry = searchInput;
  const terms: { val: string; weight: number }[] = [];
  let categoria = "";
  let familia = "";

  if (typeof entry === 'string') {
    // MULTI-WORD EXTRACTION IN TERMO (SPRINT 13 - FIX)
    const mainTerms = entry.toLowerCase().trim().split(/[\s,.;/*-]+/).filter((w: string) => w.length >= 2);
    mainTerms.forEach((w: string) => terms.push({ val: w, weight: 80 }));
  } else if (entry && typeof entry === 'object') {
    const mainTermRaw = (entry.termo || "").toString().toLowerCase().trim();
    const origin = entry.origin;
    categoria = (entry.categoria || "").toString().toUpperCase().trim();
    familia = (entry.familia || "").toString().toLowerCase().trim();

    // --- SPRINT 24: SAFE-BITOLA (Resiliência de Bitola) ---
    const bitolaMap: Record<string, string> = {
      "1/4": "04", "3/8": "06", "1/2": "08", "5/8": "10", "3/4": "12", "1": "16", "1.1/4": "20", "1.1/2": "24", "2": "32"
    };

    const generateVariants = (t: string): string[] => {
      const variants = [t];
      for (const [frac, dash] of Object.entries(bitolaMap)) {
        if (t.includes(frac)) variants.push(t.replace(frac, dash));
        if (t.includes(dash)) variants.push(t.replace(dash, frac));
      }
      return Array.from(new Set(variants));
    };

    if (mainTermRaw) {
      // 1. Código completo como âncora (com Safe-Bitola)
      if (mainTermRaw.includes("-") || mainTermRaw.includes(" ") || mainTermRaw.includes("/")) {
        const variants = generateVariants(mainTermRaw);
        variants.forEach(v => terms.push({ val: v, weight: 500 }));
      }

      // 2. Palavras-Chave da IA (SPRINT 26: Prioridade Descritiva)
      const aiKeywords = entry.palavras_chave || "";
      if (aiKeywords) {
        aiKeywords.toLowerCase().split(/[\s,.;/-]+/).filter((w: string) => w.length >= 2)
          .forEach((w: string) => terms.push({ val: w, weight: 150 }));
      }

      // 3. Fragmentos do termo bruto (Backup)
      const mainTerms = (mainTermRaw as string).split(/[\s,.;/*-]+/).filter((w: string) => w.length >= 2);
      const baseWeight = origin === 'dynar' ? 100 : 70;

      mainTerms.forEach((w: string) => {
         terms.push({ val: w, weight: baseWeight });
         
         // Expansão de bitolas por palavra (Safe fallback)
         Object.entries(BITOLA_MAP).forEach(([dash, inches]) => {
            if (w === dash || inches.includes(w)) {
               terms.push({ val: dash, weight: 85 });
               inches.forEach(inch => terms.push({ val: inch, weight: 80 }));
            }
         });
      });
    }


    // Família técnica com alta prioridade (ex: r2at)
    if (familia) {
      terms.push({ val: familia, weight: 120 });
      
      // SPRINT 10: Normalização Hierárquica e Aliasing Inteligente
      // Se a busca for "sae 100r2", tentamos achar o alias "r2" ou "r2at"
      let matchedAlias = false;
      Object.entries(FAMILIA_ALIASES).forEach(([key, aliases]) => {
        if (key === familia || aliases.some(a => a === familia || familia.includes(a))) {
          terms.push({ val: key, weight: 115 });
          aliases.forEach(alias => terms.push({ val: alias, weight: 110 }));
          matchedAlias = true;
        }
      });

      if (!matchedAlias) {
        const cleanFam = familia.replace(/[^a-z0-9]/g, "");
        if (cleanFam !== familia) terms.push({ val: cleanFam, weight: 100 });
      }
    }

    // SPRINT 21: Extração Semântica Estratificada do Insight
    // Palavras genéricas de CATEGORIA não pontuam — servem apenas para filtros.
    // Somente características técnicas DIFERENCIADORES pontuam na busca.
    const insight = (entry.insight || "").toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // ❌ Palavras genéricas gramaticais (não técnicas)
    const PALAVRAS_NEUTRAS = new Set([
      "para", "com", "por", "que", "uma", "este", "esta", "seu", "sua", "dos", "das", "the", "and",
      "abnt"  // normas genéricas sem valor de match
    ]);

    // ✅ Nível 1: Tipos de Conexão (máxima especificidade)
    const CONEXAO_TYPES: Record<string, number> = {
      "jic": 200, "npt": 200, "bsp": 200, "dko": 200, "jis": 200,
      "orfs": 200, "sae": 150, "unf": 200, "unc": 180, "metric": 180,
      "fjx": 220, "mjx": 220,  // FJX = Female JIC, MJX = Male JIC
    };

    // ✅ Nível 2: Características Físicas Diferenciadoras
    const FISICO: Record<string, number> = {
      "femea": 150, "macho": 150, "giratoria": 180, "reta": 100,
      "cotovelo": 150, "curto": 80, "longo": 80, "duplo": 120,
      "prensado": 120, "rosca": 100, "flange": 120, "ponta": 80,
      "lisa": 80, "compacta": 100, "reducao": 120,
    };

    // ✅ Nível 3: Ângulos
    const ANGULOS: Record<string, number> = {
      "37": 150, "45": 150, "90": 150,
    };

    // ✅ Nível 4: Materiais/Famílias
    const FAMILIA_KEYS: Record<string, number> = {
      "r2at": 160, "r1at": 160, "r12": 160, "r13": 160, "r15": 160, "r16": 160,
      "m2t": 160, "mega2t": 160, "gates": 120, "parker": 120,
    };

    const words = insight.split(/[\s,.;()/°"'*\-]+/).filter((w: string) => w.length >= 2);

    for (const w of words) {
      if (PALAVRAS_NEUTRAS.has(w)) continue; // ← Zero pontos para genéricos
      if (terms.some(t => t.val === w)) continue; // já existe

      if (CONEXAO_TYPES[w] !== undefined) {
        terms.push({ val: w, weight: CONEXAO_TYPES[w] });
      } else if (FISICO[w] !== undefined) {
        terms.push({ val: w, weight: FISICO[w] });
      } else if (ANGULOS[w] !== undefined) {
        terms.push({ val: w, weight: ANGULOS[w] });
      } else if (FAMILIA_KEYS[w] !== undefined) {
        terms.push({ val: w, weight: FAMILIA_KEYS[w] });
      } else if (/^\d{2,3}$/.test(w)) {
        // Números puros = bitola ou rosca → alta prioridade
        terms.push({ val: w, weight: 140 });
      } else if (w.length >= 3) {
        // Outros termos técnicos: peso baixo mas não zero
        terms.push({ val: w, weight: 20 });
      }
    }

    // Bitolas expandidas explicitamente (mantém a lógica existente)
    Object.entries(BITOLA_MAP).forEach(([dash, inches]) => {
       if (insight.includes(dash) || inches.some(inch => insight.includes(inch))) {
          terms.push({ val: dash, weight: 160 });
       }
    });

  }

  // Se ainda não temos termos mas temos categoria, usamos as palavras-chave da categoria como busca
  if (terms.length === 0 && categoria) {
    const kws = CATEGORIA_KEYWORDS[categoria] || [];
    kws.forEach(kw => terms.push({ val: kw, weight: 40 }));
  }

  if (terms.length === 0) return [];

  // NOVO: Detectar categoria implícita no insight (Sprint 15 - Refinado + Normalizado)
  let categoriaHint = categoria;
  if (!categoriaHint && typeof entry === 'object' && entry.insight) {
    // Normalização para ignorar acentos (ex: Giratória -> giratoria)
    const lowInsight = entry.insight.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    
    // PRIORIDADE 1: Terminais (Se tem termo de ponta + mangueira)
    if ((lowInsight.includes("giratoria") || lowInsight.includes("femea") || lowInsight.includes("macho")) && 
        (lowInsight.includes("mangueira") || lowInsight.includes("mangote"))) {
      categoriaHint = "TERMINAL";
    }
    // PRIORIDADE 2: Mangueiras Puras
    else if (lowInsight.includes("mangueira") || lowInsight.includes("mangote")) {
      categoriaHint = "MANGUEIRA";
    }
    // PRIORIDADE 3: Terminais sem mangueira no texto
    else if (lowInsight.includes("terminal") || lowInsight.includes("giratoria") || lowInsight.includes("prensado")) {
      categoriaHint = "TERMINAL";
    }
    // PRIORIDADE 4: Adaptadores
    else if (lowInsight.includes("adaptador")) {
      categoriaHint = "ADAPTADOR";
    }
    // PRIORIDADE 5: Outros
    else if (lowInsight.includes("valvula")) {
      categoriaHint = "VALVULA";
    }
  }

  const penalidades = categoriaHint ? (CATEGORIA_PENALIDADES[categoriaHint] || []) : [];
  const bonusKeywords = categoriaHint ? (CATEGORIA_KEYWORDS[categoriaHint] || []) : [];

  return products.map((p: Produto) => {
    let score = 0;
    const codLegado = String(p.COD_LEGADO || "").toLowerCase();
    const codInterno = String(p.COD_INTERNO || "").toLowerCase();
    const descricao = String(p.DESCRICAO || p.DESCRICAO_RICA || "").toLowerCase();
    
    // Expansão semântica da descrição reduzida
    const expandedDesc = descricao.split(/[\s,.;/-]+/)
      .map((w: string) => TERMO_ABREVIACOES[w] ? `${w} ${TERMO_ABREVIACOES[w]}` : w)
      .join(" ");

    const normalCod = codLegado.replace(/[^a-z0-9]/g, "");
    // Sprint 21: lowDesc definido aqui, antes de todos os filtros
    const lowDesc = expandedDesc.toLowerCase();
    
    // ============================================================
    // SPRINT 21: Kill Switch Absoluto — Categoria domina tudo
    // Incluindo o bônus de 10k. Sem exceções.
    // ============================================================
    
    // TERMINAL: bloqueia mangueiras literais e conexões de aço
    if (categoriaHint === "TERMINAL") {
      if (codLegado === "mangueira" || lowDesc.startsWith("mangueira")) return { ...p, score: 0 };
      if (lowDesc.startsWith("conexao de aco") || lowDesc.startsWith("connexao")) return { ...p, score: 0 };
    }
    
    // MANGUEIRA: bloqueia terminais e adaptadores puras
    if (categoriaHint === "MANGUEIRA") {
      if (lowDesc.startsWith("terminal") || lowDesc.startsWith("adaptador")) return { ...p, score: 0 };
    }
    
    // ADAPTADOR: bloqueia mangueiras e terminais montados
    if (categoriaHint === "ADAPTADOR") {
      if (lowDesc.includes("mangueira") || lowDesc.includes("terminal")) {
        if (lowDesc.includes("montada") || lowDesc.includes("prensado")) return { ...p, score: 0 };
      }
    }

    let matchedAnchor = "";
    const isExactMatch = terms.some(t => {
      const match = codLegado === t.val.toLowerCase() || 
                    codInterno === t.val.toLowerCase() || 
                    normalCod === t.val.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (match && t.weight >= 500) matchedAnchor = t.val.toUpperCase();
      return match;
    });
    if (isExactMatch) score += 10000;

    // SPRINT 19: Identificação de DNA e Kill Switch (Penalidades gerais)
    const isIllegalCode = penalidades.some(pn => 
      codLegado === pn || 
      codLegado.startsWith(pn + "-") || 
      codLegado.endsWith("-" + pn)
    );

    const hasCategoryKeyword = bonusKeywords.some(kw => lowDesc.includes(kw));
    const hasPenaltyKeyword = penalidades.filter(p => !bonusKeywords.includes(p)).some(p => lowDesc.includes(p));
    
    if (isIllegalCode || (hasPenaltyKeyword && !hasCategoryKeyword)) return { ...p, score: 0 };
    // Bonus de categoria correta
    if (hasCategoryKeyword) score += 300;

    let matchedCount = 0;
    const technicalTerms = terms.filter(t => t.val.length >= 2);

    for (const term of technicalTerms) {
      const val = term.val.toLowerCase();
      const valNormal = val.replace(/[^a-z0-9]/g, "");

      const inCod = codLegado.includes(val) || normalCod.includes(valNormal);
      const isStartMatch = codLegado.startsWith(val) || normalCod.startsWith(valNormal);
      const inDesc = expandedDesc.includes(val);

      if (inCod) {
        score += 500;
        if (isStartMatch) score += 500;
        if (isStartMatch && codLegado.length <= val.length + 5) {
          score += 500; 
        }
        matchedCount++;
      } else if (inDesc) {
        // SPRINT 23: Marreta de Pontuação — Match Seguro na Descrição
        // Se o termo for a ÂNCORA (peso 500) e bater na descrição, damos 5k de bônus imediato.
        if (term.weight >= 500) {
          score += 5000;
        } else {
          score += 800; // Aumentado de 200 para 800 para dar peso real
        }
        matchedCount++;
      }
    }

    if (technicalTerms.length > 1 && matchedCount === technicalTerms.length) {
      score += 1000;
    }

    for (const term of terms) {
      if (!term.val) continue;
      if (codLegado.includes(term.val) || normalCod.includes(term.val.replace(/[^a-z0-9]/g, ""))) {
        score += term.weight * 10;
      }
      if (descricao.includes(term.val)) {
        score += Math.round(term.weight / 2);
      }
      if (/^\d{1,2}$/.test(term.val)) {
        const bitolaRegex = new RegExp(`[\\-/\\s]${term.val}[\\-/\\s]|^${term.val}[\\-/\\s]|[\\-/\\s]${term.val}$`, 'i');
        if (bitolaRegex.test(codLegado)) score += 50;
      }
    }

    return { ...p, score, termoSugerido: matchedAnchor };
  })
  .filter(p => p.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 40);
};

