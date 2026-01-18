# Documentação Completa - Fluxo de Geração do Boiler Report

## Índice

1. [Visão Geral](#visão-geral)
2. [Fluxo do Usuário - Passo a Passo](#fluxo-do-usuário---passo-a-passo)
3. [Estrutura de Dados](#estrutura-de-dados)
4. [Formulários do Modal](#formulários-do-modal)
5. [Perguntas dos Exames](#perguntas-dos-exames)
6. [Componentes Utilizados](#componentes-utilizados)

---

## Visão Geral

O sistema de geração de relatórios de inspeção de caldeiras (Boiler Report) é um fluxo complexo composto por **37 formulários sequenciais** apresentados em um modal. Cada formulário coleta informações específicas sobre a inspeção, desde dados básicos até exames técnicos detalhados.

### Arquitetura

- **Modal Principal**: `src/app/dashboard/boiler-inspection/modal/index.tsx`
- **Formulários**: 37 formulários em `src/app/dashboard/boiler-inspection/modal/forms/`
- **Exames**: Definições de perguntas em `src/app/dashboard/boiler-inspection/exams/`
- **Tipos**: `src/@types/models/boiler-inspection.d.ts`
- **Parser**: `src/utils/parse-boiler-report-inspection.ts`

---

## Fluxo do Usuário - Passo a Passo

### 1. Abertura do Modal

O usuário pode abrir o modal de duas formas:

**a) Através da Toolbar:**
- Clica no botão "Cadastrar na toolbar
- O modal é aberto através da referência `modalRef.current?.open()`

**b) Através de Evento Customizado:**
- O sistema escuta eventos para edição de inspeções existentes
- Eventos: `events.models.boilerInspection.navigate.to.update` ou `events.models.boilerInspection.navigate.to.updateByToolbar`

### 2. Navegação pelos Formulários

O modal apresenta um sistema de **stepper** (indicador de progresso) que mostra:
- Passo atual (1 a 37)
- Total de passos (37)
- Possibilidade de navegar diretamente para qualquer passo

**Controles disponíveis:**
- **Cancelar/Voltar**: 
  - No primeiro formulário: fecha o modal
  - Nos demais: volta para o formulário anterior
- **Próximo/Finalizar**:
  - Nos formulários 1-36: avança para o próximo
  - No formulário 37: finaliza e salva o relatório

### 3. Processo de Submissão de Cada Formulário

Ao clicar em "Próximo" ou "Finalizar":

1. **Validação do Formulário**:
   - O sistema valida todos os campos obrigatórios usando Zod
   - Se houver erros, exibe toast de erro e impede o avanço

2. **Coleta de Dados**:
   - Obtém os valores do formulário atual
   - Aplica transformações automáticas (se existirem) através de `runAutoCompleteAndFormatterWithDefaultValues`
   - Formata valores especiais (datas, horários, objetos)

3. **Atualização do Estado**:
   - Os dados são mesclados no estado `boilerReportState` usando `merge` do lodash
   - Mantém dados de formulários anteriores

4. **Persistência no Firestore**:
   - Se é a primeira vez (sem `boilerReportId`):
     - Cria novo documento no Firestore
     - Gera ID único
     - Define metadados (createdAt, updatedAt, createdBy, etc.)
     - Calcula número de linha (rowNumber)
   - Se já existe:
     - Atualiza documento existente com merge
     - Atualiza `updatedAt` e `updatedBy`
   - Gera substrings para busca (searchProperty)
   - Define permissões por empresa

5. **Navegação**:
   - Se não é o último formulário: avança para o próximo
   - Se é o último: fecha o modal, exibe toast de sucesso e invalida queries do React Query

### 4. Finalização

Ao finalizar o último formulário:
- Todos os dados são salvos no Firestore
- O modal é fechado
- Toast de sucesso é exibido
- A lista de inspeções é atualizada (invalidação de queries)

---

## Estrutura de Dados

### Tipo Principal: `BoilerInspection`

```typescript
type BoilerInspection = {
  // Dados básicos da inspeção
  service: string                                    // "Inspeção de Caldeiras"
  type: BoilerInspectionType                          // 'initial' | 'periodic' | 'extraordinary'
  client: { id: string, name: string, cnpjOrCpf: string }
  motivation: string
  date: number                                        // timestamp
  startTimeInspection: string                         // formato "HH:mm"
  endTimeInspection: string                           // formato "HH:mm"
  validity: string
  nextDate: number                                    // timestamp

  // Responsável e operador
  responsible: { id: string, name: string, stateRegistry: string }
  operator: {
    name: string
    isAbleToOperateWithNR13: string                   // 'yes' | 'no'
    certificate?: Document[]
    provisionsForOperator?: string
    observations?: string
  }

  // Identificação da caldeira
  identification: {
    manufacturer: string
    model: string
    type: BoilerType                                  // 'fireTubeHorizontal' | 'fireTubeVertical' | 'waterTubeHorizontal' | 'waterTubeVertical' | 'mixed'
    yearOfManufacture: string
    mark: string
    capacity: string
    fuel: BoilerFuelType                              // 'firewood' | 'woodChips' | 'bagasse' | 'straw' | 'lpg' | 'ng' | 'dieselOil' | 'bpfOil' | 'blackLiquor' | 'briquette'
    maximumWorkingPressure: string
    operatingPressure: string
    series: string
    category: BoilerCategory                          // 'A' | 'B'
  }

  // Estrutura da caldeira
  structure: {
    heatingSurface: string
    furnace: {
      type: FurnaceType                               // 'refractory' | 'cooled' | 'waterTube'
      infos: string
      dimensions: Partial<FurnaceDimensions>           // width, height, length, diameter, tube (diameter, thickness)
    }
    freeLengthWithoutStaysOrTube: string
    mirror: { thickness: string, diameter: string }
    body: {
      thickness: string
      diameter: string
      length: string
      material: BoilerBodyMaterial                    // 'astmA285Grc' | 'astmA516' | 'notSpecified'
      hasCertificateOfManufacturer: string
    }
    tube: {
      quantity: string
      diameter: string
      length: string
      thickness: string
      material: BoilerTubeMaterial                    // 'astmA178' | 'notSpecified'
      hasCertificateOfManufacturer: string
      isNaturalOrForced: string                       // 'natural' | 'forced'
    }
    quantityOfSafetyFuse: string
  }

  // Exames realizados
  examinationsPerformed: {
    tests: BoilerTableTests
    observations?: string
    record: Document[]
    book: Document[]
  }

  // Exame externo
  externalExaminationsPerformed: {
    tests: BoilerTableTests
    observations?: string
    plateIdentification: Document[]
    boiler: Document[]
    extraPhotos?: Document[]
  }

  // Exame interno
  internalExaminationsPerformed: {
    tests: BoilerTableTests
    observations?: string
    tubes: Document[]
    furnace: Document[]
    internalBoiler?: Document[]
    extraPhotos?: Document[]
  }

  // Exame do local de instalação
  localInstallationExaminationsPerformed: {
    tests: BoilerTableTests
    observations?: string
    boilerHouse: Document[]
  }

  // Aferições do manômetro
  pressureGaugeCalibration: {
    calibrationOrderNumber: string
    mark: string
    diameter: string
    capacity: string
    photos: Document[]
    tests: BoilerTableTests
    observations?: string
  }

  // Aferições do injetor
  injectorGauge: {
    serialNumber: string
    mark: string
    diameter: string
    fuel: InjectorFuelType                            // 'liquid' | 'gaseous' | 'solid'
    photos: Document[]
    tests: BoilerTableTests
    observations?: string
  }

  // Alimentação elétrica
  powerSupply: {
    bombs: Bomb[]                                      // Array de bombas
    tests: BoilerTableTests
    observations?: string
  }

  // Aferição do conjunto de indicador de nível
  calibrationOfTheLevelIndicatorAssembly: {
    tests: BoilerTableTests
    observations?: string
    mark: string
    glass: { diameter: string, length: string }
    photos: Document[]
  }

  // Aferição das válvulas de segurança
  safetyValveGauge: {
    quantity: string
    valves: Valve[]                                   // Array de válvulas
    photos: Document[]
    isThereSafetyValveRedundancy: boolean
    observations?: string
  }

  // Aferições de comandos e dispositivos de controle elétrico/eletrônico
  gaugeOfElectricOrElectronicControlDevicesAndCommands: {
    photos: Document[]
    tests: BoilerTableTests
    observations?: string
  }

  // Qualidade da água
  waterQuality: {
    photos: Document[]
    tests: BoilerTableTests
    ph: string
    observations?: string
  }

  // Sistema de descarga de fundo
  bottomDischargeSystemChecks: {
    photos: Document[]
    tests: BoilerTableTests
    observations?: string
  }

  // Ensaio hidrostático
  hydrostaticTest: {
    pressure: string
    duration: string
    procedure: string
    tests: BoilerTableTests
    observations?: string
  }

  // Ensaio por acumulação
  accumulationTest: {
    pressure: string
    duration: string
    tests: BoilerTableTests
    observations?: string
  }

  // Ensaios por ultrassom
  ultrasoundTests: {
    bodyExaminationA: BoilerUltraSoundExam & {
      isRegularizedAccordingToASME1: boolean
    }
    bodyExaminationB: BoilerUltraSoundExam
    bodyExaminationC: BoilerUltraSoundExam
    bodyExaminationD: BoilerUltraSoundExam
  }

  // PMTA (Pressão Máxima de Trabalho Admissível)
  pmta: {
    canBeMaintained: boolean
    mustBeIncreasedTo: string
    mustBeDecreasedTo: string
    observations?: string
  }

  // Conclusões
  conclusions: {
    deadlineForNextInspection: string
    nrItemsThatNotBeingMet: string
    immediateMeasuresNecessary: string
    necessaryRecommendations: string
    canBeOperateNormally: boolean
  }

  // Campos internos
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  companyOfUser: string
  id: string
}
```

### Tipos Auxiliares

```typescript
type BoilerTableTests = {
  nrsToAdd: BoilerNrToAdd[]                           // Normas regulamentadoras selecionadas
  questions: Question[]                                // Array de perguntas e respostas
}

type Question = {
  question: string
  answer: string                                       // 'yes' | 'no' | ''
}

type BoilerNrToAdd = {
  parent: string
  parentSelected: boolean
  children: {
    selected: boolean
    text: string
  }[]
}

type Bomb = {
  mark: string
  stages: string
  model: string
  potency: string
  photos: Document[]
}

type Valve = {
  calibrationOrderNumber: string
  diameter: string
  flow: string
  tests: BoilerTableTests
  openingPressure: string
  closingPressure: string
}

type BoilerUltraSoundExam = {
  total: string
  mean: string
  thicknessProvidedByManufacturer: string
  corrosionRate: string
  allowableThickness: string
  photos: Document[]
}

type Document = {
  url: string
  name: string
  size: number
  type: string
}
```

---

## Formulários do Modal

O modal é composto por **37 formulários sequenciais**, cada um com um título específico:

### Formulários 1-3: Dados da Inspeção

#### Form 1: Dados da Inspeção
**Campos:**
- `service`: string` - Serviço (padrão: "Inspeção de Caldeiras", somente leitura)
- `inspectionType: string` - Tipo de inspeção (Select: "Inicial", "Periódico", "Extra ordinário")
- `client: string` - Cliente (Combobox com busca)
- `motivation: string` - Motivação (Textarea, opcional)

**Transformações:**
- Converte `client` de string para objeto `{ id, name, cnpjOrCpf }`
- Mapeia `inspectionType` para `type`

#### Form 2: Dados da Inspeção
**Campos:**
- `date: number` - Data da inspeção (DatePicker)
- `startTimeInspection: any` - Horário de início (TimePicker, formato "HH:mm")
- `endTimeInspection: any` - Horário do término (TimePicker, formato "HH:mm")
- `validity: string` - Validade da inspeção (Input)
- `nextDate: number` - Data da próxima inspeção (DatePicker)

**Transformações:**
- Converte horários para string "HH:mm"

#### Form 3: Dados da Inspeção
**Campos:**
- `responsible: string` - Engenheiro responsável (Combobox com busca de usuários)
- `operatorName: string` - Nome do operador de caldeira (Input)
- `isAbleToOperateWithNR13: string` - Operador se enquadra na NR13? (Checkbox: SIM/NÃO)
- `certificate: Document[]` - Certificado do operador (DocumentField, aparece se `isAbleToOperateWithNR13 === 'yes'`)
- `provisionsForOperator: string` - Providências necessárias (Select, aparece se `isAbleToOperateWithNR13 === 'no'`)
- `observations: string` - Observações (Textarea, opcional)

**Transformações:**
- Converte `responsible` de string para objeto `{ id, name, stateRegistry }`
- Estrutura dados do operador em objeto `operator`

### Formulários 4-5: Identificação da Caldeira

#### Form 4: Identificação da Caldeira
**Campos:**
- `manufacturer: string` - Fabricante (Input, opcional)
- `mark: string` - Marca (Input, opcional)
- `type: string` - Tipo (Select: "Fogotubular Horizontal", "Fogotubular Vertical", "Aquatubular Horizontal", "Aquatubular Vertical", "Mista")
- `yearOfManufacture: string` - Ano de fabricação (Input, opcional)
- `model: string` - Modelo (Input, opcional)
- `capacity: string` - Capacidade (InputWithSuffix: kgf/cm², opcional)

**Transformações:**
- Estrutura dados em `identification`

#### Form 5: Identificação da Caldeira
**Campos:**
- `maximumWorkingPressure: string` - Pressão máxima de trabalho admissível (InputWithSuffix: kgf/cm², com conversão automática para lbf/in²)
- `fuel: string` - Combustível (Select: "Lenha", "Cavaco", "Bagaço", "Palha", "GLP", "GN", "Óleo diesel", "Óleo BPF", "Licor negro", "Briquete")
- `operatingPressure: string` - Pressão de operação (InputWithSuffix: kgf/cm², com conversão automática para lbf/in²)
- Pressão teste hidrostático (calculada automaticamente, somente leitura)
- `series: string` - Série (Input, opcional)
- `category: string` - Categoria da caldeira (Checkbox: A/B)

**Transformações:**
- Calcula pressão de teste hidrostático automaticamente
- Estrutura dados em `identification`

### Formulários 6-9: Dados Estruturais

#### Form 6: Dados Estruturais
**Campos:**
- `heatingSurface: string` - Superfície de aquecimento (InputWithSuffix: m²)
- `furnaceType: string` - Tipo da fornalha (Select: "Refratária", "Refrigerada", "Aquatubular")

**Campos condicionais baseados em `furnaceType`:**

**Se `furnaceType === 'refractory'`:**
- `furnaceWidth: string` - Largura (mm)
- `furnaceLength: string` - Comprimento (mm)
- `furnaceHeight: string` - Altura (mm)

**Se `furnaceType === 'cooled'`:**
- `furnaceDimensionsInfos: string` - Informações a serem preenchidas (Select: "Comprimento, Altura e Largura", "Diâmetro e Altura", "Diâmetro e Comprimento")
- Dimensões variam conforme `furnaceDimensionsInfos`

**Se `furnaceType === 'waterTube'`:**
- `tubeDiameterFurnace: string` - Diâmetro do tubo da fornalha (pol)
- `tubeThicknessFurnace: string` - Espessura do tubo da fornalha (mm)
- `furnaceWidth: string` - Largura (mm)
- `furnaceLength: string` - Comprimento (mm)
- `furnaceHeight: string` - Altura (mm)

**Transformações:**
- Estrutura dados em `structure.furnace`

#### Form 7: Dados Estruturais
**Campos:**
- `mirrorDiameter: string` - Diâmetro do espelho (mm)
- `mirrorThickness: string` - Espessura do espelho (pol)
- `freeLengthWithoutStaysOrTube: string` - Comprimento livre sem estais ou tubo (mm)
- `bodyLength: string` - Comprimento do corpo (mm)
- `bodyDiameter: string` - Diâmetro do corpo (mm)
- `bodyThickness: string` - Espessura do corpo (mm)

**Transformações:**
- Estrutura dados em `structure.mirror` e `structure.body`

#### Form 8: Dados Estruturais
**Campos:**
- `bodyMaterial: string` - Material do corpo (Select: "ASTM A 285 GRC", "ASTM A 516", "NÃO ESPECIFICADO")
- `bodyHasCertificateOfManufacturer: string` - Certificado do fabricante (Checkbox: SIM/NÃO)
- `tubeQuantity: string` - Quantidade de tubos (InputWithSuffix: un)
- `tubeLength: string` - Comprimento do tubo (mm)
- `tubeDiameter: string` - Diâmetro do tubo (pol)

**Transformações:**
- Estrutura dados em `structure.body` e `structure.tube`

#### Form 9: Dados Estruturais
**Campos:**
- `tubeThickness: string` - Espessura de tubos (mm)
- `tubeMaterial: string` - Material do tubo (Select: "ASTM A 178", "NÃO ESPECIFICADO")
- `tubeHasCertificateOfManufacturer: string` - Certificado do fabricante (Checkbox: SIM/NÃO)
- `tubeIsNaturalOrForced: string` - Tipo de tiragem (Checkbox: Natural/Forçada)
- `quantityOfSafetyFuse: string` - Número de fusíveis de segurança (Input)

**Transformações:**
- Estrutura dados em `structure.tube` e `structure.quantityOfSafetyFuse`

### Formulários 10-11: Exames Realizados

#### Form 10: Exames Realizados
**Campos:**
- `nrs: BoilerNrToAdd[]` - Normas regulamentadoras (NrSelect)
- `tests: Question[]` - Tabela de perguntas (TableQuestion)

**Perguntas do exame:**
Ver seção [Perguntas dos Exames - Exames Realizados](#exames-realizados)

**Lógica especial:**
- Se a pergunta "A CALDEIRA É MODIFICADO / REFORMADA?" for respondida com "no", remove a pergunta "HÁ PROJETO DE ALTERAÇÃO E REPARO?"
- Se for "yes", adiciona a pergunta se ela não existir

**Transformações:**
- Estrutura dados em `examinationsPerformed.tests`

#### Form 11: Exames Realizados
**Campos:**
- `observationsExamPerformed: string` - Observações (Textarea, opcional)
- `record: Document[]` - Prontuário (DocumentField)
- `book: Document[]` - Livro de registro (DocumentField)

**Transformações:**
- Estrutura dados em `examinationsPerformed`

### Formulários 12-13: Exame Externo do Equipamento

#### Form 12: Exame Externo do Equipamento
**Campos:**
- `externExamNrs: BoilerNrToAdd[]` - Normas regulamentadoras (NrSelect)
- `externExamTests: Question[]` - Tabela de perguntas (TableQuestion)

**Perguntas do exame:**
Ver seção [Perguntas dos Exames - Exame Externo](#exame-externo-do-equipamento)

**Transformações:**
- Estrutura dados em `externalExaminationsPerformed.tests`

#### Form 13: Exame Externo do Equipamento
**Campos:**
- `observationsExternalExams: string` - Observações (Textarea, opcional)
- `plateIdentification: Document[]` - Placa de identificação (DocumentField)
- `boiler: Document[]` - Caldeira (DocumentField)
- `extraPhotos: Document[]` - Fotos extras (DocumentField, opcional)

**Transformações:**
- Estrutura dados em `externalExaminationsPerformed`

### Formulários 14-15: Exame Interno do Equipamento

#### Form 14: Exame Interno do Equipamento
**Campos:**
- `internalExamNrs: BoilerNrToAdd[]` - Normas regulamentadoras (NrSelect)
- `internalExamTests: Question[]` - Tabela de perguntas (TableQuestion)

**Perguntas do exame:**
Ver seção [Perguntas dos Exames - Exame Interno](#exame-interno-do-equipamento)

**Transformações:**
- Estrutura dados em `internalExaminationsPerformed.tests`

#### Form 15: Exame Interno do Equipamento
**Campos:**
- `observationsInternalExams: string` - Observações (Textarea, opcional)
- `tubes: Document[]` - Tubos (DocumentField)
- `furnaceInternalExaminations: Document[]` - Fornalha (DocumentField)
- `internalBoiler: Document[]` - Caldeira interna (DocumentField, opcional)
- `extraPhotosInternalExams: Document[]` - Fotos extras (DocumentField, opcional)

**Transformações:**
- Estrutura dados em `internalExaminationsPerformed`

### Formulários 16-17: Exame do Local de Instalação da Caldeira

#### Form 16: Exame do Local de Instalação da Caldeira
**Campos:**
- `localInstallationNrs: BoilerNrToAdd[]` - Normas regulamentadoras (NrSelect)
- `localInstallationTests: Question[]` - Tabela de perguntas (TableQuestion)

**Perguntas do exame:**
Ver seção [Perguntas dos Exames - Local de Instalação](#exame-do-local-de-instalação)

**Transformações:**
- Estrutura dados em `localInstallationExaminationsPerformed.tests`

#### Form 17: Exame do Local de Instalação da Caldeira
**Campos:**
- `observationsLocalInstallation: string` - Observações (Textarea, opcional)
- `boilerHouse: Document[]` - Casa de caldeira (DocumentField)

**Transformações:**
- Estrutura dados em `localInstallationExaminationsPerformed`

### Formulários 18-19: Aferições do Manômetro

#### Form 18: Aferições do Manômetro
**Campos:**
- `calibrationOrderNumber: string` - Número da ordem de calibração (Input)
- `markPressureGauge: string` - Marca (Input)
- `diameterPressureGauge: string` - Diâmetro (Input)
- `capacityPressureGauge: string` - Capacidade (Input)
- `photos: Document[]` - Fotos (DocumentField)

**Transformações:**
- Estrutura dados em `pressureGaugeCalibration`

#### Form 19: Aferições do Manômetro
**Campos:**
- `pressureGaugeNrs: BoilerNrToAdd[]` - Normas regulamentadoras (NrSelect)
- `pressureGaugeTests: Question[]` - Tabela de perguntas (TableQuestion)
- `observationsPressureGauge: string` - Observações (Textarea, opcional)

**Perguntas do exame:**
Ver seção [Perguntas dos Exames - Manômetro](#aferições-do-manômetro)

**Transformações:**
- Estrutura dados em `pressureGaugeCalibration.tests`

### Formulários 20-21: Aferições do Injetor

#### Form 20: Aferições do Injetor
**Campos:**
- `injectorSerialNumber: string` - Número de série (Input)
- `injectorMark: string` - Marca (Input)
- `injectorDiameter: string` - Diâmetro (Input)
- `injectorFuel: string` - Combustível (Select: "Líquido", "Gasoso", "Sólido")
- `injectorPhotos: Document[]` - Fotos (DocumentField)

**Transformações:**
- Estrutura dados em `injectorGauge`

#### Form 21: Aferições do Injetor
**Campos:**
- `injectorNrs: BoilerNrToAdd[]` - Normas regulamentadoras (NrSelect)
- `injectorTests: Question[]` - Tabela de perguntas (TableQuestion)
- `observationsInjector: string` - Observações (Textarea, opcional)

**Perguntas do exame:**
Ver seção [Perguntas dos Exames - Injetor](#aferições-do-injetor)

**Transformações:**
- Estrutura dados em `injectorGauge.tests`

### Formulários 22-23: Alimentação Elétrica

#### Form 22: Alimentação Elétrica
**Campos:**
- `quantityOfBombs: number` - Quantidade de bombas (Input)
- Array dinâmico de bombas (`bombs: Bomb[]`), cada uma com:
  - `mark: string` - Marca
  - `stages: string` - Estágios
  - `model: string` - Modelo
  - `potency: string` - Potência
  - `photos: Document[]` - Fotos

**Transformações:**
- Estrutura dados em `powerSupply.bombs`

#### Form 23: Alimentação Elétrica
**Campos:**
- `bombsNrs: BoilerNrToAdd[]` - Normas regulamentadoras (NrSelect)
- `bombsTests: Question[]` - Tabela de perguntas (TableQuestion)
- `observationsPowerSupply: string` - Observações (Textarea, opcional)

**Perguntas do exame:**
Ver seção [Perguntas dos Exames - Alimentação Elétrica](#alimentação-elétrica)

**Transformações:**
- Estrutura dados em `powerSupply.tests`

### Formulários 24-25: Aferição do Conjunto de Indicador de Nível

#### Form 24: Aferição do Conjunto de Indicador de Nível
**Campos:**
- `levelIndicatorMark: string` - Marca (Input)
- `levelIndicatorGlassDiameter: string` - Diâmetro do vidro (Input)
- `levelIndicatorGlassLength: string` - Comprimento do vidro (Input)
- `levelIndicatorPhotos: Document[]` - Fotos (DocumentField)

**Transformações:**
- Estrutura dados em `calibrationOfTheLevelIndicatorAssembly`

#### Form 25: Aferição do Conjunto de Indicador de Nível
**Campos:**
- `levelIndicatorNrs: BoilerNrToAdd[]` - Normas regulamentadoras (NrSelect)
- `levelIndicatorTests: Question[]` - Tabela de perguntas (TableQuestion)
- `observationsLevelIndicator: string` - Observações (Textarea, opcional)

**Perguntas do exame:**
Ver seção [Perguntas dos Exames - Indicador de Nível](#aferição-do-conjunto-de-indicador-de-nível)

**Transformações:**
- Estrutura dados em `calibrationOfTheLevelIndicatorAssembly.tests`

### Formulários 26: Aferição das Válvulas de Segurança

#### Form 26: Aferição das Válvulas de Segurança
**Campos:**
- `quantityOfSafetyValves: string` - Quantidade de válvulas (Input)
- `isThereSafetyValveRedundancy: boolean` - Há redundância de válvulas de segurança? (Checkbox)
- `valvePhotos: Document[]` - Fotos (DocumentField)
- Array dinâmico de válvulas (`valves: Valve[]`), cada uma com:
  - `calibrationOrderNumber: string` - Número da ordem de calibração
  - `diameter: string` - Diâmetro
  - `flow: string` - Vazão
  - `tests: BoilerTableTests` - Testes (tabela de testes com ciclos)
  - `openingPressure: string` - Pressão de abertura
  - `closingPressure: string` - Pressão de fechamento
- `observationsValves: string` - Observações (Textarea, opcional)

**Transformações:**
- Estrutura dados em `safetyValveGauge`

### Formulários 27: Aferições de Comandos e Dispositivos de Controle Elétrico/Eletrônico

#### Form 27: Aferições de Comandos e Dispositivos de Controle Elétrico/Eletrônico
**Campos:**
- `gaugeNrs: BoilerNrToAdd[]` - Normas regulamentadoras (NrSelect)
- `gaugeTests: Question[]` - Tabela de perguntas (TableQuestion)
- `gaugePhotos: Document[]` - Fotos (DocumentField)
- `observationsGauge: string` - Observações (Textarea, opcional)

**Perguntas do exame:**
Ver seção [Perguntas dos Exames - Controle Elétrico/Eletrônico](#aferições-de-comandos-e-dispositivos-de-controle-elétricoeletrônico)

**Transformações:**
- Estrutura dados em `gaugeOfElectricOrElectronicControlDevicesAndCommands`

### Formulários 28: Aferições do Sistema de Descarga de Fundo

#### Form 28: Aferições do Sistema de Descarga de Fundo
**Campos:**
- `dischargesNrs: BoilerNrToAdd[]` - Normas regulamentadoras (NrSelect)
- `dischargeTests: Question[]` - Tabela de perguntas (TableQuestion)
- `dischargePhotos: Document[]` - Fotos (DocumentField)
- `observationDischarge: string` - Observações (Textarea, opcional)

**Perguntas do exame:**
Ver seção [Perguntas dos Exames - Sistema de Descarga](#aferições-do-sistema-de-descarga-de-fundo)

**Transformações:**
- Estrutura dados em `bottomDischargeSystemChecks`

### Formulários 29: Qualidade da Água

#### Form 29: Qualidade da Água
**Campos:**
- `waterNrs: BoilerNrToAdd[]` - Normas regulamentadoras (NrSelect)
- `waterTests: Question[]` - Tabela de perguntas (TableQuestion)
- `ph: string` - pH (Input)
- `waterPhotos: Document[]` - Fotos (DocumentField)
- `observationsWater: string` - Observações (Textarea, opcional)

**Perguntas do exame:**
Ver seção [Perguntas dos Exames - Qualidade da Água](#qualidade-da-água)

**Transformações:**
- Estrutura dados em `waterQuality`

### Formulários 30: Ensaio Hidrostático

#### Form 30: Ensaio Hidrostático
**Campos:**
- `pressureHydrostatic: string` - Pressão (Input)
- `durationHydrostatic: string` - Duração (Input)
- `procedureHydrostatic: string` - Procedimento (Textarea)
- `hydrostaticNrs: BoilerNrToAdd[]` - Normas regulamentadoras (NrSelect)
- `hydrostaticTests: Question[]` - Tabela de perguntas (TableQuestion)
- `observationsHydrostatic: string` - Observações (Textarea, opcional)

**Perguntas do exame:**
Ver seção [Perguntas dos Exames - Ensaio Hidrostático](#ensaio-hidrostático)

**Transformações:**
- Estrutura dados em `hydrostaticTest`

### Formulários 31: Ensaio por Acumulação

#### Form 31: Ensaio por Acumulação
**Campos:**
- `pressureAccumulation: string` - Pressão (Input)
- `durationAccumulation: string` - Duração (Input)
- `accumulationNrs: BoilerNrToAdd[]` - Normas regulamentadoras (NrSelect)
- `accumulationTests: Question[]` - Tabela de perguntas (TableQuestion)
- `observationsAccumulation: string` - Observações (Textarea, opcional)

**Perguntas do exame:**
Ver seção [Perguntas dos Exames - Ensaio por Acumulação](#ensaio-por-acumulação)

**Transformações:**
- Estrutura dados em `accumulationTest`

### Formulários 32-35: Ensaios por Ultrassom

#### Form 32: Ensaios por Ultrassom - Exame do Corpo: (A)
**Campos:**
- `totalBodyExaminationA: string` - Total (Input)
- `meanBodyExaminationA: string` - Média (Input)
- `thicknessProvidedByManufacturerBodyExaminationA: string` - Espessura fornecida pelo fabricante (Input)
- `corrosionRateBodyExaminationA: string` - Taxa de corrosão (Input)
- `allowableThicknessBodyExaminationA: string` - Espessura admissível (Input)
- `isRegularizedAccordingToASME1: boolean` - Regularizado conforme ASME1? (Checkbox)
- `photosBodyExaminationA: Document[]` - Fotos (DocumentField)

**Transformações:**
- Estrutura dados em `ultrasoundTests.bodyExaminationA`

#### Form 33: Ensaios por Ultrassom - Exame do Corpo: (B)
**Campos:**
- `totalBodyExaminationB: string` - Total (Input)
- `meanBodyExaminationB: string` - Média (Input)
- `thicknessProvidedByManufacturerBodyExaminationB: string` - Espessura fornecida pelo fabricante (Input)
- `corrosionRateBodyExaminationB: string` - Taxa de corrosão (Input)
- `allowableThicknessBodyExaminationB: string` - Espessura admissível (Input)
- `photosBodyExaminationB: Document[]` - Fotos (DocumentField)

**Transformações:**
- Estrutura dados em `ultrasoundTests.bodyExaminationB`

#### Form 34: Ensaios por Ultrassom - Exame do Corpo: (C)
**Campos:**
- `totalBodyExaminationC: string` - Total (Input)
- `meanBodyExaminationC: string` - Média (Input)
- `thicknessProvidedByManufacturerBodyExaminationC: string` - Espessura fornecida pelo fabricante (Input)
- `corrosionRateBodyExaminationC: string` - Taxa de corrosão (Input)
- `allowableThicknessBodyExaminationC: string` - Espessura admissível (Input)
- `photosBodyExaminationC: Document[]` - Fotos (DocumentField)

**Transformações:**
- Estrutura dados em `ultrasoundTests.bodyExaminationC`

#### Form 35: Ensaios por Ultrassom - Exame do Corpo: (D)
**Campos:**
- `totalBodyExaminationD: string` - Total (Input)
- `meanBodyExaminationD: string` - Média (Input)
- `thicknessProvidedByManufacturerBodyExaminationD: string` - Espessura fornecida pelo fabricante (Input)
- `corrosionRateBodyExaminationD: string` - Taxa de corrosão (Input)
- `allowableThicknessBodyExaminationD: string` - Espessura admissível (Input)
- `photosBodyExaminationD: Document[]` - Fotos (DocumentField)

**Transformações:**
- Estrutura dados em `ultrasoundTests.bodyExaminationD`

### Formulários 36: Atualização da PMTA

#### Form 36: Atualização da PMTA
**Campos:**
- `canBeMaintained: boolean` - Pode ser mantida? (Checkbox)
- `mustBeIncreasedTo: string` - Deve ser aumentada para (Input, aparece se `canBeMaintained === false`)
- `mustBeDecreasedTo: string` - Deve ser diminuída para (Input, aparece se `canBeMaintained === false`)
- `observationsPMTA: string` - Observações (Textarea, opcional)

**Transformações:**
- Estrutura dados em `pmta`

### Formulários 37: Conclusões

#### Form 37: Conclusões
**Campos:**
- `deadlineForNextInspection: string` - Prazo para execução (Input)
- `nrItemsThatNotBeingMet: string` - Itens desta NR que não estão sendo atendidos (Textarea)
- `immediateMeasuresNecessary: string` - Providências imediatas necessárias (Textarea)
- `necessaryRecommendations: string` - Recomendações necessárias (Textarea)
- `canBeOperateNormally: string` - A caldeira inspecionada pode ser utilizada normalmente? (Checkbox: SIM/NÃO)

**Transformações:**
- Estrutura dados em `conclusions`

---

## Perguntas dos Exames

### Exames Realizados

**Arquivo:** `src/app/dashboard/boiler-inspection/exams/examinations-performed.ts`

1. O PRONTUÁRIO FOI ENCONTRADO COMPLETO E EM DIA?
2. O PRONTUÁRIO ENCONTRA-SE DE ACORDO COM ITEM 13.4.1.5A DA NR13?
3. O PRONTUÁRIO PRECISA SER RESTITUÍDO?
4. O PRONTUÁRIO PRECISA SER ADEQUADO?
5. A CALDEIRA É MODIFICADO / REFORMADA?
6. HÁ PROJETO DE ALTERAÇÃO E REPARO? *(Aparece condicionalmente se pergunta 5 = "yes")*
7. HOUVE ACESSO AO LIVRO DE REGISTRO DE SEGURANÇA?
8. O LIVRO DE REGISTRO DE SEGURANÇA É VIRTUAL?
9. O REGISTRO DE SEGURANÇA ENCONTRA-SE ATUALIZADO?
10. HÁ REGISTRO DE INSPEÇÕES PERIÓDICAS REGULARES NO LIVRO DE INSPEÇÃO?
11. HÁ CERTIFICADOS DE CALIBRAÇÃO DOS DISPOSITIVOS DE SEGURANÇA?
12. OS CERTIFICADOS POSSUEM DISPOSITIVOS DE CALIBRAÇÃO VÁLIDOS?
13. OS DISPOSITIVOS ESTÃO DENTRO DO PRAZO DE VALIDADE?
14. A PRESENTE INSPEÇÃO FOI REALIZADA NO PRAZO PARA ISSO FIXADA?
15. AS RECOMENDAÇÕES ANTERIORES FORAM POSTAS EM PRÁTICA?

### Exame Externo do Equipamento

**Arquivo:** `src/app/dashboard/boiler-inspection/exams/external-examinations-performed.ts`

1. HÁ PLACA DE IDENTIFICAÇÃO DA CALDEIRA EM LOCAL DE FÁCIL ACESSO E COM ANOTAÇÃO VISÍVEL?
2. A PLACA POSSUI OS REQUISITOS MÍNIMOS PREVISTOS NA NR 13.4.1.3?
3. HÁ INDICADOR DA CATEGORIA DA CALDEIRA AFIXADO EM LOCAL VISÍVEL?
4. A CALDEIRA FUNCIONA NORMALMENTE?
5. A CALDEIRA SATISFAZ AS CONDIÇÕES DE SEGURANÇA CONSTANTES NA NR13 E OBSERVÁVEIS NESTE EXAME?
6. FOI OBSERVADO ALGUMA ANOMALIA CAPAZ DE PREJUDICAR A SEGURANÇA?
7. HÁ ALGUM VAZAMENTO?
8. O ENCAPAMENTO SE ENCONTRA EM PERFEITO ESTADO?
9. HÁ RISCOS DE QUEIMADURA POR FALTA DE ENCAPAMENTO?
10. HÁ SINAIS DE DETERIORAÇÃO APARENTE?
11. A DETERIORAÇÃO INTERFERE DE FORMA IMEDIATA NO FUNCIONAMENTO DA MESMA?
12. AS VÁLVULAS, REGISTROS E TUBULAÇÃO ENCONTRAM-SE EM BOM ESTADO?
13. A CHAMINÉ DE CALDEIRA ENCONTRA-SE EM BOM ESTADO?
14. AS PASSAGENS DIANTEIRAS E TRANSEIRAS, ESTÃO EM BOM ESTADO?
15. A BASE DE CALDEIRA ENCONTRA-SE EM BOM ESTADO?
16. HÁ NECESSIDADE DE PINTURA DA CALDEIRA?

### Exame Interno do Equipamento

**Arquivo:** `src/app/dashboard/boiler-inspection/exams/internal-exams-performed.ts`

1. A CALDEIRA APRESENTA ALGUMA ANOMALIA INTERNAMENTE?
2. ESTÁ COM OS TUBOS EM BOM ESTADO?
3. ESTÁ COM OS TUBOS DEVIDAMENTE LIMPOS?
4. OS TUBOS SÃO MANDRILHADOS?
5. HÁ NECESSIDADE DE REMANDRILHAMENTO?
6. A FORNALHA ENCONTRA-SE EM BOM ESTADO?
7. ESTÁ DEVIDAMENTE LIMPA?
8. AS PEDRAS DE RETORNO DE CHAMA ESTÃO EM BOM ESTADO?
9. AS PASSAGENS DA CALDEIRA ESTÃO EM BOM ESTADO?
10. INTERNAMENTE A CALDEIRA SATISFAZ A NBR16035-1/22 E NR13?
11. FOI ENCONTRADO ALGO CAPAZ DE PREJUDICAR A SEGURANÇA?

### Exame do Local de Instalação

**Arquivo:** `src/app/dashboard/boiler-inspection/exams/local-installation-examinations.ts`

1. POSSUI PROJETO DE INSTALAÇÃO?
2. O PROJETO ATENDE AOS REQUISITOS MÍNIMOS DA NR13?
3. ATENDE AO ITEM 13.4.2.3 OU 13.4.2.4 DA NR13?
4. CONSTITUI PRÉDIO SEPARADO DE MATERIAL RESISTENTE AO CALOR?
5. DISPÕE DE PELO MENOS 2 SAÍDAS AMPLAS E SINALIZADAS?
6. DISPÕE DE VENTILAÇÃO PERMANENTE?
7. ENTRADAS DE AR NÃO BLOQUEÁVEIS?
8. DISPÕE DE SENSOR DE VAZAMENTO DED GASES?
9. A CASA É UTILIZADA PARA OUTRA FINALIDADE?
10. DISPÕE DE ACESSO FÁCIL E SEGURO?
11. TEM SISTEMA DE CAPTAÇÃO E LANÇAMENTO DE GASES?
12. POSSUI RELATÓRIO DE EMISSÃO DE GASES?
13. DISPÕE DE ILUMINAÇÃO SEGUNDO NORMAS VIGENTES?

### Aferições do Manômetro

**Arquivo:** `src/app/dashboard/boiler-inspection/exams/pressure-gauge-examinations.ts`

1. O MANÔMETRO FOI CALIBRADO?
2. FUNCIONA NORMALMENTE?
3. HÁ ALGUM PROBLEMA NO MESMO?
4. HÁ SIFÃO PARA PROTEÇÃO DO MECANISMO INTERNO?
5. O VIDRO ENCONTRA-SE COM VISIBILIDADE ADEQUADA?

### Aferições do Injetor

**Arquivo:** `src/app/dashboard/boiler-inspection/exams/injector-examinations.ts`

1. O INJETOR DE VALOR FOI AFERIDO?
2. FUNCIONA NORMALMENTE?
3. HÁ ALGUM PROBLEMA NO MESMO?
4. HÁ SISTEMA DE RETENÇÃO PARA PROTEÇÃO DO MECANISMO INTERNO?
5. A LIGAÇÃO DE ÁGUA FOI FEITA CORRETAMENTE?

### Alimentação Elétrica

**Arquivo:** `src/app/dashboard/boiler-inspection/exams/power-supply-examinations.ts`

1. FOI REALIZADO?
2. A BOMBA ENCONTRA-SE FUNCIONANDO NORMALMENTE?
3. É SUFICIENTE PARA SUPORTAR A PRESSÃO DE USO DO EQUIPAMENTO?
4. FOI OBSERVADA ALGUMA ANOMALIA CAPAZ DE PREJUDICAR A SEGURANÇA?
5. HOUVE ALGUM OUTRO PROBLEMA RELACIONADO Á PRESSÃO APLICADA?

### Aferição do Conjunto de Indicador de Nível

**Arquivo:** `src/app/dashboard/boiler-inspection/exams/level-indicator-examinations.ts`

1. O CONJUNTO INDICADOR DE NÍVEL ESTÁ EM CONDIÇÕES DE USO?
2. A VÁLVULA DE DESCARGA FUNCIONA NORMALMENTE?
3. HÁ NECESSIDADE DE TROCA DO CONJUNTO?
4. O VIDRO ENCONTRA-SE EM CONDIÇÕES DE USO?
5. AS BORRACHAS DE VEDAÇÃO ENCONTRAM-SE EM CONDIÇÕES DE USO?

### Aferições de Comandos e Dispositivos de Controle Elétrico/Eletrônico

**Arquivo:** `src/app/dashboard/boiler-inspection/exams/electrical-control-examinations.ts`

1. HÁ PAINEL DE COMANDO PARA CONTROLE AUTOMÁTICO DA CALDEIRA?
2. FUNCIONA NORMALMENTE?
3. HÁ PEÇAS DE REPOSIÇÃO?
4. HÁ REDUNDÂNCIA NOS SISTEMAS DE SEGURANÇA DO PAINEL?
5. HÁ ALGUM OUTRO DISPOSITIVO DE ELETRÔNICO?

### Aferições do Sistema de Descarga de Fundo

**Arquivo:** `src/app/dashboard/boiler-inspection/exams/discharge-system-examinations.ts`

1. HÁ SISTEMA DE DESCARGA DE FUNDO?
2. HÁ NÚMERO SUFICIENTE DE DESCARGAS?
3. FUNCIONA(M) NORMALMENTE?
4. A(S) DESCARGA(S) É(SÃ0) AUTOMÁTICA(S)?
5. AS DESCARGAS ESTÃO SENDO FEITAS NO TEMPO CORRETO?

### Qualidade da Água

**Arquivo:** `src/app/dashboard/boiler-inspection/exams/water-quality-examinations.ts`

1. Há tratamento de água?
2. O tratamento está sendo feito corretamente?
3. Há sinal de calcificação em partes ou peças?

### Ensaio Hidrostático

**Arquivo:** `src/app/dashboard/boiler-inspection/exams/hydrostatic-test-examinations.ts`

1. Foi realizado?
2. A bomba encontra-se funcionando normalmente?
3. É suficiente para suportar a pressão de uso do equipamento?
4. Foi observada alguma anomalia capaz de prejudicar a segurança?
5. A caldeira suportou satisfatoriamente a prova?
6. Houve algum outro problema relacionado á pressão aplicada?

### Ensaio por Acumulação

**Arquivo:** `src/app/dashboard/boiler-inspection/exams/accumulation-test-examinations.ts`

1. Foi realizado?
2. A bomba encontra-se funcionando normalmente?
3. É suficiente para suportar a pressão de uso do equipamento?
4. Foi observada alguma anomalia capaz de prejudicar a segurança?
5. As válvulas suportaram satisfatoriamente a prova?
6. Houve algum outro problema relacionado á pressão aplicada?

### Válvulas de Segurança

**Arquivo:** `src/app/dashboard/boiler-inspection/exams/security-measurement.ts`

*Nota: Estas perguntas são usadas para cada válvula individualmente*

1. FUNCIONAM NORMALMENTE?
2. FORAM DESMONTADAS?
3. FOI OBSERVADA ALGUMA ANOMALIA?
4. FORAM CONSERTADAS?
5. FORAM SUBSTITUÍDAS?
6. FORAM REGULADAS?

---

## Componentes Utilizados

### TableQuestion

**Localização:**** `src/components/table-question.tsx`

**Propósito:** Exibe uma tabela de perguntas com checkboxes SIM/NÃO

**Props:**
```typescript
type TableQuestionProps = {
  options: Option[]                                    // Array de perguntas
  onChange?: (value: Option[]) => void                // Callback de mudança
  extraLogicOnChange?: (value: Option[], currentOption: Option) => Option[]  // Lógica extra
}

type Option = {
  question: string
  answer: string                                       // 'yes' | 'no' | ''
}
```

**Funcionamento:**
- Renderiza uma tabela com 5 colunas (3 para pergunta, 1 para SIM, 1 para NÃO)
- Cada linha contém uma pergunta e dois checkboxes mutuamente exclusivos
- Ao marcar um checkbox, atualiza o estado e chama `onChange`
- Suporta lógica extra através de `extraLogicOnChange` (usado no Form 10)

### TableTests

**Localização:** `src/components/table-tests.tsx`

**Propósito:** Exibe uma tabela para testes de calibração com ciclos ascendentes e descendentes

**Props:**
```typescript
type TableTestsProps = {
  value?: TableTestType[]
  onChange: (value: TableTestType[]) => void
  disabled?: boolean
  isLoading?: boolean
}

type TableTestType = {
  rowId: string
  standardValue: string                               // Valor padrão
  cycleOneAscending: string                           // Ciclo 1 ascendente
  cycleOneDescending: string                          // Ciclo 1 descendente
  cycleTwoAscending: string                           // Ciclo 2 ascendente
  cycleTwoDescending: string                          // Ciclo 2 descendente
}
```

**Funcionamento:**
- Renderiza uma tabela editável (contentEditable) para valores numéricos
- Permite adicionar/remover linhas dinamicamente
- Usado principalmente para calibração de válvulas de segurança

### DocumentField

**Localização:** `src/components/document-field.tsx`

**Propósito:** Componente para upload de documentos/fotos

**Funcionamento:**
- Permite upload de arquivos (imagens ou documentos)
- Armazena no Firebase Storage
- Retorna array de objetos `Document` com `url`, `name`, `size`, `type`

### NrSelect

**Localização:** `src/components/nr-select.tsx`

**Propósito:** Seletor hierárquico de Normas Regulamentadoras (NRs)

**Funcionamento:**
- Permite selecionar NRs em estrutura hierárquica (pais e filhos)
- Retorna estrutura `BoilerNrToAdd[]`

### Combobox

**Localização:** `src/components/combobox.tsx`

**Propósito:** Combobox com busca para seleção de entidades (clientes, usuários, etc.)

**Funcionamento:**
- Busca dinâmica através de `queryFn`
- Suporta formatação de valores através de `makeOptionValue` e `makeOptionObject`

### FormStepper

**Localização:** `src/app/dashboard/boiler-inspection/modal/form-stepper.tsx`

**Propósito:** Indicador de progresso e navegação entre formulários

**Funcionamento:**
- Mostra passo atual e total de passos
- Permite navegação direta para qualquer passo através de `gotoStep`

---

## Fluxo de Dados

### 1. Estado do Modal

O modal mantém um estado `boilerReportState` do tipo `PartialBoilerInspection` que acumula todos os dados dos formulários:

```typescript
const [boilerReportState, setBoilerReportState] = useState<PartialBoilerInspection>({})
```

### 2. Transformação de Dados

Cada formulário possui uma função `runAutoCompleteAndFormatterWithDefaultValues` que:
- Formata valores do formulário para a estrutura esperada
- Mescla com valores anteriores
- Estrutura dados em objetos aninhados conforme o tipo `BoilerInspection`

### 3. Parser de Dados

O arquivo `parse-boiler-report-inspection.ts` faz a transformação inversa:
- Converte objetos aninhados em campos planos para os formulários
- Usado para popular `defaultValues` quando editando uma inspeção existente

### 4. Persistência

Os dados são salvos no Firestore com:
- **Merge:** Atualizações incrementais preservam dados anteriores
- **Search Property:** Gera substrings para busca rápida
- **Permissões:** Filtra por empresa do usuário
- **Metadados:** Timestamps e IDs de usuário para auditoria

---

## Observações Importantes

1. **Validação:** Todos os formulários usam Zod para validação. Campos obrigatórios são validados antes de avançar.

2. **Persistência Incremental:** Cada formulário salva os dados no Firestore, não apenas no final. Isso permite recuperar dados em caso de fechamento acidental do modal.

3. **Navegação Livre:** O usuário pode navegar para qualquer formulário através do stepper, mas os dados só são salvos ao clicar em "Próximo" ou "Finalizar".

4. **Lógica Condicional:** Alguns formulários têm campos condicionais que aparecem/desaparecem baseados em respostas anteriores (ex: Form 3, Form 6, Form 10).

5. **Conversões Automáticas:** Alguns campos têm conversões automáticas (ex: pressão em kgf/cm² para lbf/in², cálculo de pressão de teste hidrostático).

6. **Arrays Dinâmicos:** Alguns formulários permitem adicionar múltiplos itens (bombas, válvulas) dinamicamente.

7. **Documentos:** Todos os uploads de documentos são feitos para o Firebase Storage e referenciados no Firestore.

---

## Conclusão

Este documento cobre todo o fluxo de geração do Boiler Report, desde a abertura do modal até a finalização e persistência dos dados. Cada formulário, pergunta de exame e componente foi documentado para facilitar a manutenção e evolução do sistema.
