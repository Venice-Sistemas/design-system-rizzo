import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, type ButtonSize, type ButtonVariant } from '@rizzopark/react';

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'danger', 'ghost'];
const SIZES: ButtonSize[] = ['sm', 'md', 'lg'];

const meta = {
  title: 'Componentes/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          'Dispara uma ação. O contrato completo está em `docs/contracts/button.md`. ' +
          'Não use para navegar: se o clique muda a URL, é um link — muda o papel para leitores de tela ' +
          'e quebra abrir em nova aba.',
      },
    },
  },
  args: { children: 'Registrar' },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    size: { control: 'inline-radio', options: SIZES },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: 'Padrão',
  parameters: {
    docs: {
      description: {
        story:
          'O padrão é `secondary`, não `primary`. Uma tela deve ter um botão primário, não seis — ' +
          'se o padrão fosse `primary`, o caminho preguiçoso seria o errado.',
      },
    },
  },
};

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--rp-space-md)', alignItems: 'center', flexWrap: 'wrap' }}>{children}</div>
);

export const Variantes: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A distinção entre primário e secundário vem da **forma** — preenchido contra contornado — não só da cor.',
      },
    },
  },
  render: (args) => (
    <Grid>
      {VARIANTS.map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
    </Grid>
  ),
};

export const Tamanhos: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A área clicável nunca encolhe abaixo de `size.target.min` (44px), mesmo em `sm`. ' +
          'O alvo pode ultrapassar o desenho visível — é o que torna o controle usável em campo.',
      },
    },
  },
  render: (args) => (
    <Grid>
      {SIZES.map((size) => (
        <Button key={size} {...args} size={size}>
          {size}
        </Button>
      ))}
    </Grid>
  ),
};

export const Desabilitado: Story = {
  args: { disabled: true },
  render: (args) => (
    <Grid>
      {VARIANTS.map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
    </Grid>
  ),
};

export const Carregando: Story = {
  args: { loading: true },
  parameters: {
    docs: {
      description: {
        story:
          'Carregando **não** é desabilitado. O botão continua focável e anuncia `aria-busy`. ' +
          'Se usasse `disabled`, o elemento sairia da ordem de tabulação e o foco cairia no `body` ' +
          'no meio da ação — e leitores de tela não anunciam mudanças em elemento desabilitado, ' +
          'então o aviso passaria despercebido justamente por quem mais precisa dele. ' +
          'A largura também não muda: botão que encolhe move o layout e faz errar o clique seguinte.',
      },
    },
  },
  render: (args) => (
    <Grid>
      {VARIANTS.map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          Registrar
        </Button>
      ))}
    </Grid>
  ),
};

export const ComIcone: Story = {
  name: 'Com ícone',
  parameters: {
    docs: {
      description: {
        story:
          'Ícone não tem prop: o botão aplica o gap por token, então composição resolve. ' +
          'Botão **só** de ícone exige `aria-label` — sem ele o componente avisa no console em desenvolvimento.',
      },
    },
  },
  render: (args) => (
    <Grid>
      <Button {...args} variant="primary">
        <span aria-hidden="true">✓</span> Confirmar
      </Button>
      <Button {...args} variant="ghost" aria-label="Fechar">
        <span aria-hidden="true">✕</span>
      </Button>
    </Grid>
  ),
};
