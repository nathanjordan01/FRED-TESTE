# 📘 Base de Conhecimento: Especialista Fred IA - Hidráulica

Este guia serve como referência para a validação técnica de conversão de códigos de concorrentes para a linha Dynar.

## 1. Decodificador de Medidas (Dash Sizes)
Na hidráulica, os números representam 1/16 de polegada.
| Dash | Polegada | Milímetros (aprox) |
|------|----------|-------------------|
| -04  | 1/4"     | 6.3mm             |
| -06  | 3/8"     | 9.5mm             |
| -08  | 1/2"     | 12.7mm            |
| -10  | 5/8"     | 15.9mm            |
| -12  | 3/4"     | 19.0mm            |
| -16  | 1"       | 25.4mm            |

## 2. Equivalência de Mangueiras (Marcas vs Dynar)

### Gates
- **G1 (ex: 4G1):** 1 Trama de aço (Equivalente Dynar: **R1AT**)
- **G2 (ex: 8G2):** 2 Tramas de aço (Equivalente Dynar: **R2AT**)
- **M2T / MegaIT:** Linha de alta flexibilidade 2 tramas.
- **EFG4K / EFG5K:** Super alta pressão (4 ou 6 espirais de aço).

### Parker
- **Série 43:** Terminais crimpados (Padrão universal).
- **821:** Mangueira Push-Lok (Sem capa).

## 3. Lógica de Conferência (Checklist)
Sempre que um código for pesquisado, o Fred IA deve validar:
1. [ ] A medida em polegadas bate com o "Dash size" do código?
2. [ ] A quantidade de tramas (R1, R2, R12) foi identificada?
3. [ ] O tipo de terminal (JIC, BSP, NPT, Camlock) foi traduzido corretamente?

---
*Última atualização: 10/04/2026 - Sprint 10*
