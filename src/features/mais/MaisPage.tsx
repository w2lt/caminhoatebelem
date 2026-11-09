import { Users, Church, Sparkles, Flame, Music, Home, Bell, Settings2, DatabaseBackup, HelpCircle, ShieldCheck, KeyRound } from 'lucide-react';
import { readConfig } from '../../services/activation';
import { MenuLink, PageHeader } from '../../ui/kit';

export function MaisPage() {
  const comercial = readConfig().required;
  return (
    <div className="space-y-6">
      <PageHeader title="Mais" />
      <section aria-labelledby="m-comunidade" className="grid gap-2">
        <h2 id="m-comunidade" className="font-bold text-tinta-suave">
          Comunidade
        </h2>
        <MenuLink to="/circulo" icon={Users} title="Novena do Círculo Bíblico" desc="Encontros, famílias e PDF da comunidade" tone="verde" />
        <MenuLink to="/missas" icon={Church} title="Missas de Natal" desc="Horários das celebrações" tone="dourado" />
      </section>
      <section aria-labelledby="m-tradicoes" className="grid gap-2">
        <h2 id="m-tradicoes" className="font-bold text-tinta-suave">
          Tradições
        </h2>
        <MenuLink to="/presepio" icon={Sparkles} title="Presépio" desc="Significado, montagem e lembrete" tone="verde" />
        <MenuLink to="/coroa" icon={Flame} title="Coroa do Advento" desc="Velas, cores e orações dos domingos" tone="dourado" />
        <MenuLink to="/canticos" icon={Music} title="Cânticos" desc="Por ocasião e minha lista" tone="rosa" />
        <MenuLink to="/familia" icon={Home} title="Advento em família" desc="Um convite simples por dia" tone="rosa" />
      </section>
      <section aria-labelledby="m-app" className="grid gap-2">
        <h2 id="m-app" className="font-bold text-tinta-suave">
          Aplicativo
        </h2>
        <MenuLink to="/lembretes" icon={Bell} title="Lembretes" desc="Oração, coroa, novena, presépio e Missas" />
        <MenuLink to="/ajustes" icon={Settings2} title="Tamanho do texto e contraste" />
        <MenuLink to="/backup" icon={DatabaseBackup} title="Backup e restauração" desc="Guarde uma cópia dos seus dados" />
        <MenuLink to="/ajuda" icon={HelpCircle} title="Instalar e ajuda" desc="Android, iPhone e suporte" />
        <MenuLink to="/privacidade" icon={ShieldCheck} title="Privacidade e armazenamento" />
        {comercial && <MenuLink to="/licenca" icon={KeyRound} title="Minha licença" />}
      </section>
      <p className="text-center text-sm text-tinta-suave">Caminho até Belém · versão {__APP_VERSION__}</p>
    </div>
  );
}
