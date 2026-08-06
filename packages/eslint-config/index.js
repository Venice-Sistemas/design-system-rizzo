/**
 * Configuração base (flat config) para os pacotes do Design System.
 *
 * A configuração específica de React e acessibilidade vive em `./react.js` e só é
 * aplicada pelo pacote de componentes — o pacote de tokens é TypeScript puro e não
 * deve carregar regras de JSX.
 */

// PENDENTE — os plugins ainda não foram instalados; este arquivo declara a intenção
// e será preenchido na etapa em que o pacote de componentes existir.
// Regras que precisam existir aqui quando isso acontecer:
//
//   1. Proibir literal de cor (#hex, rgb(), hsl()) fora do pacote de tokens.
//      É o que faz valer AD-06: aplicação e componente só consomem token semântico.
//   2. Proibir import de token PRIMITIVO fora do pacote de tokens.
//   3. Proibir `console.log` em código publicado.
//   4. Ordenação de imports.

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'storybook-static/**', '.turbo/**'],
  },
];
