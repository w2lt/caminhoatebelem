import { Smartphone, Apple, LifeBuoy, WifiOff, DatabaseBackup } from 'lucide-react';
import { capabilities } from '../../services/reminders';
import { Card, ExternalLink, PageHeader } from '../../ui/kit';

export const SUPPORT_URL = import.meta.env.VITE_SUPPORT_URL || '';

export function InstallSteps() {
  return (
    <div className="grid gap-3">
      <Card aria-labelledby="android">
        <h2 id="android" className="flex items-center gap-2 font-serif text-lg font-bold text-roxo">
          <Smartphone aria-hidden className="size-5" /> Android (Chrome)
        </h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6">
          <li>Abra o link do app no <strong>Chrome</strong>.</li>
          <li>
            Toque nos <strong>três pontinhos (⋮)</strong> no canto de cima.
          </li>
          <li>
            Toque em <strong>Instalar aplicativo</strong> (ou "Adicionar à tela inicial").
          </li>
          <li>Confirme. O ícone com a estrela dourada aparece na tela inicial.</li>
        </ol>
      </Card>
      <Card aria-labelledby="iphone">
        <h2 id="iphone" className="flex items-center gap-2 font-serif text-lg font-bold text-roxo">
          <Apple aria-hidden className="size-5" /> iPhone (Safari)
        </h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6">
          <li>Abra o link do app no <strong>Safari</strong>.</li>
          <li>
            Toque no botão <strong>Compartilhar</strong> (quadrado com seta para cima).
          </li>
          <li>
            Role e toque em <strong>Adicionar à Tela de Início</strong>.
          </li>
          <li>
            Toque em <strong>Adicionar</strong>. Abra sempre pelo ícone da tela inicial.
          </li>
        </ol>
      </Card>
    </div>
  );
}

export function AjudaPage() {
  const cap = capabilities();
  return (
    <div className="space-y-4">
      <PageHeader title="Instalar e ajuda" back="/mais" />
      {cap.standalone && (
        <Card className="border-2 border-verde">
          <p className="font-semibold text-verde">O app já está instalado neste aparelho.</p>
        </Card>
      )}
      <InstallSteps />
      <Card>
        <h2 className="flex items-center gap-2 font-semibold">
          <WifiOff aria-hidden className="size-5 text-roxo" /> Funciona sem internet?
        </h2>
        <p className="mt-1">
          Sim. Depois de aberto uma vez com internet, as orações, a liturgia (referências), a novena, a agenda, os PDFs importados e os conteúdos sobre presépio e coroa funcionam offline. Só os links para fontes externas precisam de conexão.
        </p>
      </Card>
      <Card>
        <h2 className="flex items-center gap-2 font-semibold">
          <DatabaseBackup aria-hidden className="size-5 text-roxo" /> Vou trocar de celular. E agora?
        </h2>
        <p className="mt-1">Faça um backup em Mais → Backup, envie o arquivo para você mesmo (e-mail, Drive ou WhatsApp) e restaure no celular novo.</p>
      </Card>
      <Card>
        <h2 className="flex items-center gap-2 font-semibold">
          <LifeBuoy aria-hidden className="size-5 text-roxo" /> Suporte
        </h2>
        {SUPPORT_URL ? (
          <p className="mt-1">
            Precisa de ajuda? <ExternalLink href={SUPPORT_URL}>Fale com o suporte</ExternalLink>.
          </p>
        ) : (
          <p className="mt-1">Use o contato de suporte informado no e-mail da sua compra.</p>
        )}
      </Card>
    </div>
  );
}
