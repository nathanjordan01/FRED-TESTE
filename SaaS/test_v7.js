/* eslint-disable */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PDF_DIR = 'c:\\Users\\thiag\\Downloads\\PDFs-20260408T161521Z-3-001\\PDFs';
const OUT_DIR = path.join(__dirname, 'public', 'desenhos_tecnicos');

async function testExtraction() {
    console.log("🧪 TESTANDO EXTRAÇÃO V7 (RESILIENTE)...");
    
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

    const files = ['adaptador-boleado-jic-37-graus.pdf', 'adaptador-bujao.pdf'];
    const browser = await puppeteer.launch({ headless: 'new' });

    for (const file of files) {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 1600 });
        
        try {
            const pdfPath = path.resolve(PDF_DIR, file);
            const finalUrl = `file:///${pdfPath.replace(/\\/g, '/')}`;
            const imgPath = path.join(OUT_DIR, `TEST_V7_${file.replace('.pdf', '.png')}`);

            console.log(`Processing ${file}...`);
            await page.goto(finalUrl, { waitUntil: 'load' });
            
            // Esperar o viewer carregar
            await new Promise(r => setTimeout(r, 8000));

            // Tentar encontrar o canvas ou algo que indique que renderizou
            // No Chrome PDF viewer, o conteudo fica dentro de um shadow root.
            
            await page.screenshot({
                path: imgPath,
                clip: { x: 300, y: 150, width: 800, height: 800 } // Area aproximada sem flags
            });

            console.log(`✅ ${file} saved.`);
        } catch (err) {
            console.error(`❌ ${file} error:`, err.message);
        } finally {
            await page.close();
        }
    }

    await browser.close();
}

testExtraction();
