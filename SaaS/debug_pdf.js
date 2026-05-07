/* eslint-disable */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PDF_DIR = 'c:\\Users\\thiag\\Downloads\\PDFs-20260408T161521Z-3-001\\PDFs';
const OUT_DIR = path.join(__dirname, 'public', 'desenhos_tecnicos');

async function debugCapture() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600 });
    
    const file = 'adaptador-bujao.pdf';
    const pdfPath = path.join(PDF_DIR, file);
    const finalUrl = `file:///${pdfPath.replace(/\\/g, '/')}`;

    console.log("📸 Debugging capture for:", finalUrl);
    await page.goto(finalUrl, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 5000));

    await page.screenshot({ path: path.join(OUT_DIR, 'DEBUG_FULL.png') });
    console.log("✅ DEBUG_FULL saved.");
    await browser.close();
}

debugCapture();
