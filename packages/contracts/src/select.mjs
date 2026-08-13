/**
 * Contrato do Select, em forma executável.
 *
 * Espelha docs/contracts/select.md.
 *
 * A regra que este contrato protege é a de CATEGORIA ANUNCIADA. Um select
 * construído com as peças de menu funciona, abre, escolhe e fecha — e quem
 * enxerga não nota nada. O que muda é o papel: o leitor de tela anuncia "menu"
 * onde deveria dizer "caixa de combinação", e a pessoa espera executar uma ação
 * quando na verdade está preenchendo um campo.
 *
 * A segunda regra é `Escape` não alterar o valor. Cancelar uma escolha que
 * muda o campo é a diferença entre um select e um menu que grava.
 */

import userEvent from '@testing-library/user-event';

/**
 * @param {object} harness
 * @param {(props: object) => void | Promise<void>} harness.render  monta o componente no document.body
 * @param {() => void} harness.cleanup                              desmonta
 * @param {string} [harness.nome]                                   aparece no título, para distinguir plataformas
 */
export function runSelectContract({ render, cleanup, nome = 'Select' }) {
  const OPCOES = [
    { value: 'SP', label: 'São Paulo' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'MG', label: 'Minas Gerais' },
  ];

  const montar = async (props = {}) => {
    const lista = props.grupos ? {} : { opcoes: OPCOES };
    await render({ 'aria-label': 'Estado', ...lista, ...props });
    return document.querySelector('[data-slot="select-trigger"]');
  };

  const abrir = async (gatilho) => {
    await userEvent.click(gatilho);
    return document.querySelector('[data-slot="select-content"]');
  };

  describe(`contrato: ${nome}`, () => {
    afterEach(() => cleanup());

    describe('papel e categoria', () => {
      it('expõe o papel combobox no gatilho', async () => {
        const gatilho = await montar();
        expect(gatilho.getAttribute('role')).toBe('combobox');
      });

      it('anuncia fechado por padrão', async () => {
        const gatilho = await montar();
        expect(gatilho.getAttribute('aria-expanded')).toBe('false');
      });

      it('anuncia aberto depois de acionado', async () => {
        const gatilho = await montar();
        await abrir(gatilho);
        expect(gatilho.getAttribute('aria-expanded')).toBe('true');
      });

      it('expõe o papel listbox no painel', async () => {
        const gatilho = await montar();
        const painel = await abrir(gatilho);
        expect(painel.getAttribute('role')).toBe('listbox');
      });

      it('expõe o papel option nos itens, e não menuitem', async () => {
        const gatilho = await montar();
        await abrir(gatilho);
        const itens = document.querySelectorAll('[data-slot="select-item"]');
        expect(itens.length).toBe(OPCOES.length);
        for (const item of itens) {
          expect(item.getAttribute('role')).toBe('option');
        }
      });

      it('marca os elementos com data-slot', async () => {
        const gatilho = await montar();
        expect(gatilho.getAttribute('data-slot')).toBe('select-trigger');
      });
    });

    describe('valor', () => {
      it('mostra o placeholder quando não há valor', async () => {
        const gatilho = await montar({ placeholder: 'Selecione' });
        expect(gatilho.textContent).toContain('Selecione');
      });

      it('mostra o rótulo do valor escolhido, não o value', async () => {
        const gatilho = await montar({ value: 'SP' });
        expect(gatilho.textContent).toContain('São Paulo');
      });

      it('anuncia qual opção está selecionada', async () => {
        const gatilho = await montar({ value: 'RJ' });
        await abrir(gatilho);
        const selecionado = document.querySelector('[aria-selected="true"]');
        expect(selecionado.textContent).toContain('Rio de Janeiro');
      });

      it('avisa a escolha por onValueChange', async () => {
        const escolhas = [];
        const gatilho = await montar({
          onValueChange: (valor) => escolhas.push(valor),
        });

        await abrir(gatilho);
        await userEvent.click(
          [...document.querySelectorAll('[data-slot="select-item"]')].find(
            (item) => item.textContent.includes('Minas Gerais'),
          ),
        );

        expect(escolhas).toEqual(['MG']);
      });
    });

    describe('teclado', () => {
      it('é alcançável por Tab — o modelo é de campo, não de menu', async () => {
        const gatilho = await montar();
        await userEvent.tab();
        expect(document.activeElement).toBe(gatilho);
      });

      it('abre com Enter', async () => {
        const gatilho = await montar();
        gatilho.focus();
        await userEvent.keyboard('{Enter}');
        expect(gatilho.getAttribute('aria-expanded')).toBe('true');
      });

      it('abre com a seta para baixo', async () => {
        const gatilho = await montar();
        gatilho.focus();
        await userEvent.keyboard('{ArrowDown}');
        expect(gatilho.getAttribute('aria-expanded')).toBe('true');
      });

      it('fecha com Escape e devolve o foco ao gatilho', async () => {
        const gatilho = await montar();
        await abrir(gatilho);
        await userEvent.keyboard('{Escape}');

        expect(gatilho.getAttribute('aria-expanded')).toBe('false');
        expect(document.activeElement).toBe(gatilho);
      });

      it('Escape não altera o valor', async () => {
        const escolhas = [];
        const gatilho = await montar({
          value: 'SP',
          onValueChange: (valor) => escolhas.push(valor),
        });

        await abrir(gatilho);
        await userEvent.keyboard('{ArrowDown}{Escape}');

        expect(escolhas).toEqual([]);
        expect(gatilho.textContent).toContain('São Paulo');
      });
    });

    describe('desabilitado', () => {
      it('não abre quando o select está desabilitado', async () => {
        const gatilho = await montar({ disabled: true });
        await userEvent.click(gatilho);
        expect(gatilho.getAttribute('aria-expanded')).toBe('false');
      });

      it('anuncia a opção desabilitada em vez de escondê-la', async () => {
        const gatilho = await montar({
          opcoes: [...OPCOES, { value: 'AC', label: 'Acre', disabled: true }],
        });
        await abrir(gatilho);

        const acre = [
          ...document.querySelectorAll('[data-slot="select-item"]'),
        ].find((item) => item.textContent.includes('Acre'));

        expect(acre).toBeTruthy();
        expect(acre.getAttribute('aria-disabled')).toBe('true');
      });
    });

    describe('erro', () => {
      it('propaga aria-invalid para o gatilho', async () => {
        const gatilho = await montar({ 'aria-invalid': true });
        expect(gatilho.getAttribute('aria-invalid')).toBe('true');
      });
    });

    describe('grupo', () => {
      const GRUPOS = [
        { label: 'Sudeste', opcoes: [OPCOES[0], OPCOES[1], OPCOES[2]] },
        { label: 'Sul', opcoes: [{ value: 'PR', label: 'Paraná' }] },
      ];

      it('expõe o papel group', async () => {
        const gatilho = await montar({ grupos: GRUPOS });
        await abrir(gatilho);

        const grupos = document.querySelectorAll('[data-slot="select-group"]');
        expect(grupos.length).toBe(GRUPOS.length);
        for (const grupo of grupos) {
          expect(grupo.getAttribute('role')).toBe('group');
        }
      });

      it('nomeia o grupo pelo rótulo', async () => {
        const gatilho = await montar({ grupos: GRUPOS });
        await abrir(gatilho);

        const grupo = document.querySelector('[data-slot="select-group"]');
        const id = grupo.getAttribute('aria-labelledby');

        expect(id).toBeTruthy();
        expect(document.getElementById(id).textContent).toBe('Sudeste');
      });

      it('o rótulo não é opção — não entra na contagem da lista', async () => {
        const gatilho = await montar({ grupos: GRUPOS });
        await abrir(gatilho);

        const rotulos = document.querySelectorAll('[data-slot="select-label"]');
        expect(rotulos.length).toBe(GRUPOS.length);
        for (const rotulo of rotulos) {
          expect(rotulo.getAttribute('role')).not.toBe('option');
        }

        const itens = document.querySelectorAll('[data-slot="select-item"]');
        expect(itens.length).toBe(
          GRUPOS.reduce((total, grupo) => total + grupo.opcoes.length, 0),
        );
      });

      it('escolhe uma opção de dentro do grupo', async () => {
        const escolhas = [];
        const gatilho = await montar({
          grupos: GRUPOS,
          onValueChange: (valor) => escolhas.push(valor),
        });

        await abrir(gatilho);
        await userEvent.click(
          [...document.querySelectorAll('[data-slot="select-item"]')].find(
            (item) => item.textContent.includes('Paraná'),
          ),
        );

        expect(escolhas).toEqual(['PR']);
      });
    });
  });
}
