import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@venice-sistemas/react';

/**
 * Popover e DropdownMenu.
 *
 * Os dois nascem colados a um gatilho e nenhum tem véu. A diferença está no
 * modelo de teclado, e é ela que decide qual usar.
 */
const meta = {
  title: 'Componentes/Ancorado',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '`Popover` e `DropdownMenu`. Contratos em `docs/contracts/{popover,dropdown-menu}.md`.\n\n' +
          'Nenhum dos dois é modal: não têm véu, não prendem o foco e não tornam a página inerte. ' +
          'O que os separa é o teclado — dentro de um menu, `Tab` **fecha** e as setas navegam.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const PopoverPadrao: Story = {
  name: 'Popover',
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Detalhes do setor</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div style={{ display: 'grid', gap: 'var(--rp-space-2xs)', fontFamily: 'var(--rp-typography-family-default)' }}>
          <strong>Setor Centro</strong>
          <span style={{ fontSize: '0.875rem', color: 'var(--rp-color-text-secondary)' }}>
            120 vagas · 84 ocupadas · 08h às 18h
          </span>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const MenuPadrao: Story = {
  name: 'DropdownMenu',
  parameters: {
    docs: {
      description: {
        story:
          'Sete partes, não as quinze do shadcn. Submenu, item de rádio, item de checkbox e ' +
          '`Shortcut` ficaram de fora — nenhuma tela os chama, e o submenu é a parcela mais complexa ' +
          'de acertar em teclado. Entram quando houver demanda.',
      },
    },
  },
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Ações</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Ticket ABC1D23</DropdownMenuLabel>
        <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
        <DropdownMenuItem>Estender tempo</DropdownMenuItem>
        <DropdownMenuItem disabled>Transferir vaga</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Cancelar ticket</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const AuditoriaDeTeclado: Story = {
  name: 'Auditoria — teclado e modalidade',
  parameters: {
    docs: {
      description: {
        story:
          '**Complemento da passada 4.** Há botões antes e depois dos gatilhos, de propósito.\n\n' +
          'No **Popover**:\n' +
          '1. Abra e pressione Tab. O foco **pode** sair do painel — ele não é modal.\n' +
          '2. Com o popover aberto, use `Insert`+↓. O conteúdo da página **deve** continuar sendo ' +
          'lido. Se ficar mudo, estamos escondendo a página sem prender o foco, que é o pior dos ' +
          'dois mundos: a pessoa alcança o que foi escondido e ouve silêncio.\n' +
          '3. `Escape` fecha e devolve o foco ao gatilho.\n\n' +
          'No **DropdownMenu**:\n' +
          '4. Abra e navegue com `↓`. Deve percorrer os itens e **circular** ao chegar no fim — o ' +
          'Radix não circula por padrão, e ligamos isso de propósito.\n' +
          '5. O item desabilitado deve ser **anunciado**, não pulado. Pular esconde que a opção existe.\n' +
          '6. Pressione `Tab`. O menu deve **fechar** — dentro de um menu, Tab não navega.\n' +
          '7. `Escape` fecha e devolve o foco ao gatilho.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--rp-space-md)', alignItems: 'center' }}>
      <Button variant="ghost" size="sm">
        antes
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <p style={{ fontFamily: 'var(--rp-typography-family-default)', fontSize: '0.875rem' }}>
            A página atrás continua acessível.
          </p>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Primeiro</DropdownMenuItem>
          <DropdownMenuItem disabled>Segundo, indisponível</DropdownMenuItem>
          <DropdownMenuItem>Terceiro</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="ghost" size="sm">
        depois
      </Button>
    </div>
  ),
};
