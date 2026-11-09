import { useState } from 'react';
import { KeyRound, CheckCircle2, LifeBuoy } from 'lucide-react';
import { activate, ActivationError, type LicenseStatus } from '../../services/activation';
import { Button, Card, ExternalLink, PageHeader, TextField } from '../../ui/kit';
import { SUPPORT_URL } from './AjudaPage';

/**
 * Ativação comercial. Só aparece quando VITE_ACTIVATION_MODE=required.
 * Requer conexão apenas na ativação; depois a verificação é local (offline).
 */
export function AtivacaoPage({ status }: { status: LicenseStatus }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (status.state === 'active' || status.state === 'not-required') {
    return (
      <div className="space-y-4">
        <PageHeader title="Minha licença" back="/mais" />
        <Card className="bg-verde-claro">
          <p className="flex items-center gap-2 font-bold text-verde">
            <CheckCircle2 aria-hidden className="size-6" /> {status.state === 'active' ? 'App ativado neste aparelho.' : 'Este app não exige ativação.'}
          </p>
          {status.state === 'active' && <p className="mt-1 text-tinta-suave">Ativado em {new Date(status.activatedAt).toLocaleDateString('pt-BR')}.</p>}
        </Card>
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-dvh max-w-lg bg-creme px-4 py-8">
      <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-roxo">
        <KeyRound aria-hidden className="size-8 text-dourado" />
      </div>
      <h1 className="mt-4 text-center font-display text-[2rem] leading-tight text-roxo">Ativar o Caminho até Belém</h1>
      <p className="mt-2 text-center text-tinta-suave">Digite o código de ativação que você recebeu por e-mail após a compra. É preciso internet só agora.</p>

      {status.state === 'misconfigured' && (
        <p role="alert" className="mt-4 rounded-2xl bg-rosa-claro p-4 font-bold text-erro">
          A ativação ainda não está configurada nesta versão do app. Fale com o suporte.
        </p>
      )}
      {status.state === 'invalid' && (
        <p role="alert" className="mt-4 rounded-2xl bg-rosa-claro p-4 font-bold text-erro">
          A licença deste aparelho não é válida ({status.reason}). Ative novamente.
        </p>
      )}

      <form
        className="mt-6 grid gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          setBusy(true);
          try {
            await activate(code);
          } catch (err) {
            setError(err instanceof ActivationError ? err.message : 'Não foi possível ativar. Tente novamente.');
          } finally {
            setBusy(false);
          }
        }}
      >
        <TextField
          label="Código de ativação"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="XXXX-XXXX-XXXX"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={40}
          error={error}
          className="text-center"
        />
        <Button type="submit" full disabled={busy || code.trim().length < 8}>
          {busy ? 'Ativando…' : 'Ativar'}
        </Button>
      </form>
      <p className="mt-6 flex items-center justify-center gap-2 text-tinta-suave">
        <LifeBuoy aria-hidden className="size-5" />
        {SUPPORT_URL ? <ExternalLink href={SUPPORT_URL}>Preciso de ajuda</ExternalLink> : 'Problemas? Use o contato de suporte do e-mail da compra.'}
      </p>
    </main>
  );
}
