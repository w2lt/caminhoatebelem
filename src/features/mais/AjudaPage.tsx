import { Smartphone, Apple, LifeBuoy, WifiOff, DatabaseBackup, Monitor, Download, CheckCircle2 } from 'lucide-react';
import { promptInstall, useInstallState } from '../../services/install';
import { Button, Card, ExternalLink, PageHeader, cx } from '../../ui/kit';
import { useToast } from '../../ui/feedback';

export const SUPPORT_URL = import.meta.env.VITE_SUPPORT_URL || '';

/** Botão grande que abre a janela "Instalar" do navegador (Android e computador). */
export function InstallButton({ className }: { className?: string }) {
  const state = useInstallState();
  const toast = useToast();
  if (state === 'instalado') {
    return (
      <Card className={cx('bg-verde-claro', className)}>
        <p className="flex items-center gap-2 font-bold text-verde">
          <CheckCircle2 aria-hidden className="size-5 shrink-0" /> O app já está instalado. Abra pelo ícone com a estrela dourada.
        </p>
      </Card>
    );
  }
  if (state !== 'disponivel') return null;
  return (
    <Button
      full
      icon={Download}
      className={className}
      onClick={async () => {
        if (await promptInstall()) toast('Pronto! O ícone do Caminho até Belém foi criado.');
      }}
    >
      Instalar e criar o ícone
    </Button>
  );
}

export function InstallSteps() {
  return (
    <div className="grid gap-3">
      <InstallButton />
      <Card aria-labelledby="android">
        <h2 id="android" className="flex items-center gap-2 font-display text-[1.625rem] leading-tight text-roxo">
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
        <h2 id="iphone" className="flex items-center gap-2 font-display text-[1.625rem] leading-tight text-roxo">
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
      <Card aria-labelledby="computador">
        <h2 id="computador" className="flex items-center gap-2 font-display text-[1.625rem] leading-tight text-roxo">
          <Monitor aria-hidden className="size-5" /> Computador (Chrome ou Edge)
        </h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6">
          <li>Abra o link do app no <strong>Chrome</strong> ou no <strong>Edge</strong>.</li>
          <li>
            Clique no ícone de <strong>instalar</strong> no fim da barra de endereço (monitor com seta) ou no menu <strong>⋮</strong> → <strong>Instalar Caminho até Belém</strong>.
          </li>
          <li>Confirme. O ícone aparece na <strong>área de trabalho</strong> e no menu Iniciar.</li>
        </ol>
      </Card>
    </div>
  );
}

export function AjudaPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Instalar e ajuda" back="/mais" />
      <InstallSteps />
      <Card>
        <h2 className="flex items-center gap-2 font-bold">
          <WifiOff aria-hidden className="size-5 text-roxo" /> Funciona sem internet?
        </h2>
        <p className="mt-1">
          Sim. Depois de aberto uma vez com internet, as orações, a liturgia (referências), a novena, a agenda, os PDFs importados e os conteúdos sobre presépio e coroa funcionam offline. Só os links para fontes externas precisam de conexão.
        </p>
      </Card>
      <Card>
        <h2 className="flex items-center gap-2 font-bold">
          <DatabaseBackup aria-hidden className="size-5 text-roxo" /> Vou trocar de celular. E agora?
        </h2>
        <p className="mt-1">Faça um backup em Mais → Backup, envie o arquivo para você mesmo (e-mail, Drive ou WhatsApp) e restaure no celular novo.</p>
      </Card>
      <Card>
        <h2 className="flex items-center gap-2 font-bold">
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
