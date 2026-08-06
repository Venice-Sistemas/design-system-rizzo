/**
 * Build dos design tokens da Rizzo Park.
 *
 * Uma fonte (src/**\/*.json em formato DTCG) para quatro saídas:
 *
 *   dist/tokens.css     variáveis CSS + @font-face da Poppins  — web e S2Way (CakePHP)
 *   dist/tailwind.css   camada @theme do Tailwind v4           — consumidores que usam Tailwind
 *   dist/index.mjs|d.ts objetos tipados                        — web
 *   dist/native.mjs|d.ts objetos no formato React Native       — apps RN
 *   dist/fonts/         arquivos woff2 da Poppins
 *
 * Duas regras que o build faz valer, e não são cosméticas:
 *
 *   1. NADA sob `base` é emitido. Primitivo é privado — a fronteira é estrutural,
 *      não convencional (AD-06). Os aliases resolvem antes do filtro, então os
 *      semânticos saem com o valor final.
 *
 *   2. Cor sai em HEX, nunca oklch(). As escalas foram DERIVADAS em OKLCH, mas a
 *      função oklch() em CSS pode não existir na WebView Android do terminal
 *      PagSeguro. Enquanto P-06 estiver aberta, hex. Ver docs/architecture-proposal.md.
 */

import { mkdirSync, copyFileSync, existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import StyleDictionary from 'style-dictionary';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIST = join(HERE, 'dist');
const REM_BASE = 16;

// O glob do Style Dictionary não casa caminho com backslash. No Windows, `join`
// produz `src\**\*.json` e o build sai vazio sem erro — falha silenciosa. Barras
// normais aqui, e absoluto para o build não depender do cwd de quem chama.
const posix = (p) => p.replaceAll('\\', '/');

/* ------------------------------------------------------------------------ *
 * Tradução de elevação por plataforma.
 *
 * O token é semântico (0, 1, 2) justamente porque o valor concreto não é
 * portável: web tem box-shadow; iOS usa shadowOffset/Opacity/Radius; Android
 * usa `elevation`, que nem é configurável. A tabela abaixo é o único lugar
 * onde a sombra vira valor — ver §7.4 da proposta.
 * ------------------------------------------------------------------------ */
const ELEVATION = {
  0: {
    css: 'none',
    native: { shadowColor: '#000000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
  },
  1: {
    css: '0 1px 2px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.08)',
    native: { shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  },
  2: {
    css: '0 4px 12px rgba(0, 0, 0, 0.10), 0 16px 32px rgba(0, 0, 0, 0.12)',
    native: { shadowColor: '#000000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  },
};

const POPPINS_WEIGHTS = [400, 500, 700];

const val = (token) => token.$value ?? token.value;
const isElevation = (token) => token.path[0] === 'elevation';
const isPublic = (token) => token.path[0] !== 'base';

/** Dimensões que escalam com a preferência de fonte do usuário viram rem.
 *  Borda, raio e breakpoint continuam em px: borda em rem fica borrada em
 *  certos níveis de zoom, e breakpoint em rem muda de significado. */
const scalesWithUser = (token) =>
  token.path[0] === 'space' || token.path[0] === 'size' || token.path.at(-1) === 'size';

/* ------------------------------------------------------------------------ *
 * Transforms
 * ------------------------------------------------------------------------ */

StyleDictionary.registerTransform({
  name: 'rp/px-to-rem',
  type: 'value',
  transitive: true,
  filter: (token) => typeof val(token) === 'string' && val(token).endsWith('px') && scalesWithUser(token),
  transform: (token) => {
    const px = parseFloat(val(token));
    return px === 0 ? '0' : `${px / REM_BASE}rem`;
  },
});

StyleDictionary.registerTransform({
  name: 'rp/px-to-number',
  type: 'value',
  transitive: true,
  filter: (token) => typeof val(token) === 'string' && val(token).endsWith('px'),
  transform: (token) => parseFloat(val(token)),
});

StyleDictionary.registerTransform({
  name: 'rp/elevation-css',
  type: 'value',
  transitive: true,
  filter: isElevation,
  transform: (token) => ELEVATION[val(token)].css,
});

StyleDictionary.registerTransform({
  name: 'rp/elevation-native',
  type: 'value',
  transitive: true,
  filter: isElevation,
  transform: (token) => ELEVATION[val(token)].native,
});

/** React Native não aceita stack de fontes — só um nome. */
StyleDictionary.registerTransform({
  name: 'rp/font-family-native',
  type: 'value',
  transitive: true,
  filter: (token) => token.$type === 'fontFamily' || token.type === 'fontFamily',
  transform: (token) => String(val(token)).split(',')[0].trim().replace(/^['"]|['"]$/g, ''),
});

/* ------------------------------------------------------------------------ *
 * Helpers de formatação
 * ------------------------------------------------------------------------ */

const HEADER = (what) =>
  `/**\n * ${what}\n *\n * GERADO POR build.mjs — não editar à mão.\n * A fonte é packages/tokens/src/**\\/*.json\n */\n\n`;

const fontFace = () =>
  POPPINS_WEIGHTS.map(
    (weight) => `@font-face {
  font-family: 'Poppins';
  font-style: normal;
  font-weight: ${weight};
  font-display: swap;
  src: url('./fonts/poppins-latin-${weight}-normal.woff2') format('woff2'),
       url('./fonts/poppins-latin-${weight}-normal.woff') format('woff');
}`,
  ).join('\n\n');

/** Remonta a árvore aninhada a partir dos tokens achatados. */
function nest(tokens) {
  const root = {};
  for (const token of tokens) {
    let node = root;
    for (const key of token.path.slice(0, -1)) node = node[key] ??= {};
    node[token.path.at(-1)] = val(token);
  }
  return root;
}

function serialize(node, indent = 2) {
  const pad = ' '.repeat(indent);
  if (node === null || typeof node !== 'object') return JSON.stringify(node);
  const entries = Object.entries(node).map(
    ([k, v]) => `${pad}${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${serialize(v, indent + 2)}`,
  );
  return `{\n${entries.join(',\n')}\n${' '.repeat(indent - 2)}}`;
}

/** Gera o .d.ts com tipos literais — o editor autocompleta o valor real. */
function declare(node, indent = 2) {
  const pad = ' '.repeat(indent);
  if (node === null || typeof node !== 'object') return JSON.stringify(node);
  const entries = Object.entries(node).map(
    ([k, v]) => `${pad}readonly ${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${declare(v, indent + 2)}`,
  );
  return `{\n${entries.join(';\n')}\n${' '.repeat(indent - 2)}}`;
}

/* ------------------------------------------------------------------------ *
 * Formats
 * ------------------------------------------------------------------------ */

StyleDictionary.registerFormat({
  name: 'rp/css',
  format: ({ dictionary }) => {
    const vars = dictionary.allTokens
      .map((token) => {
        // Primeira frase apenas. O corte é em ponto SEGUIDO DE ESPAÇO — cortar em
        // qualquer ponto quebraria "surface.inverse" e "9,55:1" no meio.
        const full = token.$description ?? token.comment;
        const first = full ? full.split(/(?<=[.!?])\s/)[0] : '';
        const comment = first.length > 100 ? `${first.slice(0, 97)}…` : first;
        return `  --${token.name}: ${val(token)};${comment ? ` /* ${comment} */` : ''}`;
      })
      .join('\n');
    return `${HEADER('Variáveis CSS dos design tokens da Rizzo Park.')}${fontFace()}\n\n:root {\n${vars}\n}\n`;
  },
});

/**
 * Camada Tailwind v4. Mapeamento MECÂNICO: cada token vira uma entrada no
 * namespace correspondente do Tailwind, apontando para a nossa variável.
 *
 * Deliberadamente não inventamos nomes curtos aqui. Nossos nomes canônicos são
 * longos e explícitos; nomes curtos são detalhe interno de quem consome (PA-9).
 */
StyleDictionary.registerFormat({
  name: 'rp/tailwind',
  format: ({ dictionary }) => {
    const NAMESPACE = { color: 'color', space: 'spacing', radius: 'radius', breakpoint: 'breakpoint', elevation: 'shadow' };
    const lines = [];
    for (const token of dictionary.allTokens) {
      const ns = NAMESPACE[token.path[0]];
      if (!ns) continue;
      const suffix = token.name.replace(/^rp-[^-]+-/, '');
      lines.push(`  --${ns}-${suffix}: var(--${token.name});`);
    }
    for (const token of dictionary.allTokens) {
      if (token.path[0] !== 'typography') continue;
      if (token.path.at(-1) === 'size') lines.push(`  --text-${token.path.slice(1, -1).join('-')}: var(--${token.name});`);
      if (token.path[1] === 'family') lines.push(`  --font-${token.path.at(-1)}: var(--${token.name});`);
    }
    return `${HEADER('Camada de tema Tailwind v4. Importar DEPOIS de tokens.css.')}@theme inline {\n${lines.join('\n')}\n}\n`;
  },
});

StyleDictionary.registerFormat({
  name: 'rp/esm',
  format: ({ dictionary }) => `${HEADER('Design tokens da Rizzo Park (web).')}export const tokens = ${serialize(nest(dictionary.allTokens))};\n\nexport default tokens;\n`,
});

/* ------------------------------------------------------------------------ *
 * Ponte para o contrato de variáveis do shadcn/ui.
 *
 * Nossos nomes continuam canônicos — este é um ALIAS de saída, não uma segunda
 * fonte de verdade. A direção importa: os valores vêm dos nossos tokens, então a
 * ponte não pode divergir. Se um token muda, ela muda junto.
 *
 * Existe por um motivo prático: o parking-new-front já é shadcn. Sem a ponte,
 * adotar o Design System exigiria refatorar componente por componente, e a
 * adoção simplesmente não aconteceria — o maior risco do projeto (R-4) não é o
 * DS estar errado, é ninguém usar.
 *
 * O que NÃO está aqui, de propósito: `--auth-canvas-top`, `--auth-grid-line` e
 * `--brand-subtle`. São da tela de autenticação de um app específico, não da
 * linguagem visual compartilhada.
 * ------------------------------------------------------------------------ */
const SHADCN_MAP = {
  background: 'color.surface.page',
  foreground: 'color.text.primary',
  card: 'color.surface.default',
  'card-foreground': 'color.text.primary',
  popover: 'color.surface.raised',
  'popover-foreground': 'color.text.primary',

  primary: 'color.action.primary.background.default',
  'primary-foreground': 'color.action.primary.foreground.default',
  secondary: 'color.surface.subtle',
  'secondary-foreground': 'color.text.primary',
  muted: 'color.surface.subtle',
  'muted-foreground': 'color.text.secondary',
  accent: 'color.action.ghost.background.hover',
  'accent-foreground': 'color.text.primary',
  destructive: 'color.action.danger.background.default',
  'destructive-foreground': 'color.action.danger.foreground.default',

  border: 'color.border.default',
  input: 'color.border.strong',
  ring: 'color.border.focus',
  radius: 'radius.base',

  brand: 'color.brand.default',
  'brand-foreground': 'color.brand.ink',
  'brand-mark': 'color.brand.default',
  'brand-strong': 'color.brand.strong',
  'brand-link': 'color.text.link',
  'brand-hover': 'color.action.primary.background.hover',
  'brand-accent': 'color.brand.accent',
  'brand-accent-foreground': 'color.brand.accent-ink',

  'chart-1': 'color.chart.1',
  'chart-2': 'color.chart.2',
  'chart-3': 'color.chart.3',
  'chart-4': 'color.chart.4',
  'chart-5': 'color.chart.5',

  sidebar: 'color.surface.subtle',
  'sidebar-foreground': 'color.text.primary',
  'sidebar-primary': 'color.action.primary.background.default',
  'sidebar-primary-foreground': 'color.action.primary.foreground.default',
  'sidebar-accent': 'color.action.ghost.background.hover',
  'sidebar-accent-foreground': 'color.text.primary',
  'sidebar-border': 'color.border.default',
  'sidebar-ring': 'color.border.focus',
};

StyleDictionary.registerFormat({
  name: 'rp/shadcn',
  format: ({ dictionary }) => {
    const byPath = new Map(dictionary.allTokens.map((token) => [token.path.join('.'), val(token)]));

    const missing = Object.entries(SHADCN_MAP).filter(([, path]) => !byPath.has(path));
    if (missing.length) {
      // Falha o build em vez de emitir uma ponte com buracos: variável ausente
      // vira `--primary: undefined`, o componente perde a cor e ninguém liga o
      // sintoma à causa.
      throw new Error(
        `Ponte shadcn aponta para tokens que não existem:\n${missing.map(([n, p]) => `  --${n} -> ${p}`).join('\n')}`,
      );
    }

    const lines = Object.entries(SHADCN_MAP).map(([name, path]) => `  --${name}: ${byPath.get(path)};`);

    return `${HEADER('Ponte para o contrato de variáveis do shadcn/ui.')}/**
 * COMO ADOTAR num app shadcn existente
 *
 *   1. Importe este arquivo depois do \`@import 'tailwindcss'\`.
 *   2. Remova do seu \`:root\` as ${Object.keys(SHADCN_MAP).length} variáveis declaradas abaixo — passam a vir daqui.
 *   3. Seu \`@theme inline\` NÃO muda: ele mapeia exatamente estas variáveis.
 *
 * O QUE VOCÊ CONTINUA MANTENDO
 *
 *   Camada de paleta crua (\`--rizzo-green\`, \`--rizzo-gold\`, …)
 *     Equivale à nossa camada primitiva, que o build não emite de propósito. Ela
 *     ainda é referenciada pelo seu bloco \`.dark\`, então precisa ficar até o
 *     tema escuro sair daqui. Depois disso, pode ser apagada.
 *
 *   Bloco \`.dark\` inteiro
 *     O tema escuro ainda não é emitido. Sem o seu bloco, o app fica claro no
 *     modo escuro. Ele sobrepõe esta ponte normalmente — nada a fazer.
 *
 *   \`--stat-neutral\`, \`--stat-positive\`, \`--stat-negative\`
 *     São composições suas via \`color-mix\` sobre \`--muted-foreground\`,
 *     \`--primary\`, \`--destructive\` e \`--card\` — todas fornecidas aqui. Seguem
 *     funcionando sem alteração, e passam a refletir a paleta verificada.
 *
 *   \`--font-poppins\`, \`--auth-*\`, \`--brand-subtle\`, \`--shadow-card\`
 *     Específicas do seu app. O Design System não as conhece nem deveria.
 *
 * O QUE MUDA DE APARÊNCIA
 *
 *   \`--primary\` sai de #0b9e42 para #006f00. Com texto branco isso vai de
 *   3,51:1 (reprova AA) para 6,41:1. É a correção que o comentário do seu
 *   globals.css já prescrevia e o código não aplicava.
 *
 *   \`--chart-2\` sai do dourado da marca para um dourado escuro: como marca de
 *   dado em fundo claro, o #ffd700 dá 1,40:1 e some.
 */
:root {
${lines.join('\n')}
}
`;
  },
});

/**
 * Artefato SOMENTE PARA DOCUMENTAÇÃO com a camada primitiva.
 *
 * O build não emite primitivos nas saídas de produto, e isso é deliberado (AD-06).
 * Mas a galeria precisa mostrar as escalas para o time de design conferir. Este
 * arquivo existe só para isso: é exportado sob subpath próprio, não entra em
 * tokens.css nem nos objetos, e consumi-lo em produto é violação — o lint vai pegar.
 */
StyleDictionary.registerFormat({
  name: 'rp/primitives-json',
  format: ({ dictionary }) =>
    `${JSON.stringify(
      {
        $comment:
          'SOMENTE DOCUMENTAÇÃO. Camada primitiva, exposta para a galeria do Storybook conseguir desenhar as escalas. Não consumir em produto — use os tokens semânticos.',
        ...nest(dictionary.allTokens),
      },
      null,
      2,
    )}\n`,
});

StyleDictionary.registerFormat({
  name: 'rp/dts',
  format: ({ dictionary }) => `${HEADER('Tipos dos design tokens da Rizzo Park.')}export declare const tokens: ${declare(nest(dictionary.allTokens))};\n\nexport default tokens;\n`,
});

/* ------------------------------------------------------------------------ *
 * Build
 * ------------------------------------------------------------------------ */

const shared = ['attribute/cti', 'name/kebab'];

const sd = new StyleDictionary({
  source: [posix(join(HERE, 'src/**/*.json'))],
  usesDtcg: true,
  log: { verbosity: 'default', warnings: 'warn' },
  platforms: {
    css: {
      transforms: [...shared, 'rp/elevation-css', 'rp/px-to-rem'],
      prefix: 'rp',
      buildPath: `${posix(DIST)}/`,
      files: [{ destination: 'tokens.css', format: 'rp/css', filter: isPublic }],
    },
    tailwind: {
      transforms: [...shared, 'rp/elevation-css', 'rp/px-to-rem'],
      prefix: 'rp',
      buildPath: `${posix(DIST)}/`,
      files: [{ destination: 'tailwind.css', format: 'rp/tailwind', filter: isPublic }],
    },
    web: {
      transforms: [...shared, 'rp/elevation-css', 'rp/px-to-rem'],
      buildPath: `${posix(DIST)}/`,
      files: [
        { destination: 'index.mjs', format: 'rp/esm', filter: isPublic },
        { destination: 'index.d.ts', format: 'rp/dts', filter: isPublic },
      ],
    },
    native: {
      transforms: [...shared, 'rp/elevation-native', 'rp/font-family-native', 'rp/px-to-number'],
      buildPath: `${posix(DIST)}/`,
      files: [
        { destination: 'native.mjs', format: 'rp/esm', filter: isPublic },
        { destination: 'native.d.ts', format: 'rp/dts', filter: isPublic },
      ],
    },
    shadcn: {
      // Sem transform de valor: a ponte precisa dos valores CRUS, não de rem nem
      // de conversão. O consumidor é o CSS de um app shadcn, que espera cor e px.
      transforms: shared,
      buildPath: `${posix(DIST)}/`,
      files: [{ destination: 'shadcn.css', format: 'rp/shadcn', filter: isPublic }],
    },
    docs: {
      transforms: shared,
      buildPath: `${posix(DIST)}/`,
      files: [
        // Único lugar do build onde o filtro é INVERTIDO: só o que está sob `base`.
        { destination: 'primitives.json', format: 'rp/primitives-json', filter: (token) => !isPublic(token) },
      ],
    },
  },
});

// maxRetries/retryDelay são para o Windows: se outro processo ainda segura um
// handle em dist/, o rm falha com EBUSY/EPERM e derruba o build de forma
// intermitente. Vimos uma ocorrência ao rodar via `pnpm -r`, não reproduzível.
if (existsSync(DIST)) rmSync(DIST, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
await sd.buildAllPlatforms();

// Poppins auto-hospedada: copiamos os arquivos para dentro do dist para o pacote
// ser autocontido. O consumidor importa tokens.css e a fonte funciona — sem
// requisição a CDN externa.
const FONT_SRC = join(HERE, 'node_modules/@fontsource/poppins/files');
mkdirSync(join(DIST, 'fonts'), { recursive: true });
let copied = 0;
for (const weight of POPPINS_WEIGHTS) {
  for (const ext of ['woff2', 'woff']) {
    const file = `poppins-latin-${weight}-normal.${ext}`;
    copyFileSync(join(FONT_SRC, file), join(DIST, 'fonts', file));
    copied++;
  }
}
console.log(`\nPoppins: ${copied} arquivos copiados para dist/fonts/ (subset latin, cobre os diacríticos do pt-BR).`);
