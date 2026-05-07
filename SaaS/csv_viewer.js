const fs = require('fs');
const iconv = require('iconv-lite'); // Note: if not available, we use native
const path = require('path');

const filePath = process.argv[2];
if (!filePath) {
    console.log("Uso: node csv_viewer.js <caminho_do_arquivo>");
    process.exit(1);
}

try {
    // Tenta ler como Latin1 (comum em arquivos brasileiros vindo de Excel)
    const contentLatin1 = fs.readFileSync(filePath, 'latin1');
    
    // Tenta detectar se há caracteres corrompidos comuns de UTF-8 lido como Latin1
    // Se encontrarmos o padrão de UTF-8, talvez devêssemos trocar.
    
    console.log(`\n--- VENDO ARQUIVO: ${path.basename(filePath)} ---\n`);
    console.log(contentLatin1.slice(0, 1000)); // Mostra os primeiros 1000 caracteres
    console.log("\n--- FIM DA PRÉVIA ---\n");
    console.log("DICA: Se os acentos aparecerem como Ã§ ou semelhantes, o arquivo é UTF-8.");
    console.log("Se aparecerem como  ou quadrados, o arquivo é Latin1 mas o seu terminal está em UTF-8.");
} catch (e) {
    console.error("Erro ao ler arquivo:", e.message);
}
