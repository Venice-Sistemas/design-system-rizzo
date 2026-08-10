import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, type BadgeVariant } from '@venice-sistemas/react';

const VARIANTES: BadgeVariant[] = ['default', 'secondary', 'destructive', 'outline'];

const meta = {
  title: 'Componentes/Badge',
  component: Badge,
  parameters: {
    docs: {
      description: {
        component:
          'Rótulo curto que classifica algo já presente na tela. O contrato completo está em ' +
          '`docs/contracts/badge.md`. **Badge não é controle**: não recebe foco, não responde a ' +
          'clique e não tem hover. Se a peça precisa disso, ela é um `Button` ou um link.',
      },
    },
  },
  args: { children: 'Pago' },
  argTypes: { variant: { control: 'inline-radio', options: VARIANTES } },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

const Linha = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--rp-space-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
    {children}
  </div>
);

export const Padrao: Story = { name: 'Padrão' };

export const Variantes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Quatro, não as seis do shadcn. `ghost` e `link` ficaram de fora: variante que existe acaba ' +
          'sendo usada, e um badge com aparência de link só teria uso errado.',
      },
    },
  },
  render: () => (
    <Linha>
      {VARIANTES.map((v) => (
        <Badge key={v} variant={v}>
          {v}
        </Badge>
      ))}
    </Linha>
  ),
};

export const NoContexto: Story = {
  name: 'Em contexto',
  parameters: {
    docs: {
      description: {
        story:
          '**Passada 1 da auditoria com leitor de tela.** Percorra este parágrafo com `Insert`+↓: ' +
          'o texto do badge deve ser lido junto do conteúdo, sem ser anunciado como controle, e ' +
          'sem entrar na ordem de tabulação ao pressionar Tab.',
      },
    },
  },
  render: () => (
    <p style={{ fontFamily: 'var(--rp-typography-family-default)', maxWidth: '40ch' }}>
      O ticket ABC1D23 do Setor Centro está <Badge variant="default">Pago</Badge> desde as 14h32, e a
      vaga 12 segue <Badge variant="secondary">Ocupada</Badge>. A vaga 18 registra{' '}
      <Badge variant="destructive">Irregular</Badge>.
    </p>
  ),
};
