# 🗺️ Mapeamento Técnico: Fred IA Engine

Este documento detalha o funcionamento de cada arquivo do sistema, identificando o fluxo de dados e possíveis gargalos.

---

## 1. Front-End & Orquestração

### `src/components/SearchContainer.tsx`
**Responsabilidade**: Porta de entrada da busca e interface de resultados.
- **Linhas 40-60**: Capta o input do usuário, monta o `FormData` e envia para a API de extração (Gemini).
- **Linhas 65-80 (O Gargalo)**: Aqui ocorre a unificação. Se a IA falha (Erro 429), ele aciona o modo de busca por texto puro.
- **Fluxo de Dados**: Envia um array de `SearchInput` para o Worker e recebe de volta os produtos pontuados para renderizar o `ProductList`.

### `src/hooks/useSearchEngine.ts`
**Responsabilidade**: Ponte entre o React e o Web Worker.
- **Lógica**: Gerencia o ciclo de vida do Worker (inicialização e terminação). Mantém a comunicação via `postMessage`.
- **Prevenção de Erros**: Implementa o timeout de busca para evitar que o UI loader rode infinitamente.

---

## 2. O "Cérebro" (Lógica de Decisão)

### `src/lib/scoring-logic.ts`
**Responsabilidade**: A matemática da precisão técnica.
- **Linha 15**: Implementa o `BITOLA_MAP`. É aqui que a "mágica" acontece: converte automaticamente `1/2"` em `08` e códigos equivalentes.
- **Linhas 25-35**: Loop de Variantes. Gera buscas paralelas para garantir que variações de hífens, barras e espaços não quebrem o match.
- **Lógica de Pontuação**:
    - **10.000 pts**: Código Legado idêntico.
    - **500 pts**: Bônus de categoria (ex: Terminal encontrado em busca de Terminal).
    - **300-400 pts**: Palavras-chave encontradas na descrição.

---

## 3. Processamento em Background (Worker)

### `src/workers/searchWorker.ts`
**Responsabilidade**: Varredura ultra-rápida dos 53.000 itens.
- **Linhas 15-30**: Carga do CSV. Utiliza `PapaParse` com delimitador fixo `,` e decodificação `windows-1252` (ISO-8859-1).
- **Linhas 45-55 (Gargalo Corrigido)**: Filtro de Categoria. Estava sendo restritivo demais, excluindo itens do tipo "MP" (Matéria-Prima).
- **Processamento**: Limpa aspas e espaços de cada célula durante o mapeamento (Auditado na Sprint 36).

---

## 4. Banco de Dados e Documentação

### `public/data/base_produtos.csv`
- **Estrutura**: 9 colunas normalizadas.
- **Coluna 0**: ID Interno.
- **Coluna 1**: Código Legado (Chave primária de busca).
- **Coluna 2**: Descrição Técnica Curta.

### `docs/MANUAL_GRAMATICA_DYNAR.md`
- **Conteúdo**: Regras que a IA segue para entender o que é um terminal Reto, 45 or 90 graus.
```
