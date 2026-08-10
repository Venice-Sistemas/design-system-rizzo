/**
 * Contrato do Input, em forma executável.
 *
 * Espelha docs/contracts/input.md.
 *
 * A maior parte do que um campo de texto faz vem do elemento nativo, e é por isso
 * que este contrato é curto: ele não reverifica o navegador. O que ele trava são
 * as três decisões que uma implementação pode errar sozinha — usar elemento
 * errado, pintar erro sem anunciar, e desabilitar de um jeito que ainda aceita
 * digitação.
 */

import userEvent from '@testing-library/user-event';

/**
 * @param {object} harness
 * @param {(props: object) => void | Promise<void>} harness.render  monta o componente no document.body
 * @param {() => void} harness.cleanup                              desmonta
 * @param {string} [harness.nome]                                   aparece no título, para distinguir plataformas
 */
export function runInputContract({ render, cleanup, nome = 'Input' }) {
  const montar = async (props = {}) => {
    await render({ 'aria-label': 'Placa', ...props });
    return document.querySelector('[data-slot="input"]');
  };

  describe(`contrato: ${nome}`, () => {
    afterEach(() => cleanup());

    describe('elemento', () => {
      it('é um <input> nativo', async () => {
        // O nativo entrega teclado, seleção, autofill, gerenciador de senha e
        // teclado virtual correto no celular. Recriar isso sobre uma div com
        // contenteditable perde tudo e não avisa.
        const campo = await montar();
        expect(campo.tagName).toBe('INPUT');
      });

      it('marca o elemento com data-slot', async () => {
        const campo = await montar();
        expect(campo.getAttribute('data-slot')).toBe('input');
      });

      it('encaminha o type', async () => {
        // O type decide o teclado virtual no celular. Engoli-lo faz o usuário
        // digitar e-mail num teclado alfabético comum.
        const campo = await montar({ type: 'email' });
        expect(campo.getAttribute('type')).toBe('email');
      });
    });

    describe('digitação', () => {
      it('aceita texto', async () => {
        const campo = await montar();
        await userEvent.type(campo, 'ABC1D23');
        expect(campo.value).toBe('ABC1D23');
      });

      it('não aceita texto quando desabilitado', async () => {
        const campo = await montar({ disabled: true });
        await userEvent.type(campo, 'ABC1D23');
        expect(campo.value).toBe('');
      });

      it('sai da ordem de tabulação quando desabilitado', async () => {
        const campo = await montar({ disabled: true });
        expect(campo.disabled).toBe(true);
      });
    });

    describe('erro', () => {
      it('reflete aria-invalid', async () => {
        // A borda vermelha é DERIVADA deste atributo, não paralela a ele. Uma
        // prop `variant="error"` permitiria pintar sem anunciar — e vermelho sem
        // anúncio é informação só para quem enxerga.
        const campo = await montar({ 'aria-invalid': true });
        expect(campo.getAttribute('aria-invalid')).toBe('true');
      });

      it('não marca erro por padrão', async () => {
        const campo = await montar();
        expect(campo.getAttribute('aria-invalid')).toBe(null);
      });
    });

    describe('nome acessível', () => {
      it('aceita nome por aria-label', async () => {
        const campo = await montar({ 'aria-label': 'Placa do veículo' });
        expect(campo.getAttribute('aria-label')).toBe('Placa do veículo');
      });

      it('NÃO usa o placeholder como nome', async () => {
        // Placeholder some quando o usuário começa a digitar. Um campo cujo nome
        // vem dali fica sem nome no meio do preenchimento, e quem usa leitor de
        // tela perde a referência do que estava respondendo.
        const campo = await montar({ placeholder: 'ABC1D23', 'aria-label': undefined });
        expect(campo.getAttribute('aria-label')).toBe(null);
        expect(campo.getAttribute('aria-labelledby')).toBe(null);
      });
    });
  });
}
