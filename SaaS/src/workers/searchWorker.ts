import Papa from 'papaparse';
import { scoreProducts } from '../lib/scoring-logic';

interface Product {
  COD_INTERNO: string;
  COD_LEGADO: string;
  DESCRICAO: string;
  MEDIDA_UNIDADE: string;
  TIPO_PRODUTO: string;
  GRUPO_PRODUTO: string;
  DESCRICAO_RICA: string;
  URL_CATALOGO: string;
  URL_DESENHO: string;
  isMontado?: boolean;
  componentes?: any[];
}

let productBase: Product[] = [];
let estruturaMap: Record<string, any[]> = {};
let concorrenteMap: Record<string, string> = {};

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  try {
    if (type === 'LOAD_DATA') {
      // VOLTANDO PARA A LEITURA SIMPLES (UTF-8 PADRÃO)
      const [resBase, resEst, resConc] = await Promise.all([
        fetch('/data/base_produtos_clean.csv').then(r => r.text()),
        fetch('/data/estrutura_produtos_clean.csv').then(r => r.text()),
        fetch('/data/mapeamento_concorrentes_universal.csv').then(r => r.text())
      ]);

      // 1. Mapeamento de Estrutura
      const parsedEst = Papa.parse(resEst, { header: false, skipEmptyLines: true });
      parsedEst.data.forEach((row: any) => {
        const pai = String(row[0] || "").trim();
        if (!pai) return;
        if (!estruturaMap[pai]) estruturaMap[pai] = [];
        estruturaMap[pai].push({
          codFilho: String(row[1] || "").trim(),
          descricao: String(row[2] || "").trim(),
          quantidade: String(row[3] || "").trim(),
          descricaoRica: String(row[4] || "").trim(),
          urlCatalogo: String(row[5] || "").trim(),
          urlDesenho: String(row[6] || "").trim()
        });
      });

      // 2. Mapeamento de Concorrentes
      const parsedConc = Papa.parse(resConc, { header: true, skipEmptyLines: true, delimiter: ';' });
      parsedConc.data.forEach((row: any) => {
        const dynarCod = String(row.DYNAR_COD || "").trim();
        if (!dynarCod) return;

        const addMap = (val: string) => {
          if (val && val !== '-' && val.trim() !== "") {
            const cleanKey = val.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
            concorrenteMap[cleanKey] = dynarCod;
          }
        };

        addMap(row.PARKER);
        addMap(row.GATES);
        addMap(row.INTERLOKE);
      });

      // 3. Processar Base de Produtos
      const parsedBase = Papa.parse(resBase, { header: false, skipEmptyLines: true });
      productBase = parsedBase.data.map((row: any) => {
        const clean = (val: any) => String(val || "").replace(/^"(.*)"$/, '$1').trim();
        const codLegado = clean(row[1]);
        const componentes = estruturaMap[codLegado] || [];
        return {
          COD_INTERNO: clean(row[0]),
          COD_LEGADO: codLegado,
          DESCRICAO: clean(row[2]),
          MEDIDA_UNIDADE: clean(row[3]),
          TIPO_PRODUTO: clean(row[4]),
          GRUPO_PRODUTO: clean(row[5]),
          DESCRICAO_RICA: clean(row[6]),
          URL_CATALOGO: clean(row[7]),
          URL_DESENHO: clean(row[8]),
          isMontado: componentes.length > 0,
          componentes: componentes
        };
      });

      self.postMessage({ type: 'DATA_LOADED', payload: { count: productBase.length } });
    }

    if (type === 'SEARCH') {
      const { entries } = payload;
      if (!productBase.length || !entries) return;

      const inputs = entries.map((e: any) => {
        let valueToSearch = e.value;
        const cleanInput = String(e.value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
        if (e.type === 'concorrente' && concorrenteMap[cleanInput]) {
          valueToSearch = concorrenteMap[cleanInput];
        }
        return {
          termo: valueToSearch,
          origin: e.type === 'descricao' ? 'ai' : e.type,
          isDynar: e.type === 'dynar' || (e.type === 'concorrente' && !!concorrenteMap[cleanInput])
        };
      }).filter((i: any) => i.termo && i.termo.trim() !== "");

      const results = scoreProducts(productBase, inputs);
      self.postMessage({ type: 'SEARCH_RESULTS', payload: results });
    }
  } catch (err) {
    console.error("WORKER ERROR:", err);
    self.postMessage({ type: 'SEARCH_RESULTS', payload: [] });
  }
};
