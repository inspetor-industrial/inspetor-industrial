export type WaterQualityNrChild = {
  selected: boolean
  text: string
}

export type WaterQualityNrItem = {
  parent: string
  parentSelected: boolean
  children: WaterQualityNrChild[]
}

export const nrsForWaterQuality: WaterQualityNrItem[] = [
  {
    parent:
      '13.4.3.2 A qualidade da água deve ser controlada e tratamentos devem ser implementados, quando necessários, para compatibilizar suas propriedades físico-químicas com os parâmetros de operação da caldeira definidos pelo fabricante.',
    parentSelected: false,
    children: [],
  },
]
