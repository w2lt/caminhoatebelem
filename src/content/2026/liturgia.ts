/**
 * Liturgia diária — Advento e Natal de 2026 (Ano B para os domingos; Brasil).
 *
 * POLÍTICA EDITORIAL
 *  - Apenas REFERÊNCIAS bíblicas do Lecionário Romano. Nenhum texto integral é reproduzido:
 *    não há licença registrada para a tradução litúrgica oficial (CNBB). O app mostra a referência
 *    e o link para a fonte oficial (requer conexão).
 *  - Todas as referências estão com validacao "pendente" até conferência com o Diretório
 *    Litúrgico da CNBB 2026 (ver CONTENT_PENDING_REVIEW.md). Ao aprovar, troque para "aprovado".
 *  - A aclamação ao Evangelho não foi cadastrada (texto próprio da tradução oficial): o app remete à fonte.
 *  - Reflexões e propósitos são AUTORAIS (revisaoReflexao "pendente").
 */
import type { Leitura, LiturgiaDia } from '../schema';

type Tipo = Leitura['tipo'];
const L = (tipo: Tipo, referencia: string, alternativa?: string): Leitura => ({ tipo, referencia, validacao: 'pendente', ...(alternativa ? { alternativa } : {}) });
const semana = (l1: string, sl: string, ev: string) => [L('1ª Leitura', l1), L('Salmo Responsorial', sl), L('Evangelho', ev)];
const domingo = (l1: string, sl: string, l2: string, ev: string) => [L('1ª Leitura', l1), L('Salmo Responsorial', sl), L('2ª Leitura', l2), L('Evangelho', ev)];

type Base = Omit<LiturgiaDia, 'id' | 'revisaoReflexao'>;
const dia = (b: Base): LiturgiaDia => ({ ...b, id: b.data, revisaoReflexao: 'pendente' });

export const liturgia2026: LiturgiaDia[] = [
  dia({
    data: '2026-11-29', celebracao: '1º Domingo do Advento', grau: 'Domingo', cor: 'roxo',
    observacao: 'Início do Ano Litúrgico (Ano B).',
    missas: [{ leituras: domingo('Is 63,16b-17.19b; 64,2b-7', 'Sl 79(80)', '1Cor 1,3-9', 'Mc 13,33-37') }],
    reflexao: 'Jesus pede um coração acordado. Vigiar não é viver com medo, mas com atenção amorosa: perceber Deus que passa nas pessoas, nos acontecimentos e no silêncio. O Advento começa convidando a tirar o pó do coração.',
    proposito: 'Escolher um momento fixo do dia para rezar durante todo o Advento.',
  }),
  dia({
    data: '2026-11-30', celebracao: 'Santo André, Apóstolo', grau: 'Festa', cor: 'vermelho',
    missas: [{ leituras: semana('Rm 10,9-18', 'Sl 18(19)', 'Mt 4,18-22') }],
    reflexao: 'André ouviu o chamado na beira do mar, no meio do trabalho. Deixou as redes porque encontrou alguém mais importante. O seguimento de Jesus começa no cotidiano e se torna anúncio: quem encontra o Senhor quer levar outros até Ele.',
    proposito: 'Deixar de lado, por hoje, algo que me distrai de Deus.',
  }),
  dia({
    data: '2026-12-01', celebracao: 'Terça-feira da 1ª Semana do Advento', grau: 'Dia de semana', cor: 'roxo',
    missas: [{ leituras: semana('Is 11,1-10', 'Sl 71(72)', 'Lc 10,21-24') }],
    reflexao: 'De um tronco que parecia morto nasce um broto cheio do Espírito. Deus faz recomeçar o que julgávamos perdido. E Jesus se alegra porque o Pai se revela aos pequenos: a simplicidade abre a porta do Reino.',
    proposito: 'Olhar com esperança para uma situação que parece sem saída.',
  }),
  dia({
    data: '2026-12-02', celebracao: 'Quarta-feira da 1ª Semana do Advento', grau: 'Dia de semana', cor: 'roxo',
    missas: [{ leituras: semana('Is 25,6-10a', 'Sl 22(23)', 'Mt 15,29-37') }],
    reflexao: 'Isaías anuncia um banquete para todos os povos; Jesus tem compaixão da multidão e multiplica os pães. Deus não é indiferente à fome nem à dor. Ele pede o pouco que temos para fazer muito.',
    proposito: 'Partilhar algo do que tenho com quem precisa.',
  }),
  dia({
    data: '2026-12-03', celebracao: 'Quinta-feira da 1ª Semana do Advento', grau: 'Memória', cor: 'roxo',
    observacao: 'Memória de São Francisco Xavier, presbítero (no Advento, a cor pode ser branca na memória).',
    missas: [{ leituras: semana('Is 26,1-6', 'Sl 117(118)', 'Mt 7,21.24-27') }],
    reflexao: 'Não basta dizer "Senhor, Senhor". A casa firme é construída sobre a Palavra colocada em prática. O Advento é tempo de conferir os alicerces: em que estou apoiando a minha vida?',
    proposito: 'Colocar em prática hoje uma palavra de Jesus que já conheço.',
  }),
  dia({
    data: '2026-12-04', celebracao: 'Sexta-feira da 1ª Semana do Advento', grau: 'Dia de semana', cor: 'roxo',
    missas: [{ leituras: semana('Is 29,17-24', 'Sl 26(27)', 'Mt 9,27-31') }],
    reflexao: 'Dois cegos seguem Jesus gritando por piedade. Ele pergunta se acreditam e toca os seus olhos. Também nós precisamos de olhos novos para enxergar a presença de Deus e a necessidade dos irmãos.',
    proposito: 'Pedir a Jesus que cure um modo de ver que me fecha aos outros.',
  }),
  dia({
    data: '2026-12-05', celebracao: 'Sábado da 1ª Semana do Advento', grau: 'Dia de semana', cor: 'roxo',
    missas: [{ leituras: semana('Is 30,19-21.23-26', 'Sl 146(147)', 'Mt 9,35–10,1.5a.6-8') }],
    reflexao: 'Jesus vê as multidões cansadas e pede operários para a messe. Em seguida envia os discípulos: de graça receberam, de graça devem dar. A compaixão se transforma em missão.',
    proposito: 'Oferecer meu tempo, de graça, a alguém que precisa.',
  }),
  dia({
    data: '2026-12-06', celebracao: '2º Domingo do Advento', grau: 'Domingo', cor: 'roxo',
    missas: [{ leituras: domingo('Is 40,1-5.9-11', 'Sl 84(85)', '2Pd 3,8-14', 'Mc 1,1-8') }],
    reflexao: '"Consolai o meu povo": o Advento é tempo de consolação. João Batista grita no deserto para que preparemos o caminho. Aplainar caminhos é tirar do coração o orgulho que levanta montanhas e o desânimo que cava abismos.',
    proposito: 'Identificar um "obstáculo no caminho" e dar um passo concreto para removê-lo.',
  }),
  dia({
    data: '2026-12-07', celebracao: 'Segunda-feira da 2ª Semana do Advento', grau: 'Memória', cor: 'roxo',
    observacao: 'Memória de Santo Ambrósio, bispo e doutor da Igreja.',
    missas: [{ leituras: semana('Is 35,1-10', 'Sl 84(85)', 'Lc 5,17-26') }],
    reflexao: 'Amigos abrem o telhado para levar um paralítico até Jesus. A fé deles move o Senhor, que perdoa e cura. Há pessoas que só chegarão a Jesus se alguém as carregar com perseverança e criatividade.',
    proposito: 'Rezar com insistência por alguém que está longe de Deus.',
  }),
  dia({
    data: '2026-12-08', celebracao: 'Imaculada Conceição da Bem-aventurada Virgem Maria', grau: 'Solenidade', cor: 'branco',
    observacao: 'Solenidade. No Brasil, quando 8/12 cai em domingo do Advento, é transferida para 9/12.',
    missas: [{ leituras: domingo('Gn 3,9-15.20', 'Sl 97(98)', 'Ef 1,3-6.11-12', 'Lc 1,26-38') }],
    reflexao: 'Deus preparou Maria desde o primeiro instante para ser a Mãe do Salvador. Cheia de graça, ela responde com liberdade: "faça-se". Onde o primeiro "não" trouxe a ruptura, o "sim" de Maria abre espaço para a salvação.',
    proposito: 'Dizer "sim" a Deus numa decisão concreta deste dia.',
  }),
  dia({
    data: '2026-12-09', celebracao: 'Quarta-feira da 2ª Semana do Advento', grau: 'Dia de semana', cor: 'roxo',
    observacao: 'Memória facultativa de São João Diego Cuauhtlatoatzin.',
    missas: [{ leituras: semana('Is 40,25-31', 'Sl 102(103)', 'Mt 11,28-30') }],
    reflexao: 'Quem espera no Senhor renova as forças. Jesus chama os cansados e oferece descanso: o seu jugo é suave porque Ele o carrega conosco. O Advento não é corrida de tarefas, mas caminho ao lado de quem nos sustenta.',
    proposito: 'Entregar a Jesus um cansaço ou preocupação, em oração sincera.',
  }),
  dia({
    data: '2026-12-10', celebracao: 'Quinta-feira da 2ª Semana do Advento', grau: 'Dia de semana', cor: 'roxo',
    missas: [{ leituras: semana('Is 41,13-20', 'Sl 144(145)', 'Mt 11,11-15') }],
    reflexao: '"Não tenhas medo, eu te ajudo", diz o Senhor. Jesus elogia João Batista e lembra que o menor no Reino é ainda maior. A grandeza, para Deus, está em acolher o Reino com humildade.',
    proposito: 'Agir hoje com coragem onde o medo costuma me paralisar.',
  }),
  dia({
    data: '2026-12-11', celebracao: 'Sexta-feira da 2ª Semana do Advento', grau: 'Dia de semana', cor: 'roxo',
    observacao: 'Memória facultativa de São Dâmaso I, papa.',
    missas: [{ leituras: semana('Is 48,17-19', 'Sl 1', 'Mt 11,16-19') }],
    reflexao: 'Deus ensina o que é bom, mas muitas vezes buscamos desculpas para não ouvir: nada nos agrada. A sabedoria se prova pelas obras. O Advento pede um coração disponível, que não adia a conversão.',
    proposito: 'Parar de adiar algo bom que Deus me pede.',
  }),
  dia({
    data: '2026-12-12', celebracao: 'Nossa Senhora de Guadalupe, Padroeira da América Latina', grau: 'Festa', cor: 'branco',
    observacao: 'Festa no Brasil. As leituras próprias precisam ser conferidas no Diretório Litúrgico da CNBB 2026 antes da publicação.',
    missas: [{ leituras: [L('1ª Leitura', 'Zc 2,14-17', 'ou Ap 11,19a; 12,1-6a.10ab'), L('Salmo Responsorial', 'Jt 13 (cântico)'), L('Evangelho', 'Lc 1,39-47')] }],
    reflexao: 'Maria se apressa para servir Isabel e leva Jesus consigo. Em Guadalupe, ela se fez próxima dos pequenos e falou a língua do seu povo. A Mãe de Deus caminha com a América Latina e nos ensina a visitar quem precisa.',
    proposito: 'Visitar ou ligar para alguém que está sozinho.',
  }),
  dia({
    data: '2026-12-13', celebracao: '3º Domingo do Advento (Gaudete)', grau: 'Domingo', cor: 'rosa',
    observacao: 'Domingo da Alegria: a cor rosa é permitida (o roxo também pode ser usado).',
    missas: [{ leituras: domingo('Is 61,1-2a.10-11', 'Cântico: Lc 1,46-48.49-50.53-54', '1Ts 5,16-24', 'Jo 1,6-8.19-28') }],
    reflexao: 'A Igreja convida à alegria porque o Senhor está perto. João não é a luz, mas testemunha da luz. A verdadeira alegria cristã não depende das circunstâncias: nasce de saber que Deus cumpre suas promessas.',
    proposito: 'Ser motivo de alegria para alguém hoje.',
  }),
  dia({
    data: '2026-12-14', celebracao: 'Segunda-feira da 3ª Semana do Advento', grau: 'Memória', cor: 'roxo',
    observacao: 'Memória de São João da Cruz, presbítero e doutor da Igreja.',
    missas: [{ leituras: semana('Nm 24,2-7.15-17a', 'Sl 24(25)', 'Mt 21,23-27') }],
    reflexao: 'Balaão vê de longe uma estrela que surge de Jacó. Os chefes questionam a autoridade de Jesus, mas não querem se comprometer com a verdade. Diante de Deus, só um coração sincero encontra respostas.',
    proposito: 'Ser sincero com Deus sobre algo que evito encarar.',
  }),
  dia({
    data: '2026-12-15', celebracao: 'Terça-feira da 3ª Semana do Advento', grau: 'Dia de semana', cor: 'roxo',
    missas: [{ leituras: semana('Sf 3,1-2.9-13', 'Sl 33(34)', 'Mt 21,28-32') }],
    reflexao: 'Um filho diz "não", mas depois se arrepende e vai; o outro diz "sim" e não vai. Deus olha para a vida, não só para as palavras. Sempre é tempo de mudar de ideia e fazer a vontade do Pai.',
    proposito: 'Cumprir uma promessa que deixei pela metade.',
  }),
  dia({
    data: '2026-12-16', celebracao: 'Quarta-feira da 3ª Semana do Advento', grau: 'Dia de semana', cor: 'roxo',
    missas: [{ leituras: semana('Is 45,6b-8.18.21b-25', 'Sl 84(85)', 'Lc 7,19-23') }],
    reflexao: 'João pergunta se Jesus é mesmo aquele que deve vir. Jesus responde com sinais: cegos veem, pobres recebem a Boa-Nova. Os sinais do Reino continuam onde há cuidado com os pequenos.',
    proposito: 'Realizar um sinal concreto do Reino em favor de um pobre ou doente.',
  }),
  dia({
    data: '2026-12-17', celebracao: '17 de dezembro', grau: 'Dia de semana', cor: 'roxo',
    observacao: 'Início das férias maiores do Advento: leituras próprias por data.',
    missas: [{ leituras: semana('Gn 49,2.8-10', 'Sl 71(72)', 'Mt 1,1-17') }],
    reflexao: 'A genealogia de Jesus tem santos e pecadores, reis e estrangeiros. Deus entra numa história real, cheia de luzes e sombras, e a conduz à salvação. Nenhuma história é pequena demais para Deus.',
    proposito: 'Agradecer a Deus pela história da minha família, com suas luzes e sombras.',
  }),
  dia({
    data: '2026-12-18', celebracao: '18 de dezembro', grau: 'Dia de semana', cor: 'roxo',
    missas: [{ leituras: semana('Jr 23,5-8', 'Sl 71(72)', 'Mt 1,18-24') }],
    reflexao: 'José é justo e silencioso. Diante do inesperado, escuta Deus no sonho e acolhe Maria e o Menino. A fé de José é feita de obediência confiante e cuidado concreto.',
    proposito: 'Acolher com paciência um imprevisto deste dia.',
  }),
  dia({
    data: '2026-12-19', celebracao: '19 de dezembro', grau: 'Dia de semana', cor: 'roxo',
    missas: [{ leituras: semana('Jz 13,2-7.24-25a', 'Sl 70(71)', 'Lc 1,5-25') }],
    reflexao: 'Zacarias e Isabel esperaram muito tempo. Deus ouviu a súplica no momento certo. Mesmo quando duvidamos, o Senhor continua fiel; o silêncio de Zacarias se torna tempo de amadurecer a fé.',
    proposito: 'Fazer alguns minutos de silêncio diante de Deus.',
  }),
  dia({
    data: '2026-12-20', celebracao: '4º Domingo do Advento', grau: 'Domingo', cor: 'roxo',
    missas: [{ leituras: domingo('2Sm 7,1-5.8b-12.14a.16', 'Sl 88(89)', 'Rm 16,25-27', 'Lc 1,26-38') }],
    reflexao: 'Davi quer construir uma casa para Deus, mas é Deus quem promete uma casa para Davi. Em Maria, a promessa se cumpre: ela se torna morada do Altíssimo. Deus quer habitar também em nós.',
    proposito: 'Preparar um "cantinho de oração" em casa para o Natal.',
  }),
  dia({
    data: '2026-12-21', celebracao: '21 de dezembro', grau: 'Dia de semana', cor: 'roxo',
    observacao: 'Memória facultativa de São Pedro Canísio (no Advento, apenas comemoração).',
    missas: [{ leituras: [L('1ª Leitura', 'Ct 2,8-14', 'ou Sf 3,14-18a'), L('Salmo Responsorial', 'Sl 32(33)'), L('Evangelho', 'Lc 1,39-45')] }],
    reflexao: 'Maria leva Jesus a Isabel, e o menino salta de alegria no ventre. Quem carrega Cristo espalha alegria. Bem-aventurada aquela que acreditou: a fé de Maria é o caminho para o Natal.',
    proposito: 'Levar uma palavra de alegria a alguém da família.',
  }),
  dia({
    data: '2026-12-22', celebracao: '22 de dezembro', grau: 'Dia de semana', cor: 'roxo',
    missas: [{ leituras: semana('1Sm 1,24-28', 'Cântico: 1Sm 2,1.4-5.6-7.8abcd', 'Lc 1,46-56') }],
    reflexao: 'Ana entrega Samuel ao Senhor; Maria proclama o Magnificat. As duas mulheres reconhecem que tudo é dom. A gratidão abre os olhos para as maravilhas que Deus faz nos humildes.',
    proposito: 'Escrever três motivos de gratidão deste Advento.',
  }),
  dia({
    data: '2026-12-23', celebracao: '23 de dezembro', grau: 'Dia de semana', cor: 'roxo',
    missas: [{ leituras: semana('Ml 3,1-4.23-24', 'Sl 24(25)', 'Lc 1,57-66') }],
    reflexao: 'O nascimento de João enche a vizinhança de espanto. Zacarias confirma o nome dado por Deus e volta a falar, bendizendo o Senhor. Quando obedecemos a Deus, a nossa boca se abre para o louvor.',
    proposito: 'Reconciliar-me com alguém antes do Natal (ou procurar a Confissão).',
  }),
  dia({
    data: '2026-12-24', celebracao: '24 de dezembro', grau: 'Dia de semana', cor: 'roxo',
    observacao: 'Pela manhã: Missa do dia 24 (roxo). À tarde/noite: Missa da Vigília do Natal (branco).',
    missas: [
      { nome: 'Missa da manhã', leituras: semana('2Sm 7,1-5.8b-12.14a.16', 'Sl 88(89)', 'Lc 1,67-79') },
      { nome: 'Missa da Vigília do Natal', leituras: domingo('Is 62,1-5', 'Sl 88(89)', 'At 13,16-17.22-25', 'Mt 1,1-25') },
    ],
    reflexao: 'Zacarias canta o Benedictus: o sol que nasce do alto vem iluminar os que estão nas trevas. Na véspera do Natal, a espera se transforma em vigília alegre. A luz já está muito perto.',
    proposito: 'Preparar a casa e o coração para a celebração do Natal.',
  }),
  dia({
    data: '2026-12-25', celebracao: 'Natal do Senhor', grau: 'Solenidade', cor: 'branco',
    observacao: 'Solenidade com três formulários próprios de Missa.',
    missas: [
      { nome: 'Missa da Noite', leituras: domingo('Is 9,1-6', 'Sl 95(96)', 'Tt 2,11-14', 'Lc 2,1-14') },
      { nome: 'Missa da Aurora', leituras: domingo('Is 62,11-12', 'Sl 96(97)', 'Tt 3,4-7', 'Lc 2,15-20') },
      { nome: 'Missa do Dia', leituras: domingo('Is 52,7-10', 'Sl 97(98)', 'Hb 1,1-6', 'Jo 1,1-18') },
    ],
    reflexao: 'O Verbo se fez carne e habitou entre nós. Deus não enviou apenas uma mensagem: veio Ele mesmo, pequeno e frágil, numa manjedoura. O Natal é a certeza de que Deus está conosco para sempre.',
    proposito: 'Acolher Jesus em família, com oração diante do presépio.',
  }),
];
