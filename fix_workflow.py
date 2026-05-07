import json

path = "/home/jordan/Documentos/projects/n8n/Fred - Dynar/Dynar_PDF_Extractor_v2.json"
with open(path, 'r') as f:
    wf = json.load(f)

for node in wf['nodes']:
    if node['name'] == 'Re-download':
        node['parameters']['fileId']['value'] = "={{ $('Download file').item.json.id }}"
        node['parameters']['options']['fileName'] = "={{ $('Download file').item.json.name }}"

    if node['name'] == 'Gemini Pro Re-extract':
        text = node['parameters']['text']
        text = text.replace(
            "{{ JSON.stringify($json.errors) }}",
            "{{ JSON.stringify($('Validação Cruzada').item.json.errors) }}"
        ).replace(
            "{{ $json.rawText }}",
            "{{ $('Validação Cruzada').item.json.rawText }}"
        )
        node['parameters']['text'] = text

    if node['name'] == 'Validação Cruzada':
        code = """const rawText = $('Extract Text from PDF').item.json.text || '';
const visionRaw = $json.content?.parts?.[0]?.text || '';
const fileName = $('Download file').item.json.name || 'unknown';

let visionJSON;
try {
  let clean = visionRaw.replace(/```json\\n?/g, '').replace(/```\\n?/g, '').trim();
  visionJSON = JSON.parse(clean);
} catch (e) {
  return { valid: false, error: 'JSON_PARSE_ERROR', detail: e.message, rawText, visionRaw, fileName };
}

if (visionJSON.has_table === false) {
  visionJSON.source_filename = fileName;
  return { valid: true, type: 'informational', data: visionJSON, fileName, rawText };
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
const allNums = rawText.match(/\\d+[,.]?\\d*/g) || [];
const sigNums = [...new Set(allNums.map(n => parseFloat(n.replace(',', '.'))).filter(n => !isNaN(n) && n > 1 && n < 100000))];
const vNums = new Set();
if (visionJSON.tables) {
  for (const t of visionJSON.tables) {
    for (const item of (t.items || [])) {
      for (const val of Object.values(item)) {
        if (typeof val === 'number') vNums.add(val);
        if (typeof val === 'string') { const m = val.match(/\\d+\\.?\\d*/g); if (m) m.forEach(x => vNums.add(parseFloat(x))); }
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

return {
  valid: isValid, errors, warnings, data: visionJSON, rawText, fileName,
  summary: { errors: errors.length, warnings: warnings.length, nums_text: sigNums.length, nums_missing: missing.length, ratio: Math.round(ratio*100)+'%' }
};"""
        node['parameters']['jsCode'] = code

    if node['name'] == 'Revalidação':
        code = """const rawText = $('Validação Cruzada').item.json.rawText || '';
const visionRaw = $json.content?.parts?.[0]?.text || '';
const fileName = $('Download file').item.json.name || 'unknown';

let visionJSON;
try {
  let clean = visionRaw.replace(/```json\\n?/g, '').replace(/```\\n?/g, '').trim();
  visionJSON = JSON.parse(clean);
} catch (e) {
  return { valid: false, error: 'JSON_PARSE_ERROR', detail: e.message, fileName };
}
visionJSON.source_filename = fileName;
if (visionJSON.has_table === false) return { valid: true, data: visionJSON, fileName };

const errors = [];
if (visionJSON.tables) {
  for (const t of visionJSON.tables) {
    if (t.row_count !== (t.items?.length || 0)) errors.push({ type: 'ROW_COUNT', table: t.table_title });
  }
}
return { valid: errors.length === 0, errors, data: visionJSON, fileName };"""
        node['parameters']['jsCode'] = code

    if node['name'] == 'Format Output OK' or node['name'] == 'Format Output OK 2':
        code = """const d = $json.data || {};
const v = $json.valid;
const fn = $json.fileName || '';
const errs = JSON.stringify($json.errors || []);
const warns = JSON.stringify($json.warnings || []);
const tables_json = JSON.stringify(d.tables || []);

return {
  source_filename: fn,
  product_type: d.product_type || '',
  page_section: d.page_section || '',
  standard: d.standard || '',
  subtitle: d.subtitle || '',
  descriptive_text: d.descriptive_text || d.full_text_content || '',
  observations: d.observations || '',
  has_table: d.has_table !== false,
  total_order_codes: d.total_order_codes || 0,
  tables_json: tables_json,
  validation_status: v ? 'APROVADO' : 'FALHOU',
  errors: errs,
  warnings: warns
};"""
        node['parameters']['jsCode'] = code

    if node['name'] == 'Format Output ERRO':
        code = """const d = $json.data || {};
const v = $json.valid;
const fn = $json.fileName || '';
const errs = JSON.stringify($json.errors || []);
const warns = JSON.stringify($json.warnings || []);
const tables_json = JSON.stringify(d.tables || []);

return {
  source_filename: fn,
  product_type: d.product_type || '',
  page_section: d.page_section || '',
  standard: d.standard || '',
  subtitle: d.subtitle || '',
  descriptive_text: d.descriptive_text || d.full_text_content || '',
  observations: d.observations || '',
  has_table: d.has_table !== false,
  total_order_codes: d.total_order_codes || 0,
  tables_json: tables_json,
  validation_status: 'REVISAO_MANUAL',
  errors: errs,
  warnings: warns
};"""
        node['parameters']['jsCode'] = code

with open(path, 'w', encoding='utf-8') as f:
    json.dump(wf, f, indent=2, ensure_ascii=False)

print("✅ Fixes applied to workflow JSON")
