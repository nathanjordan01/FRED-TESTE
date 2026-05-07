const fs = require('fs');
const path = require('path');

const MAP_PATH = path.join(__dirname, 'mapeamento_validado.csv');
const SANEAMENTO_PATH = path.join(__dirname, 'public', 'data', 'saneamento_dynar_final.csv');
const BASE_RAW = path.join(__dirname, 'public', 'data', 'base_produtos.csv');
const BASE_OUT = path.join(__dirname, 'public', 'data', 'base_produtos_clean.csv');
const EST_RAW = path.join(__dirname, 'public', 'data', 'estrutura_produtos.csv');
const EST_OUT = path.join(__dirname, 'public', 'data', 'estrutura_produtos_clean.csv');

console.log("🚀 INICIANDO MEGA ENRIQUECEDOR V2 🚀");

// 1. Carregar Inteligência
const inteligencia = {};
const pdfMasterMap = {}; // Armazena a primeira família (master) de cada PDF

if (fs.existsSync(MAP_PATH)) {
    console.log("📝 Carregando Mapeamento Técnico (17k)...");
    const content = fs.readFileSync(MAP_PATH, 'utf-8').split('\n').slice(1);
    
    // Primeiro Passo: Identificar a família Master para cada PDF
    content.forEach(line => {
        if (!line.trim()) return;
        const [pdfOrigem, codPdf] = line.split(';');
        if (pdfOrigem && codPdf && !pdfMasterMap[pdfOrigem]) {
            pdfMasterMap[pdfOrigem] = codPdf.trim();
        }
    });

    // Segundo Passo: Mapear produtos usando a família Master do seu PDF
    content.forEach(line => {
        if (!line.trim()) return;
        const [pdfOrigem, codPdf, codErp, status, descLixo, descRica] = line.split(';');
        if (codErp) {
            const code = codErp.trim();
            const masterFamilia = pdfMasterMap[pdfOrigem] || codPdf.trim();
            
            inteligencia[code] = {
                descRica: descRica.trim(),
                url: `/catalogos_modernizados/${pdfOrigem.replace('.pdf', '')}-${masterFamilia}-ATUALIZADO.pdf`,
                img: `/desenhos_tecnicos/${pdfOrigem.replace('.pdf', '.png')}`
            };
        }
    });
}

if (fs.existsSync(SANEAMENTO_PATH)) {
    console.log("💎 Carregando Saneamento de Ouro (9k)...");
    const content = fs.readFileSync(SANEAMENTO_PATH, 'utf-8').split('\n').slice(1);
    content.forEach(line => {
        if (!line.trim()) return;
        const [codLegado, pdfResolvido] = line.split(';');
        if (codLegado && pdfResolvido) {
            const code = codLegado.trim();
            if (!inteligencia[code]) {
                inteligencia[code] = {};
            }
            inteligencia[code].url = `/catalogos_modernizados/${pdfResolvido.trim()}`;
            // Tenta adivinhar o desenho
            const drawName = pdfResolvido.trim()
                .replace('-ATUALIZADO.pdf', '')
                .replace(/-[A-Z0-9]+$/, '') + '.png';
            inteligencia[code].img = `/desenhos_tecnicos/${drawName}`;
        }
    });
}

function gerarFallbackRico(codLegado, descOriginal) {
    let mat = "Aço Carbono";
    const d = descOriginal.toUpperCase();
    if (d.includes("INOX")) mat = "Aço Inox";
    else if (d.includes("LATAO") || d.includes("LATÃO")) mat = "Latão";
    
    let tags = [`Mat: ${mat}`];
    // Pegar bitolas comuns no código legado (Ex: 1/2, 3/4, 1.1/4)
    const matchMedida = codLegado.match(/\d+(\/\d+)?|\d+\.\d+(\/\d+)?/);
    if (matchMedida && codLegado.includes(matchMedida[0])) {
        tags.push(`Ø: ${matchMedida[0]}"`);
    }

    return `${descOriginal} [${tags.join(' | ')}] - Cód: ${codLegado}`;
}

// 2. Processar Base Principal
console.log("💉 Processando Base de Produtos...");
let baseRawContent;
try {
    baseRawContent = fs.readFileSync(BASE_RAW, 'latin1');
} catch (e) {
    console.error("ERRO: base_produtos.csv não encontrada!");
    process.exit(1);
}

const baseLines = baseRawContent.split('\n');
const header = '"COD_INTERNO","COD_LEGADO","DESCRICAO","MEDIDA_UNIDADE","TIPO_PRODUTO","GRUPO_PRODUTO","DESCRICAO_RICA","URL_CATALOGO","URL_DESENHO"';
const resultBase = [header];

baseLines.slice(1).forEach(line => {
    if (!line.trim()) return;
    const parts = line.split('","');
    if (parts.length < 2) return;

    const codLegado = parts[1].replace(/^"|"$/g, '').trim();
    const descOriginal = parts[2] ? parts[2].replace(/^"|"$/g, '').trim() : "";
    
    const info = inteligencia[codLegado];
    let rica = info?.descRica || gerarFallbackRico(codLegado, descOriginal);
    let url = info?.url || "";
    let img = info?.img || "";

    rica = rica.replace(/Catalogo Geral Dynar/gi, "").trim();

    const cleanParts = parts.slice(0,6).map(p => p.replace(/^"|"$/g, '').trim());
    resultBase.push(`"${cleanParts.join('","')}","${rica}","${url}","${img}"`);
});

fs.writeFileSync(BASE_OUT, resultBase.join('\n'), 'latin1');
console.log(`✅ Base de Produtos concluída: ${resultBase.length - 1} itens.`);

// 3. Processar Estruturas
if (fs.existsSync(EST_RAW)) {
    console.log("💉 Processando Estruturas (Kits)...");
    const estLines = fs.readFileSync(EST_RAW, 'latin1').split('\n');
    const estHeader = '"COD_LEGADO_PAI","COD_LEGADO_FILHO","DESC_COMPONENTE","QTD_NECESSARIA","DESC_COMPONENTE_RICA","URL_CATALOGO","URL_DESENHO"';
    const resultEst = [estHeader];

    estLines.slice(1).forEach(line => {
        if (!line.trim()) return;
        const parts = line.split('","');
        if (parts.length < 2) return;

        const codFilho = parts[1].replace(/^"|"$/g, '').trim();
        const descOriginal = parts[2] ? parts[2].replace(/^"|"$/g, '').trim() : "";

        const info = inteligencia[codFilho];
        let rica = info?.descRica || gerarFallbackRico(codFilho, descOriginal);
        let url = info?.url || "";
        let img = info?.img || "";

        rica = rica.replace(/Catalogo Geral Dynar/gi, "").trim();

        const cleanParts = parts.slice(0,4).map(p => p.replace(/^"|"$/g, '').trim());
        resultEst.push(`"${cleanParts.join('","')}","${rica}","${url}","${img}"`);
    });

    fs.writeFileSync(EST_OUT, resultEst.join('\n'), 'latin1');
    console.log(`✅ Estruturas concluídas: ${resultEst.length - 1} itens.`);
}

console.log("🏁 SUCESSO TOTAL! O Banco de Dados Fred IA está calibrado.");
