// Validação Cruzada: Texto Bruto vs Vision JSON
const rawText = $('Extract Text from PDF').first().json.text || '';
const visionRaw = $input.first().json.content?.parts?.[0]?.text || '';
const fileName = $('Download file').first().json.name || 'unknown';

let visionJSON;
try {
  let clean = visionRaw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  visionJSON = JSON.parse(clean);
} catch (e) {
  return [{ json: { valid: false, error: 'JSON_PARSE_ERROR', detail: e.message, rawText, visionRaw, fileName } }];
}

if (visionJSON.has_table === false) {
  visionJSON.source_filename = fileName;
  return [{ json: { valid: true, type: 'informational', data: visionJSON, fileName } }];
}

const errors = [];
const warnings = [];

// CAMADA 1: row_count
if (visionJSON.tables) {
  for (const table of visionJSON.tables) {
    if (table.row_count !== (table.items?.length || 0)) {
      errors.push({ type: 'ROW_COUNT_MISMATCH', table: table.table_title, declared: table.row_count, actual: table.items?.length || 0 });
    }
  }
}

// CAMADA 2: Números significativos
const allNums = rawText.match(/\d+[,.]?\d*/g) || [];
const sigNums = [...new Set(allNums.map(n => parseFloat(n.replace(',', '.'))).filter(n => !isNaN(n) && n > 1 && n < 100000))];
const vNums = new Set();
if (visionJSON.tables) {
  for (const t of visionJSON.tables) {
    for (const item of (t.items || [])) {
      for (const val of Object.values(item)) {
        if (typeof val === 'number') vNums.add(val);
        if (typeof val === 'string') { const m = val.match(/\d+\.?\d*/g); if (m) m.forEach(x => vNums.add(parseFloat(x))); }
      }
    }
  }
}
const missing = sigNums.filter(n => ![...vNums].some(v => Math.abs(v - n) < 0.15));
const ratio = sigNums.length > 0 ? missing.length / sigNums.length : 0;
if (ratio > 0.15) errors.push({ type: 'DATA_MISSING', missingCount: missing.length, total: sigNums.length, ratio: Math.round(ratio*100)+'%', samples: missing.slice(0,10) });

// CAMADA 3: Campos vazios
if (visionJSON.tables) {
  for (const t of visionJSON.tables) {
    (t.items||[]).forEach((item, i) => {
      for (const [k,v] of Object.entries(item)) {
        if (v === null || v === '' || v === undefined) warnings.push({ type: 'EMPTY_FIELD', table: t.table_title, row: i, field: k });
      }
    });
  }
}

const isValid = errors.length === 0;
visionJSON.source_filename = fileName;

return [{ json: {
  valid: isValid, errors, warnings, data: visionJSON, rawText, fileName,
  summary: { errors: errors.length, warnings: warnings.length, nums_text: sigNums.length, nums_missing: missing.length, ratio: Math.round(ratio*100)+'%' }
}}];
