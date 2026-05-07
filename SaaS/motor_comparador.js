const fs = require('fs');
const path = require('path');

const JSON_PATH = path.join(__dirname, 'PDFs_Extraidos_Legacy.json');
const CSV_PATH = 'c:\\Git\\Fred_IA_Dynar\\public\\data\\base_produtos.csv';
const OUT_PATH = path.join(__dirname, 'mapeamento_validado.csv');

// Carregar Dados
console.log("🛠️ Iniciando Motor de Comparação e Enriquecimento...");
const extracoes = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));

console.log("📂 Carregando Base do ERP (pode demorar alguns segundos)...");
const csvRaw = fs.readFileSync(CSV_PATH, 'utf-8').split('\n');
// Pular cabecalho
const erpData = csvRaw.slice(1).filter(line => line.trim() !== '').map(line => {
    const parts = line.split('","');
    if (parts.length < 3) return null;
    return {
        cod_interno: parts[0].replace(/"/g, '').trim(),
        cod_legado: parts[1].trim(),
        descricao_erp: parts[2].trim(),
        linha_original: line.trim()
    };
}).filter(Boolean);

console.log(`✅ ${erpData.length} produtos do ERP carregados em RAM.\n`);

// Helpers
function formatarBasePdf(filename) {
    let base = filename.replace('.pdf', '').replace(/-/g, ' ');
    return base.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function extrairAtributosAvancados(codLegado, descricaoErp) {
    let material = "Aço Carbono Padrão";
    const desc = descricaoErp.toUpperCase();
    if (desc.includes("INOX")) material = "Aço Inoxidável (Inox)";
    else if (desc.includes("LATAO") || desc.includes("LATÃO")) material = "Latão";
    else if (desc.includes("ALUMINIO")) material = "Alumínio";
    else if (desc.includes("PLASTICO") || desc.includes("POLI")) material = "Polímero/Plástico";

    let medida = "";
    const matchMedida = codLegado.match(/\d+(,\d+)?(X|x)\d+(\/\d+)?|\d+\/\d+/);
    if (matchMedida) medida = matchMedida[0];

    let rosca = "";
    const matchRosca = codLegado.match(/\b(BSP|NPT|JIC|UNF|M\d+|ISO)\b/i);
    if (matchRosca) rosca = matchRosca[0].toUpperCase();

    let engate = "";
    if (desc.includes("MACHO") || codLegado.endsWith("M")) engate = "Macho";
    if (desc.includes("FEMEA") || codLegado.endsWith("F")) engate = (engate ? "Macho Fêmea" : "Fêmea");

    let tags = [];
    if (material) tags.push(`Mat: ${material}`);
    if (medida) tags.push(`Ø: ${medida}"`);
    if (rosca) tags.push(`Rosca: ${rosca}`);
    if (engate) tags.push(`Engate: ${engate}`);

    return tags.join(' | ');
}

const mapeamentoOtimizado = new Map();
const orfaos = [];
let contMatchExato = 0;
let contMatchParcial = 0;

// 1. Varrer todos os PDFs e criar um mapa de "Melhor Fonte" para cada código do ERP
extracoes.forEach(pdfItem => {
    const nomePdf = pdfItem.arquivo.toLowerCase();
    const codigosPdf = pdfItem.codigos_encontrados || [];
    
    let relevância = 5; 
    if (nomePdf.includes('catalogo') || nomePdf.includes('geral') || nomePdf.includes('indice')) relevância = 1;
    if (nomePdf.includes('joelho') || nomePdf.includes('adaptador') || nomePdf.includes('vÃ¡lvula') || nomePdf.includes('conexÃ£o')) relevância = 10;

    codigosPdf.forEach(codBase => {
        if (["SAE", "DIN", "NPT", "BSP", "JIC", "ISO", "M-", "UNF"].includes(codBase.toUpperCase())) return;

        const matchesERP = erpData.filter(item => item.cod_legado.includes(codBase));

        matchesERP.forEach(matchInfo => {
            const codErp = matchInfo.cod_legado;
            const existing = mapeamentoOtimizado.get(codErp);

            if (!existing || relevância > existing.relevância) {
                mapeamentoOtimizado.set(codErp, {
                    pdf_origem: pdfItem.arquivo,
                    codigo_pdf: codBase,
                    matchInfo: matchInfo,
                    relevância: relevância
                });
            }
        });
    });
});

// 2. Gerar as descrições ricas a partir do mapa otimizado
const mapeamentoFinal = [];
mapeamentoOtimizado.forEach((data) => {
    const { pdf_origem, codigo_pdf, matchInfo } = data;
    const baseNovaDescricao = formatarBasePdf(pdf_origem);
    
    let status = matchInfo.cod_legado.startsWith(codigo_pdf) ? 'MATCH_EXATO' : 'MATCH_PARCIAL';
    if (status === 'MATCH_EXATO') contMatchExato++;
    else contMatchParcial++;

    const atributosTecnicos = extrairAtributosAvancados(matchInfo.cod_legado, matchInfo.descricao_erp);
    const superDescricaoRica = `${baseNovaDescricao} [${atributosTecnicos}] - Cód: ${matchInfo.cod_legado}`;

    mapeamentoFinal.push({
        pdf_origem: pdf_origem,
        codigo_pdf: codigo_pdf,
        codigo_erp: matchInfo.cod_legado,
        status: status,
        descricao_antiga_erp: matchInfo.descricao_erp,
        descricao_nova_rica: superDescricaoRica
    });
});

// Exportar Tabela Mapeada
let csvContent = "PDF_ORIGEM;CODIGO_PDF;CODIGO_ERP;STATUS_MATCH;DESCRICAO_LIXO_ERP;NOVA_DESCRICAO_ENRIQUECIDA\n";
mapeamentoFinal.forEach(row => {
    csvContent += `${row.pdf_origem};${row.codigo_pdf};${row.codigo_erp};${row.status};${row.descricao_antiga_erp};${row.descricao_nova_rica}\n`;
});

fs.writeFileSync(OUT_PATH, csvContent, 'utf-8');
console.log(`🚀 SPRINT 6 PRE-ENRIQUECIMENTO CONCLUÍDO!`);
console.log(`- Vínculos Otimizados: ${mapeamentoFinal.length}`);
console.log(`- Saved: ${OUT_PATH}`);
