import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@venice-sistemas/react';

const meta = {
  title: 'Componentes/Card',
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          'Superfície que agrupa conteúdo relacionado. O contrato está em `docs/contracts/card.md`. ' +
          '**Não tem variante**: card é superfície, e superfície com variante vira decisão de cor ' +
          'espalhada por tela. Quem quer um card de perigo quer um `Alert`.',
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: 'Padrão',
  render: () => (
    <Card style={{ maxWidth: '24rem' }}>
      <CardHeader>
        <CardTitle>Setor Centro</CardTitle>
        <CardDescription>120 vagas rotativas</CardDescription>
      </CardHeader>
      <CardContent>84 vagas ocupadas, 36 livres. Operação das 08h às 18h.</CardContent>
      <CardFooter>
        <Badge variant="secondary">Ativo</Badge>
      </CardFooter>
    </Card>
  ),
};

export const TituloComNivel: Story = {
  name: 'Título com nível de cabeçalho',
  parameters: {
    docs: {
      description: {
        story:
          '`CardTitle` renderiza uma `div`, **não um `<h3>`**. O Card não sabe em que nível da ' +
          'hierarquia da página ele está, e chutar um nível produz documento com cabeçalhos fora de ' +
          'ordem — pior para leitor de tela do que a ausência de cabeçalho.\n\n' +
          'Quem sabe o nível é a tela, e declara com `asChild`. Abra a lista de elementos do NVDA ' +
          '(`Insert`+`F7`) e confirme que este título aparece como cabeçalho e o da story anterior não.',
      },
    },
  },
  render: () => (
    <Card style={{ maxWidth: '24rem' }}>
      <CardHeader>
        <CardTitle asChild>
          <h2>Setor Centro</h2>
        </CardTitle>
        <CardDescription>Agora é um cabeçalho de verdade</CardDescription>
      </CardHeader>
      <CardContent>O componente não decidiu o nível — a tela decidiu.</CardContent>
    </Card>
  ),
};

export const ConteudoAteAsBordas: Story = {
  name: 'Conteúdo até as bordas',
  parameters: {
    docs: {
      description: {
        story:
          'O padding horizontal mora nas **partes**, não na raiz. É o que permite um conteúdo de ' +
          'largura total encostar nas bordas sem desfazer o padding do resto.',
      },
    },
  },
  render: () => (
    <Card style={{ maxWidth: '24rem' }}>
      <CardHeader>
        <CardTitle>Ocupação por hora</CardTitle>
      </CardHeader>
      <div style={{ height: '6rem', background: 'var(--rp-color-surface-subtle)' }} />
      <CardFooter>
        <Button size="sm" variant="outline">
          Ver detalhes
        </Button>
      </CardFooter>
    </Card>
  ),
};
