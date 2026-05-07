/* eslint-disable */
const https = require('https');
const fs = require('fs');
const path = require('path');

const JS_DIR = path.join(__dirname, 'public', 'js');
if (!fs.existsSync(JS_DIR)) fs.mkdirSync(JS_DIR, { recursive: true });

function download(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path.join(JS_DIR, filename));
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(path.join(JS_DIR, filename), () => reject(err));
        });
    });
}

async function run() {
    console.log("📥 BAIXANDO PDF.JS...");
    await download('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js', 'pdf.min.js');
    await download('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js', 'pdf.worker.min.js');
    console.log("✅ PDF.JS PRONTO!");
}

run().catch(console.error);
