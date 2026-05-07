const fs = require('fs');

function removerAcentosECedilha(texto) {
    if (!texto) return "";
    return texto
        .normalize('NFD') // Decompõe caracteres acentuados (ex: á -> a + ´)
        .replace(/[\u0300-\u036f]/g, "") // Remove os acentos (combinados)
        .replace(/ç/g, "c")
        .replace(/Ç/g, "C");
}

function processarArquivo(caminho) {
    console.log(`\n⏳ Processando: ${caminho}...`);
    try {
        // Lemos em Latin1 (padrão atual do arquivo que preserva os acentos)
        const raw = fs.readFileSync(caminho, 'latin1');
        
        // Removemos Ç, acentos, etc.
        const sanitizado = removerAcentosECedilha(raw);
        
        // Escrevemos em UTF-8 (padrão universal que não dará mais erro de caractere estranho)
        fs.writeFileSync(caminho, sanitizado, 'utf8');
        console.log(`✅ Sucesso! Arquivo ${caminho} limpo e convertido para UTF-8.`);
    } catch (e) {
        console.error(`❌ Erro ao processar ${caminho}:`, e.message);
    }
}

// Executa nos dois arquivos solicitados
processarArquivo('public/data/base_produtos_clean.csv');
processarArquivo('public/data/estrutura_produtos_clean.csv');
