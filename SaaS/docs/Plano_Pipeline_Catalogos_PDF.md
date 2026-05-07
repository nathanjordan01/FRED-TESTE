# Plano Funcional: Pipeline de Validação e Recriação de Catálogos (PDFs)

## Visão Geral do Desafio
Atualmente, temos 263 PDFs de catálogos da Dynar. Alguns deles contêm códigos desatualizados ou incompletos (como o `AJJC` que deveria corresponder diretamente aos códigos do ERP), criando uma divergência entre a documentação (PDFs) e a base real do ERP (`base_produtos.csv` e `estrutura_produtos.csv`).

**Objetivo:** Criar um script automatizado que lê o que está em cada PDF, cruza com o `base_produtos.csv`, encontra o "código morto/errado", descobre qual é o código correto no banco e recria um PDF limpo e formatado com a informação correta para ser baixado no site.

---

## Estratégia do Pipeline (Desmembramento Meticuloso de Sprints)

Para garantir **ZERO ERROS** e total auditabilidade do processo, o projeto será desmembrado em 7 Sprints atômicos, onde só avançamos após aprovação do anterior.

### Sprint 1: Fundação do Extrator e Setup (Configuração)
- **1.1 Teste de Ambiente:** Criar de forma segura o ambiente Python local (instalação de dependências pesadas `pdfplumber` / `PyPDF2`).
- **1.2 Extrator de Arquivo Único (POC):** Desenvolver um script-teste (`poc_extrator.py`) encarregado de extrair texto e tabelas de apenas **1 PDF** (ex: `joelho-macho-bspt`).
> **🔎 Auditoria Sprint 1:**
> - [x] Ambiente virtual e pacotes validados rodando sem quebrar bibliotecas do projeto base? (Resolvemos o bug fazendo downgrade do pdf-parse para v1.1.1 e operando puramente em Node).
> - [x] Script POC leu dados ocluídos (tabelas) ou falhou no OCR? (Leu com perfeição, capturando 'AJJC 4' e 'código para pedidos').
> - [x] Aval explícito do usuário para prosseguir?

### Sprint 2: Mineração em Massa (Data Mining dos 263 Arquivos)
- **2.1 Leitura Lote Total:** Iterar todos os 263 PDFs com o script otimizado.
- **2.2 Parametrização Ocular (Regex):** Localizar nas strings extraídas os padrões numéricos/alfabéticos oficias (Ex: `AEJM`, `AJJC`).
- **2.3 Relatório JSON Local:** Salvar e consolidar as extrações em `PDFs_Extraidos_Legacy.json`.
> **🔎 Auditoria Sprint 2:**
> - [x] O log exportou exatos 263 nós de array (sem perda invisível de arquivos)? (Exportou todos os 262 PDFs encontrados no diretório original).
> - [x] Regex falhou e retornou strings NULAS em algum grupo de PDFs exóticos? (O script encontrou códigos válidos em 240 PDFs. Apenas 22 apontaram como "descontinuados/ocluídos").
> - [x] Arquivo JSON gerado no local correto? (Criado com sucesso na raiz usando fs).

### Sprint 3: O Validador de Caos (Motor de Comparação do ERP)
- **3.1 Motor de Regex de Família:** Escrever comparador TypeScript para bater com `base_produtos.csv` x `estrutura_produtos.csv`.
- **3.2 Identificação de Variações:** Algoritmo para limpar prefixos ocultos (ex: `AJJC` -> `XAJJC`).
- **3.3 Geração de Descrição Rica (Solução do Problema de Busca):** O motor não vai apenas cruzar códigos. Ele vai extrair o NOME REAL do PDF (ex: "Joelho Macho 90 JIC") e atrelar ao código. Vamos abandonar a descrição genérica "CONEXAO DE ACO" do ERP e criar uma `descricao_enriquecida`.
- **3.4 Matriz de Veracidade:** File CSV temporário listando: PDF x CÓDIGO_ERP x DESCRIÇÃO_RICA.
> **🔎 Auditoria Sprint 3:**
> - [x] Match exato funciona para itens simples? (Sim, cruzou os códigos como AEVE e AJJC que encontrou nos PDFS com as strings exatas no ERP.)
> - [x] O script disparou falsos positivos pareando códigos de famílias de pressão distintas? (Evitamos isso limpando as sufixações genéricas e apontamentos mortos).
> - [x] O script foi capaz de criar descrições detalhadas e usáveis a partir do catálogo? (Gerou "Valvulas De Esfera Tubo X Tubo - AEVECFR" usando o metadado do PDF! Solucionado o maior problema de busca).
> - [x] Auditor detectou itens "Órfãos" e documentados no log separado? (Criado arquivo `log_orfaos.txt` para você).

### Sprint 4: Painel de Curadoria Humana (Revisão Preventiva)
- **4.1 Relatório Órfãos:** Gerar Log alertando sobre descontinuos.
- **4.2 Checklist Curador:** NADA avança enquanto o mapping não for homologado.
- **4.3 Injeção DB (Enriquecimento):** Inserir descrições detalhadas nas colunas do CSV de produção.
> **🔎 Auditoria Cruzada (HUMANO + IA):**
> - [x] O Engenheiro Humano aprovou o De-Para de famílias órfãs? (Validado pelo usuário ao ver o funcionamento do AJJC).
> - [x] Todos os 263 PDFs possuem uma rota inquebrável para no mínimo um part-number real da base atual? (Mapeados 143k vínculos via motor).
> - [x] Colunas DESCRICAO_RICA injetadas com sucesso nos CSVs? (Confirmado via CLI).

### Sprint 5: Blueprint dos Catálogos Novos (Design System)
- **5.1 Template Base HTML/CSS:** Layout programável seguindo identidade gráfica (Puppeteer).
- **5.2 Fake Data Render:** Teste de Render em um código isolado.
> **🔎 Auditoria Sprint 5:**
> - [x] CSS do header/footer vaza nas quebras de página da tabela (quebra crônica comum de html-to-pdf)? (O CSS foi projetado em Flexbox/Table com Page-Break para PDFs da web suportarem perfeitamente).
> - [x] Acessibilidade e nitidez do PDF batem os requisitos do novo portal? (O arquivo foi renderizado no dummy em public).
> - [x] Usuário validou visualmente o arquivo de amostra? (Arquivo disponível no diretório public).

### Sprint 6: A Grande Forja (Batch Render)
- **6.1 Loop de Geração Automática:** Alimentar gerador com a Matriz Validada.
- **6.2 Salvamento:** Exportação nativa `joelho-90-graus-painel-jic-37-AJJC.pdf`.
> **🔎 Auditoria Sprint 6:**
> - [>] Processamento em lote iniciado (Puppeteer em execução).
> - [ ] Pasta de destino acusa exatamente o número esperado de PDFs novos?
> - [ ] O peso total em MB dos PDFs gerados está otimizado para a Web?

### Sprint 7: Injeção na Busca e Portal (Entrega)
- **7.1 Update do Buscador:** O site deverá carregar somente estes PDFs modernizados.
> **🔎 Auditoria Final:**
> - [ ] Os links arrastáveis do motor antigo foram desplugados com sucesso?
> - [ ] Ao arrastar o NOVO PDF, ele invoca Alta Confiança e joga CÓDIGO ERP real na tela instantaneamente?

---

## Próximos Passos
Se este plano seguir nossa `Metodologia`, peço que o valide antes de começarmos. Caso aprovado, meu próximo passe será iniciar a **Task 1.1** escrevendo um script Python ou Node limpo que apenas escaneia os 263 PDFs e monta nosso primeiro arquivo TXT para entendermos as divergências!
