'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@inspetor/components/ui/button'
import { Card, CardContent } from '@inspetor/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@inspetor/components/ui/dropdown-menu'
import { Form } from '@inspetor/components/ui/form'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@inspetor/components/ui/tabs'
import { IconDownload, IconEye } from '@tabler/icons-react'
import { ChevronDown, Save as IconSave } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'

import { AccumulationTestSection } from './sections/accumulation-test'
import { BasicSection } from './sections/basic'
import { BodySection } from './sections/body'
import { BoilerSection } from './sections/boiler'
import { BottomDischargeSystemSection } from './sections/bottom-discharge-system'
import { ConclusionsGeneralSection } from './sections/conclusions-general'
import { ConclusionsPmtaSection } from './sections/conclusions-pmta'
import { ControlDevicesSection } from './sections/control-devices'
import { ExternalExaminationsSection } from './sections/external-examinations'
import { FurnaceSection } from './sections/furnace'
import { GeneralExaminationsSection } from './sections/general-examinations'
import { HeatingSurfaceSection } from './sections/heating-surface'
import { HydrostaticTestSection } from './sections/hydrostatic-test'
import { InjectorGaugeSection } from './sections/injector-gauge'
import { InternalExaminationsSection } from './sections/internal-examinations'
import { LevelIndicatorCalibrationSection } from './sections/level-indicator-calibration'
import { LocalInstallationExaminationsSection } from './sections/local-installation-examinations'
import { MirrorSection } from './sections/mirror'
import { OperatorSection } from './sections/operator'
import { PowerSupplySection } from './sections/power-supply'
import { PressureGaugeCalibrationSection } from './sections/pressure-gauge-calibration'
import { SafetyValveGaugeSection } from './sections/safety-valve-gauge'
import { TubesSection } from './sections/tubes'
import { UltrasoundExamASection } from './sections/ultrasound-exam-a'
import { UltrasoundExamBSection } from './sections/ultrasound-exam-b'
import { UltrasoundExamCSection } from './sections/ultrasound-exam-c'
import { UltrasoundExamDSection } from './sections/ultrasound-exam-d'
import { WaterQualitySection } from './sections/water-quality'

// Schema baseado na tabela BoilerReport
const boilerReportSchema = z.object({
  // Dados básicos
  service: z.string().min(1, 'Serviço é obrigatório'),
  type: z.enum(['INITIAL', 'PERIODIC', 'EXTRAORDINARY']),
  motivation: z.string().optional(),

  // Datas e horários
  date: z.string().optional(),
  startTimeOfInspection: z.string().optional(),
  endTimeOfInspection: z.string().optional(),
  durationOfInspection: z.number().optional(),
  inspectionValidation: z.string().optional(),
  nextInspectionDate: z.string().optional(),

  // Dados do operador
  operatorName: z.string().min(1, 'Nome do operador é obrigatório'),
  operatorNr13: z.string().optional(),
  operatorProvidence: z.string().optional(),
  operatorCertificationId: z.string().optional(),
  operatorObservations: z.string().optional(),

  // Responsável pela inspeção
  engineerId: z.string().optional(),

  // Dados da caldeira
  boilerManufacturer: z.string().optional(),
  boilerBrand: z.string().optional(),
  boilerType: z
    .enum([
      'FIRE_TUBE_HORIZONTAL',
      'FIRE_TUBE_VERTICAL',
      'WATER_TUBE_HORIZONTAL',
      'WATER_TUBE_VERTICAL',
      'MIXED',
    ])
    .optional(),
  boilerModel: z.string().optional(),
  boilerManufacturerYear: z.string().optional(),
  boilerCapacity: z.number().optional(),
  boilerMaxPressureWorkable: z.number().optional(),
  boilerPressureOperating: z.number().optional(),
  boilerSerie: z.string().optional(),
  boilerFuel: z
    .enum([
      'FIRE_WOOD',
      'WOOD_CHIPS',
      'BAGASSE',
      'STRAW',
      'LPG',
      'NG',
      'DIESEL_OIL',
      'BPF_OIL',
      'BLACK_LIQUOR',
      'BRIQUETTE',
    ])
    .optional(),
  boilerCategory: z.enum(['A', 'B']).optional(),

  // Estrutura
  structureHeatingSurface: z.string().optional(),
  structureFurnaceType: z
    .enum(['REFRACTORY', 'COOLED', 'WATER_TUBE'])
    .optional(),
  structureFurnaceInfos: z.string().optional(),
  structureFurnaceDimensionWidth: z.number().optional(),
  structureFurnaceDimensionHeight: z.number().optional(),
  structureFurnaceDimensionLength: z.number().optional(),
  structureFurnaceDimensionDiameter: z.number().optional(),
  structureFurnaceDimensionTubeDiameter: z.number().optional(),
  structureFurnaceDimensionTubeThickness: z.number().optional(),
  structureFreeLengthWithoutStaysOrTube: z.string().optional(),
  structureMirrorThickness: z.number().optional(),
  structureMirrorDiameter: z.number().optional(),
  structureBodyThickness: z.number().optional(),
  structureBodyDiameter: z.number().optional(),
  structureBodyLength: z.number().optional(),
  structureBodyMaterial: z
    .enum(['ASTMA285GRC', 'ASTMA516', 'NOT_SPECIFIED'])
    .optional(),
  structureBodyCertificateOfManufacturer: z.string().optional(),
  structureTubeQuantity: z.number().optional(),
  structureTubeDiameter: z.number().optional(),
  structureTubeLength: z.number().optional(),
  structureTubeThickness: z.number().optional(),
  structureTubeMaterial: z.enum(['ASTMA178', 'NOT_SPECIFIED']).optional(),
  structureTubeCertificateOfManufacturer: z.string().optional(),
  structureTubeIsNaturalOrForced: z.string().optional(),
  structureQuantityOfSafetyFuse: z.number().optional(),

  // Exames realizados
  examinationsPerformedTests: z.string().optional(),
  examinationsPerformedObservations: z.string().optional(),

  // Exames externos
  externalExaminationsPerformedTests: z.string().optional(),
  externalExaminationsPerformedObservations: z.string().optional(),

  // Exames internos
  internalExaminationsPerformedTests: z.string().optional(),
  internalExaminationsPerformedObservations: z.string().optional(),

  // Exames de instalação local
  localInstallationExaminationsPerformedTests: z.string().optional(),
  localInstallationExaminationsPerformedObservations: z.string().optional(),

  // Medidor de injetor
  injectorGaugeSerialNumber: z.string().optional(),
  injectorGaugeMark: z.string().optional(),
  injectorGaugeDiameter: z.number().optional(),
  injectorGaugeFuel: z.enum(['LIQUID', 'GASEOUS', 'SOLID']).optional(),
  injectorGaugeTests: z.string().optional(),
  injectorGaugeObservations: z.string().optional(),

  // Alimentação de energia
  powerSupplyBombs: z.string().optional(),
  powerSupplyTests: z.string().optional(),
  powerSupplyObservations: z.string().optional(),

  // Calibração do indicador de nível
  calibrationOfTheLevelIndicatorAssemblyTests: z.string().optional(),
  calibrationOfTheLevelIndicatorAssemblyObservations: z.string().optional(),
  calibrationOfTheLevelIndicatorAssemblyMark: z.string().optional(),
  calibrationOfTheLevelIndicatorAssemblyGlassDiameter: z.number().optional(),
  calibrationOfTheLevelIndicatorAssemblyGlassLength: z.number().optional(),

  // Medidor de válvula de segurança
  safetyValveGaugeQuantity: z.string().optional(),
  safetyValveGaugeValves: z.string().optional(),
  safetyValveGaugeIsThereSafetyValveRedundancy: z.string().optional(),
  safetyValveGaugeObservations: z.string().optional(),

  // Dispositivos de controle
  gaugeOfElectricOrElectronicControlDevicesAndCommandsTests: z
    .string()
    .optional(),
  gaugeOfElectricOrElectronicControlDevicesAndCommandsObservations: z
    .string()
    .optional(),

  // Qualidade da água
  waterQualityTests: z.string().optional(),
  waterQualityObservations: z.string().optional(),
  waterQualityPh: z.string().optional(),

  // Sistema de descarga
  bottomDischargeSystemChecksTests: z.string().optional(),
  bottomDischargeSystemChecksObservations: z.string().optional(),

  // Teste hidrostático
  hydrostaticTestTests: z.string().optional(),
  hydrostaticTestObservations: z.string().optional(),
  hydrostaticTestPressure: z.number().optional(),
  hydrostaticTestDuration: z.number().optional(),
  hydrostaticTestProcedure: z.string().optional(),

  // Teste de acumulação
  accumulationTestTests: z.string().optional(),
  accumulationTestObservations: z.string().optional(),
  accumulationTestPressure: z.number().optional(),
  accumulationTestDuration: z.number().optional(),

  // Testes de ultrassom - Exame A
  ultrasoundTestsBodyExaminationATotal: z.number().optional(),
  ultrasoundTestsBodyExaminationAMean: z.number().optional(),
  ultrasoundTestsBodyExaminationAThicknessProvidedByManufacturer: z
    .number()
    .optional(),
  ultrasoundTestsBodyExaminationACorrosionRate: z.number().optional(),
  ultrasoundTestsBodyExaminationAAllowableThickness: z.number().optional(),
  ultrasoundTestsBodyExaminationAIsRegularizedAccordingToASME1: z
    .boolean()
    .optional(),

  // Testes de ultrassom - Exame B
  ultrasoundTestsBodyExaminationBTotal: z.number().optional(),
  ultrasoundTestsBodyExaminationBMean: z.number().optional(),
  ultrasoundTestsBodyExaminationBThicknessProvidedByManufacturer: z
    .number()
    .optional(),
  ultrasoundTestsBodyExaminationBCorrosionRate: z.number().optional(),
  ultrasoundTestsBodyExaminationBAllowableThickness: z.number().optional(),

  // Testes de ultrassom - Exame C
  ultrasoundTestsBodyExaminationCTotal: z.number().optional(),
  ultrasoundTestsBodyExaminationCMean: z.number().optional(),
  ultrasoundTestsBodyExaminationCThicknessProvidedByManufacturer: z
    .number()
    .optional(),
  ultrasoundTestsBodyExaminationCCorrosionRate: z.number().optional(),
  ultrasoundTestsBodyExaminationCAllowableThickness: z.number().optional(),

  // Testes de ultrassom - Exame D
  ultrasoundTestsBodyExaminationDTotal: z.number().optional(),
  ultrasoundTestsBodyExaminationDMean: z.number().optional(),
  ultrasoundTestsBodyExaminationDThicknessProvidedByManufacturer: z
    .number()
    .optional(),
  ultrasoundTestsBodyExaminationDCorrosionRate: z.number().optional(),
  ultrasoundTestsBodyExaminationDAllowableThickness: z.number().optional(),

  // PMTA
  pmtaCanBeMaintained: z.boolean().optional(),
  pmtaMustBeIncreasedTo: z.string().optional(),
  pmtaMustBeDecreasedTo: z.string().optional(),
  pmtaObservations: z.string().optional(),

  // Conclusões
  conclusionsDeadlineForNextInspection: z.string().optional(),
  conclusionsNrItemsThatNotBeingMet: z.string().optional(),
  conclusionsImmediateMeasuresNecessary: z.string().optional(),
  conclusionsNecessaryRecommendations: z.string().optional(),
  conclusionsCanBeOperateNormally: z.boolean().optional(),
})

type BoilerReportForm = z.infer<typeof boilerReportSchema>

export function BoilerReportEditor() {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  const form = useForm<BoilerReportForm>({
    resolver: zodResolver(boilerReportSchema),
    defaultValues: {
      service: 'Inspeção de Caldeira',
      type: 'PERIODIC',
      operatorName: '',
      operatorNr13: '',
      conclusionsCanBeOperateNormally: false,
    },
  })

  const onSubmit = (data: BoilerReportForm) => {
    console.log('Form data:', data)
    toast.success('Relatório salvo com sucesso!')
  }

  const handlePreview = () => {
    setIsPreviewMode(!isPreviewMode)
  }

  const handleDownload = () => {
    toast.info('Funcionalidade de download será implementada em breve')
  }

  if (isPreviewMode) {
    return (
      <div className="space-y-4">
        {/* Header com ações - mesmo layout do editor */}
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="w-full sm:w-auto">
            <h2 className="text-xl font-semibold">Visualização do Relatório</h2>
            <p className="text-sm text-muted-foreground">
              Visualize o relatório antes de salvar
            </p>
          </div>
          <div className="flex gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
              icon={IconEye}
              className="flex-1"
            >
              Voltar ao Editor
            </Button>
            <Button
              onClick={handleDownload}
              icon={IconDownload}
              className="flex-1"
            >
              Baixar Relatório
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="text-center text-muted-foreground">
              <p className="text-lg">
                Aqui será exibida a visualização do relatório
              </p>
              <p className="text-sm mt-2">
                Funcionalidade será implementada em breve
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {/* Header com ações */}
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Editor de Relatório</h2>
            <p className="text-sm text-muted-foreground">
              Preencha todas as seções necessárias para gerar o relatório
            </p>
          </div>
          <div className="flex gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
              icon={IconEye}
              className="flex-1"
            >
              Visualizar
            </Button>
            <Button type="submit" icon={IconSave} className="flex-1">
              Salvar Relatório
            </Button>
          </div>
        </div>

        {/* Tabs para organizar as seções */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden sm:grid w-full grid-cols-8 mb-0 text-xs">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="operator">Operador</TabsTrigger>
            <TabsTrigger value="boiler">Caldeira</TabsTrigger>
            <TabsTrigger value="structure">Estrutura</TabsTrigger>
            <TabsTrigger value="examinations">Exames</TabsTrigger>
            <TabsTrigger value="devices">Medidores</TabsTrigger>
            <TabsTrigger value="tests">Testes</TabsTrigger>
            <TabsTrigger value="conclusions">Conclusões</TabsTrigger>
          </TabsList>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1">
                Seções
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              <DropdownMenuItem onClick={() => setActiveTab('basic')}>
                Básico
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('operator')}>
                Operador
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('boiler')}>
                Caldeira
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('structure')}>
                Estrutura
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('examinations')}>
                Exames
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('devices')}>
                Medidores
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('tests')}>
                Testes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('conclusions')}>
                Conclusões
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tab: Dados Básicos */}
          <TabsContent value="basic" className="space-y-4 -mt-px">
            <BasicSection control={form.control} />
          </TabsContent>

          {/* Tab: Dados do Operador */}
          <TabsContent value="operator" className="space-y-4 -mt-px">
            <OperatorSection control={form.control} />
          </TabsContent>

          {/* Tab: Dados da Caldeira */}
          <TabsContent value="boiler" className="space-y-4 -mt-px">
            <BoilerSection control={form.control} />
          </TabsContent>

          {/* Tab: Estrutura da Caldeira */}
          <TabsContent value="structure" className="space-y-4 -mt-px">
            <HeatingSurfaceSection control={form.control} />
            <FurnaceSection control={form.control} />
            <MirrorSection control={form.control} />
            <BodySection control={form.control} />
            <TubesSection control={form.control} />
          </TabsContent>

          {/* Tab: Exames */}
          <TabsContent value="examinations" className="space-y-4 -mt-px">
            <GeneralExaminationsSection control={form.control} />
            <ExternalExaminationsSection control={form.control} />
            <InternalExaminationsSection control={form.control} />
            <LocalInstallationExaminationsSection control={form.control} />
          </TabsContent>

          {/* Tab: Medidores e Dispositivos */}
          <TabsContent value="devices" className="space-y-4 -mt-px">
            <InjectorGaugeSection control={form.control} />
            <PowerSupplySection control={form.control} />
            <LevelIndicatorCalibrationSection control={form.control} />
            <SafetyValveGaugeSection control={form.control} />
            <PressureGaugeCalibrationSection control={form.control} />
            <ControlDevicesSection control={form.control} />
            <WaterQualitySection control={form.control} />
            <BottomDischargeSystemSection control={form.control} />
          </TabsContent>

          {/* Tab: Testes */}
          <TabsContent value="tests" className="space-y-4 -mt-px">
            <UltrasoundExamASection control={form.control} />
            <UltrasoundExamBSection control={form.control} />
            <UltrasoundExamCSection control={form.control} />
            <UltrasoundExamDSection control={form.control} />
            <HydrostaticTestSection control={form.control} />
            <AccumulationTestSection control={form.control} />
          </TabsContent>

          {/* Tab: Conclusões */}
          <TabsContent value="conclusions" className="space-y-4 -mt-px">
            <ConclusionsGeneralSection control={form.control} />
            <ConclusionsPmtaSection control={form.control} />
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  )
}
