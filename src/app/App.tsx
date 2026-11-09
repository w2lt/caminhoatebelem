import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Layout, useAppearance } from './Layout';
import { ToastProvider } from '../ui/feedback';
import { useSettings } from '../db/settings';
import { db } from '../db/database';
import { licenseStatus, type LicenseStatus } from '../services/activation';
import { HomePage } from '../features/home/HomePage';
const RezarPage = lazy(() => import('../features/rezar/RezarPage').then((m) => ({ default: m.RezarPage })));
const DiaPage = lazy(() => import('../features/rezar/DiaPage').then((m) => ({ default: m.DiaPage })));
const OracoesPage = lazy(() => import('../features/rezar/OracoesPage').then((m) => ({ default: m.OracoesPage })));
const LiturgiaPage = lazy(() => import('../features/liturgia/LiturgiaPage').then((m) => ({ default: m.LiturgiaPage })));
const NovenaPage = lazy(() => import('../features/novena/NovenaPage').then((m) => ({ default: m.NovenaPage })));
const EncontroPage = lazy(() => import('../features/novena/EncontroPage').then((m) => ({ default: m.EncontroPage })));
const CirculoPage = lazy(() => import('../features/circulo/CirculoPage').then((m) => ({ default: m.CirculoPage })));
const PdfViewerPage = lazy(() => import('../features/circulo/PdfViewerPage').then((m) => ({ default: m.PdfViewerPage })));
const AgendaPage = lazy(() => import('../features/agenda/AgendaPage').then((m) => ({ default: m.AgendaPage })));
const EventFormPage = lazy(() => import('../features/agenda/EventFormPage').then((m) => ({ default: m.EventFormPage })));
const MissasPage = lazy(() => import('../features/agenda/MissasPage').then((m) => ({ default: m.MissasPage })));
const MaisPage = lazy(() => import('../features/mais/MaisPage').then((m) => ({ default: m.MaisPage })));
const PresepioPage = lazy(() => import('../features/tradicoes/PresepioPage').then((m) => ({ default: m.PresepioPage })));
const CoroaPage = lazy(() => import('../features/tradicoes/CoroaPage').then((m) => ({ default: m.CoroaPage })));
const CanticosPage = lazy(() => import('../features/tradicoes/CanticosPage').then((m) => ({ default: m.CanticosPage })));
const FamiliaPage = lazy(() => import('../features/tradicoes/FamiliaPage').then((m) => ({ default: m.FamiliaPage })));
const LembretesPage = lazy(() => import('../features/mais/LembretesPage').then((m) => ({ default: m.LembretesPage })));
const AjustesPage = lazy(() => import('../features/mais/AjustesPage').then((m) => ({ default: m.AjustesPage })));
const BackupPage = lazy(() => import('../features/mais/BackupPage').then((m) => ({ default: m.BackupPage })));
const AjudaPage = lazy(() => import('../features/mais/AjudaPage').then((m) => ({ default: m.AjudaPage })));
const PrivacidadePage = lazy(() => import('../features/mais/PrivacidadePage').then((m) => ({ default: m.PrivacidadePage })));
const BoasVindasPage = lazy(() => import('../features/mais/BoasVindasPage').then((m) => ({ default: m.BoasVindasPage })));
const AtivacaoPage = lazy(() => import('../features/mais/AtivacaoPage').then((m) => ({ default: m.AtivacaoPage })));

function Splash() {
  return (
    <div className="ceu grid min-h-dvh place-items-center" role="status">
      <div className="grid justify-items-center gap-4">
        <img src="/icon.svg" alt="" className="size-20 rounded-[1.4rem] shadow-[var(--shadow-elevada)]" />
        <p className="font-display text-3xl text-creme">Caminho até Belém</p>
        <span className="sr-only">Carregando…</span>
      </div>
    </div>
  );
}

/** Ordem: ativação comercial (se exigida) → boas-vindas (1º uso) → app. */
function Gate() {
  useAppearance();
  const settings = useSettings();
  const license = useLiveQuery(() => db.license.get('license'), []);
  const [status, setStatus] = useState<LicenseStatus | null>(null);
  useEffect(() => {
    licenseStatus().then(setStatus);
  }, [license]);

  if (!settings || !status) return <Splash />;
  if (status.state === 'missing' || status.state === 'invalid' || status.state === 'misconfigured') {
    return (
      <Suspense fallback={<Splash />}>
        <AtivacaoPage status={status} />
      </Suspense>
    );
  }
  if (!settings.onboarded) return (
    <Suspense fallback={<Splash />}>
      <BoasVindasPage />
    </Suspense>
  );

  return (
    <Suspense fallback={<Splash />}>
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="rezar" element={<RezarPage />} />
        <Route path="rezar/oracoes" element={<OracoesPage />} />
        <Route path="dia/:data" element={<DiaPage />} />
        <Route path="liturgia/:data" element={<LiturgiaPage />} />
        <Route path="novena" element={<NovenaPage />} />
        <Route path="novena/:n" element={<EncontroPage />} />
        <Route path="circulo" element={<CirculoPage />} />
        <Route path="circulo/pdf/:id" element={<PdfViewerPage />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="agenda/novo" element={<EventFormPage />} />
        <Route path="agenda/:id" element={<EventFormPage />} />
        <Route path="missas" element={<MissasPage />} />
        <Route path="mais" element={<MaisPage />} />
        <Route path="presepio" element={<PresepioPage />} />
        <Route path="coroa" element={<CoroaPage />} />
        <Route path="canticos" element={<CanticosPage />} />
        <Route path="familia" element={<FamiliaPage />} />
        <Route path="lembretes" element={<LembretesPage />} />
        <Route path="ajustes" element={<AjustesPage />} />
        <Route path="backup" element={<BackupPage />} />
        <Route path="ajuda" element={<AjudaPage />} />
        <Route path="privacidade" element={<PrivacidadePage />} />
        <Route path="licenca" element={<AtivacaoPage status={status} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
    </Suspense>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Gate />
      </ToastProvider>
    </BrowserRouter>
  );
}
