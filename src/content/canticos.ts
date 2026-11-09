/**
 * Biblioteca de cânticos. Política de direitos (ver CONTENT_GUIDE.md):
 *  - Letra só é incluída quando a obra está em DOMÍNIO PÚBLICO (texto original latino/gregoriano)
 *    ou quando houver licença registrada.
 *  - Traduções e versões brasileiras podem ter direitos próprios: sem letra até confirmação.
 *  - Nenhuma gravação é incorporada. "linkAutorizado" só deve receber links oficiais de detentores.
 */
import type { Cantico, OcasiaoCantico } from './schema';

export const OCASIOES: Record<OcasiaoCantico, string> = {
  advento: 'Advento',
  coroa: 'Acendimento da coroa',
  presepio: 'Montagem do presépio',
  novena: 'Novena de Natal',
  familia: 'Encontros familiares',
  vespera: 'Véspera de Natal',
  natal: 'Natal do Senhor',
};

export const canticos: Cantico[] = [
  {
    id: 'rorate-caeli', titulo: 'Rorate Caeli', ocasioes: ['advento', 'coroa', 'novena'],
    descricao: 'Antífona gregoriana do Advento, inspirada em Isaías: o céu derrame o Justo como orvalho. Muito usada nas celebrações deste tempo.',
    fonte: 'Canto gregoriano tradicional (texto latino, domínio público).', direitos: 'dominio-publico',
    letra: 'Rorate caeli desuper, et nubes pluant iustum.\n\n(Tradução livre: Céus, derramai lá do alto o orvalho, e as nuvens chovam o Justo.)',
    revisao: 'pendente',
  },
  {
    id: 'vinde-emanuel', titulo: 'Vinde, ó vinde, Emanuel (Veni, Veni, Emmanuel)', ocasioes: ['advento', 'coroa', 'novena'],
    descricao: 'Hino tradicional do Advento baseado nas antífonas "Ó" das férias maiores (17 a 23 de dezembro).',
    fonte: 'Hino latino tradicional (domínio público). Versões em português podem ter direitos próprios.', direitos: 'dominio-publico',
    letra: 'Veni, veni, Emmanuel;\ncaptivum solve Israel,\nqui gemit in exsilio,\nprivatus Dei Filio.\nGaude! Gaude! Emmanuel\nnascetur pro te, Israel!',
    revisao: 'pendente',
  },
  {
    id: 'vem-senhor', titulo: 'Vem, Senhor (canto de Advento da comunidade)', ocasioes: ['advento', 'coroa', 'novena'],
    descricao: 'Espaço para o canto de Advento mais usado na sua paróquia. Muitos cantos litúrgicos brasileiros têm direitos autorais: consulte o folheto ou hinário da comunidade.',
    fonte: 'Hinário/folheto da comunidade.', direitos: 'protegido-sem-licenca',
    revisao: 'pendente',
  },
  {
    id: 'alma-redemptoris', titulo: 'Alma Redemptoris Mater', ocasioes: ['advento', 'novena', 'familia'],
    descricao: 'Antífona mariana própria do Advento e do Natal, cantada ao final da Oração da Noite.',
    fonte: 'Antífona latina tradicional (domínio público).', direitos: 'dominio-publico',
    letra: 'Alma Redemptoris Mater, quae pervia caeli\nporta manes, et stella maris, succurre cadenti,\nsurgere qui curat, populo: tu quae genuisti,\nnatura mirante, tuum sanctum Genitorem,\nVirgo prius ac posterius, Gabrielis ab ore\nsumens illud Ave, peccatorum miserere.',
    revisao: 'pendente',
  },
  {
    id: 'magnificat', titulo: 'Magnificat', ocasioes: ['novena', 'familia', 'advento'],
    descricao: 'O cântico de Maria (Lc 1,46-55), rezado ou cantado na Oração da Tarde. Há muitas melodias; use a da sua comunidade.',
    fonte: 'Texto bíblico (Lc 1,46-55). Melodias e traduções podem ter direitos próprios.', direitos: 'dominio-publico',
    letra: 'Magnificat anima mea Dominum,\net exsultavit spiritus meus in Deo salutari meo.',
    revisao: 'pendente',
  },
  {
    id: 'o-vinde-adoremos', titulo: 'Ó vinde, adoremos (Adeste Fideles)', ocasioes: ['natal', 'vespera', 'presepio', 'novena'],
    descricao: 'Hino natalino clássico que convida os fiéis a ir a Belém adorar o Rei recém-nascido.',
    fonte: 'Hino latino do séc. XVIII (domínio público). Versões em português podem ter direitos próprios.', direitos: 'dominio-publico',
    letra: 'Adeste fideles, laeti triumphantes,\nvenite, venite in Bethlehem.\nNatum videte Regem angelorum.\nVenite adoremus, venite adoremus,\nvenite adoremus Dominum.',
    revisao: 'pendente',
  },
  {
    id: 'noite-feliz', titulo: 'Noite Feliz (Stille Nacht)', ocasioes: ['natal', 'vespera', 'presepio', 'familia', 'novena'],
    descricao: 'Composta em 1818 por Franz Gruber (música) e Joseph Mohr (letra). A obra original é de domínio público; confirme a situação da versão em português usada antes de reproduzir a letra.',
    fonte: 'Gruber/Mohr, 1818 (original em domínio público).', direitos: 'protegido-sem-licenca',
    revisao: 'pendente',
  },
  {
    id: 'gloria-in-excelsis', titulo: 'Glória a Deus nas alturas (Gloria in excelsis Deo)', ocasioes: ['natal', 'vespera', 'presepio'],
    descricao: 'O canto dos anjos aos pastores. Refrão latino tradicional muito cantado no Natal.',
    fonte: 'Refrão latino tradicional (domínio público).', direitos: 'dominio-publico',
    letra: 'Gloria in excelsis Deo!',
    revisao: 'pendente',
  },
  {
    id: 'canto-presepio', titulo: 'Canto para a montagem do presépio (da comunidade)', ocasioes: ['presepio', 'familia'],
    descricao: 'Escolha um canto natalino conhecido pela família para cantar enquanto montam o presépio.',
    fonte: 'Hinário/folheto da comunidade.', direitos: 'protegido-sem-licenca',
    revisao: 'pendente',
  },
];

export function canticoById(id: string) {
  return canticos.find((c) => c.id === id);
}
