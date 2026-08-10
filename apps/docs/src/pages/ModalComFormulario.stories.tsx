import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@venice-sistemas/react';

/**
 * Reprodução da estrutura do diálogo de edição do parking-new-front.
 *
 * Reproduz de propósito tudo o que aquele diálogo faz de incomum, porque é a
 * combinação que se suspeita de quebrar o foco:
 *
 *   - `p-0` e `overflow-hidden` no conteúdo
 *   - cabeçalho inteiro em `sr-only`
 *   - um campo `readOnly` pintado como se fosse desabilitado
 *   - checkboxes envolvidos por `<label>` estilizado como cartão clicável
 */
const meta = {
  title: 'Composições/Modal com formulário',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Verificação de armadilha de foco num diálogo com formulário. Use **Tab de verdade** — ' +
          'evento de teclado despachado por JS não move foco, e o teste passaria medindo nada.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const CIDADES = [
  { id: '1', nome: 'Indaiatuba', uf: 'SP' },
  { id: '2', nome: 'Marília', uf: 'SP' },
  { id: '3', nome: 'Patrocínio', uf: 'MG' },
];

export const EstruturaDoApp: Story = {
  name: 'Estrutura do app',
  parameters: {
    docs: {
      description: {
        story:
          'Abra e pressione Tab repetidamente. O foco deve circular entre: campo Nome, ' +
          'campo E-mail (que é `readOnly` e **por isso é focável**), as três caixas, Cancelar e ' +
          'Salvar — e voltar ao início. Nunca deve alcançar o botão "atrás", que está sob o véu.',
      },
    },
  },
  render: function Render() {
    const [aberto, setAberto] = useState(false);
    const [marcadas, setMarcadas] = useState<string[]>(['1', '2']);

    return (
      <div style={{ display: 'flex', gap: 'var(--rp-space-md)' }}>
        <Button variant="ghost" size="sm">
          atrás
        </Button>
        <Button onClick={() => setAberto(true)}>Editar usuário</Button>
        <Button variant="ghost" size="sm">
          atrás também
        </Button>

        <Dialog open={aberto} onOpenChange={setAberto}>
          <DialogContent className="ds:gap-0 ds:overflow-hidden ds:p-0">
            <DialogHeader className="ds:sr-only">
              <DialogTitle>Editar usuário</DialogTitle>
              <DialogDescription>As cidades marcadas substituem as atuais.</DialogDescription>
            </DialogHeader>

            <div style={{ display: 'grid', gap: 'var(--rp-space-md)', padding: 'var(--rp-space-lg)' }}>
              <div style={{ display: 'grid', gap: 'var(--rp-space-2xs)' }}>
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" defaultValue="Administrador" />
              </div>

              <div style={{ display: 'grid', gap: 'var(--rp-space-2xs)' }}>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" value="admin@prefeitura.gov.br" readOnly />
              </div>

              <div role="group" aria-label="Cidades" style={{ display: 'grid', gap: '0.5rem' }}>
                {CIDADES.map((c) => {
                  const marcada = marcadas.includes(c.id);
                  return (
                    <label
                      key={c.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        border: '1px solid var(--rp-color-border-default)',
                        borderRadius: 'var(--rp-radius-control)',
                        padding: '0.75rem 0.875rem', cursor: 'pointer',
                        fontFamily: 'var(--rp-typography-family-default)', fontSize: '0.875rem',
                      }}
                    >
                      <Checkbox
                        checked={marcada}
                        onCheckedChange={(v) =>
                          setMarcadas((a) => (v === true ? [...a, c.id] : a.filter((x) => x !== c.id)))
                        }
                      />
                      <span style={{ flex: 1 }}>{c.nome}</span>
                      <span style={{ color: 'var(--rp-color-text-secondary)' }}>{c.uf}</span>
                    </label>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: 'var(--rp-space-sm)', justifyContent: 'flex-end' }}>
                <Button variant="outline" onClick={() => setAberto(false)}>
                  Cancelar
                </Button>
                <Button>Salvar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
};
