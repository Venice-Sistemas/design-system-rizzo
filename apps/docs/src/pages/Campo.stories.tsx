import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@venice-sistemas/react';

/**
 * Input, Label e Checkbox numa página só.
 *
 * Eles compartilham o mecanismo que a auditoria verifica — a associação de nome
 * acessível — e é esse mecanismo que falha ou passa, não cada componente
 * isoladamente. Separá-los faria a auditoria verificar a mesma coisa três vezes.
 */
const meta = {
  title: 'Componentes/Campo',
  parameters: {
    docs: {
      description: {
        component:
          '`Input`, `Label` e `Checkbox`. Contratos em `docs/contracts/{input,label,checkbox}.md`.\n\n' +
          'Nenhum dos três tem prop de rótulo: o nome acessível vem de um `<label>` associado, e ele ' +
          'mora fora do campo. Uma prop `label` produziria um componente que renderiza um `<label>` ' +
          'sem saber onde ele deve ficar no layout.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const Campo = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'grid', gap: 'var(--rp-space-2xs)', maxWidth: '20rem' }}>{children}</div>
);

export const Padrao: Story = {
  name: 'Padrão',
  render: () => (
    <Campo>
      <Label htmlFor="placa">Placa do veículo</Label>
      <Input id="placa" placeholder="ABC1D23" />
    </Campo>
  ),
};

export const ComErro: Story = {
  name: 'Com erro',
  parameters: {
    docs: {
      description: {
        story:
          'O erro vem de `aria-invalid`, **não de uma prop `variant="error"`**. O atributo é o que o ' +
          'leitor de tela anuncia, e a borda vermelha é derivada dele. Uma prop paralela permitiria ' +
          'pintar sem anunciar — e vermelho sem anúncio é informação só para quem enxerga.',
      },
    },
  },
  render: () => (
    <Campo>
      <Label htmlFor="placa-erro">Placa do veículo</Label>
      <Input id="placa-erro" defaultValue="ABC" aria-invalid aria-describedby="erro-placa" />
      <span id="erro-placa" style={{ color: 'var(--rp-color-feedback-danger-text)', fontSize: '0.875rem' }}>
        Formato inválido. Use ABC1D23 ou ABC1234.
      </span>
    </Campo>
  ),
};

export const PlaceholderNaoERotulo: Story = {
  name: 'Auditoria — placeholder não é rótulo',
  parameters: {
    docs: {
      description: {
        story:
          '**Passada 2 da auditoria.** O primeiro campo tem rótulo; o segundo tem só placeholder.\n\n' +
          'Tab até cada um. O primeiro deve anunciar "Placa do veículo, caixa de edição". O segundo ' +
          'deve ficar **sem nome** — e isso é o comportamento correto. Se o leitor anunciar "ABC1D23", ' +
          'estamos derivando nome do placeholder, e o campo perderia o nome assim que a pessoa ' +
          'começasse a digitar.\n\n' +
          'Digite no primeiro campo e ouça de novo: o rótulo continua sendo o nome.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--rp-space-lg)' }}>
      <Campo>
        <Label htmlFor="com-rotulo">Placa do veículo</Label>
        <Input id="com-rotulo" placeholder="ABC1D23" />
      </Campo>
      <Campo>
        <Input placeholder="ABC1D23" />
      </Campo>
    </div>
  ),
};

export const Desabilitado: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'O rótulo apaga junto com o campo, por `peer-disabled` — ele não tem prop `disabled` ' +
          'própria, que poderia dessincronizar. E o apagamento usa token medido, não `opacity-50`: ' +
          'opacidade leva o texto para perto do fundo, e o nome do campo é a última coisa que deve sumir.',
      },
    },
  },
  render: () => (
    <Campo>
      <Input id="placa-off" placeholder="ABC1D23" disabled className="ds:peer" />
      <Label htmlFor="placa-off">Placa do veículo</Label>
    </Campo>
  ),
};

export const Caixas: Story = {
  name: 'Checkbox',
  parameters: {
    docs: {
      description: {
        story:
          '**Passada 2 da auditoria.** Tab até cada caixa e ouça nome, papel e estado. Pressione ' +
          '`Espaço` e confirme que a mudança é anunciada.\n\n' +
          'A terceira é indeterminada, e é a que mais me interessa: `aria-checked="mixed"` é correto ' +
          'pela especificação, e **como o NVDA verbaliza isso em português é pergunta aberta**. Se ' +
          'ele disser "não marcado", um "selecionar todos" com seleção parcial é anunciado como vazio.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--rp-space-sm)' }}>
      <div style={{ display: 'flex', gap: 'var(--rp-space-sm)', alignItems: 'center' }}>
        <Checkbox id="isenta" />
        <Label htmlFor="isenta">Vaga isenta</Label>
      </div>
      <div style={{ display: 'flex', gap: 'var(--rp-space-sm)', alignItems: 'center' }}>
        <Checkbox id="especial" defaultChecked />
        <Label htmlFor="especial">Vaga especial</Label>
      </div>
      <div style={{ display: 'flex', gap: 'var(--rp-space-sm)', alignItems: 'center' }}>
        <Checkbox id="todas" checked="indeterminate" />
        <Label htmlFor="todas">Selecionar todas</Label>
      </div>
      <div style={{ display: 'flex', gap: 'var(--rp-space-sm)', alignItems: 'center' }}>
        <Checkbox id="off" disabled />
        <Label htmlFor="off">Indisponível</Label>
      </div>
    </div>
  ),
};

export const Autenticacao: Story = {
  name: 'Auditoria — colar senha',
  parameters: {
    docs: {
      description: {
        story:
          '**Critério 3.3.8 do WCAG 2.2 AA.** Cole uma senha aqui com `Ctrl+V` e confirme que ' +
          'funciona. Depois tente o gerenciador de senhas do navegador.\n\n' +
          'Bloquear colagem em campo de senha reprova AA, e afeta os quatro fluxos de login do ' +
          'sistema. Vale conferir mesmo que ninguém tenha bloqueado de propósito — extensões e ' +
          'máscaras às vezes fazem isso sem querer.',
      },
    },
  },
  render: () => (
    <Campo>
      <Label htmlFor="senha">Senha</Label>
      <Input id="senha" type="password" autoComplete="current-password" />
    </Campo>
  ),
};

export const Escolha: Story = {
  name: 'Select',
  parameters: {
    docs: {
      description: {
        story:
          'Escolha de **um** valor entre opções conhecidas. Contrato em `docs/contracts/select.md`.\n\n' +
          'O gatilho tem a altura e a borda do `Input` de propósito: os dois ficam lado a lado em ' +
          'formulários, e alturas de origens diferentes desalinham a linha.\n\n' +
          '`Tab` alcança o gatilho — o modelo é de campo, não de menu, onde `Tab` fecha. E `Escape` ' +
          'fecha **sem** alterar o valor: cancelar uma escolha não pode deixar o campo diferente de ' +
          'como estava.',
      },
    },
  },
  render: () => (
    <Campo>
      <Label htmlFor="estado">Estado</Label>
      <Select defaultValue="SP">
        <SelectTrigger id="estado">
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="SP">São Paulo</SelectItem>
          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
          <SelectItem value="MG">Minas Gerais</SelectItem>
          <SelectItem value="AC" disabled>
            Acre — indisponível
          </SelectItem>
        </SelectContent>
      </Select>
    </Campo>
  ),
};
