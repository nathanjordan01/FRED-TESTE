export interface Produto {
  COD_INTERNO: string;
  COD_LEGADO: string;
  DESCRICAO: string;
  DESCRICAO_RICA?: string;
  URL_CATALOGO?: string;
  URL_DESENHO?: string;
  MEDIDA_UNIDADE: string;
  TIPO_PRODUTO: string;
  GRUPO_PRODUTO: string;
}

export interface Estrutura {
  COD_LEGADO_PAI: string;
  COD_LEGADO_FILHO: string;
  DESC_COMPONENTE: string;
  DESC_COMPONENTE_RICA?: string;
  URL_CATALOGO?: string;
  URL_DESENHO?: string;
  QTD_NECESSARIA: string;
  MEDIDA_COMPONENTE?: string;
}

export interface SearchInput {
  termo: string;
  palavras_chave?: string; // SPRINT 26: Palavras para bater na descrição
  tipo?: string;
  insight?: string;
  categoria?: string; 
  familia?: string;
  origin?: 'dynar' | 'concorrente' | 'visual' | 'ai';
  isDynar?: boolean;
}

export interface SearchEntry {
  id: string;
  type: 'dynar' | 'concorrente' | 'visual' | 'descricao';
  value: string;
  file?: File;
}

export interface ScoredProduct extends Produto {
  score: number;
  termoSugerido?: string;
  matchedInsight?: string;
}

export interface ComponenteEstrutura {
  codFilho: string;
  descricao: string;
  descricaoRica?: string;
  quantidade: string;
  medida: string;
  urlCatalogo?: string;
}

export interface ScoredProductWithStructure extends ScoredProduct {
  isMontado: boolean;
  componentes: ComponenteEstrutura[];
}
