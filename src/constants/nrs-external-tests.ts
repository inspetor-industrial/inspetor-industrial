export type ExternalTestsNrChild = {
  selected: boolean
  text: string
}

export type ExternalTestsNrItem = {
  parent: string
  parentSelected: boolean
  children: ExternalTestsNrChild[]
}

export const nrsForExternalTests: ExternalTestsNrItem[] = [
  {
    parent:
      '13.4.1.3 Toda caldeira deve ter afixada em seu corpo, em local de fácil acesso e visível, placa de identificação indelével com, no mínimo, as seguintes informações:',
    parentSelected: false,
    children: [
      {
        selected: false,
        text: 'a) nome do fabricante;',
      },
      {
        selected: false,
        text: 'b) número de ordem dado pelo fabricante da caldeira;',
      },
      {
        selected: false,
        text: 'c) ano de fabricação;',
      },
      {
        selected: false,
        text: 'd) pressão máxima de trabalho admissível;',
      },
      {
        selected: false,
        text: 'e) capacidade de produção de vapor;',
      },
      {
        selected: false,
        text: 'f) área de superfície de aquecimento;',
      },
      {
        selected: false,
        text: 'g) código de construção e ano de edição.',
      },
    ],
  },
  {
    parent:
      '13.4.1.4 Além da placa de identificação, deve constar, em local visível, a categoria da caldeira e seu número ou código de identificação.',
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
      '13.4.4.13 Sempre que os resultados da inspeção determinarem alterações dos dados de projeto, a placa de identificação e a documentação do prontuário devem ser atualizadas.',
    parentSelected: false,
    children: [],
  },
]
