import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, AlertDescription, AlertTitle, Button, type AlertTone } from '@venice-sistemas/react';

const TONS: AlertTone[] = ['info', 'success', 'warning', 'danger'];

const meta = {
  title: 'Componentes/Alert',
  component: Alert,
  parameters: {
    docs: {
      description: {
        component:
          'Mensagem persistente sobre o estado de algo na tela. Contrato em `docs/contracts/alert.md`.\n\n' +
          '**Tom e urgência são coisas diferentes.** `tone` é cor; `urgent` é se o leitor de tela ' +
          'interrompe o que está lendo. O shadcn junta as duas e fixa `role="alert"` em todo alerta — ' +
          'o que faz uma caixa informativa já renderizada interromper a leitura sem motivo, e quem ' +
          'enxerga nunca percebe o defeito.',
      },
    },
  },
  args: { children: 'Não foi possível salvar as alterações.' },
  argTypes: {
    tone: { control: 'inline-radio', options: TONS },
    urgent: { control: 'boolean' },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = { name: 'Padrão' };

export const Tons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Quatro, não os dois do shadcn. As quatro famílias de feedback já existem nos tokens, com ' +
          'superfície, borda, texto e ícone medidos no contrato de contraste, **nos dois temas**. ' +
          'Expor só `default` e `destructive` deixaria as outras serem improvisadas com opacidade.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--rp-space-sm)', maxWidth: '32rem' }}>
      {TONS.map((tone) => (
        <Alert key={tone} tone={tone}>
          <AlertTitle>{tone}</AlertTitle>
          <AlertDescription>Mensagem de exemplo para o tom {tone}.</AlertDescription>
        </Alert>
      ))}
    </div>
  ),
};

export const AuditoriaDeInterrupcao: Story = {
  name: 'Auditoria — quando interrompe',
  parameters: {
    docs: {
      description: {
        story:
          '**Passada 3 da auditoria, e a que exige o áudio.** O que se verifica aqui é *quando* algo ' +
          'é dito, não o quê.\n\n' +
          'Comece a ler o parágrafo longo com `Insert`+↓. Enquanto ele lê, acione um dos botões.\n\n' +
          '- **Polido**: o parágrafo deve **terminar**, e só então o alerta é anunciado.\n' +
          '- **Urgente**: o alerta deve **cortar** o parágrafo no meio.\n\n' +
          'Se os dois se comportarem igual, a separação entre tom e urgência não está funcionando — ' +
          'e aí ela é complexidade sem benefício, e vale reverter para o comportamento do shadcn.',
      },
    },
  },
  render: function AuditoriaRender() {
    const [mensagem, setMensagem] = useState<{ urgente: boolean; n: number } | null>(null);

    return (
      <div style={{ display: 'grid', gap: 'var(--rp-space-lg)', maxWidth: '38rem' }}>
        <div style={{ display: 'flex', gap: 'var(--rp-space-sm)' }}>
          <Button size="sm" onClick={() => setMensagem({ urgente: false, n: Date.now() })}>
            Surgir polido
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setMensagem({ urgente: true, n: Date.now() })}>
            Surgir urgente
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setMensagem(null)}>
            Limpar
          </Button>
        </div>

        {mensagem && (
          <Alert key={mensagem.n} tone={mensagem.urgente ? 'danger' : 'info'} urgent={mensagem.urgente}>
            <AlertTitle>{mensagem.urgente ? 'Falha ao salvar' : 'Sincronização concluída'}</AlertTitle>
            <AlertDescription>
              {mensagem.urgente
                ? 'A conexão caiu durante o envio. Nada foi gravado.'
                : 'Os setores foram atualizados há instantes.'}
            </AlertDescription>
          </Alert>
        )}

        <p style={{ fontFamily: 'var(--rp-typography-family-default)', lineHeight: 1.7 }}>
          O estacionamento rotativo do Setor Centro opera das oito às dezoito horas, de segunda a
          sábado, com cento e vinte vagas distribuídas entre as ruas principais e as transversais.
          A tarifa é cobrada por hora cheia, com tolerância de quinze minutos na entrada, e o
          pagamento pode ser feito por saldo pré-pago, cartão, PIX ou dinheiro nos pontos de venda
          credenciados. Vagas isentas e especiais seguem regra própria, definida por decreto
          municipal, e não entram na contagem de ocupação para efeito de relatório.
        </p>
      </div>
    );
  },
};

export const NaoRecebeFoco: Story = {
  name: 'Auditoria — não é focável',
  parameters: {
    docs: {
      description: {
        story:
          'Pressione Tab repetidamente. O alerta **não** deve aparecer na ordem de tabulação: região ' +
          'viva é anunciada sem receber foco, e um alerta focável faz quem navega por teclado parar ' +
          'nele sem poder fazer nada.\n\n' +
          'Confirme também que o ícone **não** é mencionado — a informação está no texto.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--rp-space-sm)', flexDirection: 'column', maxWidth: '32rem' }}>
      <Button size="sm">antes</Button>
      <Alert tone="warning">
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 5v4M8 11.5h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <AlertTitle>Tolerância ativa</AlertTitle>
        <AlertDescription>O veículo está nos primeiros quinze minutos.</AlertDescription>
      </Alert>
      <Button size="sm">depois</Button>
    </div>
  ),
};
