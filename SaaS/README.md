# 🤖 Fred IA - Motor de Inteligência Técnica Dynar

> Consultoria técnica automatizada e buscador de alta performance para o ecossistema Dynar.

---

## 📋 Visão Geral do Projeto

O **Fred IA** foi desenvolvido para resolver um desafio crítico: transformar códigos de concorrentes e descrições informais em recomendações técnicas precisas de produtos Dynar, processando uma base de **53.000 itens 100% offline no navegador**.

### 🚀 Diferenciais Estratégicos
- **Offline-First**: Busca processada em Web Workers para performance instantânea.
- **IA Expert (Gemini)**: Tradução técnica de códigos complexos.
- **Blindagem de Cota (Safe-Fail)**: Sistema que continua funcionando mesmo se a IA estiver offline.
- **Cache de Inteligência**: Memória local que economiza requisições e acelera resultados repetidos.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Motivação |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | SEO, performance e rotas de API robustas. |
| **Linguagem** | TypeScript | Segurança de tipos em uma base de dados complexa. |
| **IA** | Google Gemini Flash 1.5 | Extração de entidades e análise técnica de alto nível. |
| **Processamento** | Web Workers | Pesquisa pesada (53k itens) sem travar a interface. |
| **Estilização** | CSS Moderno / Tailwind | Interface premium com foco em experiência do usuário. |
| **Database** | CSV Local Sanitizado | Independência de servidores e velocidade de leitura. |

---

## 🏗️ Arquitetura do Sistema

### 1. Motor de Busca (Search Engine)
Localizado em `src/workers/searchWorker.ts`, o motor utiliza um algoritmo de **Scoring Híbrido**:
- **Categorização Rígida**: Impede que Terminais e Tubos se misturem nos resultados.
- **Pesos Técnicos**: Códigos exatos ganham 10.000 pontos; matches na descrição ganham 150 pontos por palavra.
- **Sanitarização Dinâmica**: Os dados são limpos e normalizados em tempo real durante a carga.

### 2. Fluxo de Resiliência (Safe-Fail)
Caso a API do Gemini atinja limites de cota (Erro 429) ou falhe:
- O sistema detecta a falha silenciosamente.
- Aciona o **Buscador de Backup** (Texto Bruto).
- Garante que o usuário NUNCA fique esperando ou veja uma tela de erro travada.

### 3. Memória de Longo Prazo (Intelligence Cache)
Implementado em `src/components/SearchContainer.tsx`, o sistema salva resultados da IA no `localStorage`. Buscas repetidas têm custo zero de API e velocidade de resposta sub-milissegundo.

---

## 🎨 Design Aesthetics & UI
O front-end foi projetado para parecer uma **ferramenta de engenharia premium**:
- **Cores**: Tons de azul e cinza escuro para foco e profissionalismo.
- **Micro-animações**: Feedback visual constante via `DebugLog`.
- **Responsive Layout**: Pronto para uso em tablets na oficina ou desktops em vendas.

---

## 🤖 Metodologia de Desenvolvimento Assistido por AI
Este projeto foi construído utilizando a **Metodologia de Ciclos Incrementais**:
1. **Entender antes de Implementar**: Análise profunda de dependências antes de qualquer refatoração.
2. **Hardening (Fortalecimento)**: Cada sprint focou em blindar o sistema contra falhas de rede ou inconsistência de dados.
3. **Auditabilidade**: Uso constante de scripts de scratch (em `scratch/`) para auditar a qualidade técnica dos 53.000 itens.

---

## 📂 Estrutura de Pastas Principal

```bash
├── public/data        # Base de produtos (CSV) 53k itens
├── src/app            # Rotas e Páginas (Next.js)
├── src/components     # Interface (SearchContainer, ProductList)
├── src/hooks          # Lógica de estados e orquestração de busca
├── src/lib            # O "Cérebro": scoring-logic.ts, ai-config.ts
├── src/workers        # Processamento em background
└── docs/              # Documentação técnica e gramática Dynar
```

---

## 🛠️ Como Iniciar o Desenvolvimento

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure sua chave Gemini no `.env.local`:
   ```bash
   GOOGLE_GEMINI_API_KEY=sua_chave_aqui
   ```
3. Inicie o servidor:
   ```bash
   npm run dev
   ```

---
*Documentação mantida pela equipe FJT Solutions / Dynar.*
