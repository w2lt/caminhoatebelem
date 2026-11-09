import { Link } from 'react-router-dom';
import { Card, PageHeader } from '../../ui/kit';

export function PrivacidadePage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Privacidade e armazenamento" back="/mais" />
      <Card>
        <div className="leitura space-y-3">
          <p>
            <strong>Seus dados ficam no seu celular.</strong> Agenda, intenções de oração, marcações, dados do Círculo Bíblico, PDFs importados e preferências são guardados apenas no armazenamento local do navegador (IndexedDB) deste aparelho.
          </p>
          <p>
            <strong>Não pedimos cadastro.</strong> O app não solicita nome, e-mail ou telefone para funcionar e não usa anúncios, rastreadores ou ferramentas de análise.
          </p>
          <p>
            <strong>Nada é enviado aos nossos servidores</strong>, com uma única exceção opcional: se a sua compra exigir ativação, o app envia o código de ativação e um identificador aleatório do aparelho (sem dados pessoais) para validar a licença.
          </p>
          <p>
            <strong>Links externos</strong> (liturgia completa, WhatsApp) abrem sites de terceiros, que têm suas próprias políticas.
          </p>
          <p>
            <strong>Risco de perda:</strong> se você limpar os dados do navegador, desinstalar o app ou trocar de aparelho, os dados locais são apagados. Faça backups regularmente em{' '}
            <Link to="/backup" className="font-semibold text-roxo underline">
              Mais → Backup
            </Link>
            .
          </p>
          <p>
            <strong>LGPD:</strong> como os dados não saem do aparelho, você tem controle total sobre eles. Para apagar tudo, limpe os dados do site nas configurações do navegador ou desinstale o app.
          </p>
        </div>
      </Card>
    </div>
  );
}
