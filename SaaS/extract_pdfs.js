const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const DIR_PDFS = 'c:\\Users\\thiag\\Downloads\\PDFs-20260408T161521Z-3-001\\PDFs';
const OUT_FILE = path.join(__dirname, 'PDFs_Extraidos_Legacy.json');

// Uma Regex mais abrangente para achar os códigos de modelo (Ex: AJJC 4, AEJM 10LLx1/4, WTE 12, etc)
// Busca 2 a 6 letras maiúsculas, opcionalmente com traços/espaços, seguido de dígitos, e continua pegando caracteres que costumam existir nas medidas de catálogo
const codigoRegex = /[A-Z]{3,7}(?:[ -]\d+)?\b/g; 

async function processAllPdfs() {
    console.log(`Lendo diretório: ${DIR_PDFS}`);
    const files = fs.readdirSync(DIR_PDFS).filter(f => f.toLowerCase().endsWith('.pdf'));
    
    console.log(`Total de Arquivos encontrados: ${files.length}`);
    const resolucoes = [];

    let progresso = 0;

    for (const file of files) {
        const filePath = path.join(DIR_PDFS, file);
        try {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            const text = data.text;
            
            // Tentar extrair os códigos. Vamos pegar as palavras "suspeitas" exclusivas do padrão Dynar.
            const matches = text.match(/[A-Z]{3,7}(?:\s+\d+(?:[A-Za-z]+)?.*?)?(?=\n|$)/g) || [];
            
            // Filtro e limpeza
            const codigosUnicos = new Set();
            for (const match of matches) {
                // Remove espaços duplos
                const limpo = match.replace(/\s+/g, ' ').trim();
                // Pegar só a parte base, ex "AJJC" ou "AJJC 4" 
                // para não puxar muito lixo "AJJC 4 1/2"
                const partePrincipal = limpo.split(' ')[0]; 
                
                // Só salvamos prefixos que parecem códigos de verdade (só Letras Maiusculas min 3 max 7)
                if (/^[A-Z]{3,7}$/.test(partePrincipal)) {
                    codigosUnicos.add(partePrincipal);
                }
            }
            
            resolucoes.push({
                arquivo: file,
                codigos_encontrados: Array.from(codigosUnicos)
            });

        } catch (error) {
            console.error(`Erro ao processar ${file}: ${error.message}`);
            resolucoes.push({
                arquivo: file,
                erro: error.message
            });
        }

        progresso++;
        if (progresso % 10 === 0) {
            console.log(`Progresso: ${progresso}/${files.length} analizados...`);
        }
    }

    fs.writeFileSync(OUT_FILE, JSON.stringify(resolucoes, null, 2));
    console.log(`\nMineracao Completa! JSON salvo em: ${OUT_FILE}`);
}

processAllPdfs();
