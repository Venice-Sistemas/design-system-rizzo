/**
 * Contrato compartilhado por Dialog e AlertDialog.
 *
 * Espelha docs/contracts/dialog.md e docs/contracts/alert-dialog.md.
 *
 * UMA suíte para os dois porque eles são o mesmo componente com uma diferença —
 * e a diferença é justamente o que o parâmetro `dispensavel` descreve. Escrever
 * duas suítes quase idênticas garantiria que a segunda ficaria para trás na
 * primeira correção feita na primeira.
 *
 * O que este contrato protege é o FOCO. Modal é a peça onde errar foco é mais
 * grave: quem navega por teclado ou leitor de tela fica preso fora do diálogo,
 * ou perde a posição quando ele fecha. E nada disso aparece para quem usa mouse.
 */

import userEvent from '@testing-library/user-event';

/**
 * @param {object} harness
 * @param {(props: object) => void | Promise<void>} harness.render  monta o modal ABERTO, com um gatilho antes dele
 * @param {() => void} harness.cleanup                              desmonta
 * @param {string} harness.slot                                     data-slot da raiz do conteúdo
 * @param {boolean} harness.dispensavel                             fecha por Escape e clique fora?
 * @param {string} [harness.nome]
 */
export function runModalContract({ render, cleanup, slot, dispensavel, nome = 'Modal' }) {
  const conteudo = () => document.querySelector(`[data-slot="${slot}"]`);

  describe(`contrato: ${nome}`, () => {
    afterEach(() => cleanup());

    describe('semântica', () => {
      it('expõe o papel dialog', async () => {
        await render({ open: true });
        expect(conteudo().getAttribute('role')).toMatch(/^(dialog|alertdialog)$/);
      });

      it('é modal — o resto da página fica inerte', async () => {
        // Verifica o EFEITO, não o mecanismo. Existem duas técnicas aceitas e
        // elas não são equivalentes em suporte:
        //
        //   aria-modal="true" no conteúdo   — declarativa, suporte inconsistente
        //   aria-hidden nos irmãos          — o que o Radix faz, funciona em todos
        //
        // Amarrar o contrato a uma delas reprovaria uma implementação correta.
        // O que não pode acontecer é nenhuma das duas: aí o leitor de tela
        // continua navegando pelo conteúdo atrás do diálogo, que está coberto
        // pelo véu e não recebe clique — a pessoa lê o que não consegue alcançar.
        await render({ open: true });
        const alvo = conteudo();

        const declarado = alvo.getAttribute('aria-modal') === 'true';

        const raizDoModal = [...document.body.children].find((filho) => filho.contains(alvo));
        const irmaos = [...document.body.children].filter((filho) => filho !== raizDoModal);
        const irmaosOcultos =
          irmaos.length > 0 && irmaos.every((irmao) => irmao.getAttribute('aria-hidden') === 'true');

        expect(
          declarado || irmaosOcultos,
          'nem aria-modal no conteúdo, nem aria-hidden nos irmãos — o resto da página continua acessível por trás do véu',
        ).toBe(true);
      });

      it('tem nome acessível', async () => {
        // Diálogo sem nome é anunciado como "diálogo" e nada mais. O nome vem do
        // título, e por isso o título não é opcional.
        await render({ open: true });
        const rotulado =
          conteudo().getAttribute('aria-labelledby') || conteudo().getAttribute('aria-label');
        expect(rotulado).toBeTruthy();
      });
    });

    describe('foco', () => {
      it('move o foco para dentro ao abrir', async () => {
        await render({ open: true });
        expect(conteudo().contains(document.activeElement)).toBe(true);
      });

      it('prende o foco: Tab não escapa do diálogo', async () => {
        // A armadilha de foco é o que separa um modal de uma caixa flutuante.
        // Sem ela, Tab leva para a página atrás — que está coberta pelo véu e
        // não recebe clique.
        await render({ open: true });
        for (let i = 0; i < 8; i++) await userEvent.tab();
        expect(conteudo().contains(document.activeElement)).toBe(true);
      });
    });

    describe(dispensavel ? 'dispensa' : 'exige decisão', () => {
      if (dispensavel) {
        it('fecha com Escape', async () => {
          let aberto = true;
          await render({ open: true, onOpenChange: (v) => { aberto = v; } });
          await userEvent.keyboard('{Escape}');
          expect(aberto).toBe(false);
        });
      } else {
        it('NÃO fecha com Escape', async () => {
          // Um diálogo que pede confirmação de algo destrutivo não pode sumir
          // por um Escape reflexo. Quem abriu precisa escolher, e as duas saídas
          // são botões visíveis.
          let aberto = true;
          await render({ open: true, onOpenChange: (v) => { aberto = v; } });
          await userEvent.keyboard('{Escape}');
          expect(aberto).toBe(true);
        });
      }
    });

    describe('estrutura', () => {
      it('marca o conteúdo com data-slot', async () => {
        await render({ open: true });
        expect(conteudo().getAttribute('data-slot')).toBe(slot);
      });

      it('não renderiza nada quando fechado', async () => {
        await render({ open: false });
        expect(conteudo()).toBe(null);
      });
    });
  });
}
