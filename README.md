# Rizzo Park Design System

Nosso Design System — tokens, componentes e documentação para as superfícies web e React
Native do ecossistema.

**Hoje:** o pacote de tokens compila, o contrato de contraste roda como teste e a galeria
está no ar. Componentes ainda não existem.

A arquitetura completa está em [`docs/architecture-proposal.md`](./docs/architecture-proposal.md).

---

## Começando

Requer **Node 20+**. O `pnpm` vem do corepack, que já acompanha o Node — não precisa
instalar nada globalmente:

```bash
corepack enable pnpm
```

Depois:

```bash
pnpm install
pnpm build
pnpm test
```

Para abrir a galeria em `http://localhost:6006`:

```bash
pnpm --filter @rizzopark/docs dev
```

A versão do pnpm está fixada em `packageManager` no `package.json`, então todo mundo roda a
mesma.

---

## Estrutura

```
packages/
├── tokens/          @rizzopark/tokens   — fonte única de valores (web · RN · legado)
├── react/           @rizzopark/react    — componentes web
├── ts-config/       config TypeScript compartilhada  (privado)
└── eslint-config/   config ESLint compartilhada      (privado)

apps/
├── docs/            Storybook — galeria e componentes
└── sandbox/         Next.js SEM Tailwind — prova que o pacote é consumível

docs/
├── architecture-proposal.md
└── contracts/       o que cada componente é e como se comporta
```

Planejados, ainda não criados:

| Pacote | Quando | Decisão |
|---|---|---|
| `packages/icons` | Junto do pacote RN | Fonte SVG única, duas saídas de build (AD-21) |
| `packages/native` | Só com gatilho confirmado | AD-03 |

---

## Por que estes pacotes, nesta ordem

O pacote de **tokens** vem primeiro porque é a única camada compartilhada por todas as seis
superfícies do ecossistema — incluindo os dois apps React Native e o S2Way em CakePHP, que
nunca vão consumir componentes React. É onde a unificação realmente acontece.

`ts-config` e `eslint-config` existem como pacotes (e não como arquivos duplicados) para que
a configuração não divirja. Ideia emprestada do design system do Ignite.

**Não há orquestrador de build.** Com um pacote que constrói, `pnpm -r run build` resolve na
ordem topológica e basta. Turborepo entra quando o tempo de build incomodar — não antes.

---

## O que já existe

- **Monorepo e configs compartilhadas.** `ts-config` e `eslint-config` como pacotes, para a
  configuração não divergir.
- **Tokens.** Escala derivada de `#02cb03`, taxonomia semântica, e o Style Dictionary
  gerando CSS, Tailwind v4, TypeScript e React Native a partir de uma fonte só.
- **Poppins auto-hospedada**, três pesos, empacotada junto do CSS.
- **Contrato de contraste executável**, quebrando o build quando um par reprova.
- **Galeria** com Cor, Contraste, Tipografia e Layout, toda gerada a partir de `dist/` —
  nenhum valor escrito à mão.

- **`Button`**, o primeiro componente: contrato escrito antes do código, API própria, e o
  pacote consumível por um app sem Tailwind.

## O que vem depois

- **Mais componentes.** A base mínima (`Text`, `Input`, `Field`) pode ser antecipada; o
  resto do inventário só nasce quando houver uma tela real para ancorá-lo (AD-12 / P-12).
  Construímos a reboque de produto, nunca por antecipação.
- **Lint** proibindo literal de cor e uso de primitivo fora do pacote de tokens.
- **Auditoria manual com leitor de tela** no `Button`, obrigatória antes de ele passar de
  `em construção` para `estável`.

---

## Princípios que governam este repositório

**PA-9 — nenhuma dependência externa define a superfície pública do Design System.**
Biblioteca de terceiro entra como implementação, nunca como arquitetura. A API dos
componentes, os nomes dos tokens e o contrato de acessibilidade são nossos; qual headless,
qual utilitário de CSS e qual ferramenta de build são substituíveis.

O teste, aplicável em revisão: *conseguimos trocar a implementação interna de um componente
sem que isso seja breaking change para quem consome?* Se não, a dependência vazou.

**Primitivo é privado por construção.** Tokens sob a raiz `base` não são emitidos pelo
build. Não existe como consumir um por acidente.

---

## Convenções

- Commits seguem o padrão do `parking-new`: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
- Toda decisão arquitetural vira ADR em `docs/`. O `architecture-proposal.md` é o ponto de
  partida e deve virar `ADR-001`.
- Antes do `1.0.0` o pacote está em `0.x` e **pode quebrar em minor** — de propósito (AD-18).

---

## Pendências que afetam este repositório

| ID | Pergunta | Bloqueia |
|---|---|---|
| **P-06** | Matriz de dispositivos, em especial a WebView do terminal PagSeguro | Decide se a saída de cor pode migrar de hex para `oklch()` |
| **P-12** | A reescrita do `parking-new` inclui frontend admin? Quando? | Todo o trabalho de componentes |
| **P-16** | Onde o Storybook é publicado, e com que acesso? | O valor real da galeria — em `localhost` ela não chega a quem mais precisa |
| **P-15** | Registro de publicação e escopo (`@rizzopark` ou `@venice`) | O release |

Lista completa na seção 19 da proposta de arquitetura.
