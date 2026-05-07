
const TERMO_ABREVIACOES = {
  "f": "femea", "m": "macho", "gir": "giratoria", "term": "terminal", "fjx": "fjx"
};

const CATEGORIA_PENALIDADES = {
  "TERMINAL": ["mangueira", "mangote", "adaptador"],
  "MANGUEIRA": ["terminal", "adaptador"],
  "ADAPTADOR": ["mangueira", "terminal"]
};

const scoreProducts = (products, entry) => {
  const lowInsight = (entry.insight || "").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  let categoriaHint = "";
  if ((lowInsight.includes("giratoria") || lowInsight.includes("femea") || lowInsight.includes("fjx")) && 
      (lowInsight.includes("mangueira") || lowInsight.includes("mangote"))) {
    categoriaHint = "TERMINAL";
  } else if (lowInsight.includes("mangueira")) {
    categoriaHint = "MANGUEIRA";
  }

  const penalidades = CATEGORIA_PENALIDADES[categoriaHint] || [];

  return products.map(p => {
    let score = 0;
    const codLegado = (p.COD_LEGADO || "").toLowerCase();
    const descricao = (p.DESCRICAO || "").toLowerCase();
    const expandedDesc = descricao.split(/[\s,.;/-]+/)
      .map(w => TERMO_ABREVIACOES[w] ? `${w} ${TERMO_ABREVIACOES[w]}` : w)
      .join(" ");
    
    // Sprint 19: Kill Switch
    if (categoriaHint === "TERMINAL" && (codLegado === "mangueira" || expandedDesc.startsWith("mangueira"))) {
       return { ...p, score: 0 };
    }
    
    // Bônus de código
    if (codLegado === entry.termo?.toLowerCase()) score += 10000;
    
    // Bônus de Descrição
    if (categoriaHint === "TERMINAL" && (expandedDesc.includes("terminal") || expandedDesc.includes("femea"))) {
       score += 500;
    }
    
    // Penalidades Legadas
    if (penalidades.some(pn => expandedDesc.includes(pn))) {
       score = 0;
    }

    return { ...p, score };
  }).filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score);
};

module.exports = { scoreProducts };
