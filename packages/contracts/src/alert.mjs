/**
 * Contrato do Alert, em forma executável.
 *
 * Espelha docs/contracts/alert.md. Cada bloco cita a seção que ele verifica —
 * se um deles falhar, a resposta está lá, não aqui.
 *
 * Roda sobre qualquer implementação que renderize para o DOM. Não importa React,
 * Angular nem framework nenhum: só `@testing-library/dom`, que trabalha sobre o
 * DOM já montado. A plataforma diz apenas COMO montar.
 *
 * O que este contrato protege é a REGIÃO VIVA. Um alerta é a única peça da
 * biblioteca que interrompe quem usa leitor de tela, e errar o grau da
 * interrupção é o defeito mais fácil de cometer e o mais difícil de perceber:
 * quem enxerga não nota diferença nenhuma.
 */

import { screen } from '@testing-library/dom';

/**
 * @param {object} harness
 * @param {(props: object) => void | Promise<void>} harness.render  monta o componente no document.body
 * @param {() => void} harness.cleanup                              desmonta
 * @param {string} [harness.nome]                                   aparece no título, para distinguir plataformas
 */
export function runAlertContract({ render, cleanup, nome = 'Alert' }) {
  const montar = async (props = {}) => {
    await render({ children: 'Não foi possível salvar', ...props });
    return document.querySelector('[data-slot="alert"]');
  };

  describe(`contrato: ${nome}`, () => {
    afterEach(() => cleanup());

    describe('região viva', () => {
      it('usa role="status" por padrão — polido, não interrompe', async () => {
        // O padrão é o menos invasivo de propósito. A maioria dos alertas de uma
        // tela administrativa é informativa e já nasce renderizada; anunciá-los
        // de forma assertiva interromperia a leitura sem motivo.
        const alerta = await montar();
        expect(alerta.getAttribute('role')).toBe('status');
        expect(alerta.getAttribute('aria-live')).toBe('polite');
      });

      it('usa role="alert" quando urgent — assertivo, interrompe', async () => {
        // Reservado para o que exige atenção imediata: falha que bloqueia a
        // tarefa em andamento.
        const alerta = await montar({ urgent: true });
        expect(alerta.getAttribute('role')).toBe('alert');
        expect(alerta.getAttribute('aria-live')).toBe('assertive');
      });

      it('não muda o grau de urgência conforme o tom', async () => {
        // Tom é COR, urgência é ANÚNCIO. Amarrar os dois faria todo alerta de
        // perigo interromper, inclusive os que já estavam na tela desde o
        // carregamento — e impediria um aviso informativo de interromper quando
        // ele precisa.
        const alerta = await montar({ tone: 'danger' });
        expect(alerta.getAttribute('role')).toBe('status');
      });
    });

    describe('estrutura', () => {
      it('marca o elemento com data-slot', async () => {
        const alerta = await montar();
        expect(alerta.getAttribute('data-slot')).toBe('alert');
      });

      it('expõe o tom como data-tone', async () => {
        const alerta = await montar({ tone: 'warning' });
        expect(alerta.getAttribute('data-tone')).toBe('warning');
      });

      it('usa info como tom padrão', async () => {
        const alerta = await montar();
        expect(alerta.getAttribute('data-tone')).toBe('info');
      });

      it('o conteúdo fica legível como texto', async () => {
        await montar();
        expect(screen.getByText('Não foi possível salvar')).toBeTruthy();
      });
    });

    describe('tons', () => {
      for (const tone of ['info', 'success', 'warning', 'danger']) {
        it(`aceita tone="${tone}"`, async () => {
          const alerta = await montar({ tone });
          expect(alerta.getAttribute('data-tone')).toBe(tone);
        });
      }
    });

    describe('o que o alerta NÃO faz', () => {
      it('não é focável', async () => {
        // Região viva é anunciada sem receber foco. Um alerta focável entra na
        // ordem de tabulação sem ter ação, e quem navega por teclado para nele
        // sem poder fazer nada.
        const alerta = await montar();
        expect(alerta.getAttribute('tabindex')).toBe(null);
      });

      it('não vira botão de fechar por conta própria', async () => {
        // Alerta dispensável é outro componente, com regra própria: o foco
        // precisa ir para algum lugar quando ele some. Enfiar um X aqui produz
        // foco perdido no body.
        const alerta = await montar();
        expect(alerta.querySelector('button')).toBe(null);
      });
    });
  });
}
