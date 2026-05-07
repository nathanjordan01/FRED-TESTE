const fs = require('fs');
const path = require('path');

const MAP_PATH = path.join(__dirname, 'mapeamento_validado.csv');
const BASE_CSV = path.join(__dirname, 'public', 'data', 'base_produtos.csv');
const ESTRUTURA_CSV = path.join(__dirname, 'public', 'data', 'estrutura_produtos.csv');

console.log("🧹 Iniciando Limpeza e Re-injeção Limpa (Com URLs de Catálogos)...");

// 1. Carregar o Lote de Ouro (Saneamento Validado de 2.603 itens)
const SANEAMENTO_FILE = path.join(__dirname, 'public', 'data', 'saneamento_dynar_final.csv');
const dictOuro = {};

if (fs.existsSync(SANEAMENTO_FILE)) {
    console.log("💎 Carregando Lote de Ouro (Matches 100% Validados)...");
    const saneamentoLines = fs.readFileSync(SANEAMENTO_FILE, 'utf-8').split('\n').slice(1);
    saneamentoLines.forEach(line => {
        const [codigo, pdfName] = line.split(';');
        if (codigo && pdfName) {
            dictOuro[codigo.trim()] = {
                url: `/catalogos_modernizados/${pdfName.trim()}`,
                img: `/desenhos_tecnicos/${pdfName.trim().replace('.pdf', '.png')}`
            };
        }
    });
}

function extrairAtributosFallback(codLegado, descricaoErp) {
    let material = "Aço Carbono"; 
    const desc = descricaoErp.toUpperCase();
    if (desc.includes("INOX")) material = "Aço Inox";
    const matchMedida = codLegado.match(/\d+(,\d+)?(X|x)\d+(\/\d+)?|\d+\/\d+/);
    let tags = [`Mat: ${material}`];
    if (matchMedida) tags.push(`Ø: ${matchMedida[0]}"`);
    return `${descricaoErp} [${tags.join(' | ')}] - Cód: ${codLegado}`;
}

// 2. Limpar BASE_PRODUTOS.CSV (Respeita o encoding real das máquinas brasileiras)
const baseRaw = fs.readFileSync(BASE_CSV, 'latin1').split('\n');
const baseHeader = '"COD_INTERNO","COD_LEGADO","DESCRICAO","MEDIDA_UNIDADE","TIPO_PRODUTO","GRUPO_PRODUTO","DESCRICAO_RICA","URL_CATALOGO","URL_DESENHO"';
const baseClean = [baseHeader];

baseRaw.slice(1).forEach(line => {
    if (!line.trim()) return;
    const parts = line.split('","');
    const codLegado = parts[1] ? parts[1].trim() : "";
    const descOriginal = parts[2] ? parts[2].trim() : "";
    
    const originalParts = parts.slice(0, 6).join('","');
    
    let info = dictOuro[codLegado];
    let rica = extrairAtributosFallback(codLegado, descOriginal);
    
    // LIMPEZA FINAL: Remove ruído de "Catalogo Geral" que sobrou no CSV
    rica = rica.replace(/Catalogo Geral Dynar/gi, "")
               .replace(/\[Mat: AÃ§o Carbono\]/g, "[Mat: Aço Carbono]")
               .trim();

    let url = info ? info.url : "";
    let img = info ? info.img : "";

    // FILTRO DE SEGURANÇA (Sprint 9): Detectar alucinações de mapeamento
    if (descOriginal.toUpperCase().includes("MANGUEIRA") && rica.toUpperCase().includes("MANOMETRO")) {
        console.warn(`⚠️ Alucinação detectada para [${codLegado}]: MANGUEIRA mapeada como MANOMETRO. Aplicando Fallback.`);
        rica = extrairAtributosFallback(codLegado, descOriginal);
        url = ""; 
        img = "";
    }

    baseClean.push(`${originalParts}","${rica}","${url}","${img}"`);
});

fs.writeFileSync(BASE_CSV, baseClean.join('\n'), 'latin1');
console.log("✅ Base Produtos Enriquecida com Filtro de Segurança.");

// 3. Limpar ESTRUTURA_PRODUTOS.CSV
const estRaw = fs.readFileSync(ESTRUTURA_CSV, 'latin1').split('\n');
const estHeader = '"COD_LEGADO_PAI","COD_LEGADO_FILHO","DESC_COMPONENTE","QTD_NECESSARIA","DESC_COMPONENTE_RICA","URL_CATALOGO","URL_DESENHO"';
const estClean = [estHeader];

estRaw.slice(1).forEach(line => {
    if (!line.trim()) return;
    const parts = line.split('","');
    const codFilho = parts[1] ? parts[1].trim() : "";
    const descOriginal = parts[2] ? parts[2].trim() : "";
    
    const originalParts = parts.slice(0, 4).join('","'); 
    
    let info = dictOuro[codFilho];
    let rica = extrairAtributosFallback(codFilho, descOriginal);
    let url = info ? info.url : "";
    let img = info ? info.img : "";

    // FILTRO DE SEGURANÇA (Kits)
    if (descOriginal.toUpperCase().includes("MANGUEIRA") && rica.toUpperCase().includes("MANOMETRO")) {
        rica = extrairAtributosFallback(codFilho, descOriginal);
        url = "";
        img = "";
    }

    estClean.push(`${originalParts}","${rica}","${url}","${img}"`);
});

fs.writeFileSync(ESTRUTURA_CSV, estClean.join('\n'), 'latin1');
console.log("✅ Estrutura de Kits Enriquecida com URLs.");
