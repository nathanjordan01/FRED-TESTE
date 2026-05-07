# Análise do Mapeamento Universal (Dynar vs Concorrentes)

## 1. Visão Geral
**Arquivo Alvo:** `mapeamento_concorrentes_universal.csv`
**Volume de Dados:** 52.572 linhas mapeadas.
**Ocorrência:** O usuário reportou suspeitas de inconsistência nas ligações e sobreposição de itens.
**Objetivo Base:** Validar o arquivo batendo códigos Dynar (baseados no `base_produtos_clean.csv` / `base_produtos.csv`) com os códigos de 3 concorrentes diretos (Parker, Gates e Interloke) pesquisando linha por linha as especificações técnicas da peça.

## 2. Diagnóstico Técnico Inicial (Prova de Conceito)

Iniciamos a nossa prova de conceito (PoC) amostral próximo a linha 3.150, local onde o usuário estava posicionado, visando avaliar as características do desafio atual.

**Descobertas Críticas:**

1. **Inexistência de Cadastro Fonte**: Códigos chaves como o `AJUM 5X1/8 BSP` ou `AJTI 10` que estão mapeados no arquivo `mapeamento_concorrentes_universal.csv` **não existem** no banco de dados consolidado `base_produtos.csv` (nem no clean). O mapeamento universal contêm milhares de códigos que não constam com este literal no banco raiz (podendo ser variações extintas).
2. **Alucinações Severas de Categoria (Adaptador vs Borracha)**: O código local listado é o `AJUM 5X1/4 BSP` (Provável: *Adaptador JIC para BSP*). No entanto, o arquivo vincula esse adaptador a concorrência usando os códigos:
   - **Parker: `10643-5-5`** -> Uma busca técnica direta revela que esta é uma peça de final de mangueira ("Terminal Prensável Fêmea Giratória JIC").
   - **Gates: `5G-5FJX`** -> Terminal MegaCrimp (Mangueira Hidráulica).
   **Conclusão**: O mapeamento atual está relacionando um mero Adaptador (Macho x Macho/Fêmea) com um Terminal Prensável de Mangueira (Hidráulica / Borracha). O cruzamento causará prejuízo fatal no entendimento de um consultor de engenharia.
3. **Mapeamento Genérico Espelhado**: Constatamos que no arquivo universal, TODAS as conexões `AJUM 5` (seja BSP, NPT ou UNF, independentemente da rosca na ponta oposta) estavam ligadas ao mesmíssimo item da Parker `10643-5-5`. Ou seja, o arquivo desrespeita bitolas do lado 2.

## 3. Riscos Mapeados

| Área | Risco | Justificativa |
|---|---|---|
| **Volume (Tempo)** | Altíssimo | Validar 52.572 linhas com pesquisa na web humana "linha por linha" demanda enorme precisão e automação (Bots) para dar escala e previsibilidade, já que uma janela normal de chat é insuficiente. |
| **Erros Falsos-Positivos** | Crítico | Muitos códigos listados já não existem no ERP original. |
| **Mixagem Estrutural** | Crítico | Terminais Prensáveis estão cruzados com Adaptadores (Conexões) fixas de metal. |

## 4. Plano de Ação Estruturado (Sprints de Dados)

Baseado no volume e nas falhas estruturais expostas, para aplicarmos qualidade, a IA seguirá um protocolo amostral e de programação.

### Sprint 1: Fundação & Script de Limpeza (Validação de Ocorrência)
- [ ] Task 1.1: Criar um Script NodeJS (Data Cleaner) que vai cruzar as linhas de `mapeamento_concorrentes_universal.csv` e sinalizar TODAS as linhas onde o `DYNAR_COD` **não bate** com nenhum item no arquivo `base_produtos_clean.csv`.
- [ ] Task 1.2: Elaborar lista de itens base "Orfãos" para averiguação humana.

### Sprint 2: Teste de Mesa e Busca Assistida (O que focar agora)
- [ ] Task 2.1 - Substituir os clones genéricos da região do cursor (AJUM) por códigos reais Parker/Gates de "Adaptadores JIC x BSP/NPT/UNF".
- [ ] Task 2.2 - Desenvolver a regra gramatical para `AJUM`, `AJUF`, `AJTI`, `AJTB`.

### Sprint 3: Validação da Conversão Web (Em lote)
- [ ] Task 3.1: Configurar motor programático para mapear os 52k baseando na gramática das peças em vez da caçada burra 1-por-1 na Web (o que induz o loop).

---
*Última atualização: 2026-04-16 - FJT-Solutions*
