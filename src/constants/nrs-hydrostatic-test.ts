export type HydrostaticTestNrChild = {
  selected: boolean
  text: string
}

export type HydrostaticTestNrItem = {
  parent: string
  parentSelected: boolean
  children: HydrostaticTestNrChild[]
}

export const nrsForHydrostaticTest: HydrostaticTestNrItem[] = [
  {
    parent:
      '13.4.4.3 As caldeiras devem, obrigatoriamente, ser submetidas a Teste Hidrostático - TH em sua fase de fabricação, com comprovação por meio de laudo assinado por PLH.',
    parentSelected: false,
    children: [],
  },
  {
    parent:
      '13.4.4.3.1 Na falta de comprovação documental de que o TH tenha sido realizado na fase de fabricação, se aplicará o disposto a seguir: a) para as caldeiras fabricadas ou importadas a partir de 2 de maio de 2014, o TH correspondente ao da fase de fabricação deve ser feito durante a inspeção de segurança inicial; ou b) para as caldeiras em operação antes de 2 de maio de 2014, a execução do TH correspondente ao da fase de fabricação fica a critério técnico do PLH e, caso este julgue necessário, deve ser executado até a próxima inspeção de segurança periódica interna.',
    parentSelected: false,
    children: [],
  },
]
