export type PowerSupplyNrChild = {
  selected: boolean
  text: string
}

export type PowerSupplyNrItem = {
  parent: string
  parentSelected: boolean
  children: PowerSupplyNrChild[]
}

export const nrsForPowerSupply: PowerSupplyNrItem[] = [
  {
    parent: '13.4.1.2 As caldeiras devem ser dotadas dos seguintes itens:',
    parentSelected: false,
    children: [
      {
        selected: false,
        text: 'e) sistema automático de controle do nível de água com intertravamento que evite o superaquecimento por alimentação deficiente.',
      },
    ],
  },
  {
    parent:
      '13.3.1 As seguintes situações constituem condição de grave e iminente risco:',
    parentSelected: false,
    children: [
      {
        selected: false,
        text: 'c) ausência ou bloqueio de dispositivos de segurança, sem a devida justificativa técnica, baseada em códigos, normas ou procedimentos formais de operação do equipamento;',
      },
    ],
  },
  {
    parent:
      '13.3.5 É proibida a inibição dos instrumentos, controles e sistemas de segurança, exceto quando prevista, de forma provisória, em procedimentos formais de operação e manutenção ou mediante justificativa formalmente documentada elaborada por responsável técnico, com prévia análise de risco e anuência do empregador ou de preposto por ele designado, desde que mantida a segurança operacional.',
    parentSelected: false,
    children: [],
  },
  {
    parent:
      '13.3.6 Os instrumentos e sistemas de controle e segurança dos equipamentos abrangidos por esta NR devem ser mantidos em condições adequadas de uso e devidamente inspecionados e testados ou, quando aplicável, calibrados.',
    parentSelected: false,
    children: [],
  },
  {
    parent:
      '13.3.7 Todos os reparos ou alterações em equipamentos abrangidos nesta NR devem respeitar os respectivos códigos de construção e as prescrições do fabricante no que se refere a:',
    parentSelected: false,
    children: [
      {
        selected: false,
        text: 'a) materiais;',
      },
      {
        selected: false,
        text: 'b) procedimentos de execução;',
      },
      {
        selected: false,
        text: 'c) procedimentos de controle de qualidade; e',
      },
      {
        selected: false,
        text: 'd) qualificação e certificação de pessoal.',
      },
    ],
  },
]
