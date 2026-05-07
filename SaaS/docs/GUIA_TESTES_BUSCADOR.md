# 🚀 Guia de Testes Internos - Fred IA Dynar

Este guia contém exemplos práticos para validar as capacidades de busca por **Texto Livre** e **Códigos de Concorrentes** no buscador.

---

## 1. Casos de Busca: Códigos de Concorrentes
Utilize estes exemplos no campo "Código Concorrente / Pesquisa Web". O Fred IA irá traduzir o termo para buscar no banco Dynar.

| Concorrente | Código para Testar | O que o Fred IA deve encontrar |
|-------------|-------------------|--------------------------------|
| **SMC**     | `CQ2B32-15D`      | Cilindros Compactos similares  |
| **FESTO**   | `VUVG-L10-M52`    | Válvulas de Automação          |
| **PARKER**  | `10643-8-8`       | Terminal JIC 37° (Série 43)    |
| **PARKER**  | `471TC-8`         | Mangueira de Alta Pressão      |
| **GATES**   | `8G-8FJX`         | Terminal prensado JIC Fêmea    |
| **GATES**   | `12G2-M2T`        | Mangueira 2 tramas de aço      |

---

## 2. Casos de Busca: Texto Livre (Linguagem Natural)
Teste a inteligência do buscador usando termos que os clientes usam no dia a dia.

*   **Busca por Medida e Tipo:**
    *   `Joelho 90 graus 1/2 BSP`
    *   `União Macho JIC 3/4 Inox`
*   **Busca por Aplicação:**
    *   `Mangueira para alta pressão de óleo`
    *   `Manometro glicerina 0 a 100 bar`
*   **Busca Combinada (Kits):**
    *   `Kit mangueira para retroescavadeira` (Deve sugerir itens montados com prefixo "Montado:")

---

## 3. Verificação de Alucinações (Anti-Erro)
Tente "enganar" o sistema para ver se o filtro de segurança está ativo:

1.  **Teste de Mistura:** Digite `Mangueira Manometro`. 
    *   *Resultado Esperado:* O buscador deve priorizar Mangueiras, mas **NÃO** deve exibir o desenho técnico de um Manômetro no card de Mangueira.
2.  **Teste de Material Inexistente:** Digite `Joelho de Ouro`.
    *   *Resultado Esperado:* Mensagem de "Baixa Confiança" ou exibição de itens de Aço Carbono/Inox com alerta de que o material não bate 100%.

---

## 🏁 Dica de Ouro para o Vendedor
Se você encontrar um item que "Deveria ter desenho e não tem", verifique se o código legado no ERP está exatamente igual ao mapeado nos nossos 262 PDFs.
