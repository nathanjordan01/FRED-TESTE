-- =============================================
-- DYNAR CATALOG DATABASE SCHEMA
-- Banco centralizado para n8n + SaaS
-- =============================================

-- Tabela principal: Fichas técnicas extraídas dos PDFs pelo n8n
CREATE TABLE IF NOT EXISTS catalogo_tecnico (
  id SERIAL PRIMARY KEY,
  source_filename VARCHAR(255) NOT NULL UNIQUE,
  product_type VARCHAR(500),
  page_section VARCHAR(50),
  standard VARCHAR(255),
  subtitle VARCHAR(500),
  descriptive_text TEXT,
  observations TEXT,
  has_table BOOLEAN DEFAULT true,
  total_order_codes INTEGER DEFAULT 0,
  tables_json JSONB,
  validation_status VARCHAR(50) DEFAULT 'PENDENTE',
  needs_review BOOLEAN DEFAULT false,
  errors JSONB,
  warnings JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos ERP (migração dos 53k itens do CSV)
CREATE TABLE IF NOT EXISTS produtos (
  id SERIAL PRIMARY KEY,
  cod_interno VARCHAR(50),
  cod_legado VARCHAR(100) NOT NULL,
  descricao TEXT,
  descricao_rica TEXT,
  medida_unidade VARCHAR(50),
  tipo_produto VARCHAR(50),
  grupo_produto VARCHAR(50),
  url_catalogo VARCHAR(500),
  url_desenho VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_produtos_cod_legado ON produtos(cod_legado);
CREATE INDEX IF NOT EXISTS idx_produtos_descricao ON produtos USING gin(to_tsvector('portuguese', descricao));
CREATE INDEX IF NOT EXISTS idx_produtos_tipo ON produtos(tipo_produto);

-- Tabela de estrutura de kits (componentes)
CREATE TABLE IF NOT EXISTS estrutura_produtos (
  id SERIAL PRIMARY KEY,
  cod_legado_pai VARCHAR(100) NOT NULL,
  cod_legado_filho VARCHAR(100) NOT NULL,
  desc_componente TEXT,
  desc_componente_rica TEXT,
  qtd_necessaria VARCHAR(50),
  url_catalogo VARCHAR(500),
  url_desenho VARCHAR(500)
);
CREATE INDEX IF NOT EXISTS idx_estrutura_pai ON estrutura_produtos(cod_legado_pai);
CREATE INDEX IF NOT EXISTS idx_estrutura_filho ON estrutura_produtos(cod_legado_filho);

-- Tabela de mapeamento de concorrentes
CREATE TABLE IF NOT EXISTS mapeamento_concorrentes (
  id SERIAL PRIMARY KEY,
  dynar_cod VARCHAR(100) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  parker VARCHAR(100),
  gates VARCHAR(100),
  interloke VARCHAR(100),
  status VARCHAR(50)
);
CREATE INDEX IF NOT EXISTS idx_conc_dynar ON mapeamento_concorrentes(dynar_cod);
CREATE INDEX IF NOT EXISTS idx_conc_parker ON mapeamento_concorrentes(parker);
CREATE INDEX IF NOT EXISTS idx_conc_gates ON mapeamento_concorrentes(gates);
CREATE INDEX IF NOT EXISTS idx_conc_interloke ON mapeamento_concorrentes(interloke);

-- Tabela de base de conhecimento técnico (manuais, regras, conversões)
CREATE TABLE IF NOT EXISTS base_conhecimento (
  id SERIAL PRIMARY KEY,
  source_filename VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  titulo VARCHAR(500),
  conteudo TEXT NOT NULL,
  tipo VARCHAR(50) DEFAULT 'referencia',
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_conhecimento_cat ON base_conhecimento(categoria);
CREATE INDEX IF NOT EXISTS idx_conhecimento_tipo ON base_conhecimento(tipo);
CREATE INDEX IF NOT EXISTS idx_conhecimento_busca ON base_conhecimento USING gin(to_tsvector('portuguese', conteudo));
