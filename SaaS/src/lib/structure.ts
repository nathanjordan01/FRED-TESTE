import { Estrutura, ScoredProduct, ScoredProductWithStructure } from "../types/product";

export const attachStructure = (
  products: ScoredProduct[],
  estruturaBase: Estrutura[]
): ScoredProductWithStructure[] => {
  return products.map(p => {
    // Buscar filhos no CSV 2 onde o PAI == código do produto
    const filhos = estruturaBase.filter(e => e.COD_LEGADO_PAI === p.COD_LEGADO);
    
    if (filhos.length > 0) {
      return {
        ...p,
        isMontado: true,
        // Removemos a referência direta a URL_DESENHO_PAI se não estiver no tipo centralizado ainda
        componentes: filhos.map(f => ({
          codFilho: f.COD_LEGADO_FILHO,
          descricao: f.DESC_COMPONENTE,
          descricaoRica: f.DESC_COMPONENTE_RICA,
          urlCatalogo: f.URL_CATALOGO,
          quantidade: f.QTD_NECESSARIA,
          medida: f.MEDIDA_COMPONENTE || ""
        }))
      };
    }

    return {
      ...p,
      isMontado: false,
      componentes: []
    };
  });
};
