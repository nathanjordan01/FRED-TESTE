const fs = require('fs');
const path = require('path');

const MAP_PATH = path.join(__dirname, 'mapeamento_validado.csv');
const BASE_CSV = path.join(__dirname, 'public', 'data', 'base_produtos.csv');
const ESTRUTURA_CSV = path.join(__dirname, 'public', 'data', 'estrutura_produtos.csv');

// 1. Carregar Mapeamento Validado (O super cérebro que cruzou o PDF com o ERP)
console.log("🧠 Carregando Inteligência Mapeada do Sprint 3...");
const mapContent = fs.readFileSync(MAP_PATH, 'utf-8').split('\n').slice(1).filter(Boolean);

const dictRico = {};
mapContent.forEach(line => {
    // PDF_ORIGEM;CODIGO_PDF;CODIGO_ERP;STATUS_MATCH;DESCRICAO_LIXO_ERP;NOVA_DESCRICAO_ENRIQUECIDA
    const partes = line.split(';');
    if (partes.length >= 6) {
        const codErp = partes[2].trim();
        const descRica = partes[5].trim();
        // Evita sobrescrever com algo pior se já gravou uma vez
        if (!dictRico[codErp]) {
            dictRico[codErp] = descRica;
        }
    }
});
console.log(`✅ ${Object.keys(dictRico).length} códigos únicos cruzados e mapeados para enriquecimento.`);

// Analisador Fallback (Caso a peça NÃO estivesse em nenhum PDF)
function gerarDescricaoFallback(codLegado, descricaoErp) {
    let material = "Aço Carbono"; // Fallback default
    const desc = descricaoErp.toUpperCase();
    if (desc.includes("INOX")) material = "Aço Inox";
    else if (desc.includes("LATAO") || desc.includes("LATÃO")) material = "Latão";

    let tags = [];
    if (material) tags.push(`Mat: ${material}`);
    const matchMedida = codLegado.match(/\d+(,\d+)?(X|x)\d+(\/\d+)?|\d+\/\d+/);
    if (matchMedida) tags.push(`Ø: ${matchMedida[0]}"`);
    const matchRosca = codLegado.match(/\b(BSP|NPT|JIC|UNF|M\d+|ISO)\b/i);
    if (matchRosca) tags.push(`Rosca: ${matchRosca[0].toUpperCase()}`);

    return `${descricaoErp} [${tags.join(' | ')}] - Cód: ${codLegado}`;
}

// 2. Enxertar Base Principal (base_produtos.csv)
console.log("\n💉 Injetando Coluna de Descrição Rica na base_produtos.csv...");
const baseRaw = fs.readFileSync(BASE_CSV, 'utf-8').split('\n');
const baseHeader = baseRaw[0].replace('\r', '') + ',"DESCRICAO_RICA"';

const baseProcessada = [baseHeader];
let baseCountEnriquecido = 0;

for (let i = 1; i < baseRaw.length; i++) {
    const line = baseRaw[i].replace('\r', '');
    if (!line.trim()) continue;

    // "COD_INTERNO","COD_LEGADO","DESCRICAO","MEDIDA_UNIDADE","TIPO_PRODUTO","GRUPO_PRODUTO"
    const partes = line.split('","');
    const codLegado = partes[1] ? partes[1].trim() : "";
    const descricaoOriginal = partes[2] ? partes[2].trim() : "";

    let descricaoInjetada = "";
    if (dictRico[codLegado]) {
        descricaoInjetada = dictRico[codLegado];
        baseCountEnriquecido++;
    } else {
        // Fallback pra peça sem PDF
        descricaoInjetada = gerarDescricaoFallback(codLegado, descricaoOriginal);
    }

    baseProcessada.push(`${line},"${descricaoInjetada}"`);
}
fs.writeFileSync(BASE_CSV, baseProcessada.join('\n'), 'utf-8');
console.log(`✅ Base Principal atualizada! ${baseCountEnriquecido} descrições herdadas dos PDFs.`);

// 3. Enxertar Estrutura (estrutura_produtos.csv)
console.log("\n💉 Injetando Coluna na estrutura_produtos.csv (Kits)...");
const estRaw = fs.readFileSync(ESTRUTURA_CSV, 'utf-8').split('\n');
const estHeader = estRaw[0].replace('\r', '') + ',"DESC_COMPONENTE_RICA"';

const estProcessada = [estHeader];
let estCountEnriquecido = 0;

for (let i = 1; i < estRaw.length; i++) {
    const line = estRaw[i].replace('\r', '');
    if (!line.trim()) continue;

    // "COD_LEGADO_PAI","COD_LEGADO_FILHO","DESC_COMPONENTE","QTD_NECAS"
    const partes = line.split('","');
    const codFilho = partes[1] ? partes[1].trim() : "";
    const descricaoOriginal = partes[2] ? partes[2].trim() : "";

    let descricaoInjetada = "";
    if (dictRico[codFilho]) {
        descricaoInjetada = dictRico[codFilho];
        estCountEnriquecido++;
    } else {
        descricaoInjetada = gerarDescricaoFallback(codFilho, descricaoOriginal);
    }

    estProcessada.push(`${line},"${descricaoInjetada}"`);
}
fs.writeFileSync(ESTRUTURA_CSV, estProcessada.join('\n'), 'utf-8');
console.log(`✅ Estrutura de Kits atualizada! ${estCountEnriquecido} componentes herdaram genética rica.\n`);
console.log("🏁 INJEÇÃO DB CONCLUÍDA! O CSV Oficial agora possui o formato dos sonhos dos Vendedores.");
