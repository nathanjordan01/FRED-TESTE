const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const MAP_PATH = path.join(__dirname, 'mapeamento_validado.csv');
const TEMPLATE_PATH = 'c:\\Git\\Fred_IA_Dynar\\src\\template_pdf.html';
const OUT_DIR = path.join(__dirname, 'public', 'catalogos_modernizados');

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function startBatchRender() {
    console.log("🔥 INICIANDO A GRANDE FORJA (SPRINT 6) - PUPPETEER 🔥");
    
    if (!fs.existsSync(MAP_PATH)) {
        console.error("Erro: mapeamento_validado.csv não encontrado!");
        return;
    }

    const templateRaw = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
    const mapContent = fs.readFileSync(MAP_PATH, 'utf-8').split('\n').filter(Boolean);
    const linhas = mapContent.slice(1);

    const pdfsAgrupados = {};

    linhas.forEach(linha => {
        const partes = linha.split(';');
        if (partes.length < 6) return;

        const pdfOrigem = partes[0];
        if (!pdfsAgrupados[pdfOrigem]) {
            pdfsAgrupados[pdfOrigem] = [];
        }
        pdfsAgrupados[pdfOrigem].push({
            familia: partes[1],
            codigoErp: partes[2],
            status: partes[3],
            descricaoNova: partes[5].trim()
        });
    });

    const arquivosParaGerar = Object.keys(pdfsAgrupados);
    console.log(`🚀 Identificados ${arquivosParaGerar.length} catálogos unificados para forjar.`);

    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });

    for (let i = 0; i < arquivosParaGerar.length; i++) {
        const nomeArquivoOriginal = arquivosParaGerar[i];
        const dadosProdutos = pdfsAgrupados[nomeArquivoOriginal];
        
        try {
            const itemMaster = dadosProdutos[0];
            let htmlAtualizado = templateRaw;
            
            let baseNome = nomeArquivoOriginal.replace('.pdf', '').replace(/-/g, ' ');
            baseNome = baseNome.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

            htmlAtualizado = htmlAtualizado.replace('{{NOME_PRODUTO_RICO}}', baseNome);
            htmlAtualizado = htmlAtualizado.replace('{{CODIGO_FAMILIA}}', itemMaster.familia);



            let tableRowsHtml = "";
            dadosProdutos.forEach((prod) => {
                tableRowsHtml += `
                <tr>
                    <td class="code-cell">${prod.codigoErp}</td>
                    <td>${prod.descricaoNova}</td>
                </tr>`;
            });

            htmlAtualizado = htmlAtualizado.replace(/<tbody>[\s\S]*?<\/tbody>/, `<tbody>${tableRowsHtml}</tbody>`);

            const page = await browser.newPage();
            // Timeout de 30s e waitUntil: 'load' para ser mais resiliente que networkidle0
            await page.setContent(htmlAtualizado, { waitUntil: 'load', timeout: 30000 });

            const novoNomePdf = nomeArquivoOriginal.replace('.pdf', `-${itemMaster.familia}-ATUALIZADO.pdf`);
            const pdfPath = path.join(OUT_DIR, novoNomePdf);

            await page.pdf({ 
                path: pdfPath, 
                format: 'A4', 
                printBackground: true,
                margin: { top: '0', bottom: '0', left: '0', right: '0' }
            });

            await page.close();
            console.log(`[${i+1}/${arquivosParaGerar.length}] ✅ Forjado: ${novoNomePdf}`);

        } catch (err) {
            console.error(`[${i+1}/${arquivosParaGerar.length}] ❌ Erro ao forjar ${nomeArquivoOriginal}:`, err.message);
        }
    }

    await browser.close();
    console.log(`\n🎉 SPRINT 6 CONCLUÍDO! Verifica 'public/catalogos_modernizados'.`);
}

startBatchRender().catch(err => console.error("Erro fatal no Puppeteer:", err));
