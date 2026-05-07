# Análise do Projeto Fred IA

## Visão Geral
- **Objetivo**: Criar um Buscador Inteligente de Produtos inspirado na interface T-Cloud da Totvs, focado nos nichos de Peças Industriais, Borrachas, Correias e Automação Pneumática.
- **Stack Tecnológica**: Next.js (App Router), React, Tailwind CSS, PapaParse, API OpenAI (Vision/GPT-4o).
- **Arquitetura Atual**: Projeto iniciando do zero. Foco forte no processamento local do frontend (latência zero via CSVs em memória) usando o Backend apenas para ponte segura com modelos de IA.
- **Pontos Fortes**: Busca offline-first instantânea via `PapaParse`, UI dinâmica que aceita diferentes tipos de inputs, desacoplamento e não bloqueio do sistema legado (Totvs ERP).
- **Pontos de Melhoria**: A complexidade do state management de uma busca "Multi-linha" (Lógica OR + Lógica AND na saída).

## Mapa de Dependências
- `Frontend (Interface)` dependente de `CSV 1 e 2` carregados no cliente.
- `Buscador (Motor Local)` avalia os resultados a partir do input fornecido.
- `Backend (Next.js API Routes / Server Actions)` envia Imagens e Docs para `LLM / Vision (OpenAI)`.
- `Card Renderizador` dependente de bater resultados no `CSV 2 (Estrutura Pai-Filho)` antes de montar em tela.

## Áreas Críticas
| Área | Risco | Justificativa |
|------|-------|---------------|
| Componente Multi-Input | Médio | Gerenciar múltiplos estados diferentes para 4 tipos de inserção num único fluxo OR/AND exige boa lógica de estado global. |
| Integração OCR IA (Backend) | Alto | Risco de 'alucinação' da IA. Mitigação requer Strict JSON Outputs e Prompt forte Anti-Alucinação. |
| Performance Busca CSV | Baixo | CSV com mais de 10k linhas varrido localmente pode bloquear Event Loop se mal arquitetado, porém uso de métodos nativos array resolve na maioria dos casos modernos. |
| Árvore Pai-Filho no Card | Médio | Criar expansão condicional batendo contra o CSV2 durante a exibição exige cuidados com renderização duplicada. |

## Recomendações
1. Iniciar do zero utilizando o template oficial do `create-next-app` focado em desempenho.
2. Usar dados *Mocks* rigorosos de CSV no /public desde o primeiro dia (para garantir que os hooks funcionem corretamente).
3. Construir as peças de UI de Input antes da lógica do buscador, para ter de onde sacar os inputs mockados em estado final.
