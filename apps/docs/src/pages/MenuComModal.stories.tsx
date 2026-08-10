import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@venice-sistemas/react';

/**
 * Abrir um modal a partir de um item de menu.
 *
 * É a composição mais comum numa tabela — o "…" de cada linha abre um menu, e um
 * dos itens pede confirmação. E é onde o foco quebra de um jeito que ninguém
 * percebe usando mouse.
 *
 * Ao selecionar o item, DUAS coisas disputam o foco ao mesmo tempo: o menu
 * fechando devolve o foco ao gatilho, e o diálogo abrindo tenta prender o foco
 * dentro dele. Quem vence é o menu, porque a devolução acontece depois.
 *
 * O resultado é um diálogo aberto com o foco lá fora: Tab passeia pela página de
 * trás, que está coberta pelo véu e não recebe clique.
 */
const meta = {
  title: 'Composições/Menu abrindo modal',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Reprodução de um defeito de foco que só aparece quando menu e modal se ' +
          'combinam. Use Tab para verificar — com mouse os dois parecem idênticos.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

function Linha({ prevenirDevolucao }: { prevenirDevolucao: boolean }) {
  const [aberto, setAberto] = useState(false);

  return (
    <div style={{ display: 'flex', gap: 'var(--rp-space-md)', alignItems: 'center' }}>
      <Button variant="ghost" size="sm">
        antes
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Ações</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          // Quando um item abre um modal, o menu NÃO deve devolver o foco ao
          // gatilho: o diálogo já o levou para dentro dele.
          onCloseAutoFocus={prevenirDevolucao ? (evento) => evento.preventDefault() : undefined}
        >
          <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setAberto(true)}>
            Desativar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="ghost" size="sm">
        depois
      </Button>

      <AlertDialog open={aberto} onOpenChange={setAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar Administrador?</AlertDialogTitle>
            <AlertDialogDescription>
              O cadastro é preservado e é possível reativar depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive">Desativar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export const MenuAbrindoModal: Story = {
  name: 'Menu abrindo modal',
  parameters: {
    docs: {
      description: {
        story:
          'Abra o menu, selecione "Desativar" e pressione Tab. O foco deve entrar no diálogo e ' +
          'circular dentro dele — nunca alcançar os botões de trás do véu, que estão cobertos ' +
          'e não recebem clique.\n\n' +
          'Verificado com Tab real: o foco entra em "Cancelar" e circula. Se algum dia escapar, ' +
          'é aqui que aparece.',
      },
    },
  },
  render: () => <Linha prevenirDevolucao={false} />,
};

export const Corrigido: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'O mesmo, com `onCloseAutoFocus` prevenido no conteúdo do menu. O foco entra no ' +
          'diálogo e Tab circula dentro dele.\n\n' +
          'A prevenção vale só para esta composição: um menu que fecha por Escape, sem abrir ' +
          'nada, deve continuar devolvendo o foco ao gatilho.',
      },
    },
  },
  render: () => <Linha prevenirDevolucao />,
};
