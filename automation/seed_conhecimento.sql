-- =============================================
-- SEED: Base de Conhecimento Técnico Dynar
-- Fonte: catalogo-manual-roscas.pdf + catalogo-tubulacoes.pdf + WhatsApp Image
-- =============================================

-- ===========================================
-- 1. CONVERSÃO DE BITOLAS (TRAÇO ↔ FRAÇÃO ↔ mm)
-- ===========================================
INSERT INTO base_conhecimento (source_filename, categoria, titulo, conteudo, tipo, tags) VALUES
('catalogo-manual-roscas.pdf', 'conversao_bitola', 'Tabela Traço → Fração → Medida',
'Traço -2 = 2/16 = 1/8"
Traço -3 = 3/16 = 3/16"
Traço -4 = 4/16 = 1/4"
Traço -5 = 5/16 = 5/16"
Traço -6 = 6/16 = 3/8"
Traço -8 = 8/16 = 1/2"
Traço -10 = 10/16 = 5/8"
Traço -12 = 12/16 = 3/4"
Traço -16 = 16/16 = 1"
Traço -20 = 20/16 = 1.1/4"
Traço -24 = 24/16 = 1.1/2"
Traço -32 = 32/16 = 2"',
'tabela_conversao', ARRAY['bitola', 'traco', 'fracao', 'mangueira', 'polegada']);

-- ===========================================
-- 2. TIPOS DE SEDE E ROSCA
-- ===========================================
INSERT INTO base_conhecimento (source_filename, categoria, titulo, conteudo, tipo, tags) VALUES
('catalogo-manual-roscas.pdf', 'tipos_rosca', 'Principais Tipos de Sedes de Vedação',
'SAE JIC 37° - Rosca UNF/UN - tubos em polegadas
SAE FLARE 45° - Rosca para tubos flexíveis
SAE INVERTED FLARE - Rosca invertida
SAE FLARELESS BYTE TYPE - Sem alargamento com mordente
SAE PIPE FITTING - Macho NPT/NPTF e Fêmea NPSM
SAE O-RING FACE SEAL (ORFS) - Vedação com O-ring na face
ROSCA MÉTRICA DIN 2353 - Séries L e S - cone 24°
ROSCA MÉTRICA DIN 3865 DKO - Séries L e S
ROSCA MÉTRICA DIN 3868 - Séries L e S
BS 2779 BSP - Sede interna 60° - Rosca BSPP paralela
BSPT - Rosca cônica (equivalente europeu do NPT)
JIS B8363 - Norma japonesa - Sede interna 30° - Rosca BSPP
KES Komatsu - Sede interna 30° - Rosca MÉTRICA',
'referencia', ARRAY['rosca', 'sede', 'jic', 'npt', 'bsp', 'orfs', 'dko', 'metrica']);

-- ===========================================
-- 3. FLANGES - CLASSIFICAÇÃO
-- ===========================================
INSERT INTO base_conhecimento (source_filename, categoria, titulo, conteudo, tipo, tags) VALUES
('catalogo-manual-roscas.pdf', 'flanges', 'Classificação de Flanges por Pressão',
'FLANGE SAE Código 61 = 3000 psi (baixa pressão)
FLANGE SAE Código 62 = 6000 psi (alta pressão)
FLANGE DIN/ISO Formato R = 31 MPa (5000 psi)
FLANGE DIN/ISO Formato S = 40 MPa (6000 psi)
FLANGE CATERPILLAR = Similar ao SAE código 62 (6000 psi)
FLANGE KOMATSU Série Standard = Similar código 61
FLANGE KOMATSU Série Alta Pressão = Similar código 62',
'referencia', ARRAY['flange', 'pressao', 'sae', 'cod61', 'cod62', '3000psi', '6000psi']);

-- ===========================================
-- 4. CODIFICAÇÃO DE MANGUEIRA MONTADA (WhatsApp Image)
-- ===========================================
INSERT INTO base_conhecimento (source_filename, categoria, titulo, conteudo, tipo, tags) VALUES
('whatsapp-codificacao-mangueira.jpg', 'codificacao_mangueira', 'Codificação Completa da Mangueira Montada',
'FORMATO: [1]-[2]*[3][4]*[3][4]*[5] A[6] ([7])
[1] TIPO DE MANGUEIRA:
R00=ar/água, R04=2 tramas fio têxtil, R06=1 trama fio têxtil, R08=termoplástica,
R01=1 trama aço, R02=2 tramas aço, R12=4 espirais aço,
R13=6 espirais aço, R17=1 ou 2 espirais aço, 4SH=4 espirais aço, 4SP=4 espirais aço

[2] BITOLA: 4=1/4" 6=3/8" 8=1/2" 10=5/8" 12=3/4" 16=1" 20=1.1/4" 24=1.1/2" 32=2"

[3] CÓDIGOS TERMINAIS STANDARD:
PP00=DKO reto, PP45=DKO 45°, PP90=DKO 90°
PL00=ponta lisa reto, PL45=ponta lisa 45°, PL90=ponta lisa 90°
PT=para tubo
PF00=flange reto 3000psi, PF45=flange 45° 3000psi, PF90=flange 90° 3000psi
PFR00=flange reforçado reto 6000psi, PFR45=flange reforçado 45° 6000psi, PFR90=flange reforçado 90° 6000psi
PM=macho fixo rosca NPT ou BSP
PJ00=porca giratória JIC reto, PJ45=porca giratória JIC 45°, PJ90=porca giratória JIC 90°
PJM=macho fixo JIC reto
PFCAT00=prensado flange Supercat reto, PFCAT45=Supercat 45°, PFCAT90=Supercat 90°
PFP00=face plana reto, PFP45=face plana 45°, PFP90=face plana 90°
PFPM=terminal macho reto ORFS
PG00=porca giratória BSP reto, PG45=BSP 45°, PG90=BSP 90°

[3] CÓDIGOS TERMINAIS INTERLOCK:
PKF00=flange reto SAE J518 3000psi, PKF45=3000psi 45°, PKF90=3000psi 90°
PKFP00=face plana reto ORFS, PKFP45=ORFS 45°, PKFP90=ORFS 90°
PKFR00=flange reto SAE J518 6000psi, PKFR45=6000psi 45°, PKFR90=6000psi 90°
PKJ=fêmea giratória JIC reto, PKJ45=JIC 45°, PKJ90=JIC 90°
PKJM=macho fixo JIC reto
PKMB=prensado fixo rosca BSP, PKMBT=fixo rosca BSPT, PKMN=fixo rosca NPT
PKP00=DKO reto cone 24° métrica, PKP45=DKO 45° métrica, PKP90=DKO 90° métrica
PKT=macho fixo cone 24° rosca métrica

[4] MEDIDA: vide tabelas de terminais
[5] COMPRIMENTO: total em mm com terminais
[6] ÂNGULO: 0° a 360°
[7] PROTEÇÃO: 1M=manga anti-chama, 2M=duas mangas, MEP=mola plástica, DS=dispositivo segurança, X=trançado aço inox, G=trançado aço galvanizado

EXEMPLO: R12-8*P9016*P9016*1500 A270° DS',
'regra_codificacao', ARRAY['mangueira', 'codificacao', 'terminal', 'interlock', 'bitola']);

-- ===========================================
-- 5. REGRAS DE MONTAGEM ANILHA E/E2
-- ===========================================
INSERT INTO base_conhecimento (source_filename, categoria, titulo, conteudo, tipo, tags) VALUES
('catalogo-tubulacoes.pdf', 'montagem', 'Instruções de Montagem Anilha E - DIN 2353',
'PASSOS DE MONTAGEM:
1. Verificar ferramentas em perfeita condição
2. Tubo com extremidade reta de pelo menos 2x comprimento da porca (H)
3. Cortar tubo no esquadro com serra (NÃO usar cortadores de disco)
4. Verificar corte a 90° e remover rebarbas internas e externas
5. Lubrificar: cone 24°, rosca do corpo, anilha e porca
6. Colocar porca e anilha no tubo (diâmetro maior da anilha voltado para a porca)
7. Encaixar tubo no cone 24° até encostar no batente
8. Apertar porca manualmente até anilha firme
9. Apertar com chave até canto de cravação em contato com tubo (evitar rotação)',
'instrucao_montagem', ARRAY['montagem', 'anilha', 'e', 'e2', 'din2353', 'tubo', 'cravacao']);

-- ===========================================
-- 6. ERROS COMUNS DE MONTAGEM
-- ===========================================
INSERT INTO base_conhecimento (source_filename, categoria, titulo, conteudo, tipo, tags) VALUES
('catalogo-tubulacoes.pdf', 'montagem', 'Erros Comuns de Montagem e Correções',
'ERRO 1: Assento 24° grande demais → Anilha não crava, fica perto da extremidade → TROCAR ferramenta
ERRO 2: Assento 24° pequeno demais → Anilha fica longe da extremidade → TROCAR ferramenta
ERRO 3: Tubo gira durante aperto → Anilha não crava, danifica cone → REPETIR sem rotação
ERRO 4: Tubo de parede muito fina → Parede deforma, anilha não crava → USAR inserto de reforço
ERRO 5: Tubo não totalmente introduzido → Tubo flete, sem cravação → GARANTIR contato com corpo
ERRO 6: Dureza do tubo acima do máximo → Anilha encontra resistência demais → TROCAR tubo
ERRO 7: Dureza do tubo abaixo do mínimo → Anilha crava fundo demais → TROCAR tubo
ERRO 8: Diâmetro externo menor que nominal → Anilha não crava → TROCAR tubo com medida certa
ERRO 9: Tubo cortado obliquamente → Anilha não crava ao redor → CORTAR perpendicular',
'instrucao_montagem', ARRAY['erro', 'montagem', 'falha', 'vazamento', 'correcao']);

-- ===========================================
-- 7. PRESSÕES E TEMPERATURAS DE TRABALHO
-- ===========================================
INSERT INTO base_conhecimento (source_filename, categoria, titulo, conteudo, tipo, tags) VALUES
('catalogo-geral-dynar.pdf', 'especificacoes', 'Pressões e Temperaturas de Trabalho',
'TEMPERATURAS MÁXIMAS POR MATERIAL:
Conexões de aço: -20°C até +120°C
NBR (Perbunan/Nitrílica): -25°C até +100°C
FPM (Viton/Fluorelastômero): -15°C até +200°C
PTFE (Teflon): -100°C até +250°C

TEMPERATURA AMBIENTE MÍNIMA:
Conexões de aço: até -40°C
Aço + vedação NBR: até -35°C
Aço + vedação FPM: até -25°C

FATOR DE SEGURANÇA: mínimo 4x a pressão nominal PN
Pressão PN à temperatura ambiente: mínimo 2,5x

REGRA: Na combinação de materiais diferentes, usar a temperatura mais restritiva.',
'referencia', ARRAY['pressao', 'temperatura', 'nbr', 'fpm', 'ptfe', 'viton', 'seguranca']);
