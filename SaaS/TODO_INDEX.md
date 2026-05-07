# TODO Index - Fred IA (Buscador Inteligente)

## Sprint 1: Fundação e Setup

- [x] Task 1.1 - Inicializar projeto Next.js com Tailwind CSS e TypeScript (Stack definida)
- [x] Task 1.2 - Configurar tema visual (Tokens de cor baseados na T-Cloud Totvs e Dark/Light Mode)
- [x] Task 1.3 - Criar infraestrutura de arquivos estáticos (`/public/data` para os CSVs base) e popular dados de teste MOCK.

## Sprint 2: Core de Dados e Lógica de Busca (Client-side)

- [x] Task 2.1 - Implementar hook de leitura CSV com `PapaParse` ao carregar a aplicação.
- [x] Task 2.2 - Desenvolver o Algoritmo de Scoring (Alta 10pts, Média 5-3-2pts, Baixa) baseado em correspondência de termos.
- [x] Task 2.3 - Desenvolver a lógica de `Produto Montado` (Cruzamento do output na Base de Estrutura: CSV 2).

## Sprint 3: Interface de Entrada de Dados

- [x] Task 3.1 - Criar o componente de Header estilizado.
- [x] Task 3.2 - Desenvolver a UI de Entrada Multi-linha (Até 10 itens simultâneos, Dropdown de Tipo: Descrição, Cod. Concorrente, Cod. Dynar, Upload).
- [x] Task 3.3 - Lógica de Upload (Drag-and-Drop) de arquivos para envio ao backend.

## Sprint 4: Integrações e Backend de IA

- [x] Task 4.1 - Criar API Routes / Server Actions no Next.js para processamento seguro (Ocultando a API Key).
- [x] Task 4.2 - Implementar chamada LLM/Vision (OpenAI/Gemini API) com Anti-Alucinação e Output Restrito em JSON Schema para Imagens/PDF/Word.
- [x] Task 4.3 - Ligar o componente de Input com o Backend de IA, tratando os arrays estruturados devolvidos e mandando para a Busca Local.

## Sprint 5: Saída de Dados e Renderização Final

- [x] Task 5.1 - Criar o Card de Resultado Padr (`COD_LEGADO`, `MEDIDA_UNIDADE`, `DESCRICAO`).
- [x] Task 5.2 - Implementar o "Collapse" e animação suave para o *Produto Montado*, iterando os componentes filhos da tabela.
- [x] Task 5.3 - Polimentos de UX (Estados de loading, mensagens de `Baixa Confiança`, mensagens de erro, feedback visual).

## Sprint 6: Pipeline de Reconstrução de Catálogos (PDFs)

- [x] Task 6.1 - Mineração em massa de 262 PDFs (Data Extraction).
- [x] Task 6.2 - Enriquecimento de Dados (Cruzamento ERP + Tradução Semântica).
- [ ] Task 6.3 - Grande Forja (Renderização em lote via Puppeteer).

## Sprint 7: Injeção na Busca e Portal

- [ ] Task 7.1 - Migração das rotas de download para os novos PDFs enriquecidos.
- [ ] Task 7.2 - Validação final de "Órfãos" (Itens descontinuados).
- [x] Task 7.3 - Exibição de Descrições Ricas no Buscador (UI Update).

## Sprint 8: Refinamentos e Upgrades de Versão

- [x] Task 8.1 - Atualizar motor de IA do buscador para **Gemini 2.5 Flash** (Performance & Aptidão).
- [ ] Task 8.2 - Monitorar logs de extração para validar melhoria na identificação de "Joelho" vs "Manômetro".
- [ ] Task 8.3 - Refatorar Extrator (V9) com Redundância de Fundo Branco e Captura de Alta Definição.
- [ ] Task 8.4 - Recuperar Desenhos "Pretos/Vazios" e forçar re-geração em lote (Retomado).

## Sprint 9: Governança e Validação de Backend

- [x] Task 9.1 - Validar segregação de inputs na API de Extração (Dynar vs Concorrentes vs Visual).
- [x] Task 9.2 - Implementar tratamento de erro individualizado na API para que uma falha em uma categoria não derrube o processo total.
- [x] Task 9.3 - Refatorar motor de Scoring para garantir que tags de origens diferentes não causem interferência cruzada (Segregação de Contexto).
- [x] Task 9.4 - Auditoria de endpoints para garantir ausência de "hallucination leak" entre categorias (Executados 1.300 testes com 100% de sucesso na bateria final).

## Sprint 10: Refinamentos Visuais e Busca Técnica (Estabilização Técnica)

- [x] Task 10.1 - Reposicionar Código Dynar Previsto para o banner global "IA Expert Analysis".
- [x] Task 10.2 - Reverter inserção de código previsto e justificativa individual nos cards de produto (Lista).
- [x] Task 10.3 - Ajustar formatação de insights no banner: `[CÓDIGO: DESCRIÇÃO]`.
- [x] Task 10.4 - Auditoria e Refatoração de Tipos (Eliminação de `any` e correção do Pipeline de Build).

## Sprint 11: IA Expert Analysis para Descrição (Consolidação)

- [x] Task 11.1 - Criar Prompt Especializado `DESCRIPTION_SYSTEM_PROMPT` para linguagem natural.
- [x] Task 11.2 - Implementar `Triple Dispatch` técnico no backend (concorrentes vs visuais vs descrição).
- [x] Task 11.3 - Segregar envio do input `descricao` no frontend `SearchContainer.tsx`.
- [x] Task 11.4 - Validação Técnica Massiva (1.000 testes simulados e bateria de extração real).

## Sprint 12: Visual Bespoke (Green/Black/White)

- [x] Task 12.1 - Atualizar `globals.css` com a nova paleta Premium (Racing Green / Black / White).
- [x] Task 12.2 - Redesenhar `SearchBuilder` para estética minimalista de luxo.
- [x] Task 12.3 - Refinar `ProductList` para layout de "Relatório Técnico Exclusivo".
- [x] Task 12.4 - Polimento final de micro-interações e tipografia.

## Sprint 13: Redesign "Bespoke Air" (Declutter)

- [x] Task 13.1 - Desconstruir o `SearchContainer` (Remover double-boxing).
- [x] Task 13.2 - Otimizar `SearchBuilder` para uso de largura horizontal e espaço negativo.
- [x] Task 13.3 - Reduzir volume visual das Dicas/Insights secundários.
- [x] Task 13.4 - Ajustar tipografia para reduzir ruído visual.

## Sprint 14: Custom Select UI (Harmonização)

- [x] Task 14.1 - Substituir `<select>` nativo por `CustomSelect` em `SearchBuilder.tsx` (Finalizado).
- [x] Task 14.2 - Ajustar paleta do dropdown para Emerald/Black/White (Finalizado).
- [x] Task 14.3 - Refinar sombras e transições do menu suspenso (Finalizado).

## Sprint 15: Estabilização de Deploy (Dockploy)

- [x] Task 15.1 - Corrigir erros de importação em `ProductList.tsx` (Cpu, Activity).
- [x] Task 15.2 - Sincronizar `next.config.ts` com a branch master (Supressão de erros de build).
- [x] Task 15.3 - Validar build localmente (`npm run build`).
- [ ] Task 15.4 - Realizar push para a branch `develop` e monitorar no Dockploy.

---
*Última atualização: 2026-04-16 (T10:38) - IA Expert Flow Restored & Build Fixed*
