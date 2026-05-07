import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { Pool } from 'pg';

/**
 * CONFIGURAÇÃO DO BANCO
 * Use variáveis de ambiente para segurança
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/dynar_catalogo',
});

const DATA_DIR = path.join(process.cwd(), 'public/data');

async function migrate() {
  console.log('🚀 Iniciando migração de dados...');
  const client = await pool.connect();

  try {
    // 1. MIGRAR PRODUTOS (53k itens)
    console.log('📦 Processando produtos...');
    const baseFile = fs.readFileSync(path.join(DATA_DIR, 'base_produtos_clean.csv'), 'utf8');
    const baseData = Papa.parse(baseFile, { header: true, skipEmptyLines: true }).data;

    await client.query('BEGIN');
    for (const row of baseData as any[]) {
      await client.query(
        `INSERT INTO produtos (cod_interno, cod_legado, descricao, medida_unidade, tipo_produto, grupo_produto, descricao_rica, url_catalogo, url_desenho)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (cod_legado) DO UPDATE SET 
         descricao = EXCLUDED.descricao, descricao_rica = EXCLUDED.descricao_rica`,
        [row.COD_INTERNO, row.COD_LEGADO, row.DESCRICAO, row.MEDIDA_UNIDADE, row.TIPO_PRODUTO, row.GRUPO_PRODUTO, row.DESCRICAO_RICA, row.URL_CATALOGO, row.URL_DESENHO]
      );
    }
    await client.query('COMMIT');
    console.log(`✅ ${baseData.length} produtos migrados.`);

    // 2. MIGRAR ESTRUTURAS (Kits)
    console.log('🔗 Processando estruturas...');
    const estFile = fs.readFileSync(path.join(DATA_DIR, 'estrutura_produtos_clean.csv'), 'utf8');
    const estData = Papa.parse(estFile, { header: true, skipEmptyLines: true }).data;

    await client.query('BEGIN');
    for (const row of estData as any[]) {
      await client.query(
        `INSERT INTO estrutura_produtos (cod_legado_pai, cod_legado_filho, desc_componente, qtd_necessaria, desc_componente_rica, url_catalogo, url_desenho)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [row.COD_LEGADO_PAI, row.COD_LEGADO_FILHO, row.DESC_COMPONENTE, row.QTD_NECESSARIA, row.DESC_COMPONENTE_RICA, row.URL_CATALOGO, row.URL_DESENHO]
      );
    }
    await client.query('COMMIT');
    console.log(`✅ ${estData.length} vínculos de estrutura migrados.`);

    // 3. MIGRAR CONCORRENTES (Delimitador ;)
    console.log('🕵️ Processando mapeamento de concorrentes...');
    const concFile = fs.readFileSync(path.join(DATA_DIR, 'mapeamento_concorrentes_universal.csv'), 'utf8');
    const concData = Papa.parse(concFile, { header: true, skipEmptyLines: true, delimiter: ';' }).data;

    await client.query('BEGIN');
    for (const row of concData as any[]) {
      await client.query(
        `INSERT INTO mapeamento_concorrentes (dynar_cod, descricao, categoria, parker, gates, interloke, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [row.DYNAR_COD, row.DESCRIÇÃO, row.CATEGORIA, row.PARKER, row.GATES, row.INTERLOKE, row.STATUS]
      );
    }
    await client.query('COMMIT');
    console.log(`✅ ${concData.length} mapeamentos de concorrentes migrados.`);

  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ ERRO NA MIGRAÇÃO:', e);
  } finally {
    client.release();
    await pool.end();
    console.log('🏁 Processo finalizado.');
  }
}

migrate();
