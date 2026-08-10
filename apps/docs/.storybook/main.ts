import { existsSync } from 'node:fs';
import path from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';
import type { Plugin } from 'vite';
import remarkGfm from 'remark-gfm';

/**
 * A galeria só tem valor se ela SEMPRE mostrar o que está no build. Sem este
 * plugin ela mostra valores velhos com cara de atuais, que é pior do que não
 * existir — documentação que mente é aceita como verdade.
 *
 * O problema: `packages/tokens/dist` fica fora da raiz do app de docs, então o
 * watcher do Vite não o observa. O sintoma é traiçoeiro — a PRIMEIRA leitura
 * depois de subir o servidor lê do disco e parece funcionar; a partir daí o
 * módulo fica no cache do grafo e nenhum rebuild aparece.
 */
function watchTokensDist(): Plugin {
  const dist = path.resolve(process.cwd(), '../../packages/tokens/dist');

  return {
    name: 'rizzopark:watch-tokens-dist',
    apply: 'serve',
    configureServer(server) {
      if (!existsSync(dist)) {
        server.config.logger.warn(`[rizzopark] ${dist} não existe — rode \`pnpm build\` nos tokens primeiro.`);
        return;
      }
      server.watcher.add(dist);

      // 'add' e 'unlink' além de 'change': o build apaga dist/ inteiro e recria,
      // então o chokidar vê remoção e criação, nunca alteração. Escutar só
      // 'change' faz o plugin parecer instalado e não fazer nada.
      let pending: NodeJS.Timeout | undefined;
      for (const event of ['add', 'change', 'unlink'] as const) {
        server.watcher.on(event, (file) => {
          if (!path.resolve(file).startsWith(dist)) return;
          // O build reescreve vários arquivos em sequência; agrupa para não
          // disparar meia dúzia de reloads seguidos.
          clearTimeout(pending);
          pending = setTimeout(() => {
            server.moduleGraph.invalidateAll();
            server.hot.send({ type: 'full-reload' });
            server.config.logger.info('[rizzopark] tokens rebuildados — recarregando a galeria');
          }, 150);
        });
      }
    },
  };
}

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-a11y',
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          // MDX 3 não habilita tabelas GFM por padrão. Sem isto, `| a | b |` sai
          // como texto literal com pipes no meio da página.
          mdxCompileOptions: { remarkPlugins: [remarkGfm] },
        },
      },
    },
  ],
  framework: { name: '@storybook/react-vite', options: {} },
  // Sem autodocs: ainda não existem componentes do Design System, só páginas de
  // foundations. Ele passa a fazer sentido junto de @venice-sistemas/react.
  typescript: { reactDocgen: false },

  viteFinal: async (config) => {
    /**
     * @venice-sistemas/tokens é um link de workspace, então o Vite o enxerga dentro de
     * node_modules e o PRÉ-EMPACOTA como dependência de terceiro. Dependência
     * pré-empacotada não é observada nem invalidada — o resultado é que rodar
     * `pnpm build` nos tokens não muda nada na galeria, e ela passa a mostrar
     * valores velhos com cara de atuais. É a pior falha possível aqui, porque a
     * galeria existe justamente para ser a fonte confiável do que está no build.
     *
     * Excluir da otimização faz o Vite tratá-lo como código-fonte: entra no grafo
     * de módulos, é observado e recarrega sozinho.
     */
    config.optimizeDeps = {
      ...config.optimizeDeps,
      exclude: [...(config.optimizeDeps?.exclude ?? []), '@venice-sistemas/tokens'],
    };
    // Excluir da otimização é necessário mas não suficiente: o diretório também
    // precisa ser observado, porque fica fora da raiz deste app.
    config.plugins = [...(config.plugins ?? []), watchTokensDist()];
    return config;
  },
};

export default config;
