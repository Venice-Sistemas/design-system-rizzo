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
  AlertDialogTrigger,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
} from '@venice-sistemas/react';

/**
 * Dialog e AlertDialog na mesma página.
 *
 * A auditoria os verifica junto porque eles compartilham armadilha e retorno de
 * foco — o mecanismo que falha ou passa é o mesmo. O que os separa cabe numa
 * comparação lado a lado, e é o que a última story faz.
 */
const meta = {
  title: 'Componentes/Modal',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '`Dialog` e `AlertDialog`. Contratos em `docs/contracts/{dialog,alert-dialog}.md`.\n\n' +
          'Visualmente são o mesmo componente. Todas as diferenças são de comportamento, e todas ' +
          'apontam para a mesma regra: o `AlertDialog` **exige uma decisão**.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Padrao: Story = {
  name: 'Dialog',
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Editar setor</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar setor</DialogTitle>
          <DialogDescription>As alterações valem a partir do próximo ticket.</DialogDescription>
        </DialogHeader>
        <div style={{ display: 'grid', gap: 'var(--rp-space-2xs)' }}>
          <Label htmlFor="nome-setor">Nome</Label>
          <Input id="nome-setor" defaultValue="Centro" />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Confirmacao: Story = {
  name: 'AlertDialog',
  parameters: {
    docs: {
      description: {
        story:
          'O título diz **o que vai acontecer**, não pede confirmação genérica. "Tem certeza?" não ' +
          'permite decidir; "Excluir esta irregularidade?" permite.\n\n' +
          '`AlertDialogAction` não é `destructive` por padrão — nem toda confirmação apaga algo, e ' +
          'vermelho em toda confirmação dessensibiliza para o vermelho que importa.',
      },
    },
  },
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Excluir irregularidade</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir esta irregularidade?</AlertDialogTitle>
          <AlertDialogDescription>
            A foto e o registro de autuação serão removidos. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const AuditoriaDeFoco: Story = {
  name: 'Auditoria — foco e diferença',
  parameters: {
    docs: {
      description: {
        story:
          '**Passada 4 da auditoria.** Faça o roteiro nos dois, na ordem:\n\n' +
          '1. Abra pelo gatilho. Deve anunciar "diálogo" **e o título**, e depois a descrição.\n' +
          '2. Tab várias vezes. O foco deve **circular dentro** do diálogo, sem escapar.\n' +
          '3. `Insert`+↓ com o diálogo aberto. Só o conteúdo dele deve ser lido.\n' +
          '4. Role a página. Ela **não** deve rolar atrás do véu.\n' +
          '5. Feche. O foco deve voltar ao gatilho, **e ele deve ser anunciado**.\n\n' +
          'O passo 5 é o mais frequentemente quebrado e o mais invisível para quem usa mouse: o ' +
          'foco cai no `body`, o leitor cala, e a pessoa recomeça do topo da página.\n\n' +
          'Depois, só no AlertDialog:\n\n' +
          '6. Pressione `Escape`. **Nada** deve acontecer.\n' +
          '7. Reabra e pressione `Enter` de imediato. Deve **cancelar** — se confirmar, o foco ' +
          'inicial está no botão errado, e isso é uma ação destrutiva.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--rp-space-md)' }}>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Abrir Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispensável</DialogTitle>
            <DialogDescription>Fecha com Escape, com clique fora e pelo X.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button>Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">Abrir AlertDialog</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exige decisão</AlertDialogTitle>
            <AlertDialogDescription>
              Não fecha com Escape nem com clique fora, e não tem X. As duas saídas são botões.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  ),
};
