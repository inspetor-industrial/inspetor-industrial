export type InternalTestsNrChild = {
  selected: boolean
  text: string
}

export type InternalTestsNrItem = {
  parent: string
  parentSelected: boolean
  children: InternalTestsNrChild[]
}

export const nrsForInternalTests: InternalTestsNrItem[] = [
  {
    parent:
      '13.3.7.5 Todas as intervenções que exijam mandrilamento ou soldagem em partes que operem sob pressão devem ser objeto de exames ou testes para controle da qualidade com parâmetros definidos por PLH, de acordo com códigos ou normas aplicáveis.',
    parentSelected: false,
    children: [],
  },
]
