# Auditoria com leitor de tela

Roteiro para promover um componente de `em construção` para `estável`.

É o único item obrigatório que nenhuma ferramenta substitui, e por isso é o único que separa os
dois estados. Enquanto ele não roda, o componente existe mas **não vale confiar** — que é
literalmente o que `em construção` significa em [`contracts/README.md`](./contracts/README.md).

---

## Por que isto existe

A suíte automatizada cobre bastante, e é honesto dizer onde ela para.

**O axe roda em jsdom, que não tem layout nem canvas.** A regra `color-contrast` fica
desligada nos nossos testes justamente porque, ligada, ela falha por dentro e segue — a suíte
passaria dando a impressão de ter verificado. Contraste é medido em `@venice-sistemas/tokens`,
contra os valores resolvidos do build, e lá quebra o CI.

**O axe verifica estrutura, não experiência.** Ele confirma que existe um nome acessível; não
diz se o nome faz sentido, se é anunciado no momento certo, ou se a pessoa entende o que
aconteceu. Um `aria-checked="mixed"` passa no axe e pode ser lido de um jeito incompreensível
em português.

**Três critérios do WCAG 2.2 AA só se verificam com alguém operando.**

| Critério | Por que é manual |
|---|---|
| **2.4.11 Focus Not Obscured** | O foco pode existir e estar atrás de um cabeçalho fixo. Só se vê rolando |
| **3.3.8 Accessible Authentication** | Colar senha precisa funcionar. Nenhuma ferramenta tenta colar |
| **2.5.8 Target Size** | Medível, mas o que importa é acertar com o dedo, não o número |

---

## O que você precisa

**NVDA + Firefox no Windows.** É a combinação de maior uso no Brasil, é gratuita, e é o alvo
realista das superfícies municipais. Se houver macOS à mão, repita o roteiro no VoiceOver +
Safari — divergências entre os dois são comuns e informativas.

Baixe o NVDA em <https://www.nvaccess.org/download/>.

**Fones de ouvido.** Sem eles a auditoria vira incômodo para a sala e você acelera.

**A galeria rodando:**

```bash
pnpm --filter @venice-sistemas/docs dev
```

Cada passada tem uma story dedicada, com o roteiro repetido na descrição — você não precisa
alternar entre este documento e a tela:

| Passada | Onde |
|---|---|
| Nome acessível e estado | `Button` · `Badge → Em contexto` · `Skeleton → Auditoria` |
| Campos e associação | `Campo → Auditoria` · `Campo → Checkbox` · `Campo → Colar senha` |
| Região viva | `Alert → Auditoria` |
| Modal e foco | `Modal → Auditoria` · `Ancorado → Auditoria` |

### Teclas que bastam

| Tecla | O que faz |
|---|---|
| `Ctrl` | **Cala o NVDA.** A tecla mais importante |
| `Insert` + `Q` | Encerra o NVDA |
| `Tab` / `Shift+Tab` | Navega entre controles |
| `Insert` + seta ↓ | Lê tudo a partir daqui |
| `Insert` + `F7` | Lista elementos da página |

Não é preciso saber mais que isso para executar este roteiro.

---

## Como conduzir

**Feche os olhos, ou desligue o monitor.** É a parte que parece exagero e não é: com a tela
visível o cérebro completa o que o áudio não disse, e o defeito passa.

**Anote o que ouviu, literalmente.** "Ele leu 'botão Entrar ocupado'" é um dado. "Funcionou" não
é — daqui a três meses ninguém sabe o que foi verificado.

**Uma passada por padrão, não por componente.** Os componentes compartilham mecanismo, e uma
falha no mecanismo é uma falha em todos que o usam. Auditar `Dialog` e `AlertDialog` separados
verificaria a mesma armadilha de foco duas vezes e o que os diferencia nenhuma.

---

## Nome acessível e estado

**Cobre:** `Button`, `Badge`, `Skeleton`

| # | Faça | Deve acontecer | Reprova se |
|---|---|---|---|
| 1 | Tab até um `Button` padrão | Anuncia o texto e a palavra "botão" | Anuncia só "botão", ou lê o texto sem dizer que é botão |
| 2 | Tab até um `Button` com ícone e texto | Anuncia **só o texto** | Anuncia o nome do arquivo do ícone, ou lê algo duas vezes |
| 3 | Tab até um `Button` desabilitado | Anuncia "indisponível" ou equivalente | Passa direto sem anunciar nada |
| 4 | Acione um `Button` com `loading` | O nome **continua** sendo anunciado, com indicação de ocupado | Vira "botão" sem nome, ou o foco pula para o `body` |
| 5 | `Insert`+↓ sobre uma área com `Badge` | O texto do badge é lido junto do conteúdo | O badge é anunciado como controle, ou entra na tabulação |
| 6 | `Insert`+↓ sobre uma área carregando com `Skeleton` | **Silêncio** onde estão os esqueletos | Uma sequência de itens vazios é anunciada |

O item 4 é o que justifica a decisão de `loading` não ser `disabled`. Se ele reprovar, a
decisão está errada e o contrato do Button precisa mudar — não o teste.

O item 6 verifica o `aria-hidden` do Skeleton. Se a região que carrega **também** ficar muda,
o problema é da tela, não do componente: quem anuncia o carregamento é o contêiner, com
`aria-busy`.

---

## Campos e associação

**Cobre:** `Input`, `Label`, `Checkbox`

| # | Faça | Deve acontecer | Reprova se |
|---|---|---|---|
| 1 | Tab até um `Input` com `Label` | Anuncia o texto do rótulo e "caixa de edição" | Anuncia só "caixa de edição" |
| 2 | Digite algo e ouça de novo | O rótulo continua sendo o nome | O nome some ou vira o que foi digitado |
| 3 | Tab até um `Input` com placeholder **e sem** rótulo | Fica **sem nome** | O placeholder é usado como nome |
| 4 | Tab até um `Input` com `aria-invalid` | Anuncia estado inválido | Só a borda muda; nada é dito |
| 5 | Clique no texto do `Label` | O foco vai para o campo | Nada acontece, ou a palavra é selecionada |
| 6 | Tab até um `Checkbox` e ouça | Anuncia nome, "caixa de seleção" e marcado/não marcado | Falta o estado |
| 7 | Pressione `Espaço` | Anuncia a mudança de estado | Muda visualmente sem anunciar |
| 8 | Pressione `Enter` num `Checkbox` dentro de formulário | O formulário **submete** | O checkbox alterna e a submissão é engolida |
| 9 | Tab até um `Checkbox` indeterminado | Anuncia algo compreensível para "parcial" | Anuncia "não marcado" |

O item 3 parece esquisito e é proposital: ele confirma que **não** derivamos nome do
placeholder. Um campo sem rótulo *deve* ficar sem nome — o defeito é da tela, e escondê-lo com
o placeholder faz o campo perder o nome no meio do preenchimento.

O item 9 é o que eu mais quero ver. `aria-checked="mixed"` é correto pela especificação, e como
o NVDA verbaliza isso em português é pergunta aberta.

### Autenticação

Ainda neste grupo, porque o critério **3.3.8** afeta os quatro fluxos de login:

| # | Faça | Deve acontecer |
|---|---|---|
| 10 | Cole uma senha no campo com `Ctrl+V` | Funciona |
| 11 | Use o gerenciador de senhas do navegador | Preenche |

Bloquear colagem em campo de senha reprova AA. Vale conferir mesmo que ninguém tenha bloqueado
de propósito — extensões e máscaras às vezes fazem isso sem querer.

---

## Região viva

**Cobre:** `Alert`

Este grupo exige o áudio, porque o que se verifica é **quando** algo é dito.

| # | Faça | Deve acontecer | Reprova se |
|---|---|---|---|
| 1 | Carregue uma página que já tem um `Alert` (`urgent` falso) | O alerta é lido na ordem natural do documento, sem interromper | Interrompe a leitura assim que a página abre |
| 2 | Comece a ler um parágrafo longo e faça surgir um `Alert` (`urgent` falso) | O parágrafo **termina**, depois o alerta é anunciado | Corta o parágrafo no meio |
| 3 | Repita com `urgent` verdadeiro | O alerta **interrompe** imediatamente | Espera o parágrafo terminar |
| 4 | Ouça um alerta com ícone | O ícone **não** é mencionado | O nome do ícone é lido |
| 5 | Tab pela página com um `Alert` presente | O alerta **não** recebe foco | Ele entra na ordem de tabulação |

Os itens 2 e 3 são a razão de existir do `urgent`. Se os dois se comportarem igual, a separação
entre tom e urgência não está funcionando — e aí ela é complexidade sem benefício, e vale
reverter para o comportamento do shadcn.

---

## Modal e foco

**Cobre:** `Dialog`, `AlertDialog`

| # | Faça | Deve acontecer | Reprova se |
|---|---|---|---|
| 1 | Abra um `Dialog` pelo gatilho | Anuncia "diálogo" **e o título** | Anuncia só "diálogo" |
| 2 | Ouça o que vem depois | A descrição é lida sem precisar navegar | Fica em silêncio |
| 3 | Tab várias vezes | O foco circula **dentro** do diálogo | Escapa para a página atrás |
| 4 | `Insert`+↓ com o diálogo aberto | Só o conteúdo do diálogo é lido | O conteúdo de trás também é lido |
| 5 | Feche com `Escape` | O foco volta ao gatilho, e ele é anunciado | O foco cai no `body` e o NVDA fica em silêncio |
| 6 | Abra um `AlertDialog` | O foco começa no **Cancelar** | Começa no Confirmar, ou no painel |
| 7 | Pressione `Escape` num `AlertDialog` | **Nada acontece** | Fecha |
| 8 | Pressione `Enter` logo ao abrir um `AlertDialog` | **Cancela** | Confirma a ação destrutiva |
| 9 | Role a página com o diálogo aberto | A página atrás **não** rola | Rola atrás do véu |
| 10 | Com foco num controle dentro do diálogo, role até o limite | O foco nunca fica escondido atrás de borda ou cabeçalho | Some da vista (reprova **2.4.11**) |

O item 5 é o mais frequentemente quebrado em bibliotecas de componente, e o mais invisível para
quem usa mouse: o foco cai no `body`, o NVDA cala, e a pessoa precisa recomeçar do topo da
página.

O item 8 é a razão de o foco ir para o Cancelar. Se ele confirmar, a decisão de foco está
errada.

---

## Como registrar

Crie uma seção no documento de contrato do componente:

```markdown
## Auditoria com leitor de tela

**2026-08-14** · NVDA 2024.4 + Firefox 131 · Windows 11 · executada por {nome}

Aprovado. Observações:

- O estado indeterminado do Checkbox é lido como "parcialmente marcado" — compreensível.
- O retorno de foco do Dialog demora ~1s para ser anunciado. Aceitável, mas notável.
```

E só então mude o cabeçalho:

```
**Situação:** web `estável` · react native `não implementado`
```

**Registre a versão do leitor e do navegador.** Comportamento de leitor de tela muda entre
versões, e "foi auditado" sem versão não permite reproduzir a divergência quando alguém
reclamar daqui a um ano.

**Reprovou? Não marque como estável e não conserte na hora.** Abra o achado, decida se o
defeito é do componente ou do contrato, e corrija na camada certa. Um item deste roteiro que
reprova pode significar que a nossa decisão está errada — foi o que aconteceu quando o contrato
do modal exigia `aria-modal` e a implementação estava certa.

---

## O que este roteiro não cobre

**React Native.** `accessibilityRole`, `accessibilityState` e a ordem de foco do TalkBack e do
VoiceOver móvel são outro roteiro, a ser escrito quando `@venice-sistemas/native` existir.

**Ampliação e zoom.** Reflow a 320px e zoom de 400% são critérios AA que se verificam com o
navegador, sem leitor de tela.

**Navegação por voz.** Dragon e o Controle por Voz do sistema dependem de o nome visível bater
com o nome acessível. É a razão de o botão de fechar do `Dialog` usar texto escondido em vez de
`aria-label` — mas verificar isso é outro roteiro.

**Terminal PagSeguro.** A matriz de dispositivos é a pendência **P-06**, e enquanto ela estiver
aberta não dá para escrever o roteiro do hardware de campo.
