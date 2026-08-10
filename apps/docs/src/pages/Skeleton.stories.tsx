import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from '@venice-sistemas/react';

const meta = {
  title: 'Componentes/Skeleton',
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component:
          'Ocupa o lugar do conteúdo enquanto ele carrega, preservando o layout para a página não ' +
          'saltar. O contrato está em `docs/contracts/skeleton.md`. **A forma vem de quem usa** — ' +
          'sem `variant` e sem `size`, porque um esqueleto só cumpre a função se tiver a medida do ' +
          'conteúdo que substitui.',
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: 'Padrão',
  render: () => <Skeleton className="ds:h-4 ds:w-48" />,
};

export const ImitandoOConteudo: Story = {
  name: 'Imitando o conteúdo',
  parameters: {
    docs: {
      description: {
        story:
          'O esqueleto acerta quando tem a mesma medida do que vai substituir. Compare os dois ' +
          'blocos: a página não deve saltar ao trocar um pelo outro.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--rp-space-2xl)', fontFamily: 'var(--rp-typography-family-default)' }}>
      <div style={{ display: 'grid', gap: 'var(--rp-space-sm)' }}>
        <Skeleton className="ds:h-5 ds:w-40" />
        <Skeleton className="ds:h-4 ds:w-64" />
        <Skeleton className="ds:h-4 ds:w-52" />
      </div>
      <div style={{ display: 'grid', gap: 'var(--rp-space-sm)' }}>
        <strong style={{ fontSize: '1.125rem' }}>Setor Centro</strong>
        <span>120 vagas rotativas, 84 ocupadas</span>
        <span>Operação das 08h às 18h</span>
      </div>
    </div>
  ),
};

export const AuditoriaDeAnuncio: Story = {
  name: 'Auditoria — silêncio',
  parameters: {
    docs: {
      description: {
        story:
          '**Passada 1 da auditoria com leitor de tela.** Percorra esta área com `Insert`+↓. Deve ' +
          'haver **silêncio** onde estão os esqueletos, e a região deve se anunciar como ocupada. ' +
          'Se você ouvir uma sequência de itens vazios, o `aria-hidden` do componente falhou. ' +
          'Se ouvir silêncio total, o problema é da tela: quem anuncia o carregamento é o ' +
          'contêiner, com `aria-busy`, porque é ele que sabe **o que** está carregando.',
      },
    },
  },
  render: () => (
    <div aria-busy="true" aria-live="polite" style={{ display: 'grid', gap: 'var(--rp-space-sm)' }}>
      <span className="ds:sr-only">Carregando dados do setor</span>
      <Skeleton className="ds:h-5 ds:w-40" />
      <Skeleton className="ds:h-4 ds:w-64" />
      <Skeleton className="ds:h-4 ds:w-52" />
    </div>
  ),
};
