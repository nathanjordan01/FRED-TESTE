# FRED IA - Dynar PDF Extraction & SaaS

Sistema de extração automatizada de dados técnicos da Dynar usando IA (Gemini) e sincronização com SaaS via PostgreSQL.

## 🏗️ Estrutura do Projeto

- `/SaaS`: Aplicação Next.js (Fred IA).
- `Dynar_PDF_Extractor_v3.json`: Workflow do n8n.
- `schema.sql`: Estrutura do Banco de Dados.
- `seed_conhecimento.sql`: Base de conhecimento técnico.
- `seed_conhecimento.sql`: Script de carga inicial.

## 🚀 Como Rodar o Projeto

### 1. Banco de Dados (PostgreSQL)
1. Crie uma instância PostgreSQL (Dokploy recomendada).
2. Execute o arquivo `schema.sql` para criar as tabelas.
3. (Opcional) Execute `seed_conhecimento.sql` para popular dados técnicos.

### 2. n8n (Workflow)
1. Importe o arquivo `Dynar_PDF_Extractor_v3.json`.
2. Configure as credenciais:
   - **Google Drive:** Para ler a pasta de PDFs.
   - **Gemini API:** Para extração via IA.
   - **PostgreSQL:** Para salvar os dados.

### 3. SaaS (Next.js)
1. Entre na pasta `SaaS`.
2. Instale as dependências: `npm install`.
3. Configure o arquivo `.env.local` com a variável:
   `DATABASE_URL=postgresql://user:password@host:port/dbname`
4. Execute a migração dos CSVs para o banco:
   `npx ts-node scripts/migrate-csv-to-pg.ts`
5. Inicie o desenvolvimento: `npm run dev`.

## 🛠️ Tecnologias
- **Frontend:** Next.js, Tailwind CSS.
- **Backend:** Node.js, PostgreSQL.
- **Automação:** n8n.
- **IA:** Google Gemini 1.5 Flash & Pro.

---
*Desenvolvido para Dynar.*
