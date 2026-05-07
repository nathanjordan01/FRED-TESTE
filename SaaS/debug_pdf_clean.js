/* eslint-disable */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PDF_DIR = 'c:\\Users\\thiag\\Downloads\\PDFs-20260408T161521Z-3-001\\PDFs';
const OUT_DIR = path.join(__dirname, 'public', 'desenhos_tecnicos');

async function debugCapture() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1000, height: 1200 });
    
    const file = 'adaptador-bujao.pdf';
    const pdfPath = path.join(PDF_DIR, file);
    // Adicionando parâmetros para esconder UI
    const finalUrl = `file:///${pdfPath.replace(/\\/g, '/')}#toolbar=0&navpanes=0&view=FitH`;

    console.log("📸 Debugging capture (CLEAN) for:", finalUrl);
    await page.goto(finalUrl, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 5000));

    await page.screenshot({ path: path.join(OUT_DIR, 'DEBUG_CLEAN.png') });
    console.log("✅ DEBUG_CLEAN saved.");
    await browser.close();
}

debugCapture();
