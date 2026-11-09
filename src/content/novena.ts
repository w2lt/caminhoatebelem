/**
 * Novena de Natal do Caminho até Belém — 9 encontros (sugestão: 16 a 24 de dezembro).
 * Conteúdo ORIGINAL. As leituras são apresentadas por referência + resumo autoral
 * (leia o texto na sua Bíblia ou na fonte oficial). Revisão editorial: "pendente".
 */
import type { EncontroNovena } from './schema';

export const SINAL_DA_CRUZ = 'Em nome do Pai, e do Filho, e do Espírito Santo. Amém.';

/** Roteiro comum a todos os encontros. */
export const ROTEIRO = [
  'Acolhida',
  'Sinal da cruz',
  'Oração inicial',
  'Leitura bíblica',
  'Reflexão',
  'Preces e intenções',
  'Gesto concreto',
  'Oração final',
  'Cântico',
] as const;

type Base = Omit<EncontroNovena, 'revisao' | 'dataSugerida'>;
const e = (b: Base): EncontroNovena => ({ ...b, dataSugerida: `2026-12-${String(15 + b.numero)}`, revisao: 'pendente' });

export const novena: EncontroNovena[] = [
  e({
    numero: 1, titulo: 'A promessa', tema: 'Deus cumpre o que promete',
    acolhida: 'Sejam bem-vindos ao primeiro encontro da nossa Novena de Natal. Hoje começamos a última etapa do caminho até Belém, lembrando que Deus nunca esquece suas promessas.',
    oracaoInicial: 'Deus fiel, reunidos em teu nome, começamos esta novena com o coração aberto. Tu prometeste um Salvador ao teu povo e cumpriste a tua palavra. Renova em nós a esperança e prepara-nos para acolher o teu Filho. Por Cristo, nosso Senhor. Amém.',
    leitura: { referencia: 'Is 7,10-14', resumo: 'O profeta anuncia um sinal dado pelo próprio Senhor: a jovem conceberá e dará à luz um filho, chamado Emanuel, "Deus conosco".', validacao: 'pendente' },
    reflexao: 'Quando o rei Acaz não quis pedir um sinal, Deus mesmo o ofereceu. O nome do menino é o centro do Natal: Deus conosco. Não estamos sozinhos em nenhuma situação. A promessa feita há séculos se cumpre em Jesus e continua se cumprindo em nossa vida.',
    perguntas: ['Que promessa de Deus mais me sustenta hoje?', 'Em que momento senti que Deus estava comigo?'],
    preces: { resposta: 'Vem, Senhor, Deus conosco!', intencoes: ['Pela Igreja, para que seja sinal de esperança no mundo.', 'Pelas famílias que perderam a esperança.', 'Por todos os que esperam uma resposta de Deus.', 'Por nossa família e nossa comunidade.'] },
    gesto: 'Escreva num papel uma promessa de Deus que você quer guardar e coloque perto do presépio.',
    oracaoFinal: 'Senhor, tu és o Deus conosco. Fica em nossa casa e em nossa vida durante esta novena e sempre. Que, ao chegar o Natal, encontremos o coração preparado para te receber. Amém.',
    canticoId: 'vinde-emanuel',
  }),
  e({
    numero: 2, titulo: 'O rebento de Jessé', tema: 'Deus faz brotar vida nova',
    acolhida: 'Bem-vindos ao segundo encontro. Hoje contemplamos a esperança que nasce onde menos se espera.',
    oracaoInicial: 'Senhor, do tronco de Jessé fizeste brotar um rebento cheio do teu Espírito. Derrama sobre nós a sabedoria, o conselho e a fortaleza, para que vivamos como teus filhos. Por Cristo, nosso Senhor. Amém.',
    leitura: { referencia: 'Is 11,1-5', resumo: 'Do tronco de Jessé surgirá um broto sobre o qual repousará o Espírito do Senhor. Ele julgará os pobres com justiça e defenderá os humildes.', validacao: 'pendente' },
    reflexao: 'Um tronco cortado parece sem futuro. Mas Deus faz nascer dele um broto. O Messias vem com o Espírito e traz justiça para os pobres. Onde há desânimo, Deus pode recomeçar. Nossa família também pode florescer de novo.',
    perguntas: ['Que área da minha vida precisa de um recomeço?', 'Como posso defender os mais fracos ao meu redor?'],
    preces: { resposta: 'Senhor, faze florescer a esperança!', intencoes: ['Pelos pobres e pelos que sofrem injustiça.', 'Pelos jovens, para que encontrem sentido na vida.', 'Pelos que estão desanimados.', 'Pelas intenções deste encontro.'] },
    gesto: 'Ajude alguém que está passando por dificuldade, com um gesto concreto.',
    oracaoFinal: 'Deus da vida, faz brotar em nós a esperança. Que o teu Espírito nos torne justos e misericordiosos, preparando o caminho do teu Filho. Amém.',
    canticoId: 'vem-senhor',
  }),
  e({
    numero: 3, titulo: 'José, o homem justo', tema: 'Escutar e confiar',
    acolhida: 'Bem-vindos ao terceiro encontro. Hoje aprendemos com São José a escutar Deus e cuidar de quem Ele nos confia.',
    oracaoInicial: 'Deus Pai, escolheste José para guardar Jesus e Maria. Dá-nos um coração atento à tua voz e mãos dispostas a cuidar. Por Cristo, nosso Senhor. Amém.',
    leitura: { referencia: 'Mt 1,18-24', resumo: 'José, homem justo, pensa em deixar Maria em segredo. Em sonho, o anjo lhe pede que não tenha medo de recebê-la. José acorda e faz como o anjo mandou.', validacao: 'pendente' },
    reflexao: 'José enfrenta uma situação que não entende. Em vez de agir com dureza, escuta e confia. Sua resposta não são palavras, mas atitudes: ele acolhe Maria e o Menino. A fé verdadeira se mostra no cuidado.',
    perguntas: ['Como reajo quando os planos não saem como eu esperava?', 'Quem Deus confiou aos meus cuidados?'],
    preces: { resposta: 'São José, rogai por nós!', intencoes: ['Pelos pais de família.', 'Pelos trabalhadores e desempregados.', 'Pelos que precisam tomar decisões difíceis.', 'Pelas famílias da nossa comunidade.'] },
    gesto: 'Faça um serviço silencioso em casa, sem esperar reconhecimento.',
    oracaoFinal: 'São José, guarda da Sagrada Família, protege nossas famílias. Ensina-nos a escutar Deus e a confiar n’Ele em todas as situações. Amém.',
    canticoId: 'o-vinde-adoremos',
  }),
  e({
    numero: 4, titulo: 'Zacarias e Isabel', tema: 'Deus ouve a nossa oração',
    acolhida: 'Bem-vindos ao quarto encontro. Hoje lembramos que Deus escuta as orações feitas com perseverança.',
    oracaoInicial: 'Senhor, tu ouviste a súplica de Zacarias e Isabel. Escuta também as nossas preces e fortalece a nossa fé quando a resposta demora. Por Cristo, nosso Senhor. Amém.',
    leitura: { referencia: 'Lc 1,5-25', resumo: 'O anjo anuncia ao sacerdote Zacarias que sua esposa Isabel, já idosa, terá um filho chamado João. Zacarias duvida e fica mudo até o cumprimento da promessa.', validacao: 'pendente' },
    reflexao: 'Zacarias e Isabel eram justos e esperaram muito tempo. Deus agiu no momento certo. O silêncio de Zacarias nos ensina que, às vezes, é preciso calar para escutar o que Deus está fazendo.',
    perguntas: ['Que pedido tenho feito a Deus há muito tempo?', 'Tenho reservado momentos de silêncio para escutar Deus?'],
    preces: { resposta: 'Senhor, escuta a nossa prece!', intencoes: ['Pelos casais que desejam ter filhos.', 'Pelos idosos de nossa família e comunidade.', 'Pelos que perderam a fé por causa da espera.', 'Pelas intenções de cada um.'] },
    gesto: 'Visite ou ligue para uma pessoa idosa.',
    oracaoFinal: 'Deus fiel, obrigado porque nunca deixas de nos ouvir. Que saibamos esperar com fé e reconhecer a tua ação no tempo certo. Amém.',
    canticoId: 'rorate-caeli',
  }),
  e({
    numero: 5, titulo: 'O sim de Maria', tema: 'Faça-se em mim',
    acolhida: 'Bem-vindos ao quinto encontro. Hoje contemplamos o "sim" de Maria, que abriu as portas para o Salvador.',
    oracaoInicial: 'Deus Altíssimo, escolheste Maria para ser a Mãe do teu Filho. Ajuda-nos a dizer "sim" à tua vontade, com a mesma confiança dela. Por Cristo, nosso Senhor. Amém.',
    leitura: { referencia: 'Lc 1,26-38', resumo: 'O anjo Gabriel anuncia a Maria que ela será mãe do Filho do Altíssimo. Maria pergunta como isso acontecerá e, ao ouvir a resposta, se declara serva do Senhor.', validacao: 'pendente' },
    reflexao: 'Maria fez perguntas, mas não fechou o coração. Seu "faça-se" não foi resignação, mas confiança livre. Deus continua pedindo a nossa colaboração para que Jesus nasça no mundo de hoje.',
    perguntas: ['A que Deus está me pedindo para dizer "sim"?', 'O que me impede de confiar plenamente?'],
    preces: { resposta: 'Maria, Mãe de Jesus, rogai por nós!', intencoes: ['Pelas mães, especialmente as que enfrentam dificuldades.', 'Pelas gestantes e pelas crianças que vão nascer.', 'Pelos que estão discernindo a vocação.', 'Por nossa família.'] },
    gesto: 'Diga "sim" a algo que Deus lhe pede e que você vinha adiando.',
    oracaoFinal: 'Santa Maria, Mãe de Deus, ensina-nos a dizer "sim" com confiança. Leva-nos até Jesus neste Natal. Amém.',
    canticoId: 'alma-redemptoris',
  }),
  e({
    numero: 6, titulo: 'A Visitação', tema: 'Levar Jesus aos outros',
    acolhida: 'Bem-vindos ao sexto encontro. Hoje seguimos Maria na visita a Isabel e aprendemos a servir com alegria.',
    oracaoInicial: 'Senhor, Maria levou Jesus à casa de Isabel e encheu tudo de alegria. Faze de nós portadores da tua presença. Por Cristo, nosso Senhor. Amém.',
    leitura: { referencia: 'Lc 1,39-45', resumo: 'Maria vai às pressas visitar Isabel. Ao ouvir a saudação, o menino salta no ventre de Isabel, que, cheia do Espírito, chama Maria de bendita e feliz porque acreditou.', validacao: 'pendente' },
    reflexao: 'Maria não guarda a notícia para si: vai servir. E a sua presença traz alegria. Quem carrega Jesus não fica parado; vai ao encontro de quem precisa. A visita é um gesto simples que pode mudar o dia de alguém.',
    perguntas: ['Quem precisa da minha visita neste Natal?', 'Minha presença leva alegria ou peso aos outros?'],
    preces: { resposta: 'Senhor, faze-nos portadores de alegria!', intencoes: ['Pelos doentes e pelos que estão sozinhos.', 'Pelos agentes da Pastoral da Saúde e visitadores.', 'Pelos vizinhos de nossa rua.', 'Pelas intenções deste encontro.'] },
    gesto: 'Visite alguém que está sozinho ou doente (ou faça uma chamada).',
    oracaoFinal: 'Maria da Visitação, ensina-nos a sair de nós mesmos e a levar Jesus aos irmãos com alegria e prontidão. Amém.',
    canticoId: 'magnificat',
  }),
  e({
    numero: 7, titulo: 'O canto de Maria', tema: 'Gratidão e humildade',
    acolhida: 'Bem-vindos ao sétimo encontro. Hoje rezamos com Maria o seu cântico de louvor.',
    oracaoInicial: 'Deus santo, tu olhas para a humildade dos teus servos. Que o nosso coração se alegre em ti e cante as tuas maravilhas. Por Cristo, nosso Senhor. Amém.',
    leitura: { referencia: 'Lc 1,46-55', resumo: 'Maria engrandece o Senhor: Ele olhou para a sua humildade, derruba os poderosos, eleva os humildes, sacia os famintos e se lembra da sua misericórdia.', validacao: 'pendente' },
    reflexao: 'O Magnificat é o canto de quem reconhece que tudo é dom. Maria canta um Deus que vira a lógica do mundo: exalta os pequenos e sacia os famintos. A gratidão nos torna humildes e nos compromete com os pobres.',
    perguntas: ['Quais são as maravilhas que Deus fez em minha vida neste ano?', 'Como posso ser sinal do cuidado de Deus com os pobres?'],
    preces: { resposta: 'A minha alma engrandece o Senhor!', intencoes: ['Pelos humildes e esquecidos.', 'Pelos que passam fome.', 'Pelos governantes, para que sirvam ao bem comum.', 'Em ação de graças pelas bênçãos deste ano.'] },
    gesto: 'Doe algo de valor para quem precisa — não o que sobra, mas o que faz falta.',
    oracaoFinal: 'Senhor, com Maria te damos graças por tudo. Que nossa vida seja um Magnificat de louvor e serviço. Amém.',
    canticoId: 'magnificat',
  }),
  e({
    numero: 8, titulo: 'O nascimento de João', tema: 'Deus é misericordioso',
    acolhida: 'Bem-vindos ao oitavo encontro. Hoje celebramos o nascimento de João Batista, o precursor.',
    oracaoInicial: 'Deus de misericórdia, o nome de João anuncia a tua bondade. Purifica os nossos corações e prepara-nos para o Natal. Por Cristo, nosso Senhor. Amém.',
    leitura: { referencia: 'Lc 1,57-66', resumo: 'Isabel dá à luz um filho. Os vizinhos querem chamá-lo Zacarias, mas o pai escreve: "João é o seu nome". Sua boca se abre e ele louva a Deus.', validacao: 'pendente' },
    reflexao: 'O nome "João" lembra que Deus é misericordioso. Quando Zacarias obedece, volta a falar e bendiz o Senhor. A misericórdia de Deus nos solta a voz para o louvor e para a reconciliação. É tempo de perdoar e de pedir perdão.',
    perguntas: ['Com quem preciso me reconciliar antes do Natal?', 'Já procurei o sacramento da Confissão neste Advento?'],
    preces: { resposta: 'Senhor, tende piedade de nós!', intencoes: ['Pelas famílias divididas.', 'Pelos que guardam mágoas.', 'Pelos sacerdotes que atendem confissões neste tempo.', 'Por nós, para que vivamos o perdão.'] },
    gesto: 'Dê um passo de reconciliação: uma mensagem, um abraço, um pedido de perdão.',
    oracaoFinal: 'Pai de misericórdia, abre a nossa boca para te louvar e o nosso coração para perdoar. Que cheguemos ao Natal em paz. Amém.',
    canticoId: 'vinde-emanuel',
  }),
  e({
    numero: 9, titulo: 'Belém', tema: 'O Verbo se fez carne',
    acolhida: 'Bem-vindos ao último encontro da novena! Chegamos a Belém. Hoje contemplamos o mistério de Deus que se fez pequeno.',
    oracaoInicial: 'Deus Pai, tanto amaste o mundo que nos deste o teu Filho. Neste último encontro, preparamos o presépio do nosso coração para recebê-lo. Por Cristo, nosso Senhor. Amém.',
    leitura: { referencia: 'Lc 2,1-7', resumo: 'Por causa do recenseamento, José e Maria vão a Belém. Lá Maria dá à luz o seu filho, envolve-o em faixas e o deita numa manjedoura, porque não havia lugar para eles na hospedaria.', validacao: 'pendente' },
    reflexao: 'Não havia lugar na hospedaria. Deus nasce fora, na simplicidade de uma manjedoura. O Natal nos pergunta: há lugar para Jesus em nossa casa, em nossa agenda, em nosso coração? Ele vem pobre para que ninguém tenha medo de se aproximar.',
    perguntas: ['Que lugar Jesus terá no meu Natal?', 'Como posso acolher os que hoje "não têm lugar"?'],
    preces: { resposta: 'Vem, Senhor Jesus!', intencoes: ['Pelos que não têm casa nem família.', 'Pelos que passarão o Natal no hospital ou na prisão.', 'Pelos que trabalham na noite de Natal.', 'Em ação de graças por esta novena.'] },
    gesto: 'Prepare um lugar à mesa (ou um prato) para partilhar com quem não tem.',
    oracaoFinal: 'Menino Jesus, encerramos esta novena com gratidão. Nasce em nossa casa, em nossa família e em nosso coração. Que a tua paz permaneça conosco. Amém.',
    canticoId: 'noite-feliz',
  }),
];

export function convite(n: EncontroNovena, quando?: string, onde?: string): string {
  return [
    `Convite — Novena de Natal`,
    `${n.numero}º encontro: ${n.titulo} (${n.tema})`,
    quando ? `Quando: ${quando}` : '',
    onde ? `Onde: ${onde}` : '',
    'Venha rezar conosco e preparar o coração para o Natal!',
  ]
    .filter(Boolean)
    .join('\n');
}
