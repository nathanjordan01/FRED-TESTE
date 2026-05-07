
const FAMILIA_ALIASES = {
  "r2at": ["r2", "sae 100r2", "r2at"],
  "r1at": ["r1", "sae 100r1", "r1at"],
  "r12": ["r12", "sae 100r12"],
  "r13": ["r13", "sae 100r13"],
  "r15": ["r15", "sae 100r15"],
  "r16": ["m2t", "r16", "sae 100r16"],
  "m2t": ["m2t", "r2", "r16"]
};

const BITOLA_MAP = {
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

const CATEGORIA_KEYWORDS = {
  "MANGUEIRA": ["mangueira", "mangote", "conjunto de mang", "flexible hose"],
  "TERMINAL": ["terminal", "conector", "plug"],
  "ADAPTADOR": ["adaptador", "bushing"],
  "ENGATE": ["engate", "acoplamento", "quick"],
  "VALVULA": ["valvula", "válvula", "valve"],
  "PA": ["produto acabado", "montado", "kit"],
};

const CATEGORIA_PENALIDADES = {
  "MANGUEIRA": ["conexao", "alavanca", "terminal", "adaptador", "parafuso", "porca", "arruela", "valvula", "reparo", "embolo", "flange", "contraflange", "tubo", "tubo de aco", "calibrador", "mola", "anel", "diafragma"],
  "TERMINAL": ["mangueira", "mangote", "valvula", "alavanca", "flange", "porca", "parafuso", "arruela"],
  "CONEXAO": ["mangueira", "mangote"],
};

const scoreProducts = (products, searchInput) => {
  if (!searchInput || !products || products.length === 0) return [];

  if (Array.isArray(searchInput)) {
    const allScoredMaps = searchInput.map(input => {
      const results = scoreProducts(products, input);
      const map = new Map();
      results.forEach(r => map.set(r.COD_LEGADO || r.COD_INTERNO, r.score));
      return map;
    });

    const finalMap = new Map();
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

    return Array.from(finalMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 40);
  }

  const entry = searchInput;
  let terms = [];
  let categoria = "";
  let familia = "";

  if (typeof entry === 'string') {
    terms.push({ val: entry.toLowerCase().trim(), weight: 50 });
  } else if (entry && typeof entry === 'object') {
    const mainTerm = (entry.termo || "").toString().toLowerCase().trim();
    const origin = entry.origin;
    categoria = (entry.categoria || "").toString().toUpperCase().trim();
    familia = (entry.familia || "").toString().toLowerCase().trim();

    if (mainTerm) {
      const baseWeight = origin === 'dynar' ? 100 : 70;
      terms.push({ val: mainTerm, weight: baseWeight });
      Object.entries(BITOLA_MAP).forEach(([dash, inches]) => {
         if (mainTerm === dash || inches.includes(mainTerm)) {
            terms.push({ val: dash, weight: 85 });
            inches.forEach(inch => terms.push({ val: inch, weight: 80 }));
         }
      });
    }

    if (familia) {
      terms.push({ val: familia, weight: 120 });
      let matchedAlias = false;
      Object.entries(FAMILIA_ALIASES).forEach(([key, aliases]) => {
        if (key === familia.toLowerCase() || aliases.some(a => familia.toLowerCase().includes(a))) {
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

    const insight = (entry.insight || "").toLowerCase();
    
    // AUTO WORD EXTRACTION (SPRINT 12)
    const words = insight.split(/[\s,.;/]+/).filter(w => w.length >= 3);
    words.forEach(w => {
      if (!terms.some(t => t.val === w)) terms.push({ val: w, weight: 30 }); 
    });

    const extraTerms = ["r16", "r2at", "r12", "r13", "mega2t", "gates", "parker", "m2t", "compacta", "jic", "npt", "bsp", "dko", "jis", "metrica"];
    extraTerms.forEach(et => {
      if (insight.includes(et)) {
        terms.push({ val: et, weight: 45 });
      }
    });

    Object.entries(BITOLA_MAP).forEach(([dash, inches]) => {
       if (insight.includes(dash) || inches.some(inch => insight.includes(inch))) {
          terms.push({ val: dash, weight: 45 });
       }
    });
  }

  // FALLBACK TO CATEGORY PARAMS
  if (terms.length === 0 && categoria) {
    const kws = CATEGORIA_KEYWORDS[categoria] || [];
    kws.forEach(kw => terms.push({ val: kw, weight: 40 }));
  }

  if (terms.length === 0) return [];

  const penalidades = categoria ? (CATEGORIA_PENALIDADES[categoria] || []) : [];
  const bonusKeywords = categoria ? (CATEGORIA_KEYWORDS[categoria] || []) : [];

  return products.map(p => {
    let score = 0;
    const codLegado = String(p.COD_LEGADO || "").toLowerCase();
    const codInterno = String(p.COD_INTERNO || "").toLowerCase();
    const descricao = String(p.DESCRICAO || p.DESCRICAO_RICA || "").toLowerCase();
    const normalCod = codLegado.replace(/[^a-z0-9]/g, "");
    
    const isExactMatch = terms.some(t => 
      codLegado === t.val.toLowerCase() || 
      codInterno === t.val.toLowerCase() || 
      normalCod === t.val.toLowerCase().replace(/[^a-z0-9]/g, "")
    );

    if (isExactMatch) score += 2000;

    const hasCategoryKeyword = bonusKeywords.some(kw => descricao.includes(kw));
    const isHardware = ["porca", "parafuso", "arruela"].some(h => descricao.includes(h));
    const hasPenaltyKeyword = penalidades.filter(pn => !bonusKeywords.includes(pn)).some(pn => descricao.includes(pn));
    
    if (hasPenaltyKeyword && (!hasCategoryKeyword || isHardware)) {
       return { ...p, score: 0 };
    }
    
    if (hasCategoryKeyword) score += 200;

    let matchedCount = 0;
    const technicalTerms = terms.filter(t => t.val.length >= 2);

    for (const term of technicalTerms) {
      const val = term.val.toLowerCase();
      const valNormal = val.replace(/[^a-z0-9]/g, "");
      const inCod = codLegado.includes(val) || normalCod.includes(valNormal);
      const isStartMatch = codLegado.startsWith(val) || normalCod.startsWith(valNormal);
      const inDesc = descricao.includes(val);

      if (inCod) {
        score += 500;
        if (isStartMatch) score += 500;
        if (isStartMatch && codLegado.length <= val.length + 5) {
          score += 500; 
        }
        matchedCount++;
      } else if (inDesc) {
        score += 200;
        matchedCount++;
      }
    }

    if (technicalTerms.length > 1 && matchedCount === technicalTerms.length) {
      score += 1000;
    }

    for (const term of terms) {
      if (!term.val) continue;
      const cleanT = term.val.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (codLegado.includes(term.val) || (cleanT && normalCod.includes(cleanT))) {
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

    return { ...p, score };
  })
  .filter(p => p.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 40);
};

module.exports = { scoreProducts };
