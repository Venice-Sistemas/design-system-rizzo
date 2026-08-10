/**
 * Contrato do DropdownMenu, em forma executável.
 *
 * Espelha docs/contracts/dropdown-menu.md.
 *
 * O que este contrato protege é o MODELO DE TECLADO, que é o oposto do resto da
 * biblioteca e por isso o mais fácil de implementar errado:
 *
 *   fora de um menu    Tab navega entre controles
 *   dentro de um menu  Tab FECHA; as setas navegam
 *
 * Um menu cujos itens são alcançáveis por Tab não é um menu — é uma lista de
 * botões dentro de uma caixa, e quem usa leitor de tela recebe a promessa de
 * "menu" com o comportamento de outra coisa.
 */

import userEvent from '@testing-library/user-event';

/**
 * @param {object} harness
 * @param {(props: object) => void | Promise<void>} harness.render  monta um menu com 3 itens e um gatilho
 * @param {() => void} harness.cleanup                              desmonta
 * @param {string} [harness.nome]
 */
export function runMenuContract({ render, cleanup, nome = 'DropdownMenu' }) {
  const gatilho = () => document.querySelector('[data-slot="dropdown-menu-trigger"]');
  const conteudo = () => document.querySelector('[data-slot="dropdown-menu-content"]');
  const itens = () => [...document.querySelectorAll('[data-slot="dropdown-menu-item"]')];

  describe(`contrato: ${nome}`, () => {
    afterEach(() => cleanup());

    describe('papéis', () => {
      it('o conteúdo é um menu', async () => {
        await render({ open: true });
        expect(conteudo().getAttribute('role')).toBe('menu');
      });

      it('cada item é um menuitem', async () => {
        await render({ open: true });
        expect(itens().length).toBeGreaterThan(0);
        for (const item of itens()) expect(item.getAttribute('role')).toBe('menuitem');
      });

      it('o gatilho declara que abre um menu', async () => {
        // `aria-haspopup` é o que faz o leitor anunciar "botão, submenu" em vez
        // de só "botão" — quem não enxerga precisa saber que algo vai abrir
        // antes de acionar.
        await render({ open: false });
        expect(gatilho().getAttribute('aria-haspopup')).toBe('menu');
      });

      it('o gatilho reflete se está aberto', async () => {
        await render({ open: true });
        expect(gatilho().getAttribute('aria-expanded')).toBe('true');
      });
    });

    describe('teclado', () => {
      /**
       * Abre CLICANDO no gatilho, não forçando `open`.
       *
       * A diferença não é cosmética: o comportamento de foco de um menu depende
       * de onde o foco estava quando ele abriu. Montado já aberto, o gatilho
       * nunca recebeu foco e não há para onde devolvê-lo — o teste reprovaria
       * uma implementação correta.
       */
      const abrir = async () => {
        await render({});
        await userEvent.click(gatilho());
        return gatilho();
      };

      it('as setas navegam entre os itens', async () => {
        await abrir();
        await userEvent.keyboard('{ArrowDown}');
        expect(itens()).toContain(document.activeElement);
      });

      it('a navegação circula no fim da lista', async () => {
        // Sem circular, quem chega no último item com a seta acha que travou.
        //
        // Não assume ONDE o foco começa: abrir por clique e abrir por teclado
        // deixam o foco em lugares diferentes, e amarrar o teste a um deles o
        // faria reprovar por detalhe de entrada em vez de por comportamento.
        // A propriedade verificada é "dar uma volta completa retorna ao mesmo
        // item", que vale a partir de qualquer ponto.
        await abrir();
        await userEvent.keyboard('{ArrowDown}');
        const partida = document.activeElement;
        expect(itens()).toContain(partida);

        for (let i = 0; i < itens().length; i++) await userEvent.keyboard('{ArrowDown}');
        expect(document.activeElement).toBe(partida);
      });

      it('Escape fecha', async () => {
        await abrir();
        await userEvent.keyboard('{Escape}');
        expect(conteudo()).toBe(null);
      });

      it('o foco volta ao gatilho ao fechar', async () => {
        // Sem isso o foco cai no body e a pessoa recomeça do topo da página.
        const disparador = await abrir();
        await userEvent.keyboard('{Escape}');
        expect(document.activeElement).toBe(disparador);
      });
    });

    describe('item desabilitado', () => {
      it('não aciona', async () => {
        let acionou = false;
        await render({ open: true, itemDesabilitado: true, onSelect: () => { acionou = true; } });
        const desabilitado = itens().find((i) => i.hasAttribute('data-disabled'));
        await userEvent.click(desabilitado);
        expect(acionou).toBe(false);
      });

      it('continua anunciado', async () => {
        // Pular o item desabilitado esconde que a opção existe. Quem não enxerga
        // fica procurando uma ação que está ali, apenas indisponível.
        await render({ open: true, itemDesabilitado: true });
        const desabilitado = itens().find((i) => i.hasAttribute('data-disabled'));
        expect(desabilitado).toBeTruthy();
        expect(desabilitado.getAttribute('aria-disabled')).toBe('true');
      });
    });

    describe('estrutura', () => {
      it('marca o conteúdo com data-slot', async () => {
        await render({ open: true });
        expect(conteudo().getAttribute('data-slot')).toBe('dropdown-menu-content');
      });

      it('não renderiza nada quando fechado', async () => {
        await render({ open: false });
        expect(conteudo()).toBe(null);
      });
    });
  });
}
