export type LocalInstallationTestsNrChild = {
  selected: boolean
  text: string
}

export type LocalInstallationTestsNrItem = {
  parent: string
  parentSelected: boolean
  children: LocalInstallationTestsNrChild[]
}

export const nrsForLocalInstallationTests: LocalInstallationTestsNrItem[] = [
  {
    parent:
      '13.4.2.1 A autoria do projeto de instalação de caldeiras é de responsabilidade de PLH, e deve obedecer aos aspectos de segurança, saúde e meio ambiente previstos nas normas regulamentadoras, convenções e disposições legais aplicáveis.',
    parentSelected: false,
    children: [],
  },
  {
    parent:
      '13.4.2.2 As caldeiras de qualquer estabelecimento devem ser instaladas em local específico para tal fim, denominado casa de caldeiras ou área de caldeiras.',
    parentSelected: false,
    children: [],
  },
  {
    parent:
      '13.4.2.3 Quando a caldeira for instalada em ambiente aberto, a área de caldeiras deve satisfazer os seguintes requisitos:',
    parentSelected: false,
    children: [
      {
        selected: false,
        text: 'a) estar afastada, no mínimo, três metros de outras instalações do estabelecimento, dos depósitos de combustíveis, excetuando-se reservatórios para partida com até dois mil litros de capacidade, do limite de propriedade de terceiros e do limite com as vias públicas;',
      },
      {
        selected: false,
        text: '',
      },
      {
        selected: false,
        text: 'b) dispor de pelo menos duas saídas amplas, permanentemente desobstruídas, sinalizadas e dispostas em direções distintas;',
      },
      {
        selected: false,
        text: 'c) dispor de acesso fácil e seguro, necessário à operação e à manutenção da caldeira, sendo que, para guarda-corpos vazados, os vãos devem ter dimensões que impeçam a queda de pessoas;',
      },
      {
        selected: false,
        text: 'd) ter sistema de captação e lançamento dos gases e material particulado, provenientes da combustão, para fora da área de operação, atendendo às normas ambientais vigentes;',
      },
      {
        selected: false,
        text: 'e) dispor de iluminação conforme normas oficiais vigentes; e',
      },
      {
        selected: false,
        text: 'f) ter sistema de iluminação de emergência caso opere à noite.',
      },
    ],
  },
  {
    parent:
      '13.4.2.4 Quando a caldeira estiver instalada em ambiente fechado, a casa de caldeiras deve satisfazer os seguintes requisitos:',
    parentSelected: false,
    children: [
      {
        selected: false,
        text: 'a) constituir prédio separado, construído de material resistente ao fogo, podendo ter apenas uma parede adjacente a outras instalações do estabelecimento, porém com as outras paredes afastadas de, no mínimo, três metros de outras instalações, do limite de propriedade de terceiros, do limite com as vias públicas e de depósitos de combustíveis, excetuando-se reservatórios para partida com até dois mil litros de capacidade;',
      },
      {
        selected: false,
        text: 'b) dispor de pelo menos duas saídas amplas, permanentemente desobstruídas, sinalizadas e dispostas em direções distintas;',
      },
      {
        selected: false,
        text: 'c) dispor de ventilação permanente com entradas de ar que não possam ser bloqueadas;',
      },
      {
        selected: false,
        text: 'd) dispor de sensor para detecção de vazamento de gás, quando se tratar de caldeira a combustível gasoso;',
      },
      {
        selected: false,
        text: 'e) não ser utilizada para qualquer outra finalidade; ',
      },
      {
        selected: false,
        text: 'f) dispor de acesso fácil e seguro, necessário à operação e à manutenção da caldeira, sendo que, para guarda-corpos vazados, os vãos devem ter dimensões que impeçam a queda de pessoas;',
      },
      {
        selected: false,
        text: 'g) ter sistema de captação e lançamento dos gases e material particulado, provenientes da combustão, para fora da área de operação, atendendo às normas ambientais vigentes;',
      },
      {
        selected: false,
        text: 'h) dispor de iluminação conforme normas oficiais vigentes e ter sistema de iluminação de emergência',
      },
    ],
  },
  {
    parent:
      '13.4.2.5 Quando o estabelecimento não puder atender ao disposto nos subitens 13.4.2.3 e 13.4.2.4, deve ser elaborado projeto alternativo de instalação, com medidas complementares de segurança que permitam a atenuação dos riscos, comunicando previamente à representação sindical da categoria profissional predominante do estabelecimento.',
    parentSelected: false,
    children: [],
  },
  {
    parent:
      '13.4.2.6 As caldeiras classificadas na categoria A devem possuir painel de instrumentos instalados em sala de controle, construída segundo o que estabelecem as normas regulamentadoras aplicáveis.',
    parentSelected: false,
    children: [],
  },
]
