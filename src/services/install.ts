/**
 * Instalação do app (ícone na tela inicial do celular / área de trabalho do computador).
 *
 * O navegador é quem cria o ícone: no Android (Chrome/Edge/Samsung) e no computador (Chrome/Edge)
 * ele oferece o evento `beforeinstallprompt`, que guardamos para abrir a janela "Instalar" com um
 * toque em um botão do próprio app. No iPhone/iPad não existe essa API: a instalação é sempre pelo
 * Safari → Compartilhar → "Adicionar à Tela de Início" (o app mostra o passo a passo).
 */
import { useSyncExternalStore } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type InstallState = 'disponivel' | 'instalado' | 'indisponivel';

let deferred: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: window-controls-overlay)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/** Deve ser chamado o mais cedo possível (main.tsx): o evento pode chegar antes das telas montarem. */
export function initInstallPrompt(): void {
  if (typeof window === 'undefined') return;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // nós mostramos o convite no momento certo, com botão grande
    deferred = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener('appinstalled', () => {
    installed = true;
    deferred = null;
    emit();
  });
}

export function installState(): InstallState {
  if (installed || isStandalone()) return 'instalado';
  return deferred ? 'disponivel' : 'indisponivel';
}

/** Abre a janela de instalação do navegador. Retorna true se a pessoa aceitou. */
export async function promptInstall(): Promise<boolean> {
  const ev = deferred;
  if (!ev) return false;
  deferred = null; // o evento só pode ser usado uma vez
  emit();
  await ev.prompt();
  const { outcome } = await ev.userChoice;
  if (outcome === 'accepted') {
    installed = true;
    emit();
    return true;
  }
  return false;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useInstallState(): InstallState {
  return useSyncExternalStore(subscribe, installState, () => 'indisponivel');
}
