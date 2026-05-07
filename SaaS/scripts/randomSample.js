const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../public/data/mapeamento_concorrentes_universal.csv');

function getRandomSample() {
    try {
        console.log("=== Iniciando Validação Aleatória de Códigos ===");
        const fileContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = fileContent.split('\n');
        
        // Remove cabeçalho e filtra apenas itens que possuem código de concorrente preenchido
        const mappedItems = lines.slice(1).filter(line => {
            const cols = line.split(';');
            if (cols.length < 6) return false;
            // Verifica se Parker, Gates ou Interloke não são "-"
            return (cols[3] && cols[3].trim() !== '-') || 
                   (cols[4] && cols[4].trim() !== '-') || 
                   (cols[5] && cols[5].trim() !== '-');
        });

        if (mappedItems.length === 0) {
            console.log("Nenhum item mapeado válido encontrado.");
            return;
        }

        console.log(`Pool total de itens mapeados com concorrentes: ${mappedItems.length}`);
        console.log("Sorteando 10 itens para auditoria de alucinação...\n");

        // Embaralhar e pegar 10
        const shuffled = mappedItems.sort(() => 0.5 - Math.random());
        const sample = shuffled.slice(0, 10);

        sample.forEach((line, index) => {
            const [dynar, desc, cat, parker, gates, interloke, status] = line.split(';');
            console.log(`[Item ${index + 1}]`);
            console.log(`  - DYNAR:     ${dynar} (${desc})`);
            console.log(`  - PARKER:    ${parker}`);
            console.log(`  - GATES:     ${gates}`);
            console.log(`  - INTERLOKE: ${interloke}`);
            console.log(`  --------------------------------------------------`);
        });

    } catch (error) {
        console.error("Erro ao ler o arquivo CSV:", error);
    }
}

getRandomSample();
