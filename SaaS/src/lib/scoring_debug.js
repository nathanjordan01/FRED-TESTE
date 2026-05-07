
function scoreProducts(products, searchInput) {
  const CATEGORIA_KEYWORDS = {
    "MANGUEIRA": ["mangueira", "mangote", "conjunto de mang", "flexible hose"],
    "TERMINAL": ["terminal", "conector", "plug"],
    "ADAPTADOR": ["adaptador", "adaptador", "bushing"],
    "ENGATE": ["engate", "acoplamento", "quick"],
    "VALVULA": ["valvula", "válvula", "valve"],
    "PA": ["produto acabado", "montado", "kit"],
  };

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
    "04": ["1/4", "04", "06", "6mm"],
    "06": ["3/8", "06", "10", "10mm"],
    "08": ["1/2", "08", "13", "12mm"],
    "10": ["5/8", "10", "16", "15mm"],
    "12": ["3/4", "12", "19", "20mm"],
    "16": ["1\"", "16", "25", "25mm"],
    "20": ["1.1/4", "20", "32", "31mm"],
    "24": ["1.1/2", "24", "38", "40mm"],
    "32": ["2\"", "32", "50", "50mm"],
  };

  const CATEGORIA_PENALIDADES = {
    "MANGUEIRA": ["conexao", "alavanca", "terminal", "adaptador", "parafuso", "porca", "arruela", "valvula", "reparo", "embolo", "flange", "contraflange", "tubo", "tubo de aco", "calibrador", "mola", "anel", "diafragma"],
    "TERMINAL": ["mangueira", "mangote", "valvula", "alavanca", "flange"],
    "CONEXAO": ["mangueira", "mangote"],
  };

  let terms = [];
  let categoria = (searchInput.categoria || "").toUpperCase();
  let familia = (searchInput.familia || "").toLowerCase();
  let mainTerm = (searchInput.termo || "").toLowerCase();

  if (mainTerm) {
    terms.push({ val: mainTerm, weight: 60 });
    const bitolasTraduzidas = BITOLA_MAP[mainTerm] || [];
    bitolasTraduzidas.forEach(bt => terms.push({ val: bt, weight: 85 }));
  }

  if (familia) {
    terms.push({ val: familia, weight: 120 });
    const aliases = FAMILIA_ALIASES[familia] || [];
    aliases.forEach(alias => terms.push({ val: alias, weight: 110 }));
  }

  // NOVA IDEIA DO USUARIO: Usar o insight para extrair termos extras
  const insight = (searchInput.insight || "").toLowerCase();
  const extraTerms = ["r16", "r2at", "r12", "mega2t", "gates", "parker"];
  extraTerms.forEach(et => {
    if (insight.includes(et)) terms.push({ val: et, weight: 40 });
  });

  const penalidades = categoria ? (CATEGORIA_PENALIDADES[categoria] || []) : [];
  const bonusKeywords = categoria ? (CATEGORIA_KEYWORDS[categoria] || []) : [];

  return products.map(p => {
    let score = 0;
    const codLegado = String(p.COD_LEGADO || "").toLowerCase();
    const descricao = String(p.DESCRICAO || p.DESCRICAO_RICA || "").toLowerCase();
    const normalCod = codLegado.replace(/[^a-z0-9]/g, "");

    const hasCategoryKeyword = bonusKeywords.some(kw => descricao.includes(kw));
    const hasPenaltyKeyword = penalidades.filter(pn => !bonusKeywords.includes(pn)).some(pn => descricao.includes(pn));
    
    // REGRA DE OURO
    if (hasPenaltyKeyword && !hasCategoryKeyword) {
        return { ...p, score: 0 };
    }

    if (hasCategoryKeyword) score += 100;

    for (const term of terms) {
      if (codLegado.includes(term.val) || normalCod.includes(term.val.replace(/[^a-z0-9]/g, ""))) {
        score += term.weight * 3;
      }
      if (descricao.includes(term.val)) {
        score += Math.round(term.weight / 2);
      }
      if (/^\d{1,2}$/.test(term.val)) {
        const bitolaRegex = new RegExp(`[\\-/]${term.val}[\\-/]|^${term.val}[\\-/]|[\\-/]${term.val}$`, 'i');
        if (bitolaRegex.test(codLegado)) score += 50;
      }
    }

    return { ...p, score };
  }).filter(p => p.score > 0);
}

module.exports = { scoreProducts };
