/**
 * Contrato do Checkbox, em forma executável.
 *
 * Espelha docs/contracts/checkbox.md.
 *
 * A regra que este contrato protege é a de ESTADO ANUNCIADO. Um checkbox errado
 * continua parecendo certo: a caixa marca, a cor muda, e quem enxerga não nota
 * nada. O que quebra é o `aria-checked` — e aí quem usa leitor de tela ouve
 * "não marcado" numa caixa marcada, ou não ouve nada.
 */

import userEvent from '@testing-library/user-event';

/**
 * @param {object} harness
 * @param {(props: object) => void | Promise<void>} harness.render  monta o componente no document.body
 * @param {() => void} harness.cleanup                              desmonta
 * @param {string} [harness.nome]                                   aparece no título, para distinguir plataformas
 */
export function runCheckboxContract({ render, cleanup, nome = 'Checkbox' }) {
  const montar = async (props = {}) => {
    await render({ 'aria-label': 'Isento', ...props });
    return document.querySelector('[data-slot="checkbox"]');
  };

  describe(`contrato: ${nome}`, () => {
    afterEach(() => cleanup());

    describe('papel e estado', () => {
      it('expõe o papel checkbox', async () => {
        const caixa = await montar();
        expect(caixa.getAttribute('role')).toBe('checkbox');
      });

      it('anuncia não marcado por padrão', async () => {
        const caixa = await montar();
        expect(caixa.getAttribute('aria-checked')).toBe('false');
      });

      it('anuncia marcado quando checked', async () => {
        const caixa = await montar({ checked: true });
        expect(caixa.getAttribute('aria-checked')).toBe('true');
      });

      it('anuncia mixed quando indeterminado', async () => {
        // "mixed" é o valor da ARIA para o terceiro estado. Usar "false" faria
        // um checkbox de "selecionar todos" com seleção parcial ser anunciado
        // como vazio.
        const caixa = await montar({ checked: 'indeterminate' });
        expect(caixa.getAttribute('aria-checked')).toBe('mixed');
      });

      it('marca o elemento com data-slot', async () => {
        const caixa = await montar();
        expect(caixa.getAttribute('data-slot')).toBe('checkbox');
      });
    });

    describe('interação', () => {
      it('alterna no clique', async () => {
        let valor = false;
        const caixa = await montar({ checked: false, onCheckedChange: (v) => { valor = v; } });
        await userEvent.click(caixa);
        expect(valor).toBe(true);
      });

      it('alterna com Espaço', async () => {
        // Espaço é a tecla do checkbox. Enter NÃO alterna — num formulário, Enter
        // submete, e um checkbox que alterna com Enter engole a submissão.
        let valor = false;
        const caixa = await montar({ checked: false, onCheckedChange: (v) => { valor = v; } });
        caixa.focus();
        await userEvent.keyboard(' ');
        expect(valor).toBe(true);
      });

      it('recebe foco por Tab', async () => {
        const caixa = await montar();
        await userEvent.tab();
        expect(document.activeElement).toBe(caixa);
      });

      it('não alterna quando desabilitado', async () => {
        let mudou = false;
        const caixa = await montar({ disabled: true, onCheckedChange: () => { mudou = true; } });
        await userEvent.click(caixa);
        expect(mudou).toBe(false);
      });

      it('sai da ordem de tabulação quando desabilitado', async () => {
        const caixa = await montar({ disabled: true });
        await userEvent.tab();
        expect(document.activeElement).not.toBe(caixa);
      });
    });

    describe('nome acessível', () => {
      it('aceita nome por aria-label', async () => {
        const caixa = await montar({ 'aria-label': 'Vaga isenta' });
        expect(caixa.getAttribute('aria-label')).toBe('Vaga isenta');
      });
    });
  });
}
