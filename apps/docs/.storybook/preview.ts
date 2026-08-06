import type { Preview } from '@storybook/react-vite';

// A galeria consome tokens e componentes do jeito que uma aplicação consumiria:
// pelo CSS gerado. Se o build quebrar, a própria galeria quebra — é o canário.
import '@rizzopark/tokens/css';
import '@rizzopark/react/styles.css';

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: ['Introdução', 'Foundations', ['Cor', 'Contraste', 'Tipografia', 'Layout'], 'Componentes'],
      },
    },
    docs: { toc: true },
    a11y: {
      /**
       * `error` faz a violação FALHAR, não apenas aparecer num painel lateral que
       * ninguém abre. Aviso que não bloqueia é aviso que se aprende a ignorar, e
       * acessibilidade é o primeiro item a cair sob prazo.
       *
       * `color-contrast` fica de fora: o contraste é verificado contra os valores
       * resolvidos do build em @rizzopark/tokens, onde quebra o CI. Duas checagens
       * da mesma coisa acabam discordando, e aí ninguém confia em nenhuma.
       */
      test: 'error',
      config: { rules: [{ id: 'color-contrast', enabled: false }] },
    },
  },
};

export default preview;
