/**
 * Contrato do Button, em forma executável.
 *
 * Espelha docs/contracts/button.md. Cada bloco cita a seção que ele verifica —
 * se um deles falhar, a resposta está lá, não aqui.
 *
 * Roda sobre qualquer implementação que renderize para o DOM. Não importa React,
 * Angular nem framework nenhum: só `@testing-library/dom` e `user-event`, que
 * trabalham sobre o DOM já montado. A plataforma diz apenas COMO montar.
 *
 * Usa os globais `describe`/`it`/`expect` do runner. Vitest, Jest e Jasmine os
 * fornecem, então o mesmo arquivo serve aos três.
 */

import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

/**
 * @param {object} harness
 * @param {(props: object) => void | Promise<void>} harness.render  monta o componente no document.body
 * @param {() => void} harness.cleanup                              desmonta
 * @param {string} [harness.nome]                                   aparece no título, para distinguir plataformas
 */
export function runButtonContract({ render, cleanup, nome = 'Button' }) {
  const montar = async (props = {}) => {
    await render({ children: 'Registrar', ...props });
    return screen.getByRole('button', { hidden: true });
  };

  describe(`contrato: ${nome}`, () => {
    afterEach(() => cleanup());

    describe('elemento e papel', () => {
      it('expõe o papel button', async () => {
        await montar();
        expect(screen.getByRole('button', { name: 'Registrar' })).toBeTruthy();
      });

      it('é um <button> nativo, não um elemento com role', async () => {
        // O nativo entrega papel, Enter, Espaço e foco de graça. Recriar isso à
        // mão só introduz bugs, e é o erro mais comum em botão customizado.
        const b = await montar();
        expect(b.tagName).toBe('BUTTON');
        expect(b.getAttribute('role')).toBe(null);
      });

      it('marca o elemento com data-slot', async () => {
        const b = await montar();
        expect(b.getAttribute('data-slot')).toBe('button');
      });

      it('usa type="button" por padrão', async () => {
        // O padrão do HTML é "submit". Sem isto, um botão dentro de <form>
        // submete sem querer — armadilha clássica.
        const b = await montar();
        expect(b.getAttribute('type')).toBe('button');
      });

      it('aceita type="submit"', async () => {
        const b = await montar({ type: 'submit' });
        expect(b.getAttribute('type')).toBe('submit');
      });
    });

    describe('teclado', () => {
      it('recebe foco por Tab', async () => {
        const user = userEvent.setup();
        const b = await montar();
        await user.tab();
        expect(document.activeElement).toBe(b);
      });

      it('aciona com Enter', async () => {
        const user = userEvent.setup();
        let cliques = 0;
        await montar({ onClick: () => { cliques += 1; } });
        await user.tab();
        await user.keyboard('{Enter}');
        expect(cliques).toBe(1);
      });

      it('aciona com Espaço', async () => {
        const user = userEvent.setup();
        let cliques = 0;
        await montar({ onClick: () => { cliques += 1; } });
        await user.tab();
        await user.keyboard(' ');
        expect(cliques).toBe(1);
      });
    });

    describe('desabilitado', () => {
      it('não aciona no clique', async () => {
        const user = userEvent.setup();
        let cliques = 0;
        const b = await montar({ disabled: true, onClick: () => { cliques += 1; } });
        await user.click(b);
        expect(cliques).toBe(0);
      });

      it('sai da ordem de tabulação', async () => {
        const user = userEvent.setup();
        const b = await montar({ disabled: true });
        await user.tab();
        expect(document.activeElement).not.toBe(b);
      });
    });

    describe('carregando', () => {
      it('anuncia o estado ocupado', async () => {
        const b = await montar({ loading: true });
        expect(b.getAttribute('aria-busy')).toBe('true');
      });

      it('expõe data-loading como gancho de estilo', async () => {
        const b = await montar({ loading: true });
        expect(b.getAttribute('data-loading')).toBe('true');
      });

      it('CONTINUA focável — carregando não é desabilitado', async () => {
        // `disabled` tiraria o elemento da ordem de tabulação e o foco cairia no
        // body no meio da ação. Leitores de tela também não anunciam mudança em
        // elemento desabilitado, então o aviso passaria despercebido por quem
        // mais precisa dele.
        const user = userEvent.setup();
        const b = await montar({ loading: true });
        await user.tab();
        expect(document.activeElement).toBe(b);
        expect(b.hasAttribute('disabled')).toBe(false);
      });

      it('preserva o nome acessível', async () => {
        // O rótulo some da vista, não da árvore de acessibilidade. Se sumisse, o
        // leitor de tela anunciaria só "botão, ocupado".
        await montar({ loading: true });
        expect(screen.getByRole('button', { name: 'Registrar' })).toBeTruthy();
      });

      it('ignora o clique', async () => {
        const user = userEvent.setup();
        let cliques = 0;
        const b = await montar({ loading: true, onClick: () => { cliques += 1; } });
        await user.click(b);
        expect(cliques).toBe(0);
      });
    });

    describe('nome acessível', () => {
      it('avisa no console quando não há nome', async () => {
        // Botão só de ícone sem rótulo é mudo no leitor de tela e parece normal
        // para quem enxerga. O caminho inacessível precisa ser barulhento.
        const original = console.warn;
        const avisos = [];
        console.warn = (...args) => avisos.push(String(args[0]));
        try {
          await montar({ children: null });
          await waitFor(() => expect(avisos.some((a) => /nome acess/i.test(a))).toBe(true));
        } finally {
          console.warn = original;
        }
      });

      it('não avisa quando há aria-label', async () => {
        const original = console.warn;
        const avisos = [];
        console.warn = (...args) => avisos.push(String(args[0]));
        try {
          await montar({ children: null, 'aria-label': 'Fechar' });
          expect(avisos.some((a) => /nome acess/i.test(a))).toBe(false);
        } finally {
          console.warn = original;
        }
      });
    });

    describe('variantes e tamanhos', () => {
      // Aparência não se verifica aqui — cor e altura vêm dos tokens e são
      // conferidas no pacote de tokens, uma vez, para as duas plataformas. O que
      // se verifica é que o conjunto declarado no contrato EXISTE e monta.
      for (const variant of ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']) {
        it(`aceita variant="${variant}"`, async () => {
          const b = await montar({ variant });
          expect(b).toBeTruthy();
        });
      }

      for (const size of ['default', 'sm', 'lg', 'icon']) {
        it(`aceita size="${size}"`, async () => {
          const b = await montar({ size, 'aria-label': 'Ação' });
          expect(b).toBeTruthy();
        });
      }
    });
  });
}
