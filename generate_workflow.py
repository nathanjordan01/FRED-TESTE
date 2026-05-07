import json, uuid

def uid():
    return str(uuid.uuid4())

# Read prompt
with open("/home/jordan/Documentos/projects/n8n/Fred - Dynar/prompt_dinamico.txt") as f:
    prompt = f.read().strip()

# Read validation code
with open("/home/jordan/Documentos/projects/n8n/Fred - Dynar/validation_code.js") as f:
    validation_code = f.read().strip()

# Re-extraction prompt (enhanced with raw text context)
re_prompt = """ATENÇÃO: Extração anterior FALHOU na validação.

ERROS: {{ JSON.stringify($json.errors) }}

TEXTO BRUTO DO PDF (GROUND TRUTH):
{{ $json.rawText }}

Use o texto bruto como referência ABSOLUTA para não omitir dados.
Analise a IMAGEM para entender o layout e associação entre colunas.

""" + prompt

# Revalidation code
revalidation_code = """const rawText = $json.rawText || '';
const visionRaw = $input.first().json.content?.parts?.[0]?.text || '';
const fileName = $json.fileName || 'unknown';

let visionJSON;
try {
  let clean = visionRaw.replace(/```json\\n?/g, '').replace(/```\\n?/g, '').trim();
  visionJSON = JSON.parse(clean);
} catch (e) {
  return [{ json: { valid: false, error: 'JSON_PARSE_ERROR', detail: e.message, fileName } }];
}
visionJSON.source_filename = fileName;
if (visionJSON.has_table === false) return [{ json: { valid: true, data: visionJSON, fileName } }];

const errors = [];
if (visionJSON.tables) {
  for (const t of visionJSON.tables) {
    if (t.row_count !== (t.items?.length || 0)) errors.push({ type: 'ROW_COUNT', table: t.table_title });
  }
}
return [{ json: { valid: errors.length === 0, errors, data: visionJSON, fileName } }];
"""

# Credential refs
drive_cred = {"googleDriveOAuth2Api": {"id": "EuOqHuLFXtfCJBhO", "name": "Google Drive account | Admin"}}
gemini_cred = {"googlePalmApi": {"id": "oyBniSGPd0HBDOte", "name": "Google Gemini(PaLM) Api account 4"}}

# Build format output code
format_code = """const d = $json.data || {};
const v = $json.valid;
const fn = $json.fileName || '';
const errs = JSON.stringify($json.errors || []);
const warns = JSON.stringify($json.warnings || []);
const tables_json = JSON.stringify(d.tables || []);

return [{ json: {
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
}}];
"""

ids = {k: uid() for k in [
    'trigger','search','batch','download','extract','analyze',
    'validate','if_valid','format_ok','format_err',
    'wait_retry','redownload','reanalyze','revalidate','if_valid2',
    'format_ok2','format_err2','no_op'
]}

nodes = [
    {
        "parameters": {},
        "type": "n8n-nodes-base.manualTrigger",
        "typeVersion": 1,
        "position": [-700, 0],
        "id": ids['trigger'],
        "name": "Start"
    },
    {
        "parameters": {
            "resource": "fileFolder",
            "queryString": ".pdf",
            "returnAll": True,
            "filter": {
                "driveId": {"__rl": True, "value": "My Drive", "mode": "list", "cachedResultName": "My Drive"},
                "folderId": {"__rl": True, "value": "17ljYxd28b3tCUMsFgRjIyFazGz5P-K6q", "mode": "id"}
            },
            "options": {}
        },
        "type": "n8n-nodes-base.googleDrive",
        "typeVersion": 3,
        "position": [-480, 0],
        "id": ids['search'],
        "name": "Search PDFs",
        "credentials": drive_cred
    },
    {
        "parameters": {"batchSize": 3, "options": {}},
        "type": "n8n-nodes-base.splitInBatches",
        "typeVersion": 3,
        "position": [-260, 0],
        "id": ids['batch'],
        "name": "Batch 3"
    },
    {
        "parameters": {
            "operation": "download",
            "fileId": {"__rl": True, "value": "={{ $json.id }}", "mode": "id"},
            "options": {"fileName": "={{ $json.name }}"}
        },
        "type": "n8n-nodes-base.googleDrive",
        "typeVersion": 3,
        "position": [-40, 0],
        "id": ids['download'],
        "name": "Download file",
        "credentials": drive_cred
    },
    {
        "parameters": {
            "operation": "pdf",
            "binaryPropertyName": "data",
            "options": {"joinPages": True, "keepSource": "binary"}
        },
        "type": "n8n-nodes-base.extractFromFile",
        "typeVersion": 1.1,
        "position": [180, 0],
        "id": ids['extract'],
        "name": "Extract Text from PDF"
    },
    {
        "parameters": {
            "resource": "image",
            "operation": "analyze",
            "modelId": {"__rl": True, "value": "=models/gemini-2.5-flash", "mode": "id"},
            "text": "=" + prompt,
            "inputType": "binary",
            "binaryPropertyName": "data",
            "options": {}
        },
        "type": "@n8n/n8n-nodes-langchain.googleGemini",
        "typeVersion": 1.2,
        "position": [400, 0],
        "id": ids['analyze'],
        "name": "Gemini Flash Vision",
        "credentials": gemini_cred,
        "onError": "continueErrorOutput"
    },
    {
        "parameters": {
            "language": "javaScript",
            "jsCode": validation_code,
            "mode": "runOnceForEachItem"
        },
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [620, 0],
        "id": ids['validate'],
        "name": "Validação Cruzada"
    },
    {
        "parameters": {
            "conditions": {
                "options": {"caseSensitive": True, "leftValue": ""},
                "conditions": [{"leftValue": "={{ $json.valid }}", "rightValue": True, "operator": {"type": "boolean", "operation": "equals"}}],
                "combinator": "and"
            }
        },
        "type": "n8n-nodes-base.if",
        "typeVersion": 2.2,
        "position": [840, 0],
        "id": ids['if_valid'],
        "name": "Válido?"
    },
    {
        "parameters": {
            "language": "javaScript",
            "jsCode": format_code,
            "mode": "runOnceForEachItem"
        },
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [1060, -120],
        "id": ids['format_ok'],
        "name": "Format Output OK"
    },
    {
        "parameters": {"amount": 1, "unit": "minutes"},
        "type": "n8n-nodes-base.wait",
        "typeVersion": 1.1,
        "position": [1060, 120],
        "id": ids['wait_retry'],
        "name": "Wait 1min",
        "webhookId": uid()
    },
    {
        "parameters": {
            "operation": "download",
            "fileId": {"__rl": True, "value": "={{ $('Download file').first().json.id || $('Batch 3').first().json.id }}", "mode": "id"},
            "options": {"fileName": "={{ $json.fileName }}"}
        },
        "type": "n8n-nodes-base.googleDrive",
        "typeVersion": 3,
        "position": [1280, 120],
        "id": ids['redownload'],
        "name": "Re-download",
        "credentials": drive_cred
    },
    {
        "parameters": {
            "resource": "image",
            "operation": "analyze",
            "modelId": {"__rl": True, "value": "=models/gemini-2.5-pro", "mode": "id"},
            "text": "=" + re_prompt,
            "inputType": "binary",
            "binaryPropertyName": "data",
            "options": {}
        },
        "type": "@n8n/n8n-nodes-langchain.googleGemini",
        "typeVersion": 1.2,
        "position": [1500, 120],
        "id": ids['reanalyze'],
        "name": "Gemini Pro Re-extract",
        "credentials": gemini_cred,
        "onError": "continueErrorOutput"
    },
    {
        "parameters": {
            "language": "javaScript",
            "jsCode": revalidation_code,
            "mode": "runOnceForEachItem"
        },
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [1720, 120],
        "id": ids['revalidate'],
        "name": "Revalidação"
    },
    {
        "parameters": {
            "conditions": {
                "options": {"caseSensitive": True, "leftValue": ""},
                "conditions": [{"leftValue": "={{ $json.valid }}", "rightValue": True, "operator": {"type": "boolean", "operation": "equals"}}],
                "combinator": "and"
            }
        },
        "type": "n8n-nodes-base.if",
        "typeVersion": 2.2,
        "position": [1940, 120],
        "id": ids['if_valid2'],
        "name": "Válido 2?"
    },
    {
        "parameters": {
            "language": "javaScript",
            "jsCode": format_code,
            "mode": "runOnceForEachItem"
        },
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [2160, 0],
        "id": ids['format_ok2'],
        "name": "Format Output OK 2"
    },
    {
        "parameters": {
            "language": "javaScript",
            "jsCode": format_code.replace("'APROVADO'", "'REVISAO_MANUAL'"),
            "mode": "runOnceForEachItem"
        },
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [2160, 240],
        "id": ids['format_err2'],
        "name": "Format Output ERRO"
    },
    {
        "parameters": {},
        "type": "n8n-nodes-base.noOp",
        "typeVersion": 1,
        "position": [2380, 0],
        "id": ids['no_op'],
        "name": "Done - Loop Back"
    }
]

connections = {
    "Start": {"main": [[{"node": "Search PDFs", "type": "main", "index": 0}]]},
    "Search PDFs": {"main": [[{"node": "Batch 3", "type": "main", "index": 0}]]},
    "Batch 3": {"main": [
        [{"node": "Download file", "type": "main", "index": 0}],
    ]},
    "Download file": {"main": [[{"node": "Extract Text from PDF", "type": "main", "index": 0}]]},
    "Extract Text from PDF": {"main": [[{"node": "Gemini Flash Vision", "type": "main", "index": 0}]]},
    "Gemini Flash Vision": {"main": [
        [{"node": "Validação Cruzada", "type": "main", "index": 0}],
        [{"node": "Wait 1min", "type": "main", "index": 0}]
    ]},
    "Validação Cruzada": {"main": [[{"node": "Válido?", "type": "main", "index": 0}]]},
    "Válido?": {"main": [
        [{"node": "Format Output OK", "type": "main", "index": 0}],
        [{"node": "Wait 1min", "type": "main", "index": 0}]
    ]},
    "Format Output OK": {"main": [[{"node": "Done - Loop Back", "type": "main", "index": 0}]]},
    "Wait 1min": {"main": [[{"node": "Re-download", "type": "main", "index": 0}]]},
    "Re-download": {"main": [[{"node": "Gemini Pro Re-extract", "type": "main", "index": 0}]]},
    "Gemini Pro Re-extract": {"main": [
        [{"node": "Revalidação", "type": "main", "index": 0}],
        [{"node": "Format Output ERRO", "type": "main", "index": 0}]
    ]},
    "Revalidação": {"main": [[{"node": "Válido 2?", "type": "main", "index": 0}]]},
    "Válido 2?": {"main": [
        [{"node": "Format Output OK 2", "type": "main", "index": 0}],
        [{"node": "Format Output ERRO", "type": "main", "index": 0}]
    ]},
    "Format Output OK 2": {"main": [[{"node": "Done - Loop Back", "type": "main", "index": 0}]]},
    "Format Output ERRO": {"main": [[{"node": "Done - Loop Back", "type": "main", "index": 0}]]},
    "Done - Loop Back": {"main": [[{"node": "Batch 3", "type": "main", "index": 0}]]}
}

workflow = {
    "name": "Dynar PDF Extractor v2 - Híbrido com Validação",
    "nodes": nodes,
    "connections": connections,
    "active": False,
    "settings": {"executionOrder": "v1"},
    "meta": {"templateCredsSetupCompleted": True},
    "tags": []
}

output_path = "/home/jordan/Documentos/projects/n8n/Fred - Dynar/Dynar_PDF_Extractor_v2.json"
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2, ensure_ascii=False)

print(f"Workflow saved to: {output_path}")
print(f"Total nodes: {len(nodes)}")
print(f"Total connections: {len(connections)}")
