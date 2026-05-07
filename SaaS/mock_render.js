const fs = require('fs');
const path = require('path');

const TEMPLATE_PATH = 'c:\\Git\\Fred_IA_Dynar\\src\\template_pdf.html';
const OUT_PATH = 'c:\\Git\\Fred_IA_Dynar\\public\\dummy_catalogo_AJJC.html';

const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

const htmlRenderizado = template
    .replace('{{NOME_PRODUTO_RICO}}', 'Joelho 90 Graus Painel Jic 37 Graus - AJJC')
    .replace('{{CODIGO_FAMILIA}}', 'AJJC')
    .replace('{{CODIGO_COMPLETO_1}}', 'XAJJC 10LX1/4 BSPT')
    .replace('{{MEDIDA_1}}', '1/4 x 1/4')
    .replace('{{CODIGO_ANTIGO}}', 'AJJC 4')
    .replace('{{CODIGO_COMPLETO_2}}', 'XAJJC 10LX3/8 BSPT')
    .replace('{{MEDIDA_2}}', '3/8 x 3/8')
    // Substituindo o segundo {{CODIGO_ANTIGO}}
    .replace('{{CODIGO_ANTIGO}}', 'AJJC 6');

fs.writeFileSync(OUT_PATH, htmlRenderizado, 'utf-8');
console.log(`✅ Render Fake gerado em: ${OUT_PATH}`);
