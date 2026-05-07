const fs = require('fs');
const Papa = require('papaparse');

function finalSanitize(filePath, urlIndex) {
    console.log(`🧹 Iniciando sanitização final de ${filePath} (Índice URL: ${urlIndex})...`);
    const raw = fs.readFileSync(filePath, 'latin1');
    const parsed = Papa.parse(raw);
    
    let removed = 0;
    let valid = 0;

    parsed.data.forEach((row, i) => {
        if (i === 0) return; // Header
        const url = row[urlIndex];
        
        if (url && url.length > 5) {
            let cleanUrl = url.trim();
            if (!fs.existsSync('public' + cleanUrl)) {
                row[urlIndex] = ""; 
                if (row[urlIndex + 1]) row[urlIndex + 1] = ""; // Desenho
                removed++;
            } else {
                valid++;
            }
        }
    });

    const output = Papa.unparse(parsed.data);
    fs.writeFileSync(filePath, output, 'latin1');
    console.log(`✅ Concluído! Válidos: ${valid} | Removidos (404): ${removed}`);
}

// Sanitiza tanto a Base quanto a Estrutura com os índices corretos
finalSanitize('public/data/base_produtos_clean.csv', 7);
finalSanitize('public/data/estrutura_produtos_clean.csv', 5);
