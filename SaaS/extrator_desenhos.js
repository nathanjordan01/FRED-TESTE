const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PDF_DIR = 'c:\\Users\\thiag\\Downloads\\PDFs-20260408T161521Z-3-001\\PDFs';
const OUT_DIR = path.join(__dirname, 'public', 'desenhos_tecnicos');
const CONCURRENCY = 1; // Reduzido para 1 para evitar sobrecarga e travamentos no sistema

async function extractDrawings() {
    console.log(`🎨 EXTRAINDO DESENHOS TÉCNICOS (V9 - SMART RECOVERY)...`);
    
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

    const allFiles = fs.readdirSync(PDF_DIR).filter(f => f.endsWith('.pdf'));
    
    // Filtrar: Apenas os que não existem OU estão com tamanho suspeito (< 5KB)
    const files = allFiles.filter(file => {
        const imgPath = path.join(OUT_DIR, file.replace('.pdf', '.png'));
        if (!fs.existsSync(imgPath)) return true;
        const stats = fs.statSync(imgPath);
        return stats.size < 5000; // Imagens pretas costumam ser muito leves
    });

    console.log(`📊 Total: ${allFiles.length} | Pendentes/Corrompidos: ${files.length}`);

    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    let index = 0;
    const workers = Array(CONCURRENCY).fill(null).map(async (_, workerId) => {
        const page = await browser.newPage();
        
        // FORÇAR FUNDO BRANCO E ALTA DEFINIÇÃO
        const client = await page.target().createCDPSession();
        await client.send('Emulation.setDefaultBackgroundColorOverride', {
            color: { r: 255, g: 255, b: 255, a: 1 }
        });
        
        await page.setViewport({ 
            width: 1400, 
            height: 1600, 
            deviceScaleFactor: 2 
        });
        
        while (index < files.length) {
            const i = index++;
            const file = files[i];
            const pdfPath = path.resolve(PDF_DIR, file);
            const imgPath = path.join(OUT_DIR, file.replace('.pdf', '.png'));

            try {
                // Parâmetros para esconder UI e focar no conteúdo
                const finalUrl = `file:///${pdfPath.replace(/\\/g, '/')}#toolbar=0&navpanes=0&view=FitH`;
                await page.goto(finalUrl, { waitUntil: 'networkidle0', timeout: 60000 });
                
                // Aguardar renderização dos vetores (9s é seguro)
                await new Promise(r => setTimeout(r, 10000)); 

                await page.screenshot({
                    path: imgPath,
                    clip: { 
                        x: 350, 
                        y: 180, 
                        width: 750, 
                        height: 550 
                    }
                });

                console.log(`[W${workerId}][${i+1}/${files.length}] ✅ Re-gerado: ${file}`);
            } catch (err) {
                console.error(`❌ Erro em ${file}:`, err.message);
            }
        }
        await page.close();
    });

    await Promise.all(workers);
    await browser.close();
    console.log("🏁 EXTRAÇÃO V9 CONCLUÍDA!");
}

extractDrawings().catch(console.error);
