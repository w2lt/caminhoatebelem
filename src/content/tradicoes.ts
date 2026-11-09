/**
 * Conteúdo catequético: presépio, coroa do Advento, cores litúrgicas e orações tradicionais.
 * Textos explicativos AUTORAIS (revisão editorial pendente). Orações tradicionais da Igreja
 * (Pai-Nosso, Ave-Maria, Glória) na forma de uso comum no Brasil.
 */

export interface Secao {
  titulo: string;
  texto: string;
}

export const presepio = {
  introducao:
    'O presépio representa o nascimento de Jesus em Belém. É uma tradição muito querida da Igreja, que ajuda a contemplar com simplicidade o mistério de Deus que se fez homem. A tradição atribui a São Francisco de Assis a primeira encenação do presépio, em Greccio (Itália), no ano de 1223.',
  dataSugerida:
    'Muitas famílias montam o presépio no 1º Domingo do Advento e colocam o Menino Jesus na manjedoura somente na celebração do Natal. Trata-se de uma tradição opcional, não de uma obrigação litúrgica: escolha a data que for melhor para a sua família.',
  personagens: [
    { nome: 'Menino Jesus', significado: 'O Filho de Deus feito homem, centro do presépio. Pela tradição, é colocado na manjedoura na noite de Natal.' },
    { nome: 'Maria', significado: 'A Mãe de Jesus, que acolheu a vontade de Deus com fé e guardava tudo no coração.' },
    { nome: 'José', significado: 'O esposo de Maria, homem justo, que protegeu e cuidou da Sagrada Família.' },
    { nome: 'Manjedoura', significado: 'O cocho onde os animais comem. Jesus, o Pão da Vida, nasce num lugar pobre e simples.' },
    { nome: 'Pastores', significado: 'Gente simples e trabalhadora, os primeiros a receber o anúncio dos anjos e a visitar o Menino.' },
    { nome: 'Anjo', significado: 'Mensageiro de Deus que anuncia aos pastores a grande alegria do nascimento do Salvador.' },
    { nome: 'Boi e jumento', significado: 'Presentes na tradição do presépio, recordam a humildade do lugar do nascimento e a criação que acolhe o Criador.' },
    { nome: 'Estrela', significado: 'Sinal que guiou os Magos até Jesus. Lembra que Cristo é a luz que orienta o caminho.' },
    { nome: 'Reis Magos', significado: 'Sábios vindos do Oriente que representam todos os povos. Pela tradição, chegam ao presépio na Epifania.' },
  ],
  tutorial: [
    'Escolha um lugar de destaque e de fácil acesso na casa, onde a família possa rezar.',
    'Prepare a base: uma caixa, tecido ou madeira. Pode usar musgo, papel pardo, pedras e galhos.',
    'Monte a gruta ou estábulo e coloque Maria e José próximos à manjedoura vazia.',
    'Acrescente pastores, animais e o anjo. Os Magos podem ficar mais distantes e "caminhar" até a Epifania.',
    'Coloque a estrela no alto. Se usar luzes, prefira as de baixa voltagem e nunca as deixe ligadas sem supervisão.',
    'Envolva as crianças: cada uma pode cuidar de uma peça ou fazer peças de papel e argila.',
    'Na celebração do Natal, coloque o Menino Jesus na manjedoura e rezem juntos.',
  ],
  oracao:
    'Senhor Deus, ao montarmos este presépio queremos preparar também o nosso coração. Que estas imagens simples nos lembrem do teu amor, que se fez pequeno para estar conosco. Abençoa esta casa e todos os que nela vivem. Que, ao chegar o Natal, Jesus encontre em nós um lugar acolhedor. Amém.',
  oracaoMenino:
    'Menino Jesus, hoje te colocamos na manjedoura com alegria e gratidão. Sê bem-vindo em nossa casa! Abençoa nossa família, os que estão longe e os que estão sozinhos neste Natal. Amém.',
  canticoId: 'canto-presepio',
};

export const coroa = {
  secoes: [
    { titulo: 'Origem e significado', texto: 'A coroa do Advento é uma tradição de origem europeia, difundida entre os cristãos a partir do século XIX. Ela marca a passagem das quatro semanas de preparação para o Natal: a cada domingo, acende-se mais uma vela, e a luz vai crescendo até a chegada de Cristo, Luz do mundo.' },
    { titulo: 'O círculo', texto: 'O formato circular, sem começo nem fim, lembra a eternidade de Deus e o seu amor que não acaba.' },
    { titulo: 'Os ramos verdes', texto: 'Os ramos verdes simbolizam a esperança e a vida que permanece. Podem ser naturais ou artificiais.' },
    { titulo: 'As velas', texto: 'São quatro velas, uma para cada domingo do Advento. A luz crescente expressa a expectativa pela vinda de Jesus. Algumas famílias acrescentam uma vela branca no centro, acesa no Natal.' },
    { titulo: 'Montagem em família', texto: 'Use uma base redonda, cubra com ramos verdes e prenda quatro velas com segurança. Coloque a coroa num lugar onde a família possa rezar junta. Nunca deixe velas acesas sem supervisão e mantenha-as longe de cortinas e de crianças pequenas.' },
    { titulo: 'Como acender', texto: 'Reúna a família, faça o sinal da cruz, leia uma passagem bíblica do domingo, acenda a(s) vela(s) correspondente(s) e reze a oração do domingo. Pode-se terminar com um canto e o Pai-Nosso.' },
  ] as Secao[],
  cores: {
    liturgicas:
      'A cor litúrgica do Advento é o ROXO, sinal de preparação, espera e conversão. No 3º Domingo (Domingo Gaudete, "Alegrai-vos"), a liturgia permite o uso do ROSA, sinal da alegria pela proximidade do Natal. No Natal, a cor é o BRANCO. As cores litúrgicas seguem as normas da Igreja e se referem às vestes e aos paramentos da celebração.',
    velas:
      'As cores das velas da coroa são uma tradição popular e variam entre comunidades: há quem use três roxas e uma rosa (para o 3º domingo), quatro roxas, quatro brancas, ou velas de cores diferentes. Nenhuma dessas opções é obrigatória: siga o costume da sua comunidade.',
  },
  domingos: [
    { domingo: 1, cor: 'Roxo', oracao: 'Senhor Jesus, acendemos esta primeira vela como sinal de vigilância. Desperta-nos do sono da indiferença e prepara os nossos corações para a tua vinda. Que esta luz nos lembre que tu estás chegando. Vem, Senhor Jesus! Amém.' },
    { domingo: 2, cor: 'Roxo', oracao: 'Senhor Jesus, acendemos a segunda vela para preparar o teu caminho. Aplaina em nós o orgulho e enche os vazios do desânimo. Que a nossa casa seja lugar de conversão e de paz. Vem, Senhor Jesus! Amém.' },
    { domingo: 3, cor: 'Rosa permitido (Gaudete)', oracao: 'Senhor Jesus, acendemos a terceira vela neste domingo da alegria. Tu estás perto! Enche a nossa família de alegria verdadeira, que nasce de ti e se partilha com os outros. Vem, Senhor Jesus! Amém.' },
    { domingo: 4, cor: 'Roxo', oracao: 'Senhor Jesus, acendemos a quarta vela, com Maria, que te esperou com amor. Que, como ela, digamos "sim" à vontade do Pai. Faltam poucos dias: nasce em nós! Vem, Senhor Jesus! Amém.' },
  ],
};

export const oracoesTradicionais = [
  { titulo: 'Sinal da cruz', texto: 'Em nome do Pai, e do Filho, e do Espírito Santo. Amém.' },
  { titulo: 'Pai-Nosso', texto: 'Pai nosso que estais nos céus, santificado seja o vosso nome; venha a nós o vosso reino; seja feita a vossa vontade, assim na terra como no céu. O pão nosso de cada dia nos dai hoje; perdoai-nos as nossas ofensas, assim como nós perdoamos a quem nos tem ofendido; e não nos deixeis cair em tentação, mas livrai-nos do mal. Amém.' },
  { titulo: 'Ave-Maria', texto: 'Ave Maria, cheia de graça, o Senhor é convosco; bendita sois vós entre as mulheres, e bendito é o fruto do vosso ventre, Jesus. Santa Maria, Mãe de Deus, rogai por nós, pecadores, agora e na hora de nossa morte. Amém.' },
  { titulo: 'Glória ao Pai', texto: 'Glória ao Pai, e ao Filho, e ao Espírito Santo. Como era no princípio, agora e sempre. Amém.' },
  { titulo: 'Oração antes da ceia de Natal (autoral)', texto: 'Senhor Jesus, obrigado por estarmos reunidos nesta noite santa. Abençoa esta mesa, as mãos que a prepararam e todos que a partilham. Lembra-te dos que não têm o que comer e dos que estão sozinhos. Que o teu amor seja o centro da nossa festa. Amém.' },
];

/** Explicação das cores litúrgicas (para a tela de liturgia). */
export const CORES_LITURGICAS: Record<string, { nome: string; sentido: string; hex: string }> = {
  roxo: { nome: 'Roxo', sentido: 'Preparação, espera e conversão.', hex: '#60377D' },
  rosa: { nome: 'Rosa', sentido: 'Alegria pela proximidade do Senhor (3º Domingo do Advento).', hex: '#D99AB5' },
  branco: { nome: 'Branco', sentido: 'Festa, alegria e glória (Natal, solenidades de Nosso Senhor e de Nossa Senhora).', hex: '#F2EEE4' },
  vermelho: { nome: 'Vermelho', sentido: 'Espírito Santo e martírio (festas dos apóstolos e mártires).', hex: '#A3262A' },
  verde: { nome: 'Verde', sentido: 'Esperança e crescimento (Tempo Comum).', hex: '#476D57' },
};
