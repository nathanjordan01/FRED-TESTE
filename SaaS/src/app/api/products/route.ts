import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { scoreProducts } from '@/lib/scoring-logic';
import { SearchInput } from '@/types/product';

export async function POST(request: Request) {
  try {
    const { searchInputs } = await request.json();
    
    if (!searchInputs || !Array.isArray(searchInputs)) {
      return NextResponse.json({ error: 'searchInputs is required' }, { status: 400 });
    }

    // 1. Extrair palavras-chave para pré-filtro no Banco (Performance)
    const keywords = searchInputs
      .flatMap(input => (input.termo || '').split(/\s+/))
      .filter(word => word.length > 2)
      .map(word => word.replace(/[^a-zA-Z0-9]/g, ''))
      .join(' | ');

    // 2. Query no Banco com Filtro inicial
    // Buscamos por código ou por palavras na descrição
    const dbResults = await query(`
      SELECT p.*, 
             EXISTS(SELECT 1 FROM estrutura_produtos e WHERE e.cod_legado_pai = p.cod_legado) as "isMontado"
      FROM produtos p
      WHERE 
        p.cod_legado ILIKE $1 
        OR p.cod_interno ILIKE $1
        ${keywords ? `OR to_tsvector('portuguese', p.descricao || ' ' || p.descricao_rica) @@ to_tsquery('portuguese', $2)` : ''}
      LIMIT 500
    `, [`%${searchInputs[0]?.termo || ''}%`, keywords]);

    // 3. Aplicar Lógica de Scoring Refinada (Dynar Logic)
    const scored = scoreProducts(dbResults.rows, searchInputs);

    // 4. Anexar Componentes para itens montados
    const finalResults = await Promise.all(scored.map(async (prod: any) => {
      if (prod.isMontado) {
        const comps = await query(
          `SELECT cod_legado_filho as "codFilho", desc_componente as "descricao", 
                  qtd_necessaria as "quantidade", url_catalogo as "urlCatalogo" 
           FROM estrutura_produtos WHERE cod_legado_pai = $1`,
          [prod.COD_LEGADO]
        );
        return { ...prod, componentes: comps.rows };
      }
      return { ...prod, componentes: [] };
    }));

    return NextResponse.json(finalResults);
  } catch (error) {
    console.error('SEARCH API ERROR:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
